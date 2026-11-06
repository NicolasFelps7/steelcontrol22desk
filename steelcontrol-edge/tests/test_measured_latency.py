import pathlib,sys,struct,unittest
from unittest.mock import Mock,patch
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parents[1]))
from adapters.dobot_adapter import DobotMagicianAdapter
class MeasuredLatency(unittest.TestCase):
 def test_latency_is_measured_from_serial_exchange_not_constant(self):
  d=DobotMagicianAdapter({});d._exchange=Mock(return_value=bytes([10,0])+struct.pack('<8f',200,0,100,0,0,30,40,0))
  with patch('adapters.dobot_adapter.time.monotonic',side_effect=[1.0,1.0125]):pose=d._get_pose()
  payload=d._telemetry_from_pose(pose,[])
  self.assertEqual(payload['latenciaMs'],12.5);self.assertNotIn('qualidadeSinal',payload)
if __name__=='__main__':unittest.main()
