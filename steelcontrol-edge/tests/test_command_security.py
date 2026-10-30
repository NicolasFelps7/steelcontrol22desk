import copy
import os
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from command_guard import CommandJournal, validate_command, fingerprint
from adapters.dobot_adapter import validate_ptp, validate_rotation, DobotMagicianAdapter, AdapterError
from edge_client import SteelControlClient
from transport_security import validate_server_url
from edge_runtime import MachineRuntime
from edge_profiles import MachineProfile


def command(cid=10, **changes):
    now = datetime.now(timezone.utc)
    return {'id': cid, 'maquinaId': 7, 'comando': 'DOBOT_ROTATE', 'tentativaEntrega': 1,
            'criadoEm': now.isoformat(), 'payload': {'delta': 5, 'velocidade': 20,
            'expiresAt': (now + timedelta(seconds=8)).isoformat()}, **changes}


class CommandSecurity(unittest.TestCase):
    def test_envelope_rejects_other_machine_invalid_ids_unknown_command_and_dates(self):
        for changed in [{'maquinaId': 8}, {'maquinaId': True}, {'id': True}, {'id': -1},
                        {'comando': 'EXEC_SHELL'}, {'comando': 'DOBOT_HOME'}, {'payload': []}, {'tentativaEntrega': 0},
                        {'criadoEm': 'invalid'}, {'criadoEm': '2026-01-01T00:00:00'}]:
            with self.subTest(changed=changed), self.assertRaises(AdapterError):
                validate_command(command(**changed), 7, 'DOBOT_MAGICIAN')

    def test_deadline_missing_invalid_expired_or_unbounded_is_rejected(self):
        for expiry in [None, 'invalid', '2020-01-01T00:00:00Z',
                       (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()]:
            cmd = command(); cmd['payload']['expiresAt'] = expiry
            with self.subTest(expiry=expiry), self.assertRaises(AdapterError):
                validate_command(cmd, 7, 'DOBOT_MAGICIAN')

    def test_invalid_dobot_numbers_never_reach_serial(self):
        for value in [float('nan'), float('inf'), -float('inf'), True]:
            with self.subTest(value=value):
                with self.assertRaises(AdapterError): validate_ptp({'x': value, 'y': 0, 'z': 100, 'r': 0})
                with self.assertRaises(AdapterError): validate_ptp({'x': 150, 'y': 0, 'z': 100, 'r': 0, 'velocidade': value})
                with self.assertRaises(AdapterError): validate_rotation({'delta': value})
                with self.assertRaises(AdapterError): validate_rotation({'delta': 5, 'velocidade': value})

    def test_journal_blocks_restart_after_uncertain_physical_outcome(self):
        with tempfile.TemporaryDirectory() as home:
            path = Path(home) / 'journal.sqlite'; cmd = command()
            journal = CommandJournal(path)
            self.assertIsNone(journal.begin('machine-7', cmd))
            journal.close()  # Processo encerrou entre execução e ACK.
            journal = CommandJournal(path)
            self.assertEqual(journal.begin('machine-7', cmd), 'FALHOU')
            journal.close()

    def test_duplicate_returns_saved_outcome_and_tampering_is_blocked(self):
        with tempfile.TemporaryDirectory() as home:
            journal = CommandJournal(Path(home) / 'journal.sqlite'); cmd = command()
            self.assertIsNone(journal.begin('machine-7', cmd))
            journal.finish('machine-7', 10, 'CONCLUIDO')
            self.assertEqual(journal.begin('machine-7', cmd), 'CONCLUIDO')
            altered = copy.deepcopy(cmd); altered['payload']['delta'] = 20
            with self.assertRaises(AdapterError): journal.begin('machine-7', altered)
            journal.close()

    def test_two_workers_cannot_admit_the_same_movement(self):
        with tempfile.TemporaryDirectory() as home:
            path=Path(home)/'journal.sqlite'; a=CommandJournal(path); b=CommandJournal(path); cmd=command()
            self.assertIsNone(a.begin('same',cmd)); self.assertEqual(b.begin('same',cmd),'FALHOU')
            a.close();b.close()

    def test_first_seen_redelivery_is_not_executed_and_scope_is_isolated(self):
        with tempfile.TemporaryDirectory() as home:
            journal=CommandJournal(Path(home)/'journal.sqlite')
            self.assertEqual(journal.begin('one',command(tentativaEntrega=2)),'FALHOU')
            self.assertIsNone(journal.begin('two',command()))
            with self.assertRaises(AdapterError): journal.begin('two',command(cid=9))
            journal.close()

    def test_journal_rejects_nan_before_writing_a_record(self):
        cmd=command();cmd['payload']['delta']=float('nan')
        with self.assertRaises(AdapterError):fingerprint(cmd)

    def test_remote_server_requires_https_without_credentials_or_query(self):
        for url in ['http://example.test', 'https://user:pass@example.test', 'https://example.test?k=secret',
                    'https://example.test/#secret', 'file:///tmp/data']:
            with self.subTest(url=url),self.assertRaises(ValueError):validate_server_url(url)
        self.assertEqual(validate_server_url('https://example.test/'),'https://example.test')
        self.assertEqual(validate_server_url('http://127.0.0.1:3000'),'http://127.0.0.1:3000')

    def test_credential_request_does_not_follow_redirects(self):
        client=SteelControlClient('https://example.test',7,'unit-key')
        response=Mock(status_code=302)
        with patch.object(client.session,'get',return_value=response) as request:
            with self.assertRaises(Exception):client.config()
            self.assertFalse(request.call_args.kwargs['allow_redirects'])
            response.json.assert_not_called()

    def test_local_stop_or_revocation_interrupts_motion_guard(self):
        runtime=MachineRuntime(MachineProfile(machine_id=7),lambda *_:None,lambda *_:None)
        cmd=command();client=Mock();client.authorize.side_effect=RuntimeError('revoked')
        with self.assertRaises(RuntimeError):runtime._motion_guard(client,cmd)()
        runtime.stop_event.set();client.reset_mock()
        with self.assertRaises(AdapterError):runtime._motion_guard(client,cmd)()
        client.authorize.assert_not_called()

    def test_non_finite_pose_and_startup_speed_are_blocked(self):
        driver=DobotMagicianAdapter({'speed': float('nan')})
        driver._exchange=Mock(return_value=bytes([10,0])+struct.pack('<8f',*[float('nan')]*8))
        with self.assertRaises(AdapterError):driver._get_pose()
        with self.assertRaises(AdapterError):driver._set_speed(float('nan'))

    def test_connect_stops_old_queue_without_clearing_alarms(self):
        driver=DobotMagicianAdapter({'serialPort':'COM_TEST'})
        driver._candidates=lambda:['COM_TEST'];driver._get_pose=Mock(return_value={})
        driver._exchange=Mock(return_value=b'');driver._recover_alarms=Mock();driver._initialize_controller=Mock()
        with patch('serial.Serial',return_value=Mock()):driver.connect()
        self.assertEqual([call.args[0] for call in driver._exchange.call_args_list],[242,245])
        driver._recover_alarms.assert_not_called();driver._initialize_controller.assert_not_called()

    def test_disconnect_sends_best_effort_stop_and_latches_control(self):
        with tempfile.TemporaryDirectory() as home,patch.dict(os.environ,{'STEELCONTROL_EDGE_HOME':home}):
            runtime=MachineRuntime(MachineProfile(machine_id=7,device_key='unit-key'),lambda *_:None,lambda *_:None)
            client=Mock();client.config.return_value={};client.next_command.side_effect=RuntimeError('network lost')
            adapter=Mock();adapter.params={}
            runtime.stop_event.wait=lambda _: (runtime.stop_event.set() or True)
            with patch('edge_runtime.SteelControlClient',return_value=client),patch('edge_runtime.create_adapter',return_value=adapter):runtime._run()
            adapter.safety_stop.assert_called();self.assertTrue(runtime.control_latched)
            adapter.execute_command.assert_not_called()

    def test_logs_hide_device_key(self):
        messages=[];runtime=MachineRuntime(MachineProfile(device_key='private-unit-key'),lambda _,msg:messages.append(msg),lambda *_:None)
        runtime.log('error private-unit-key')
        self.assertNotIn('private-unit-key',messages[0])


if __name__=='__main__':unittest.main()
