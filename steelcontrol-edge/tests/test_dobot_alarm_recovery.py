import importlib.util
import pathlib
import struct
import sys
import types
import unittest


EDGE_ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(EDGE_ROOT))
from adapters.dobot_adapter import AdapterError, DobotMagicianAdapter, MotionPreflightError



class RecoveryProbe(DobotMagicianAdapter):
    def __init__(self, alarm_reads):
        super().__init__({})
        self.alarm_reads = list(alarm_reads)
        self.commands = []
        self.initialized = False
        self.queue_stopped = True

    def _exchange(self, cid, rw=0, queued=False, params=b""):
        self.commands.append(cid)
        return bytes([cid, 0])

    def _alarms(self):
        if len(self.alarm_reads) > 1:
            return self.alarm_reads.pop(0)
        return self.alarm_reads[0]

    def _initialize_controller(self):
        self.initialized = True


class ImmediateMotionProbe(DobotMagicianAdapter):
    def __init__(self):
        super().__init__({})
        self.commands = []
        self.pose_reads = 0

    def _exchange(self, cid, rw=0, queued=False, params=b""):
        self.commands.append((cid, rw, queued, params))
        return bytes([cid, 0])

    def _ensure_motion_ready(self):
        return None

    def _get_pose(self):
        self.pose_reads += 1
        if self.pose_reads == 1:
            return {"x": 150.0, "y": 150.0, "z": 100.0, "r": 0.0, "j1": 10.0, "j2": 20.0, "j3": 30.0, "j4": 40.0}
        return {"x": 155.0, "y": 150.0, "z": 100.0, "r": 0.0, "j1": 10.0, "j2": 20.0, "j3": 30.0, "j4": 45.0}


class DobotAlarmRecoveryTests(unittest.TestCase):
    def test_ptp_outside_radial_envelope_is_blocked_before_serial_motion(self):
        driver = ImmediateMotionProbe()

        with self.assertRaisesRegex(AdapterError, "bloqueado antes"):
            driver.execute_command("DOBOT_PTP", {
                "x": 290, "y": 290, "z": 100, "r": 0, "velocidade": 20,
            })

        self.assertFalse(any(item[0] == 84 for item in driver.commands))

    def test_rotation_near_joint_limit_is_blocked_before_serial_motion(self):
        driver = ImmediateMotionProbe()
        driver._get_pose = lambda: {"x": 150.0, "y": 150.0, "z": 100.0, "r": 0.0, "j1": 10.0, "j2": 20.0, "j3": 30.0, "j4": 134.0}

        with self.assertRaisesRegex(AdapterError, "bloqueada antes"):
            driver.execute_command("DOBOT_ROTATE", {"delta": 5, "velocidade": 20})

        self.assertFalse(any(item[0] == 84 for item in driver.commands))

    def test_queue_index_reads_uint64(self):
        response = bytes([246, 0]) + struct.pack("<Q", 2**40 + 7)
        self.assertEqual(DobotMagicianAdapter._queue_index(response), 2**40 + 7)

    def test_ptp_is_immediate_and_confirms_physical_pose(self):
        driver = ImmediateMotionProbe()

        driver.execute_command("DOBOT_PTP", {
            "x": 155, "y": 150, "z": 100, "r": 0, "velocidade": 20,
        })

        ptp = next(item for item in driver.commands if item[0] == 84)
        self.assertFalse(ptp[2])
        self.assertEqual([item[0] for item in driver.commands if item[0] in (240, 84)], [84])
        self.assertEqual(driver.production, 1)

    def test_two_sequential_ptps_are_allowed_when_previous_completed(self):
        driver = ImmediateMotionProbe()
        poses = [
            {"x": x, "y": 150.0, "z": 100.0, "r": 0.0, "j1": 10.0, "j2": 20.0, "j3": 30.0, "j4": 40.0}
            for x in (150.0, 155.0, 155.0, 155.0, 160.0, 160.0)
        ]
        driver._get_pose = lambda: poses.pop(0)
        for x in (155, 160):
            driver.execute_command("DOBOT_PTP", {"x": x, "y": 150, "z": 100, "r": 0, "velocidade": 20})
        self.assertEqual(driver.production, 2)
        self.assertEqual(len([item for item in driver.commands if item[0] == 84]), 2)

    def test_ptp_one_mm_waits_for_physical_motion(self):
        driver = ImmediateMotionProbe()
        target = {'x':151, 'y':150, 'z':100, 'r':0, 'velocidade':20}
        initial = {'x':150, 'y':150, 'z':100, 'r':0, 'j1':10, 'j2':20, 'j3':30, 'j4':40}
        arrived = {**initial, 'x':151}
        poses = [initial, initial, arrived, arrived]
        driver._get_pose = lambda: poses.pop(0)
        driver._queue_and_start = lambda *_: bytes([84, 3]) + struct.pack('<Q', 12)
        indexes=iter([11, 11, 12, 12])
        driver._current_queue_index = lambda: next(indexes)
        driver.execute_command('DOBOT_PTP',target)
        self.assertEqual(driver.production,1)
        self.assertEqual(poses,[])

    def test_rotation_one_degree_requires_actual_joint_change(self):
        driver=ImmediateMotionProbe()
        initial={'x':150,'y':150,'z':100,'r':0,'j1':10,'j2':20,'j3':30,'j4':40}
        moved={**initial,'j4':41}
        poses=[initial,initial,moved,moved]
        driver._get_pose=lambda:poses.pop(0)
        driver.execute_command('DOBOT_ROTATE', {'delta':1,'velocidade':20})
        self.assertEqual(poses,[])

    def test_direct_ptp_does_not_depend_on_queue_index(self):
        driver=ImmediateMotionProbe()
        initial={'x':150,'y':150,'z':100,'r':0}
        moved={**initial,'x':151}
        poses=[initial,initial,moved,moved]
        driver._get_pose=lambda:poses.pop(0)
        def forbidden():
            raise AssertionError('Movimento direto não consulta índice da fila')
        driver._current_queue_index=forbidden
        driver._initialize_controller=forbidden
        driver.execute_command('DOBOT_PTP', {'x':151,'y':150,'z':100,'r':0,'velocidade':20})
        self.assertEqual(driver.production,1)

    def test_preflight_rejects_unreachable_target_without_serial_motion(self):
        driver = ImmediateMotionProbe()
        with self.assertRaises(MotionPreflightError):
            driver.execute_command("DOBOT_PTP", {"x": 290, "y": 290, "z": 100, "r": 0, "velocidade": 20})
        self.assertFalse(any(item[0] == 84 for item in driver.commands))

    def test_home_uses_immediate_serial_command(self):
        driver = ImmediateMotionProbe()

        driver.execute_command("DOBOT_HOME")

        home = next(item for item in driver.commands if item[0] == 31)
        self.assertFalse(home[2])

    def test_rotate_uses_joint_mode_and_preserves_other_joints(self):
        driver = ImmediateMotionProbe()

        driver.execute_command("DOBOT_ROTATE", {"delta": 5, "velocidade": 20})

        ptp = next(item for item in driver.commands if item[0] == 84)
        self.assertFalse(ptp[2])
        self.assertEqual(ptp[3][0], 4)
        self.assertEqual(struct.unpack("<4f", ptp[3][1:]), (10.0, 20.0, 30.0, 45.0))

    def test_alarm_zero_is_cleared_without_force_stop(self):
        driver = RecoveryProbe([[0], []])

        driver._recover_alarms()

        self.assertTrue(driver.initialized)
        self.assertFalse(driver.queue_stopped)
        self.assertNotIn(242, driver.commands)
        self.assertEqual(driver.commands[:3], [241, 245, 21])

    def test_motion_ready_blocks_alarm_until_explicit_clear(self):
        driver = RecoveryProbe([[0], []])

        with self.assertRaises(AdapterError):
            driver._ensure_motion_ready()
        self.assertFalse(driver.initialized)
        self.assertTrue(driver.queue_stopped)
        self.assertEqual(driver.commands, [])

    def test_persistent_startup_bit_is_acknowledged_only_after_clear(self):
        driver = RecoveryProbe([[0]])

        driver._recover_alarms()

        self.assertTrue(driver.initialized)
        self.assertTrue(driver.startup_reset_acknowledged)
        self.assertEqual(driver._blocking_alarms([0]), [])
        self.assertEqual(driver._blocking_alarms([0, 18]), [18])
        self.assertNotIn(242, driver.commands)

    def test_persistent_alarm_is_not_ignored(self):
        driver = RecoveryProbe([[18]])

        with self.assertRaises(AdapterError):
            driver._recover_alarms()

        self.assertFalse(driver.initialized)
        self.assertNotIn(242, driver.commands)
        self.assertNotIn(240, driver.commands)
        self.assertTrue(driver.queue_stopped)


if __name__ == "__main__":
    unittest.main()
