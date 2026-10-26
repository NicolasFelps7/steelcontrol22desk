import sys
from pathlib import Path
import unittest
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import edge_runtime as runtime
from edge_profiles import MachineProfile


class RuntimeSafety(unittest.TestCase):
    def test_disconnect_during_poll_does_not_execute_returned_command(self):
        p = MachineProfile(machine_id=1, device_key='unit-test-not-a-real-device-key', driver='MOCK', allow_commands=True)
        events = []
        rt = runtime.MachineRuntime(p, lambda *_: None, lambda *_: None)
        class Adapter:
            def connect(self): pass
            def close(self): pass
            def execute_command(self, *_): events.append('executed')
        class Client:
            def __init__(self, *_): pass
            def config(self): return {}
            def heartbeat(self): pass
            def next_command(self, **_):
                rt.stop_event.set()
                return {'id': 1, 'comando': 'MOVE', 'payload': {}}
        with patch.object(runtime, 'SteelControlClient', Client), patch.object(runtime, 'create_adapter', return_value=Adapter()):
            rt._run()
        self.assertEqual(events, [])
    def test_busy_old_driver_is_not_replaced(self):
        manager = runtime.EdgeRuntimeManager(lambda *_: None, lambda *_: None)
        p = MachineProfile(machine_id=1, params={'serialPort': 'COM3'})
        class Busy:
            profile = p
            def stop(self, **_): return False
        previous = Busy(); manager.runtimes[p.id] = previous
        with self.assertRaises(runtime.AdapterError): manager.start(p)
        self.assertIs(manager.runtimes[p.id], previous)
    def test_local_params_cannot_enable_remote_control(self):
        p = MachineProfile(params={'serverRemoteControlEnabled': True})
        rt = runtime.MachineRuntime(p, lambda *_: None, lambda *_: None)
        self.assertFalse(rt._params({})['serverRemoteControlEnabled'])
        self.assertFalse(rt._params({'integracaoMeta': {'dobot': {'remoteControlEnabled': False}}})['serverRemoteControlEnabled'])
        self.assertTrue(rt._params({'integracaoMeta': {'dobot': {'remoteControlEnabled': True}}})['serverRemoteControlEnabled'])
