"""Edge integrado: somente IPC por stdin/stdout; nenhuma porta de controle HTTP.

O Desktop é dono do processo. EOF encerra os drivers; a chave fica protegida
por DPAPI no perfil do usuário Windows. Não inicia descoberta/provisionamento LAN.
"""
from __future__ import annotations
import copy
import json
import socket
import sys
import threading
from urllib.parse import urlsplit

from edge_client import SteelControlClient
from edge_profiles import MachineProfile, DRIVER_NAMES, load_store, save_store
from edge_runtime import EdgeRuntimeManager

MAX_MESSAGE = 65536


class DesktopWorker:
    def __init__(self, emit, manager_factory=EdgeRuntimeManager, client_factory=SteelControlClient):
        self.emit = emit
        self.client_factory = client_factory
        self.lock = threading.RLock()
        self.store = load_store()
        self.states = {}
        self.manager = manager_factory(self.log, self.status)

    def log(self, pid, message):
        # Exceções de drivers podem conter endpoints locais. Não são enviadas ao site.
        self.emit({"event": "log", "profileId": pid, "message": str(message)[:1500]})

    def status(self, pid, state, extra):
        with self.lock:
            self.states[pid] = {"state": state, "driver": extra.get("driver")}
        self.emit({"event": "status", "profileId": pid, "state": state})

    def snapshot(self):
        with self.lock:
            return {"profiles": [self.public_profile(p) for p in self.store.profiles],
                    "drivers": DRIVER_NAMES}

    def public_profile(self, p):
        return {"id": p.id, "label": p.label, "serverUrl": p.server_url,
                "machineId": p.machine_id, "driver": p.driver, "params": p.params,
                "enabled": p.enabled, "allowCommands": p.allow_commands,
                "intervalMs": p.interval_ms, "hasKey": bool(p.device_key),
                "state": self.states.get(p.id, {}).get("state", "STOPPED")}

    @staticmethod
    def validate_server(server):
        u = urlsplit(server)
        if u.username or u.password or u.query or u.fragment or u.path not in ("", "/"):
            raise ValueError("Informe somente o endereço base do servidor, sem senha ou caminho.")
        if not u.hostname or (u.scheme != "https" and not (
                u.scheme == "http" and u.hostname in {"localhost", "127.0.0.1", "::1"})):
            raise ValueError("Use HTTPS para o servidor ou HTTP somente em localhost.")

    def _find(self, pid):
        p = next((x for x in self.store.profiles if x.id == pid), None)
        if p is None:
            raise ValueError("Conexão não encontrada.")
        return p

    def _save(self):
        # Inclusive uma lista vazia precisa substituir o arquivo antigo.
        save_store(self.store)

    def dispatch(self, action, data):
        if action == "list":
            return self.snapshot()
        if action == "ports":
            from serial.tools import list_ports
            return [{"port": p.device, "description": p.description} for p in list_ports.comports()]
        if action == "save":
            with self.lock:
                previous = self._find(data["id"]) if data.get("id") else None
                p = copy.deepcopy(previous) if previous else MachineProfile()
            p.label = str(data.get("label") or "Máquina")[:120]
            p.server_url = str(data.get("serverUrl") or "").strip().rstrip("/")
            self.validate_server(p.server_url)
            p.machine_id = int(data.get("machineId") or 0)
            p.device_key = str(data.get("deviceKey") or (previous.device_key if previous else ""))
            p.driver = str(data.get("driver") or "AUTO")
            p.params = dict(data.get("params") or {})
            p.interval_ms = int(data.get("intervalMs") or 2000)
            p.allow_commands = data.get("allowCommands") is True
            p.enabled = True
            p.validate()
            with self.lock:
                for other in self.store.profiles:
                    if other.id != p.id and (other.server_url, other.machine_id) == (p.server_url, p.machine_id):
                        raise ValueError("Esta máquina já tem uma conexão neste computador.")
            # Não salva uma chave incorreta nem declara ONLINE antes do driver conectar.
            cfg = self.client_factory(p.server_url, p.machine_id, p.device_key).config()
            p.label = str(cfg.get("nome") or p.label)[:120]
            if previous:
                self.manager.stop(previous.id)
            with self.lock:
                old_profiles = list(self.store.profiles)
                self.store.profiles = [p if x.id == p.id else x for x in self.store.profiles]
                if not previous:
                    self.store.profiles.append(p)
                try:
                    self._save()
                except Exception:
                    self.store.profiles = old_profiles
                    raise
            self.manager.start(p)
            return self.public_profile(p)
        if action in {"connect", "disconnect", "remove"}:
            with self.lock:
                p = self._find(str(data.get("id") or ""))
            self.manager.stop(p.id)
            with self.lock:
                old_profiles = list(self.store.profiles)
                was_enabled = p.enabled
                if action == "remove":
                    self.store.profiles = [x for x in self.store.profiles if x.id != p.id]
                else:
                    p.enabled = action == "connect"
                try:
                    self._save()
                except Exception:
                    p.enabled = was_enabled
                    self.store.profiles = old_profiles
                    raise
            if action == "connect":
                self.manager.start(p)
            return {"ok": True}
        raise ValueError("Ação não permitida.")

    def autostart(self):
        for p in self.store.profiles:
            if p.enabled:
                try:
                    self.validate_server(p.server_url)
                    p.validate()
                    self.manager.start(p)
                except Exception:
                    self.status(p.id, "ERROR", {})

    def close(self):
        self.manager.stop_all()


def main():
    if "--self-test" in sys.argv:
        from secret_store import protect_text, unprotect_text
        if unprotect_text(protect_text("desktop-self-test")) != "desktop-self-test":
            raise RuntimeError("Proteção de credenciais indisponível")
        print("SteelControl Edge: drivers e proteção de credenciais disponíveis")
        return 0
    output_lock = threading.Lock()
    def emit(value):
        with output_lock:
            sys.stdout.write(json.dumps(value, ensure_ascii=True) + "\n")
            sys.stdout.flush()
    # Também impede execução simultânea com a versão antiga do Edge.
    guard = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        guard.bind(("127.0.0.1", 4212))
        guard.listen(1)
    except OSError:
        emit({"event": "fatal", "message": "Feche o SteelControl Edge antigo antes de abrir o Desktop."})
        return 2
    worker = DesktopWorker(emit)
    try:
        worker.autostart()
        emit({"event": "ready"})
        while True:
            line = sys.stdin.readline(MAX_MESSAGE + 1)
            if not line:
                break
            if len(line) > MAX_MESSAGE:
                break
            request_id = None
            try:
                request = json.loads(line)
                request_id = request.get("id")
                if request.get("action") == "shutdown":
                    break
                result = worker.dispatch(request.get("action"), request.get("data") or {})
                emit({"id": request_id, "result": result})
            except Exception as exc:
                # Nunca devolve a Device Key nem objetos de requisição HTTP.
                message = str(exc) if isinstance(exc, ValueError) else "Falha na conexão ou no armazenamento. Confira servidor, chave e disponibilidade da máquina."
                emit({"id": request_id, "error": message[:500]})
    finally:
        worker.close()
        guard.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
