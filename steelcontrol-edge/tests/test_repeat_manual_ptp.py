import pathlib
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from adapters.dobot_adapter import DobotMagicianAdapter, AdapterError, MotionPreflightError


def pose(x=150, y=150, z=100, r=0):
    return dict(x=float(x), y=float(y), z=float(z), r=float(r), j1=10., j2=20., j3=30., j4=40.)


class Probe(DobotMagicianAdapter):
    def __init__(self, positions):
        super().__init__({})
        self.positions = iter(positions)
        self.calls = []
        self._set_speed = lambda _value: None
        self._ensure_motion_ready = lambda: None
    def _get_pose(self):
        return next(self.positions)
    def _exchange(self, cid, rw=0, queued=False, params=b''):
        self.calls.append((cid, rw, queued))
        return bytes([cid, 0])
    def _blocking_alarms(self, _raw=None):
        return []


class ManualRepeatChecks(unittest.TestCase):
    def test_duplicate_target_does_not_enter_queue_or_block_future_commands(self):
        robot = Probe([pose(155)])
        with self.assertRaisesRegex(MotionPreflightError, 'coincide com a posição real'):
            robot.execute_command('DOBOT_PTP', dict(x=155, y=150, z=100, r=0, velocidade=20))
        self.assertFalse(any(cid == 84 for cid, _, _ in robot.calls))

    def test_two_distinct_consecutive_moves_are_accepted_and_confirmed(self):
        robot = Probe([pose(150), pose(155), pose(155), pose(155), pose(160), pose(160)])
        with patch('adapters.dobot_adapter.time.sleep'):
            robot.execute_command('DOBOT_PTP', dict(x=155, y=150, z=100, r=0, velocidade=20))
            robot.execute_command('DOBOT_PTP', dict(x=160, y=150, z=100, r=0, velocidade=20))
        self.assertEqual(robot.production, 2)
        self.assertEqual(sum(cid == 84 for cid, _, _ in robot.calls), 2)

    def test_real_stall_remains_fatal_and_provides_transport_and_pose(self):
        robot = Probe([pose(150)] * 9)
        clock = iter([0, 1, 4, 8, 12, 13, 14, 15])
        with patch('adapters.dobot_adapter.time.monotonic', side_effect=lambda: next(clock)), patch('adapters.dobot_adapter.time.sleep'):
            with self.assertRaises(AdapterError) as error:
                robot.execute_command('DOBOT_PTP', dict(x=155, y=150, z=100, r=0, velocidade=20))
        detail = str(error.exception)
        self.assertIn('não houve deslocamento medido', detail)
        self.assertIn('transporte imediato', detail)
        self.assertIn('inicial=', detail)
        self.assertIn('alvo=', detail)


if __name__ == '__main__':
    unittest.main()
