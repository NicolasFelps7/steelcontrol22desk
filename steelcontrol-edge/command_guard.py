"""Local command validation and durable at-most-once admission.

An INICIADO record is never retried after a crash: the physical outcome is
unknown. This intentionally favours rejecting a movement over repeating it.
"""
from __future__ import annotations
import hashlib
import json
import sqlite3
from datetime import datetime, timezone
from edge_profiles import config_dir
from adapters.base import AdapterError
from adapters.dobot_adapter import validate_ptp, validate_rotation

STOP_COMMANDS = {'DOBOT_STOP', 'PARAR_SEGURANCA', 'IHM_STOP', 'PRINTER3D_CANCEL'}
DOBOT = {'DOBOT_STOP', 'DOBOT_CLEAR_ALARMS', 'DOBOT_PTP', 'DOBOT_ROTATE',
         'DOBOT_SUCTION_ON', 'DOBOT_SUCTION_OFF', 'DOBOT_GRIPPER_OPEN', 'DOBOT_GRIPPER_CLOSE'}
GENERIC = {'IHM_START', 'IHM_STOP', 'IHM_RESET', 'IHM_ACK', 'IHM_MODE_AUTO', 'IHM_MODE_MANUAL',
           'PARAR_SEGURANCA', 'LIBERAR_OPERACAO', 'PRINTER3D_PAUSE', 'PRINTER3D_RESUME',
           'PRINTER3D_CANCEL', 'PRINTER3D_HOME', 'PRINTER3D_LIGHT_ON', 'PRINTER3D_LIGHT_OFF'}


def _date(value):
    if not isinstance(value, str):
        raise AdapterError('Comando sem data válida.')
    try:
        date = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if date.tzinfo is None:
            raise ValueError('timezone')
        return date.timestamp()
    except (ValueError, TypeError, OverflowError) as error:
        raise AdapterError('Data de comando inválida.') from error


def validate_command(command, machine_id, driver, now=None):
    if not isinstance(command, dict):
        raise AdapterError('Envelope de comando inválido.')
    cid = command.get('id')
    if type(cid) is not int or cid <= 0 or cid > 2147483647:
        raise AdapterError('Identificador de comando inválido.')
    if type(command.get('maquinaId')) is not int or command['maquinaId'] != machine_id:
        raise AdapterError('Comando pertence a outra máquina.')
    attempt = command.get('tentativaEntrega')
    if type(attempt) is not int or attempt < 1:
        raise AdapterError('Entrega de comando inválida.')
    name = command.get('comando')
    allowed = DOBOT | {'PARAR_SEGURANCA', 'LIBERAR_OPERACAO'} if driver == 'DOBOT_MAGICIAN' else GENERIC
    if name not in allowed:
        raise AdapterError('Comando não permitido para este driver.')
    payload = command.get('payload')
    if not isinstance(payload, dict):
        raise AdapterError('Payload de comando inválido.')
    now = datetime.now(timezone.utc).timestamp() if now is None else now
    created = _date(command.get('criadoEm'))
    expires = _date(payload.get('expiresAt')) if payload.get('expiresAt') else (
        created + 15 if name in STOP_COMMANDS else _date(None))
    if created > now + 1 or expires <= now or expires <= created or expires - created > 60:
        raise AdapterError('Comando expirado ou com validade inválida. Confira o relógio do PC.')
    if name == 'DOBOT_PTP':
        validate_ptp(payload)
    elif name == 'DOBOT_ROTATE':
        validate_rotation(payload)
    return name, payload


def fingerprint(command):
    fields = {key: command.get(key) for key in ('id', 'maquinaId', 'comando', 'payload', 'criadoEm')}
    try:
        raw = json.dumps(fields, sort_keys=True, separators=(',', ':'), allow_nan=False)
    except (TypeError, ValueError) as error:
        raise AdapterError('Comando contém valores inválidos.') from error
    return hashlib.sha256(raw.encode()).hexdigest()


class CommandJournal:
    def __init__(self, path=None):
        path = path or config_dir() / 'command-journal.sqlite3'
        path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(str(path), timeout=5, isolation_level=None)
        try:
            path.chmod(0o600)
        except OSError:
            pass
        self.db.execute('PRAGMA synchronous=FULL')
        self.db.execute('CREATE TABLE IF NOT EXISTS commands (scope TEXT, id INTEGER, digest TEXT NOT NULL, status TEXT NOT NULL, PRIMARY KEY(scope,id))')
        self.db.execute('CREATE TABLE IF NOT EXISTS sequence (scope TEXT PRIMARY KEY, last_id INTEGER NOT NULL)')

    def begin(self, scope, command):
        """Commit before any USB/network write. Return previous result or None."""
        digest = fingerprint(command)
        cid = command['id']
        self.db.execute('BEGIN IMMEDIATE')
        try:
            old = self.db.execute('SELECT digest,status FROM commands WHERE scope=? AND id=?', (scope, cid)).fetchone()
            if old:
                if old[0] != digest:
                    raise AdapterError('Comando repetido com conteúdo adulterado.')
                result = old[1] if old[1] in {'CONCLUIDO', 'FALHOU'} else 'FALHOU'
            else:
                last = self.db.execute('SELECT last_id FROM sequence WHERE scope=?', (scope,)).fetchone()
                if last and cid <= last[0]:
                    raise AdapterError('Comando antigo recusado pelo registro local.')
                initial='FALHOU' if command['tentativaEntrega']!=1 and command['comando'] not in STOP_COMMANDS else 'INICIADO'
                self.db.execute('INSERT INTO commands VALUES (?,?,?,?)', (scope, cid, digest, initial))
                self.db.execute('INSERT INTO sequence VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET last_id=excluded.last_id', (scope, cid))
                # O contador monotônico preserva o bloqueio mesmo após compactar resultados.
                self.db.execute('DELETE FROM commands WHERE scope=? AND id NOT IN (SELECT id FROM commands WHERE scope=? ORDER BY id DESC LIMIT 1000)', (scope, scope))
                result = None if initial == "INICIADO" else initial
            self.db.execute('COMMIT')
            return result
        except Exception:
            self.db.execute('ROLLBACK')
            raise

    def finish(self, scope, cid, status):
        self.db.execute('UPDATE commands SET status=? WHERE scope=? AND id=?', (status, scope, cid))

    def close(self):
        self.db.close()
