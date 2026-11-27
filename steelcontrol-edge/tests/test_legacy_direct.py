import pathlib,sys,struct,unittest
from unittest.mock import Mock,patch
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
from adapters.dobot_adapter import DobotMagicianAdapter,AdapterError
class Robot(DobotMagicianAdapter):
 def __init__(self):
  super().__init__({});self.calls=[];self.pose=dict(x=150.,y=0.,z=100.,r=0.,j1=0.,j2=20.,j3=30.,j4=0.);self.alarms=[];self.stalled=False;self.queue_stopped=True
 def _get_pose(self):return dict(self.pose)
 def _alarms(self):return self.alarms
 def _exchange(self,cid,rw=0,queued=False,params=b''):
  self.calls.append((cid,queued,params))
  if cid==84:
   if queued:raise AssertionError('Movimento enfileirado indevidamente')
   if not self.stalled:
    vals=struct.unpack('<4f',params[1:]);self.pose.update(dict(zip(['x','y','z','r'] if params[0]==1 else ['j1','j2','j3','j4'],vals)))
  if cid in (83,246):return bytes([cid,0])+struct.pack('<Q',7)
  return bytes([cid,0])
class DirectChecks(unittest.TestCase):
 def move(self,d,x=151):d.execute_command('DOBOT_PTP',dict(x=x,y=0,z=100,r=0,velocidade=10))
 def test_thirty_moves_use_immediate_packets_without_initializing_queue(self):
  d=Robot();d.params['_motionGuard']=Mock();seen=[];d.params['_poseObserver']=seen.append
  with patch('adapters.dobot_adapter.time.sleep'):
   for x in range(151,181):self.move(d,x)
  self.assertEqual(d.production,30);self.assertEqual(sum(cid==80 for cid,_,_ in d.calls),0)
  self.assertEqual(sum(cid==84 for cid,_,_ in d.calls),30)
  self.assertTrue(all(not q for cid,q,_ in d.calls if cid==84));self.assertGreater(len(seen),30)
  self.assertFalse(any(cid in (240,80,81,82,246) for cid,_,_ in d.calls));self.assertNotIn(21,[cid for cid,_,_ in d.calls])
 def test_rotation_preserves_other_joints(self):
  d=Robot()
  with patch('adapters.dobot_adapter.time.sleep'):d.execute_command('DOBOT_ROTATE',{'delta':1,'velocidade':10})
  c=next(c for c in d.calls if c[0]==84);self.assertFalse(c[1]);self.assertEqual(c[2][0],4)
  self.assertEqual(struct.unpack('<4f',c[2][1:]),(0,20,30,1))
 def test_active_alarm_never_prepares_or_moves(self):
  d=Robot();d.alarms=[18]
  with self.assertRaises(AdapterError):self.move(d)
  self.assertEqual(d.calls,[])
 def test_revocation_before_motion_prevents_ptp(self):
  d=Robot();d.params['_motionGuard']=Mock(side_effect=AdapterError('revogado'))
  with self.assertRaises(AdapterError):self.move(d)
  self.assertEqual(d.calls,[])
 def test_stop_does_not_restart_old_queue_on_next_authorized_move(self):
  d=Robot()
  with patch('adapters.dobot_adapter.time.sleep'):
   self.move(d);d.safety_stop();self.move(d,152)
  self.assertEqual(sum(cid==80 for cid,_,_ in d.calls),0)
 def test_ack_without_displacement_fails(self):
  d=Robot();d.stalled=True;d.queue_stopped=False
  with patch('adapters.dobot_adapter.time.monotonic',side_effect=range(100)),patch('adapters.dobot_adapter.time.sleep'):
   with self.assertRaisesRegex(AdapterError,'não houve deslocamento'):self.move(d)
  self.assertEqual(d.production,0)
 def test_serial_failure_does_not_report_success(self):
  d=Robot();d._exchange=Mock(side_effect=AdapterError('serial failed'))
  with self.assertRaises(AdapterError):self.move(d)
  self.assertEqual(d.production,0)
if __name__=='__main__':unittest.main()
