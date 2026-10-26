"""Exercita processo real + HTTP local + driver MOCK, sem máquinas físicas."""
import json
import os
from pathlib import Path
import queue
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

EDGE = Path(__file__).resolve().parents[1]


class API(BaseHTTPRequestHandler):
    telemetry = 0
    key = 'integration-key-for-local-test'
    def do_GET(self):
        if self.headers.get('X-Device-Key') != self.key:
            self.send_response(401); self.end_headers(); return
        if self.path.endswith('/config'):
            body = json.dumps({'nome': 'Simulador de teste', 'controlador': 'OUTRO', 'protocolo': 'MOCK'}).encode()
            self.send_response(200); self.send_header('Content-Type', 'application/json'); self.end_headers(); self.wfile.write(body)
        else:
            self.send_response(204); self.end_headers()
    def do_POST(self):
        self.rfile.read(int(self.headers.get('Content-Length') or 0))
        if self.path.endswith('/telemetria'):
            type(self).telemetry += 1
        self.send_response(200); self.end_headers(); self.wfile.write(b'{}')
    def log_message(self, *_):
        pass


class ProcessTest(unittest.TestCase):
    def test_worker_connect_disconnect_and_parent_eof(self):
        server = ThreadingHTTPServer(('127.0.0.1', 0), API)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        with tempfile.TemporaryDirectory() as home:
            env = {**os.environ, 'STEELCONTROL_EDGE_HOME': home}
            proc = subprocess.Popen([sys.executable, '-u', str(EDGE / 'desktop_worker.py')],
                                    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                    text=True, env=env)
            messages = queue.Queue()
            def read():
                for line in proc.stdout:
                    messages.put(json.loads(line))
            threading.Thread(target=read, daemon=True).start()
            buffered = []
            def until(predicate, timeout=10):
                for index, msg in enumerate(buffered):
                    if predicate(msg):
                        return buffered.pop(index)
                deadline = time.monotonic() + timeout
                while time.monotonic() < deadline:
                    msg = messages.get(timeout=max(.01, deadline - time.monotonic()))
                    if predicate(msg):
                        return msg
                    buffered.append(msg)
                self.fail('Tempo esgotado')
            try:
                until(lambda msg: msg.get('event') == 'ready')
                proc.stdin.write(json.dumps({'id': 1, 'action': 'save', 'data': {
                    'serverUrl': f'http://127.0.0.1:{server.server_port}', 'machineId': 1,
                    'deviceKey': API.key, 'driver': 'MOCK', 'intervalMs': 500}}) + '\n')
                proc.stdin.flush()
                saved = until(lambda msg: msg.get('id') == 1)['result']
                until(lambda msg: msg.get('state') == 'ONLINE')
                deadline = time.monotonic() + 3
                while API.telemetry == 0 and time.monotonic() < deadline:
                    time.sleep(.05)
                self.assertGreater(API.telemetry, 0)
                proc.stdin.write(json.dumps({'id': 2, 'action': 'disconnect', 'data': {'id': saved['id']}}) + '\n')
                proc.stdin.flush(); until(lambda msg: msg.get('id') == 2)
                count = API.telemetry; time.sleep(.6)
                self.assertEqual(count, API.telemetry)
                proc.stdin.close()
                self.assertEqual(proc.wait(timeout=5), 0)
                self.assertNotIn(API.key, proc.stderr.read())
                stored = json.loads((Path(home) / 'edge-profiles.json').read_text())
                self.assertFalse(stored['profiles'][0]['enabled'])
            finally:
                if proc.poll() is None:
                    proc.kill(); proc.wait()
                proc.stdout.close(); proc.stderr.close()
                server.shutdown(); server.server_close()


if __name__ == '__main__':
    unittest.main()
