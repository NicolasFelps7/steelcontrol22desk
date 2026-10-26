import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from adapters.serial_adapter import SerialJsonAdapter, AdapterError

class Serial:
    def __init__(self,packets):self.lines=[(json.dumps(p)+'\n').encode() for p in packets];self.writes=[]
    def readline(self,size=65537):return self.lines.pop(0) if self.lines else b''
    def write(self,data):self.writes.append(json.loads(data))
    def flush(self):pass

class SerialConfirmationTest(unittest.TestCase):
    def adapter(self,packets,params=None):
        adapter=SerialJsonAdapter(params);adapter.ser=Serial(packets);return adapter
    def test_matching_physical_ack_confirms_and_maps_command(self):
        adapter=self.adapter([{'ack':{'id':7,'status':'CONCLUIDO'}}],{'commandMap':{'IHM_START':'RUN'}})
        adapter.execute_command('IHM_START',{},command_id=7)
        self.assertEqual(adapter.ser.writes[0]['comando'],'RUN');self.assertEqual(adapter.ser.writes[0]['id'],7)
    def test_writing_or_wrong_ack_never_means_completed(self):
        adapter=self.adapter([{'ack':{'id':99,'status':'CONCLUIDO'}}])
        with patch('adapters.serial_adapter.time.monotonic',side_effect=[0,0,6]):
            with self.assertRaises(AdapterError):adapter.execute_command('IHM_START',{},command_id=7)
        self.assertEqual(len(adapter.ser.writes),1)
    def test_device_failure_is_not_reported_as_success(self):
        adapter=self.adapter([{'ack':{'id':7,'status':'FALHOU'}}])
        with self.assertRaises(AdapterError):adapter.execute_command('IHM_START',{},command_id=7)
    def test_telemetry_during_ack_wait_is_preserved(self):
        adapter=self.adapter([{'temperatura':25},{'ack':{'id':7,'status':'CONCLUIDO'}}])
        adapter.execute_command('IHM_START',{},command_id=7);self.assertEqual(adapter.read_telemetry()['temperatura'],25)
    def test_generic_mapping_and_unknown_machine_fields_are_supported(self):
        adapter=self.adapter([{'sensores':{'temp':32},'pressao':7}],{'fieldMap':{'temperatura':'sensores.temp'}})
        self.assertEqual(adapter.read_telemetry()['temperatura'],32)
        generic=self.adapter([{'rpm':1400}]);self.assertEqual(generic.read_telemetry()['dadosExtras']['equipamento']['rpm'],1400)
    def test_command_without_id_never_writes(self):
        adapter=self.adapter([])
        with self.assertRaises(AdapterError):adapter.execute_command('IHM_START')
        self.assertEqual(adapter.ser.writes,[])
    def test_runtime_reconfirms_a_delivery_without_repeating_the_movement(self):
        from edge_runtime import MachineRuntime
        from edge_profiles import MachineProfile
        from unittest.mock import Mock
        runtime=MachineRuntime(MachineProfile(id='retry',label='Teste',server_url='https://example.test',machine_id=7,device_key='test-key',driver='SERIAL_JSON',allow_commands=True),lambda *_:None,lambda *_:None)
        client=Mock();client.config.return_value={};client.next_command.side_effect=[{'id':9,'comando':'IHM_START','tentativaEntrega':1},{'id':9,'comando':'IHM_START','tentativaEntrega':2}]
        adapter=Mock();adapter.read_telemetry.return_value={'temperatura':25};confirmations=[]
        def confirm(cid,status):
            confirmations.append(status)
            if len(confirmations)==2:runtime.stop_event.set()
        client.confirm.side_effect=confirm
        with patch('edge_runtime.SteelControlClient',return_value=client),patch('edge_runtime.create_adapter',return_value=adapter):runtime._run()
        adapter.execute_command.assert_called_once();self.assertEqual(confirmations,['CONCLUIDO','CONCLUIDO'])

if __name__=='__main__':unittest.main()
