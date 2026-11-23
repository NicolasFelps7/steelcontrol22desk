import pathlib,sys,unittest
from unittest.mock import Mock,patch
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
from adapters.dobot_adapter import DobotMagicianAdapter,AdapterError
from edge_runtime import MachineRuntime
from edge_profiles import MachineProfile

def pose(x,j):return dict(x=x,y=0,z=100,r=0,j1=j,j2=30,j3=40,j4=0)
class MotionTelemetry(unittest.TestCase):
 def driver(self,observer):
  d=DobotMagicianAdapter({'_poseObserver':observer});d._ensure_motion_ready=Mock();d._set_speed=Mock();d._exchange=Mock();d._blocking_alarms=Mock(return_value=[]);d._alarms=Mock(return_value=[]);d._get_pose=Mock(side_effect=[pose(150,0),pose(175,10),pose(200,20),pose(200,20)]);return d
 def test_publishes_measured_intermediate_pose_before_command_returns(self):
  seen=[];d=self.driver(seen.append)
  with patch('adapters.dobot_adapter.time.sleep'):d.execute_command('DOBOT_PTP',{'x':200,'y':0,'z':100,'r':0,'velocidade':10})
  self.assertEqual([p['dadosExtras']['dobot']['pose']['x'] for p in seen],[175,200,200]);self.assertEqual(seen[0]['dadosExtras']['dobot']['joints']['j1'],10);self.assertEqual(seen[0]['dadosExtras']['dobot']['queue'],'MOVING');self.assertEqual(d.cycles,1);self.assertEqual(d._exchange.call_count,3);self.assertEqual([c.args[0] for c in d._exchange.call_args_list],[240,84,240]);self.assertTrue(d._exchange.call_args_list[1].args[2])
 def test_first_ptp_after_connect_restarts_stopped_queue(self):
  seen=[];d=self.driver(seen.append);d.queue_stopped=True
  with patch('adapters.dobot_adapter.time.sleep'):d.execute_command('DOBOT_PTP',{'x':200,'y':0,'z':100,'r':0,'velocidade':10})
  self.assertEqual([c.args[0] for c in d._exchange.call_args_list],[241,245,240,84,240])
  self.assertTrue(d._exchange.call_args_list[3].args[2])
  self.assertFalse(d.queue_stopped)
  self.assertEqual(d.cycles,1)
 def test_publication_failure_is_not_reported_as_completed_motion(self):
  d=self.driver(Mock(side_effect=RuntimeError('offline')))
  with patch('adapters.dobot_adapter.time.sleep'),self.assertRaises(RuntimeError):d.execute_command('DOBOT_PTP',{'x':200,'y':0,'z':100,'r':0})
  self.assertEqual(d.cycles,0)
 def test_edge_publishes_fault_reason_and_latch_without_exposing_secrets(self):
  rt=MachineRuntime(MachineProfile(machine_id=7),lambda *_:None,lambda *_:None)
  rt.control_latched=True
  rt.last_dobot_command={'id':44,'command':'DOBOT_PTP','status':'FALHOU','reason':'Fila PTP não concluiu'}
  d={'dadosExtras':{'dobot':{'connected':True,'alarms':[]}}}
  rt._publish_dobot_diagnostic(d,'DOBOT_MAGICIAN')
  self.assertEqual(d['dadosExtras']['dobot']['lastCommandDiagnostic']['id'],44)
  self.assertTrue(d['dadosExtras']['dobot']['edgeControlLatched'])
  other={'dadosExtras':{}}
  rt._publish_dobot_diagnostic(other,'GENERIC')
  self.assertEqual(other,{'dadosExtras':{}})
 def test_network_telemetry_failure_does_not_abort_authorized_move(self):
  logs=[]
  runtime=MachineRuntime(MachineProfile(machine_id=7),lambda _,msg:logs.append(msg),lambda *_:None)
  client=Mock();from requests.exceptions import ConnectionError as HttpConnectionError
  client.telemetry.side_effect=[HttpConnectionError('rede oscilou'),None]
  observe=runtime._motion_observer(client)
  with patch('edge_runtime.time.monotonic',side_effect=[1,1.3]):
   observe({'dadosExtras':{'dobot':{'pose':{'x':150}}}})
   observe({'dadosExtras':{'dobot':{'pose':{'x':151}}}})
  self.assertEqual(client.telemetry.call_count,2)
  self.assertEqual(len([msg for msg in logs if 'Telemetria de movimento indisponível' in msg]),1)
  runtime.stop_event.set()
  with self.assertRaises(AdapterError): observe({})
 def test_observer_throttles_and_respects_local_stop(self):
  r=MachineRuntime(MachineProfile(machine_id=7),lambda *_:None,lambda *_:None);c=Mock();observe=r._motion_observer(c)
  with patch('edge_runtime.time.monotonic',side_effect=[1,1.1,1.3]):observe({'n':1});observe({'n':2});observe({'n':3})
  self.assertEqual(c.telemetry.call_count,2);self.assertEqual(c.telemetry.call_args.kwargs,{'timeout':2});r.stop_event.set()
  with self.assertRaises(AdapterError):observe({})
if __name__=='__main__':unittest.main()
