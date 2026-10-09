import { validarPayloadDobot } from "./dobotPolicy.js";

const DOBOT_AUTOMATIC_POINTS = ["P0", "P1", "P2", "P3", "P4"];

export function pontosAutomaticosDobot(valor) {
  if (valor === undefined || valor === null) return {};
  if (typeof valor !== "object" || Array.isArray(valor)) {
    const erro = new Error("Os pontos automáticos do Dobot devem ser um objeto.");
    erro.statusCode = 400;
    throw erro;
  }

  const pontos = {};
  for (const nome of DOBOT_AUTOMATIC_POINTS) {
    const pose = valor[nome];
    if (pose === undefined || pose === null) continue;
    const validada = validarPayloadDobot("DOBOT_PTP", {
      ...pose,
      velocidade: 10
    });
    pontos[nome] = {
      x: validada.x,
      y: validada.y,
      z: validada.z,
      r: validada.r
    };
  }
  return pontos;
}

export function metaDobotComPontos(maquina, pontos, revisao) {
  const metaAtual = maquina?.integracaoMeta && typeof maquina.integracaoMeta === "object" && !Array.isArray(maquina.integracaoMeta)
    ? maquina.integracaoMeta
    : {};
  const dobotAtual = metaAtual.dobot && typeof metaAtual.dobot === "object" && !Array.isArray(metaAtual.dobot)
    ? metaAtual.dobot
    : {};
  return {
    ...metaAtual,
    dobot: {
      ...dobotAtual,
      automaticPoints: pontos,
      automaticPointsRevision: revisao
    }
  };
}

export function prepararAutomaticoDobot(maquina, body = {}, revisao = new Date().toISOString()) {
  const anterior = maquina.integracaoMeta?.dobot?.automatico || {};
  const pontos = pontosAutomaticosDobot(body.points ?? body.pontos ?? anterior.pontos ?? maquina.integracaoMeta?.dobot?.automaticPoints);
  const ciclos = Number(body.ciclos ?? anterior.ciclos ?? 1);
  const velocidade = Number(body.velocidade ?? anterior.velocidade ?? 15);
  if (!Number.isInteger(ciclos) || ciclos < 1 || ciclos > 20 || !Number.isFinite(velocidade) || velocidade < 1 || velocidade > 40) {
    const erro = new Error("Use 1 a 20 ciclos e velocidade entre 1 e 40%.");
    erro.statusCode = 400;
    throw erro;
  }
  if (body.versao !== undefined && Number(body.versao) !== Number(anterior.versao || 0)) {
    const erro = new Error("O ensino foi alterado em outro dispositivo. Atualize antes de salvar.");
    erro.statusCode = 409;
    throw erro;
  }
  const integracaoMeta = metaDobotComPontos(maquina, pontos, revisao);
  integracaoMeta.dobot.automatico = {
    pontos, ciclos, velocidade, versao: Number(anterior.versao || 0) + 1, atualizadoEm: revisao
  };
  return integracaoMeta;
}
