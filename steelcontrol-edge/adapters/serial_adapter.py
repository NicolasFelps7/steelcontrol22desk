from __future__ import annotations
import json
import math
import time
from collections import deque
from .base import BaseAdapter, AdapterError

class SerialJsonAdapter(BaseAdapter):
    name = "Serial genérica / JSON"
    def connect(self):
        try: import serial
        except Exception as e: raise AdapterError("pyserial não instalado.") from e
        port=str(self.params.get("serialPort") or self.params.get("port") or "").strip()
        if not port or port.upper()=="AUTO":
            try:
                from serial.tools import list_ports
                ports=list(list_ports.comports())
                if not ports: raise AdapterError("Nenhuma porta serial detectada.")
                port=ports[0].device
            except AdapterError: raise
            except Exception as e: raise AdapterError(f"Falha ao detectar porta serial: {e}") from e
        self.ser=serial.Serial(port=port, baudrate=int(self.params.get("baud") or 115200), timeout=max(0.1,min(1.0,float(self.params.get("timeout") or 1.0))))
        self.connected=True
        self.pending_telemetry=deque(maxlen=32)
    def _packet(self):
        raw=self.ser.readline(65537).decode("utf-8", errors="replace").strip()
        if not raw:return None
        if len(raw)>65536:raise AdapterError('Mensagem serial excedeu o limite permitido.')
        try:data=json.loads(raw)
        except Exception as e:raise AdapterError('Serial recebeu mensagem incompatível com JSON por linha.') from e
        if not isinstance(data,dict):raise AdapterError('Telemetria serial precisa ser um objeto JSON.')
        return data
    def _telemetry(self,data):
        source=data.get('telemetria',data)
        if not isinstance(source,dict):raise AdapterError('Telemetria serial inválida.')
        result=dict(source)
        for field,path in (self.params.get('fieldMap') or {}).items():
            value=source
            for part in str(path).split('.'):
                value=value.get(part) if isinstance(value,dict) else None
            if value is not None:
                if isinstance(value,bool):raise AdapterError('Leitura mapeada inválida.')
                try:n=float(value)
                except (ValueError,TypeError) as e:raise AdapterError('Leitura mapeada inválida.') from e
                if not math.isfinite(n):raise AdapterError('Leitura mapeada inválida.')
                result[field]=n
        canonical={'temperatura','vibracao','corrente','producao','ciclos','consumoEnergia','dadosExtras'}
        if source and 'dadosExtras' not in result:
            extra={key:value for key,value in source.items() if key not in canonical}
            if extra:result['dadosExtras']={'equipamento':extra}
        return result
    def read_telemetry(self):
        pending=getattr(self,'pending_telemetry',None)
        data=pending.popleft() if pending else self._packet()
        if not data or 'ack' in data:return {}
        return self._telemetry(data)
    def execute_command(self, command, payload=None, command_id=None):
        if command_id is None:raise AdapterError('Comando serial sem identificador de confirmação.')
        mapped=(self.params.get('commandMap') or {}).get(command,command)
        if not isinstance(mapped,str) or not mapped.strip():raise AdapterError('Mapeamento de comando serial inválido.')
        deadline=time.monotonic()+max(1,min(10,float(self.params.get('ackTimeout') or 5)))
        packet={"id":command_id,"comando":mapped,"payload":payload or {}}
        self.ser.write((json.dumps(packet, ensure_ascii=False)+"\n").encode("utf-8")); self.ser.flush()
        if not hasattr(self,'pending_telemetry'):self.pending_telemetry=deque(maxlen=32)
        while time.monotonic()<deadline:
            data=self._packet()
            if not data:continue
            ack=data.get('ack')
            if isinstance(ack,dict):
                if ack.get('id')!=command_id:continue
                if ack.get('status')=='CONCLUIDO':return
                if ack.get('status')=='FALHOU':raise AdapterError('O equipamento informou falha na execução do comando.')
            else:self.pending_telemetry.append(data)
        raise AdapterError('O equipamento não confirmou o comando serial dentro do prazo.')
    def close(self):
        try: self.ser.close()
        except Exception: pass
        super().close()
