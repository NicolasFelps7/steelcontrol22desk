import pathlib,sys,unittest
from unittest.mock import Mock,patch
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
from adapters.dobot_adapter import DobotMagicianAdapter,AdapterError
from edge_runtime import MachineRuntime
from edge_profiles import MachineProfile

def pose(x,j):return dict(x=x,y=0,z=100,r=0,j1=j,j2=30,j3=40,j4=0)
class MotionTelemetry(unittest.TestCase):
 def driver(self,observer):
  d=DobotMagicianAdapter({'_poseObserver':observer});d._ensure_motion_ready=Mock();d._set_speed=Mock();d._exchange=Mock();d._blocking_alarms=Mock(return_value=[]);d._get_pose=Mock(side_effect=[pose(150,0),pose(175,10),pose(200,20)]);return d
 def test_publishes_measured_intermediate_pose_before_command_returns(self):
  seen=[];d=self.driver(seen.append)
  with patch('adapters.dobot_adapter.time.sleep'):d.execute_command('DOBOT_PTP',{'x':200,'y':0,'z':100,'r':0,'velocidade':10})
  self.assertEqual([p['dadosExtras']['dobot']['pose']['x'] for p in seen],[175,200]);self.assertEqual(seen[0]['dadosExtras']['dobot']['joints']['j1'],10);self.assertEqual(seen[0]['dadosExtras']['dobot']['queue'],'MOVING');self.assertEqual(d.cycles,1);self.assertEqual(d._exchange.call_count,1)
 def test_publication_failure_is_not_reported_as_completed_motion(self):
  d=self.driver(Mock(side_effect=RuntimeError('offline')))
  with patch('adapters.dobot_adapter.time.sleep'),self.assertRaises(RuntimeError):d.execute_command('DOBOT_PTP',{'x':200,'y':0,'z':100,'r':0})
  self.assertEqual(d.cycles,0)
 def test_observer_throttles_and_respects_local_stop(self):
  r=MachineRuntime(MachineProfile(machine_id=7),lambda *_:None,lambda *_:None);c=Mock();observe=r._motion_observer(c)
  with patch('edge_runtime.time.monotonic',side_effect=[1,1.1,1.3]):observe({'n':1});observe({'n':2});observe({'n':3})
  self.assertEqual(c.telemetry.call_count,2);self.assertEqual(c.telemetry.call_args.kwargs,{'timeout':2});r.stop_event.set()
  with self.assertRaises(AdapterError):observe({})
if __name__=='__main__':unittest.main()
