from __future__ import annotations
import math, struct, time
from .base import BaseAdapter, AdapterError

HEADER=b"\xAA\xAA"
ALARM_DESCRIPTIONS={
    0:"reinicialização pendente (exige reconhecimento local)",
    1:"instrução desconhecida pelo controlador",
    2:"falha do sistema de arquivos do controlador",
    3:"falha de comunicação interna MCU/FPGA",
    4:"falha de leitura de ângulo",
    16:"singularidade na posição solicitada",
    17:"posição solicitada fora da área alcançável",
    18:"alvo fora do alcance ou dos limites das juntas",
    33:"falha de cinemática inversa durante movimento",
    34:"limite de junta durante movimento",
    64:"limite positivo J1", 65:"limite negativo J1",
    66:"limite positivo J2", 67:"limite negativo J2",
    68:"limite positivo J3", 69:"limite negativo J3",
    70:"limite positivo J4", 71:"limite negativo J4",
}
DOBOT_LIMITS={"x":(-290.0,290.0),"y":(-290.0,290.0),"z":(-10.0,220.0),"r":(-180.0,180.0),"velocidade":(1.0,60.0)}
RADIAL_LIMITS=(80.0,290.0)
J4_LIMITS=(-135.0,135.0)
ROTATION_STEP_LIMIT=20.0

class MotionPreflightError(AdapterError):
    """Target rejected locally before any motion command reaches the robot."""
    pass

def validate_ptp(payload):
    values={}
    for key in ("x","y","z","r"):
        try:value=float(payload[key])
        except (KeyError,TypeError,ValueError):raise MotionPreflightError(f"Coordenada {key.upper()} inválida.")
        low,high=DOBOT_LIMITS[key]
        if isinstance(payload[key],bool) or not math.isfinite(value) or value<low or value>high:raise MotionPreflightError(f"{key.upper()} fora do envelope seguro ({low:g} a {high:g}).")
        values[key]=value
    radius=math.hypot(values["x"],values["y"])
    if radius<RADIAL_LIMITS[0] or radius>RADIAL_LIMITS[1]:
        raise MotionPreflightError(f"Movimento bloqueado antes de acionar o Dobot: raio XY {radius:.1f} mm fora da área preventiva ({RADIAL_LIMITS[0]:g} a {RADIAL_LIMITS[1]:g} mm). Mova no sentido oposto.")
    try:speed=float(payload.get("velocidade",30))
    except (TypeError,ValueError):raise MotionPreflightError("Velocidade inválida.")
    low,high=DOBOT_LIMITS["velocidade"]
    if isinstance(payload.get("velocidade"),bool) or not math.isfinite(speed) or speed<low or speed>high:raise MotionPreflightError(f"Velocidade fora do limite seguro ({low:g}% a {high:g}%).")
    values["velocidade"]=speed
    return values
def validate_rotation(payload):
    try:delta=float(payload["delta"])
    except (KeyError,TypeError,ValueError):raise MotionPreflightError("Passo de rotação inválido.")
    if isinstance(payload.get("delta"),bool) or not math.isfinite(delta) or delta==0 or abs(delta)>ROTATION_STEP_LIMIT:raise MotionPreflightError(f"Rotação por comando deve ficar entre {-ROTATION_STEP_LIMIT:g}° e {ROTATION_STEP_LIMIT:g}° e não pode ser zero.")
    try:speed=float(payload.get("velocidade",20))
    except (TypeError,ValueError):raise MotionPreflightError("Velocidade inválida.")
    low,high=DOBOT_LIMITS["velocidade"]
    if isinstance(payload.get("velocidade"),bool) or not math.isfinite(speed) or speed<low or speed>high:raise MotionPreflightError(f"Velocidade fora do limite seguro ({low:g}% a {high:g}%).")
    return {"delta":delta,"velocidade":speed}
def checksum(payload:bytes)->int:return (-sum(payload))&0xFF
def packet(command_id:int,rw:int=0,queued:bool=False,params:bytes=b"")->bytes:
    ctrl=(1 if rw else 0)|(2 if queued else 0); payload=bytes([command_id,ctrl])+params
    return HEADER+bytes([len(payload)])+payload+bytes([checksum(payload)])

class DobotMagicianAdapter(BaseAdapter):
    name="Dobot Magician"
    def __init__(self,params=None):
        super().__init__(params); self.ser=None; self.port=None; self.suction=False; self.gripper=False; self.cycles=0; self.production=0; self.queue_stopped=False; self.startup_reset_acknowledged=False; self.last_motion_target=None; self.last_ptp_diagnostic=None
    def _candidates(self):
        try:
            from serial.tools import list_ports
            specified=str(self.params.get("serialPort") or self.params.get("portName") or self.params.get("dobotPort") or "AUTO")
            if specified.upper()!="AUTO": return [specified]
            ports=list(list_ports.comports()); pref=[p.device for p in ports if any(k in f"{p.description} {p.manufacturer} {p.hwid}".lower() for k in ["dobot","ch340","usb serial","silicon labs","wch"])]; return pref+[p.device for p in ports if p.device not in pref]
        except Exception:return []
    def connect(self):
        try:import serial
        except Exception as e:raise AdapterError("pyserial não instalado.") from e
        errors=[]
        for port in self._candidates():
            try:
                self.ser=serial.Serial(port,int(self.params.get("baud") or 115200),timeout=.7,write_timeout=.7); self.port=port
                # Abrir conexão deve ser somente leitura. O SteelControl não
                # altera a fila do robô automaticamente ao abrir o dashboard.
                # Isso separa falhas do USB dos comandos de movimentação.
                self._get_pose()
                self._alarms()
                # A primeira movimentação explicitamente autorizada saneará
                # a fila anterior antes de enfileirar QUALQUER PTP novo.
                self.queue_stopped=True
                self.connected=True; return
            except Exception as e:
                errors.append(f"{port}: {e}")
                try:self.ser.close()
                except Exception:pass
                self.ser=None
        raise AdapterError("Dobot não encontrado. "+("; ".join(errors) if errors else "Nenhuma porta serial disponível."))
    def _read_frame(self,expected_id=None):
        deadline=time.monotonic()+1.2; buf=bytearray()
        while time.monotonic()<deadline:
            chunk=self.ser.read(1)
            if not chunk:continue
            buf+=chunk
            while len(buf)>=2 and bytes(buf[:2])!=HEADER:del buf[0]
            if len(buf)<3:continue
            total=3+buf[2]+1
            if len(buf)<total:
                buf+=self.ser.read(total-len(buf))
                if len(buf)<total:continue
            frame=bytes(buf[:total]);del buf[:total];payload=frame[3:-1]
            if ((sum(payload)+frame[-1])&0xFF)!=0:continue
            if expected_id is not None and payload[0]!=expected_id:continue
            return payload
        raise AdapterError("Timeout aguardando Dobot.")
    def _exchange(self,cid,rw=0,queued=False,params=b""):
        if not self.ser:raise AdapterError("Dobot não conectado.")
        self.ser.reset_input_buffer();self.ser.write(packet(cid,rw,queued,params));self.ser.flush();return self._read_frame(cid)
    @staticmethod
    def _queue_index(response):
        if not isinstance(response, (bytes, bytearray)) or len(response) < 2:
            return None
        params=response[2:]
        # O protocolo atual devolve uint64. Mantemos compatibilidade com
        # firmwares antigos que ainda respondem com quatro bytes.
        if len(params)>=8:return struct.unpack('<Q',params[:8])[0]
        return struct.unpack('<I',params[:4])[0] if len(params)>=4 else None
    def _current_queue_index(self):
        return self._queue_index(self._exchange(246,0,False))
    def _wait_queue_index(self,index,timeout=5.0):
        if index is None:return
        deadline=time.monotonic()+timeout
        while time.monotonic()<deadline:
            current=self._current_queue_index()
            # O índice é monotônico. Comparar apenas por igualdade podia perder
            # a confirmação quando o controlador avançava mais de um item entre
            # duas leituras.
            if current is not None and current>=index:return
            alarms=self._blocking_alarms()
            if alarms:raise AdapterError(f"Dobot bloqueou a fila por alarme(s): {self._describe_alarms(alarms)}. Use Limpar alarmes e, se persistir, reinicie o braço.")
            time.sleep(.05)
        raise AdapterError(f"Dobot recebeu o comando #{index}, mas a fila não o executou.")
    def _initialize_controller(self):
        # Sequência compatível com o controlador do Magician/Lite: a fila deve
        # estar rodando antes de receber os parâmetros e movimentos.
        self._exchange(240,1,False)
        self._exchange(245,1,False)
        self._exchange(80,1,True,struct.pack('<8f',*[200.0]*8))
        self._exchange(81,1,True,struct.pack('<4f',200.0,200.0,200.0,200.0))
        self._exchange(82,1,True,struct.pack('<2f',10.0,200.0))
        speed=float(self.params.get('speed') or 40.0)
        if not math.isfinite(speed) or not 1<=speed<=60:raise AdapterError('Velocidade de inicialização inválida.')
        response=self._exchange(83,1,True,struct.pack('<2f',speed,speed))
        self._exchange(240,1,False)
        self._wait_queue_index(self._queue_index(response),3.0)
        self.queue_stopped=False
    def _queue_and_start(self,cid,params=b""):
        if self.queue_stopped:
            # Somente após autorização de um movimento. A fila antiga pode
            # conter comandos de outra sessão: parar normalmente e limpar
            # antes de iniciar, nunca dar START em alvos desconhecidos.
            self._exchange(241,1,False)
            self._exchange(245,1,False)
        # Mantém a fila em execução antes e depois de inserir o comando. Isso
        # também recupera a fila depois de um STOP anterior.
        self._exchange(240,1,False)
        response=self._exchange(cid,1,True,params)
        self._exchange(240,1,False)
        self.queue_stopped=False
        return response
    @staticmethod
    def _target_reached(before, actual, target, keys):
        # Uma tolerancia fixa de 1,5 mm aceitava um PTP de 1 mm como
        # concluido SEM o braço sair da posicao inicial. Para eixos alterados
        # a tolerancia e proporcional ao passo, mantendo um piso realista.
        for key in keys:
            travelled = abs(target[key] - before[key])
            tolerance = min(1.5 if key != 'r' else 2.0,
                            max(0.15, travelled * 0.35)) if travelled > 0.01 else (1.5 if key != 'r' else 2.0)
            if abs(actual[key] - target[key]) > tolerance:
                return False
        return True

    @staticmethod
    def _motion_progressed(before, actual, keys):
        return any(abs(actual[k] - before[k]) >= (0.12 if k != 'r' else 0.2) for k in keys)

    def _set_speed(self,value):
        speed=float(value)
        if not math.isfinite(speed) or not 1<=speed<=60:raise AdapterError('Velocidade inválida.')
        # Parâmetro imediato: evita depender do estado residual da fila interna
        # do braço. A fila segura do SteelControl continua no backend/Edge.
        self._exchange(83,1,False,struct.pack('<2f',speed,speed))
    def _ensure_motion_ready(self):
        alarms=self._blocking_alarms()
        if not alarms:return
        raise AdapterError(f"Dobot possui alarme(s) ativo(s): {self._describe_alarms(alarms)}. Inspecione o equipamento e solicite a limpeza explicitamente.")
    def _blocking_alarms(self,alarms=None):
        alarms=self._alarms() if alarms is None else list(alarms)
        # Alguns firmwares do Magician/Lite mantêm o bit 0 visível mesmo após
        # confirmar ClearAllAlarmsState. Ele só deixa de bloquear depois que a
        # limpeza foi reconhecida nesta sessão. Todos os demais bits continuam
        # sendo bloqueantes sem exceção.
        if self.startup_reset_acknowledged:
            return [code for code in alarms if code!=0]
        return alarms
    @staticmethod
    def _describe_alarms(alarms):
        return ", ".join(f"{code} ({ALARM_DESCRIPTIONS.get(code,'consulte o manual Dobot')})" for code in alarms)
    def _recover_alarms(self):
        # Um PTP inválido pode deixar a fila interna tentando executar o mesmo
        # alvo. Primeiro interrompemos e descartamos essa fila; somente depois
        # enviamos ClearAllAlarmsState. Reiniciar a fila antes de confirmar a
        # limpeza fazia o alarme 18 reaparecer imediatamente.
        self.startup_reset_acknowledged=False
        alarms=self._alarms()
        for _ in range(5):
            self._exchange(241,1,False)
            self._exchange(245,1,False)
            self.queue_stopped=True
            self._exchange(21,1,False)
            time.sleep(.25)
            alarms=self._alarms()
            if not alarms:
                self.last_motion_target=None
                self._initialize_controller();self.queue_stopped=False;return
            if alarms==[0]:
                # ClearAllAlarmsState foi aceito, mas este firmware mantém o
                # aviso de boot no bitmap. Registramos o reconhecimento e ainda
                # exigimos que HOME/fila sejam realmente concluídos.
                self.startup_reset_acknowledged=True
                self.last_motion_target=None
                self._initialize_controller();self.queue_stopped=False;return
        target=""
        if self.last_motion_target:
            target=" Último alvo rejeitado: "+" ".join(f"{key.upper()}={self.last_motion_target[key]:.2f}" for key in ("x","y","z","r")) + "."
        raise AdapterError(f"Alarmes continuam ativos: {self._describe_alarms(alarms)}.{target} O alvo precisa ser ensinado novamente dentro da área alcançável; se o alarme permanecer após PARAR e limpar, desligue/ligue a alimentação do Dobot.")
    def _verify_effector(self,cid,enabled,on):
        state=self._exchange(cid,0,False)[2:]
        if len(state)>=2 and (bool(state[0])!=bool(enabled) or bool(state[1])!=bool(on)):
            raise AdapterError('O Dobot processou a fila, mas o efetuador não confirmou o estado solicitado.')
    def _recover_rejected_motion(self,alarms):
        self._exchange(242,1,False)
        self._exchange(245,1,False)
        self.queue_stopped=True
        return " Movimento interrompido. Inspecione o equipamento antes de limpar os alarmes explicitamente."
    def safety_stop(self):
        # Parada de software, best effort: não substitui circuito de emergência.
        self._exchange(242,1,False)
        self._exchange(245,1,False)
        self.queue_stopped=True
        self.startup_reset_acknowledged=False
    def _check_motion_guard(self):
        guard=self.params.get("_motionGuard")
        if guard:guard()
    def _get_pose(self):
        started=time.monotonic()
        p=self._exchange(10,0,False)[2:]
        self.last_pose_latency_ms=round((time.monotonic()-started)*1000,2)
        if len(p)<32:raise AdapterError("Resposta GetPose incompleta.")
        vals=struct.unpack('<8f',p[:32])
        if not all(math.isfinite(value) for value in vals):raise AdapterError("Pose do Dobot contém valor não finito.")
        return dict(zip(["x","y","z","r","j1","j2","j3","j4"],vals))
    def _alarms(self):
        p=self._exchange(20,0,False)[2:18];out=[]
        for bi,v in enumerate(p):
            for bit in range(8):
                if v&(1<<bit):out.append(bi*8+bit)
        return out
    def _telemetry_from_pose(self,pose,raw_alarms,queue="READY"):
        alarms=self._blocking_alarms(raw_alarms)
        data={"producao":self.production,"ciclos":self.cycles,"origem":"DOBOT_REAL","dadosExtras":{"dobot":{"mode":"REAL","connected":True,"port":self.port,"baudRate":int(self.params.get("baud") or 115200),"pose":{k:round(pose[k],4) for k in ["x","y","z","r"]},"joints":{k:round(pose[k],4) for k in ["j1","j2","j3","j4"]},"alarms":alarms,"rawAlarms":raw_alarms,"alarmDetails":[f"{a}: {ALARM_DESCRIPTIONS.get(a,'consulte manual Dobot')}" for a in raw_alarms],"startupResetAcknowledged":self.startup_reset_acknowledged,"queue":queue,"lastPtpDiagnostic":dict(self.last_ptp_diagnostic) if self.last_ptp_diagnostic else None,"endEffector":{"suction":self.suction,"gripper":self.gripper}}}}
        if hasattr(self,'last_pose_latency_ms'):data['latenciaMs']=self.last_pose_latency_ms
        return data
    def _publish_motion_pose(self,pose,alarms):
        observer=self.params.get('_poseObserver')
        if callable(observer):observer(self._telemetry_from_pose(pose,alarms,queue="MOVING"))
    def read_telemetry(self):
        return self._telemetry_from_pose(self._get_pose(),self._alarms())
    def execute_command(self,command,payload=None):
        payload=payload or {}
        if command in {"DOBOT_STOP","PARAR_SEGURANCA"}:self.safety_stop();return
        if command=="LIBERAR_OPERACAO":return
        if command=="DOBOT_CLEAR_ALARMS":
            self._recover_alarms();return
        if command=="DOBOT_HOME":
            self._ensure_motion_ready()
            self._exchange(30,1,False,struct.pack('<4f',200.0,0.0,0.0,0.0))
            self._exchange(31,1,False,struct.pack('<I',0));self.cycles+=1;return
        if command=="DOBOT_PTP":
            target=validate_ptp(payload);x=target['x'];y=target['y'];z=target['z'];r=target['r']
            self._ensure_motion_ready();self.last_motion_target={key:target[key] for key in ('x','y','z','r')};self._set_speed(target['velocidade'])
            before=self._get_pose()
            if all(abs(before[k]-target[k]) <= (0.25 if k != 'r' else 0.35) for k in ('x','y','z','r')):
                raise MotionPreflightError('Alvo PTP já coincide com a posição real atual. Nenhum movimento foi enviado; atualize a telemetria antes de tentar outro passo.')
            # O connect() parou e limpou a fila antiga por segurança. Para
            # movimentar novamente precisamos iniciar a fila do controlador.
            # SetPTPCmd (ID 84, modo MOVJ_XYZ=1) é enviado como queued=True;
            # o fim físico é confirmado pelas coordenadas, nunca apenas pelo ACK.
            response=self._queue_and_start(84,bytes([1])+struct.pack('<4f',x,y,z,r))
            queued_index=self._queue_index(response)
            self.last_ptp_diagnostic={"state":"EXECUTANDO", "sentQueueIndex":queued_index, "initialPose":{k:round(before[k],3) for k in ('x','y','z','r')}, "targetPose":{k:round(target[k],3) for k in ('x','y','z','r')}}
            queue_done=queued_index is None  # Alguns firmwares antigos não devolvem índice.
            last_queue_index=None
            deadline=time.monotonic()+12.0; moved=False; last=before; near_samples=0
            while time.monotonic()<deadline:
                self._check_motion_guard()
                time.sleep(.06)
                last=self._get_pose()
                raw_alarms=self._alarms()
                alarms=self._blocking_alarms(raw_alarms)
                if alarms:
                    self.last_ptp_diagnostic.update({"state":"FALHOU","rawAlarms":raw_alarms})
                    recovery=self._recover_rejected_motion(alarms)
                    raise AdapterError(f"Dobot rejeitou o alvo PTP X={x:.2f} Y={y:.2f} Z={z:.2f} R={r:.2f}: {self._describe_alarms(alarms)}.{recovery}")
                self._publish_motion_pose(last,alarms)
                moved = moved or self._motion_progressed(before,last,('x','y','z','r'))
                self.last_ptp_diagnostic.update({"actualPose":{k:round(last[k],3) for k in ('x','y','z','r')}, "rawAlarms":raw_alarms, "movementDetected":moved})
                if not queue_done:
                    current=self._current_queue_index()
                    last_queue_index=current
                    self.last_ptp_diagnostic["executedQueueIndex"]=current
                    queue_done=current is not None and current>=queued_index
                # Não libere o próximo PTP quando a pose inicial já estava
                # dentro da tolerância do pequeno passo pedido (1 mm / 1°).
                near=self._target_reached(before,last,target,('x','y','z','r'))
                near_samples = near_samples + 1 if near and moved and queue_done else 0
                if near_samples>=2:
                    self.last_motion_target=None;self.cycles+=1;self.production+=1
                    self.last_ptp_diagnostic["state"]="CONCLUIDO"; return
            # Diagnóstico factual para distinguir fila parada, alvo repetido e
            # ausência de deslocamento físico. Não envia movimento adicional.
            # Confirmar índice da fila NÃO comprova movimentação física.
            # Informar alarmes e juntas no instante da falha ajuda a separar
            # erro de alcance, controlador e telemetria sem mandar outro PTP.
            raw_alarms=self._alarms()
            queue_detail=f'fila enviada={queued_index if queued_index is not None else "sem índice"}, índice processado={last_queue_index if last_queue_index is not None else "não consultado"}'
            pose_detail=(f'inicial=({before["x"]:.2f},{before["y"]:.2f},{before["z"]:.2f},{before["r"]:.2f}); '
                         f'atual=({last["x"]:.2f},{last["y"]:.2f},{last["z"]:.2f},{last["r"]:.2f}); '
                         f'alvo=({x:.2f},{y:.2f},{z:.2f},{r:.2f})')
            extra=f'; alarmes={raw_alarms or "nenhum reportado"}; juntas=({last["j1"]:.2f},{last["j2"]:.2f},{last["j3"]:.2f},{last["j4"]:.2f})'
            self.last_ptp_diagnostic.update({"state":"FALHOU", "rawAlarms":raw_alarms,
                "actualJoints":{k:round(last[k],3) for k in ('j1','j2','j3','j4')}})
            if not queue_done:
                raise AdapterError(f'Dobot não confirmou fila PTP; {queue_detail}; {pose_detail}{extra}. Verifique estado, alarmes e LED.')
            if not moved:
                raise AdapterError(f'Dobot confirmou comando PTP, mas não houve deslocamento medido; {queue_detail}; {pose_detail}{extra}. Inspecione o braço antes de reconectar.')
            raise AdapterError(f'Dobot iniciou PTP mas não atingiu o destino; {queue_detail}; {pose_detail}{extra}.')
        if command=="DOBOT_ROTATE":
            rotation=validate_rotation(payload)
            self._ensure_motion_ready()
            before=self._get_pose();target_j4=before['j4']+rotation['delta']
            if target_j4<J4_LIMITS[0] or target_j4>J4_LIMITS[1]:
                raise MotionPreflightError(f"Rotação bloqueada antes de acionar o Dobot: J4 alvo {target_j4:.1f}° fora da faixa preventiva ({J4_LIMITS[0]:g}° a {J4_LIMITS[1]:g}°). Gire no sentido oposto.")
            self._set_speed(rotation['velocidade'])
            # MOVJ_ANGLE (modo 4) altera somente J4. Usar MOVJ_XYZ para girar
            # o efetuador fazia alguns firmwares recalcularem a postura inteira
            # e deslocarem X/Y, além de aproximar outras juntas dos limites.
            response=self._queue_and_start(84,bytes([4])+struct.pack('<4f',before['j1'],before['j2'],before['j3'],target_j4))
            queued_index=self._queue_index(response)
            queue_done=queued_index is None
            deadline=time.monotonic()+8.0;last=before;near_samples=0
            tolerance=min(1.5,max(0.15,abs(rotation['delta'])*0.35))
            while time.monotonic()<deadline:
                self._check_motion_guard()
                time.sleep(.06);last=self._get_pose();alarms=self._blocking_alarms()
                if alarms:
                    recovery=self._recover_rejected_motion(alarms)
                    raise AdapterError(f"Dobot recusou a rotação de J4: {self._describe_alarms(alarms)}.{recovery}")
                self._publish_motion_pose(last,alarms)
                if not queue_done:
                    current=self._current_queue_index()
                    queue_done=current is not None and current>=queued_index
                near=abs(last['j4']-target_j4)<=tolerance
                moved=abs(last['j4']-before['j4'])>=0.2
                near_samples=near_samples+1 if near and moved and queue_done else 0
                if near_samples>=2:
                    self.cycles+=1;return
            if not queue_done:
                raise AdapterError(f'Dobot não confirmou a execução da fila de rotação (índice {queued_index}).')
            if abs(last['j4']-before['j4'])<=0.2:
                raise AdapterError("Dobot recebeu a rotação, mas a junta J4 não iniciou movimento.")
            raise AdapterError(f"Dobot não concluiu a rotação. J4 atual={last['j4']:.2f}°, alvo={target_j4:.2f}°.")
        if command=="DOBOT_SUCTION_ON":self._exchange(62,1,False,bytes([1,1]));self._verify_effector(62,True,True);self.suction=True;return
        if command=="DOBOT_SUCTION_OFF":self._exchange(62,1,False,bytes([0,0]));self._verify_effector(62,False,False);self.suction=False;return
        if command=="DOBOT_GRIPPER_OPEN":self._exchange(63,1,False,bytes([1,0]));self._verify_effector(63,True,False);self.gripper=False;return
        if command=="DOBOT_GRIPPER_CLOSE":self._exchange(63,1,False,bytes([1,1]));self._verify_effector(63,True,True);self.gripper=True;return
        raise AdapterError(f"Comando Dobot não suportado: {command}")
    def close(self):
        try:
            if self.ser:self.ser.close()
        except Exception:pass
        super().close()
