import test from 'node:test';
import assert from 'node:assert/strict';
import { automaticoDobotAtual, prepararAutomaticoDobot, prepararEstadoAutomaticoDobot } from '../src/lib/dobotAutomation.js';

const pose = { x: 150, y: 0, z: 80, r: 0 };
const machine = { integracaoMeta: { fabricante: 'Dobot', dobot: { remoteControlEnabled: true, port: 'COM5' } } };

test('ensino cria a mesma configuração para desktop e mobile sem apagar integração', () => {
  const result = prepararAutomaticoDobot(machine, { pontos: { P0: pose }, ciclos: 3, velocidade: 20, versao: 0 }, 'revision-1');
  assert.equal(result.dobot.remoteControlEnabled, true);
  assert.equal(result.dobot.port, 'COM5');
  assert.equal(result.fabricante, 'Dobot');
  assert.deepEqual(result.dobot.automaticPoints, result.dobot.automatico.pontos);
  assert.equal(result.dobot.automatico.versao, 1);
  assert.equal(result.dobot.automatico.ciclos, 3);
  assert.equal(result.dobot.automatico.velocidade, 20);
  assert.equal(result.dobot.automatico.atualizadoEm, 'revision-1');
  assert.equal(machine.integracaoMeta.dobot.automatico, undefined);
});

test('alterar velocidade preserva posições e quantidade de ciclos', () => {
  const first = prepararAutomaticoDobot(machine, { points: { P0: pose }, ciclos: 4 });
  const next = prepararAutomaticoDobot({ integracaoMeta: first }, { velocidade: 12, versao: 1 });
  assert.deepEqual(next.dobot.automatico.pontos.P0, pose);
  assert.equal(next.dobot.automatico.ciclos, 4);
  assert.equal(next.dobot.automatico.versao, 2);
});

test('redefinição explícita remove pontos dos dois formatos', () => {
  const first = prepararAutomaticoDobot(machine, { points: { P0: pose } });
  const cleared = prepararAutomaticoDobot({ integracaoMeta: first }, { pontos: {}, versao: 1 });
  assert.deepEqual(cleared.dobot.automatico.pontos, {});
  assert.deepEqual(cleared.dobot.automaticPoints, {});
});

test('edição baseada numa versão antiga não sobrescreve ensino remoto', () => {
  const current = prepararAutomaticoDobot(machine, { pontos: { P0: pose } });
  assert.throws(() => prepararAutomaticoDobot({ integracaoMeta: current }, { pontos: {}, versao: 0 }), { statusCode: 409 });
});

test('envelope físico, velocidade e ciclos são validados no backend', () => {
  for (const body of [{ ciclos: 0 }, { ciclos: 21 }, { ciclos: 1.5 }, { velocidade: 41 }, { velocidade: 0 }, { velocidade: 'invalid' }, { pontos: { P0: { ...pose, z: 999 } } }, { pontos: [] }]) {
    assert.throws(() => prepararAutomaticoDobot(machine, body), { statusCode: 400 });
  }
});

test('formato antigo permanece legível e atualizável', () => {
  const legacy = { integracaoMeta: { dobot: { automaticPoints: { P0: pose }, remoteControlEnabled: true } } };
  const atual = automaticoDobotAtual(legacy);
  assert.deepEqual(atual.pontos, { P0: pose });
  assert.equal(atual.ciclos, 1);
  assert.equal(atual.velocidade, 15);
  assert.equal(atual.versao, 0);
  assert.equal(atual.atualizadoEm, null);
  assert.equal(atual.estado, 'PARADO');
  const migrated = prepararAutomaticoDobot(legacy, { ciclos: 2 });
  assert.deepEqual(migrated.dobot.automatico.pontos.P0, pose);
  assert.equal(migrated.dobot.remoteControlEnabled, true);
});

test('leitura canônica preserva revisão, ciclos, velocidade e versão', () => {
  const integracaoMeta = prepararAutomaticoDobot(machine, {
    pontos: { P0: pose }, ciclos: 6, velocidade: 24, versao: 0
  }, 'revision-canonical');
  const atual = automaticoDobotAtual({ integracaoMeta });
  assert.deepEqual(atual.pontos, { P0: pose });
  assert.equal(atual.ciclos, 6);
  assert.equal(atual.velocidade, 24);
  assert.equal(atual.versao, 1);
  assert.equal(atual.atualizadoEm, 'revision-canonical');
  assert.equal(atual.estado, 'PARADO');
});

test('estado de execução é compartilhado sem alterar a versão do ensino', () => {
  const configured = prepararAutomaticoDobot(machine, { pontos: { P0: pose }, ciclos: 3 }, 'config-1');
  const running = prepararEstadoAutomaticoDobot(
    { integracaoMeta: configured },
    {
      estado: 'EXECUTANDO',
      execucaoId: 'execution-1',
      cicloAtual: 1,
      etapaAtual: 2,
      etapa: 'Aproximar da matéria-prima',
      progresso: 15,
      origem: 'DESKTOP'
    },
    'state-1'
  );
  const atual = automaticoDobotAtual({ integracaoMeta: running });
  assert.equal(atual.versao, 1);
  assert.equal(atual.estado, 'EXECUTANDO');
  assert.equal(atual.execucaoId, 'execution-1');
  assert.equal(atual.cicloAtual, 1);
  assert.equal(atual.etapaAtual, 2);
  assert.equal(atual.progresso, 15);

  const edited = prepararAutomaticoDobot(
    { integracaoMeta: running },
    { velocidade: 12, versao: 1 },
    'config-2'
  );
  const depois = automaticoDobotAtual({ integracaoMeta: edited });
  assert.equal(depois.estado, 'EXECUTANDO');
  assert.equal(depois.execucaoId, 'execution-1');
  assert.equal(depois.versao, 2);
});

test('payload automático inválido é rejeitado antes de persistir', () => {
  assert.throws(() => prepararAutomaticoDobot(machine, []), { statusCode: 400 });
  assert.throws(() => prepararAutomaticoDobot(machine, null), { statusCode: 400 });
});
