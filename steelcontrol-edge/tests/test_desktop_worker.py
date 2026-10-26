import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from desktop_worker import DesktopWorker
from edge_profiles import load_store, profiles_path


class Manager:
    def __init__(self, log, status):
        self.active = set()
    def start(self, p):
        self.active.add(p.id)
    def stop(self, pid):
        self.active.discard(pid)
    def stop_all(self):
        self.active.clear()


class Client:
    def __init__(self, *args):
        self.key = args[2]
    def config(self):
        if self.key == 'invalid-key-at-least-16':
            raise RuntimeError('Unauthorized')
        return {'nome': 'Máquina validada'}


class WorkerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.environment = patch.dict(os.environ, {'STEELCONTROL_EDGE_HOME': self.temp.name})
        self.environment.start()
        self.worker = self.make_worker()
    def tearDown(self):
        self.environment.stop()
        self.temp.cleanup()
    def make_worker(self):
        return DesktopWorker(lambda _: None, manager_factory=Manager, client_factory=Client)
    def payload(self, **changes):
        return {'serverUrl': 'https://example.test', 'machineId': 7, 'driver': 'MOCK',
                'deviceKey': 'demo-key-for-unit-tests-only', **changes}
    def test_connect_restart_disconnect_remove_persist(self):
        result = self.worker.dispatch('save', self.payload())
        pid = result['id']
        self.assertFalse(result['allowCommands'])
        self.assertNotIn('deviceKey', json.dumps(self.worker.snapshot()))
        self.assertNotIn('demo-key-for-unit-tests-only', profiles_path().read_text())
        restarted = self.make_worker()
        restarted.autostart()
        self.assertEqual(restarted.manager.active, {pid})
        restarted.dispatch('disconnect', {'id': pid})
        after_disconnect = self.make_worker(); after_disconnect.autostart()
        self.assertEqual(after_disconnect.manager.active, set())
        after_disconnect.dispatch('connect', {'id': pid})
        self.assertEqual(after_disconnect.manager.active, {pid})
        after_disconnect.dispatch('remove', {'id': pid})
        self.assertEqual(load_store().profiles, [])
    def test_invalid_key_does_not_overwrite_saved_profile(self):
        saved = self.worker.dispatch('save', self.payload())
        with self.assertRaises(RuntimeError):
            self.worker.dispatch('save', self.payload(id=saved['id'], deviceKey='invalid-key-at-least-16'))
        self.assertEqual(load_store().profiles[0].device_key, 'demo-key-for-unit-tests-only')
    def test_edit_preserves_key_and_explicit_command_policy(self):
        saved = self.worker.dispatch('save', self.payload(allowCommands=True))
        self.assertTrue(saved['allowCommands'])
        updated = self.worker.dispatch('save', self.payload(id=saved['id'], deviceKey='', allowCommands=False))
        self.assertFalse(updated['allowCommands'])
        self.assertEqual(len(load_store().profiles), 1)
        self.assertEqual(load_store().profiles[0].device_key, 'demo-key-for-unit-tests-only')
    def test_duplicate_machine_rejected(self):
        self.worker.dispatch('save', self.payload())
        with self.assertRaisesRegex(ValueError, 'já tem'):
            self.worker.dispatch('save', self.payload())
    def test_no_unencrypted_remote_or_credentials_in_url(self):
        for server in ['http://example.test', 'https://user:pass@example.test', 'file:///tmp/a', 'https://example.test/app/login']:
            with self.subTest(server=server), self.assertRaises(ValueError):
                self.worker.dispatch('save', self.payload(serverUrl=server))
        self.assertEqual(self.worker.snapshot()['profiles'], [])
    def test_write_failure_keeps_previous_profile(self):
        saved = self.worker.dispatch('save', self.payload())
        with patch('desktop_worker.save_store', side_effect=OSError('disk')):
            with self.assertRaises(OSError):
                self.worker.dispatch('save', self.payload(id=saved['id'], label='Mudança', machineId=8))
        self.assertEqual(self.worker.snapshot()['profiles'][0]['machineId'], 7)


if __name__ == '__main__':
    unittest.main()
