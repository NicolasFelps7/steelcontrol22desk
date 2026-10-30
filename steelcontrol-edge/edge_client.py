from __future__ import annotations
import requests
from transport_security import validate_server_url

class SteelControlClient:
    def __init__(self, base_url:str, machine_id:int, device_key:str, timeout=8):
        self.base=validate_server_url(base_url); self.machine_id=int(machine_id); self.timeout=timeout
        self.session=requests.Session(); self.session.trust_env=False; self.session.headers.update({'X-Device-Key':device_key,'X-SteelControl-Command-Protocol':'2','Accept':'application/json'})
    def _url(self,path): return f"{self.base}/device/{self.machine_id}{path}"
    @staticmethod
    def _check(response):
        if 300 <= response.status_code < 400:
            raise requests.RequestException("Redirecionamento do servidor recusado para proteger a credencial.")
        response.raise_for_status()
    def authorize(self,command_id):
        r=self.session.post(self._url(f"/comandos/{int(command_id)}/autorizar"),json={},timeout=min(self.timeout,2),allow_redirects=False)
        self._check(r); return r.json()
    def config(self):
        r=self.session.get(self._url('/config'),timeout=self.timeout,allow_redirects=False); self._check(r); return r.json()
    def heartbeat(self):
        r=self.session.post(self._url('/heartbeat'),json={},timeout=self.timeout,allow_redirects=False); self._check(r); return r.json()
    def telemetry(self,payload):
        r=self.session.post(self._url('/telemetria'),json=payload,timeout=self.timeout,allow_redirects=False); self._check(r); return r.json()
    def next_command(self,wait_ms=180):
        wait_ms=max(0,min(250,int(wait_ms or 0)))
        r=self.session.get(self._url('/comandos/proximo'),params={'waitMs':wait_ms},timeout=self.timeout,allow_redirects=False)
        if r.status_code==204:return None
        self._check(r); return r.json()
    def confirm(self,command_id,status):
        r=self.session.post(self._url(f'/comandos/{int(command_id)}/confirmar'),json={'status':status},timeout=self.timeout,allow_redirects=False); self._check(r); return r.json()
