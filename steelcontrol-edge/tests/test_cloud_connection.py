import json
import os
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from cloud_connection import CloudConnection
from edge_profiles import EdgeStore,MachineProfile,save_store,load_store

class Manager:
    def __init__(self): self.runtimes={}; self.stopped=[]
    def start(self,p): self.runtimes[p.id]=p
    def stop(self,pid): self.stopped.append(pid); self.runtimes.pop(pid,None)
class Worker:
    def __init__(self): self.lock=threading.RLock();self.store=load_store();self.states={};self.manager=Manager()
    def status(self,pid,state,extra): self.states[pid]={'state':state}
class Response:
    def __init__(self,data,status=200):self.data=data;self.status_code=status
    def json(self):return self.data
    def raise_for_status(self):
        if self.status_code>=400:raise RuntimeError('HTTP error')
class Session:
    def __init__(self):self.data={'vinculado':True,'conexoes':[]};self.status=200;self.payloads=[]
    def post(self,url,**kw):self.payloads.append(kw);return Response(self.data,self.status)

class CloudTest(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.environment=patch.dict(os.environ,{'STEELCONTROL_EDGE_HOME':self.temp.name});self.environment.start()
        self.worker=Worker();self.cloud=CloudConnection(self.worker,'https://example.test');self.session=Session();self.cloud.session=self.session
        self.cloud.state={'id':'h','token':'unit-connection-token','vinculado':True};self.cloud.claimed=True
        self.ports=patch('serial.tools.list_ports.comports',return_value=[]);self.ports.start()
    def tearDown(self):self.ports.stop();self.environment.stop();self.temp.cleanup()
    def config(self,**changes):return {'id':'c','maquinaId':7,'nome':'Máquina','driver':'MOCK','parametros':{},'ativa':True,'comandos':False,'versao':1,'credencial':'unit-machine-key-private',**changes}
    def sync(self,config):self.session.data={'vinculado':True,'conexoes':config};self.cloud.sync(self.cloud.state)
    def test_save_then_ack_no_raw_key_in_store(self):
        self.sync([self.config()]);self.assertIn('cloud-c',self.worker.manager.runtimes)
        self.assertFalse(self.worker.manager.runtimes['cloud-c'].allow_commands)
        text=(Path(self.temp.name)/'edge-profiles.json').read_text();self.assertNotIn('unit-machine-key-private',text)
        self.sync([self.config(credencial=None)]);self.assertEqual(self.session.payloads[-1]['json']['estados'][0]['salvo'],True)
    def test_restart_revalidates_then_starts_profile_without_redelivering_secret(self):
        self.sync([self.config()]);worker=Worker();cloud=CloudConnection(worker,'https://example.test');cloud.session=self.session;cloud.state=self.cloud.state;cloud.claimed=True
        self.session.data={'vinculado':True,'conexoes':[self.config(credencial=None)]}
        self.assertEqual(worker.manager.runtimes,{})
        cloud.sync(cloud.state);self.assertIn('cloud-c',worker.manager.runtimes)
    def test_revoked_host_stops_and_disables_saved_profiles(self):
        self.sync([self.config()]);self.session.status=401;self.cloud.sync(self.cloud.state)
        self.assertEqual(self.worker.manager.runtimes,{})
        self.assertFalse(load_store().profiles[0].enabled);self.assertEqual(self.cloud.state,{})
    def test_new_version_disables_previous_connection(self):
        self.sync([self.config()]);self.sync([self.config(versao=2,ativa=False,credencial=None)])
        self.assertEqual(self.worker.manager.runtimes,{})
        self.assertFalse(load_store().profiles[0].enabled)
    def test_server_removal_stops_machine_and_removes_local_key(self):
        self.sync([self.config()]);self.sync([])
        self.assertEqual(load_store().profiles,[]);self.assertEqual(self.worker.manager.runtimes,{})
    def test_write_failure_never_acknowledges_credential(self):
        with patch('cloud_connection.save_store',side_effect=OSError('disk')):
            with self.assertRaises(OSError):self.sync([self.config()])
        self.assertEqual(self.cloud.records,{})
        self.assertEqual(self.worker.manager.runtimes,{})

class ConnectionStateTest(unittest.TestCase):
    def test_online_requires_first_telemetry_accepted_by_server(self):
        from edge_runtime import MachineRuntime
        from unittest.mock import Mock
        states=[]
        runtime=MachineRuntime(MachineProfile(id='test',label='Teste',server_url='https://example.test',machine_id=7,device_key='test-key',driver='SERIAL_JSON'),lambda *_:None,lambda _,state,extra:states.append(state))
        client=Mock();client.config.return_value={};client.next_command.return_value=None
        adapter=Mock()
        def received():
            self.assertNotIn('ONLINE',states)
            return {'temperatura':25}
        def accepted(data):
            self.assertNotIn('ONLINE',states)
            runtime.stop_event.set()
        adapter.read_telemetry.side_effect=received
        client.telemetry.side_effect=accepted
        with patch('edge_runtime.SteelControlClient',return_value=client),patch('edge_runtime.create_adapter',return_value=adapter):runtime._run()
        self.assertEqual(states,['CONNECTING','ONLINE','STOPPED'])
        client.telemetry.assert_called_once()

if __name__=='__main__':unittest.main()
