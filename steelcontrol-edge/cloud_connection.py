"""Sincroniza os perfis autorizados no site/mobile com o componente interno."""
from __future__ import annotations
import json
import os
from pathlib import Path
import socket
import threading
from datetime import datetime, timezone
import requests
from transport_security import validate_server_url
from edge_profiles import MachineProfile, EdgeStore, config_dir, save_store
from secret_store import protect_text, unprotect_text

SERVER = 'https://web-production-6682df.up.railway.app'


class CloudConnection:
    def __init__(self, worker, server=SERVER):
        self.worker = worker
        self.server = validate_server_url(server)
        self.stop_event = threading.Event()
        self.lock = threading.RLock()
        self.path = config_dir() / 'computer-link.json'
        self.state = {}
        self.records = {}
        self.claimed = False
        self.error = None
        self.session = requests.Session()
        self.session.trust_env = False
        if self.path.exists():
            try:
                saved = json.loads(self.path.read_text(encoding='utf8'))
                saved['token'] = unprotect_text(saved.pop('protectedToken'))
                self.state = saved
            except Exception:
                self.error = 'Não foi possível ler o vínculo deste computador.'
        with self.worker.lock:
            for p in self.worker.store.profiles:
                if p.id.startswith('cloud-'):
                    self.records[p.id[6:]] = {'profile': p, 'version': int(p.params.get('_connectionVersion') or 0)}

    @staticmethod
    def _check_response(response):
        if 300 <= response.status_code < 400:
            raise requests.RequestException('Redirecionamento recusado para proteger o vínculo do computador.')
        response.raise_for_status()

    def _persist(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        data = dict(self.state)
        data['protectedToken'] = protect_text(data.pop('token'))
        temporary = self.path.with_suffix('.tmp')
        temporary.write_text(json.dumps(data), encoding='utf8')
        try: temporary.chmod(0o600)
        except OSError: pass
        os.replace(temporary, self.path)

    def pairing(self):
        with self.lock:
            if self.state and not self.claimed:
                expires = datetime.fromisoformat(str(self.state.get('expiraEm')).replace('Z', '+00:00'))
                if expires <= datetime.now(timezone.utc):
                    self.state = {}
            if not self.state:
                r = self.session.post(self.server + '/conexoes/computador/registrar', json={'nome': socket.gethostname()}, timeout=10, allow_redirects=False)
                self._check_response(r)
                self.state = r.json()
                self._persist()
            return {'id': self.state.get('id'), 'codigo': None if self.claimed else self.state.get('codigo'),
                    'vinculado': self.claimed, 'nome': socket.gethostname()}

    def start(self):
        self.thread = threading.Thread(target=self._loop, name='steelcontrol-sync', daemon=True)
        self.thread.start()

    def close(self):
        self.stop_event.set()
        thread = getattr(self, 'thread', None)
        if thread and thread is not threading.current_thread():
            thread.join(timeout=12)

    def _loop(self):
        while not self.stop_event.is_set():
            try:
                with self.lock:
                    state = dict(self.state)
                if state:
                    self.sync(state)
            except Exception:
                self.error = 'Conexão indisponível. Tentando novamente.'
            self.stop_event.wait(4)

    def sync(self, state):
        from serial.tools import list_ports
        ports = [{'porta': p.device, 'nome': p.description or 'USB / serial'} for p in list_ports.comports()]
        with self.worker.lock:
            reports = [{'id': ident, 'versao': rec['version'], 'salvo': True,
                        'estado': self.worker.states.get(rec['profile'].id, {}).get('state', 'STOPPED')}
                       for ident, rec in self.records.items()]
        response = self.session.post(self.server + '/conexoes/computador/sincronizar',
                                     headers={'X-Connection-Token': state['token']},
                                     json={'portas': ports, 'estados': reports}, timeout=10, allow_redirects=False)
        if response.status_code in (401, 403):
            # Revogação para imediatamente os perfis desta autorização.
            for rec in self.records.values():
                self.worker.manager.stop(rec['profile'].id)
                rec['profile'].enabled = False
            with self.worker.lock:
                save_store(self.worker.store)
            self.records.clear()
            with self.lock:
                self.claimed = False
                self.state = {}
                if self.path.exists(): self.path.unlink()
            return
        response.raise_for_status()
        result = response.json()
        self.claimed = result.get('vinculado') is True
        if self.claimed and not state.get('vinculado'):
            with self.lock:
                self.state['vinculado'] = True
                self.state['codigo'] = None
                self._persist()
        active_ids = set()
        for config in result.get('conexoes', []):
            if self.stop_event.is_set(): return
            ident = config['id']
            active_ids.add(ident)
            old = self.records.get(ident)
            version = int(config['versao'])
            if old and old['version'] == version:
                p = old['profile']
                if p.enabled and p.id not in self.worker.manager.runtimes:
                    self.worker.manager.start(p)
                continue
            pid = 'cloud-' + ident
            if old:
                self.worker.manager.stop(pid)
            key = config.get('credencial') or (old['profile'].device_key if old else '')
            if not key:
                # Sem chave protegida local, a interface precisa reenviar a configuração.
                continue
            profile = MachineProfile(id=pid, label=config['nome'], server_url=self.server,
                                     machine_id=int(config['maquinaId']), device_key=key,
                                     driver=config['driver'], enabled=config['ativa'] is True,
                                     allow_commands=config['comandos'] is True,
                                     interval_ms=int(config.get('intervaloLeitura') or 2000),
                                     params={**config.get('parametros', {}), '_connectionVersion': version})
            profile.validate()
            with self.worker.lock:
                profiles = [p for p in self.worker.store.profiles if p.id != pid]
                profiles.append(profile)
                candidate = EdgeStore(profiles)
                save_store(candidate)  # ACK somente depois da gravação protegida.
                self.worker.store = candidate
                self.records[ident] = {'profile': profile, 'version': version}
            if profile.enabled:
                self.worker.manager.start(profile)
            else:
                self.worker.status(pid, 'STOPPED', {})
        for ident in set(self.records) - active_ids:
            pid = self.records[ident]['profile'].id
            self.worker.manager.stop(pid)
            with self.worker.lock:
                self.worker.store.profiles = [p for p in self.worker.store.profiles if p.id != pid]
                save_store(self.worker.store)
            del self.records[ident]
        self.error = None
