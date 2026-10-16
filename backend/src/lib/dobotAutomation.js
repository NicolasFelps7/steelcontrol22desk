import { validarPayloadDobot } from "./dobotPolicy.js";

const DOBOT_AUTOMATIC_POINTS = ["P0", "P1", "P2", "P3", "P4"];
const DOBOT_AUTOMATIC_STATES = new Set([
  "PARADO",
  "EXECUTANDO",
  "PAUSADO",
  "CONCLUIDO",
  "FALHOU"
]);

function textoOpcional(valor, max = 180) {
  if (valor === undefined || valor === null) return null;
  const limpo = String(valor).trim();
  return limpo ? limpo.slice(0, max) : null;
}

function inteiroNoIntervalo(valor, minimo, maximo, fallback) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= minimo && numero <= maximo
    ? numero
    : fallback;
}

function numeroNoIntervalo(valor, minimo, maximo, fallback) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= minimo && numero <= maximo
    ? numero
    : fallback;
}

function valorDoPatch(patch, chave, fallback) {
  return Object.prototype.hasOwnProperty.call(patch, chave)
    ? patch[chave]
    : fallback;
}

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

export function automaticoDobotAtual(maquina) {
  const meta = maquina?.integracaoMeta && typeof maquina.integracaoMeta === "object" && !Array.isArray(maquina.integracaoMeta)
    ? maquina.integracaoMeta
    : {};
  const dobot = meta.dobot && typeof meta.dobot === "object" && !Array.isArray(meta.dobot)
    ? meta.dobot
    : {};
  const automatico = dobot.automatico && typeof dobot.automatico === "object" && !Array.isArray(dobot.automatico)
    ? dobot.automatico
    : {};
  const pontos = pontosAutomaticosDobot(automatico.pontos ?? dobot.automaticPoints ?? {});
  const ciclosBruto = Number(automatico.ciclos ?? 1);
  const velocidadeBruta = Number(automatico.velocidade ?? 15);
  const versaoBruta = Number(automatico.versao ?? 0);
  const estadoBruto = String(automatico.estado || "PARADO").trim().toUpperCase();
  const estado = DOBOT_AUTOMATIC_STATES.has(estadoBruto) ? estadoBruto : "PARADO";

  return {
    pontos,
    ciclos: Number.isInteger(ciclosBruto) && ciclosBruto >= 1 && ciclosBruto <= 20 ? ciclosBruto : 1,
    velocidade: Number.isFinite(velocidadeBruta) && velocidadeBruta >= 1 && velocidadeBruta <= 40 ? velocidadeBruta : 15,
    versao: Number.isInteger(versaoBruta) && versaoBruta >= 0 ? versaoBruta : 0,
    atualizadoEm: typeof automatico.atualizadoEm === "string"
      ? automatico.atualizadoEm
      : typeof dobot.automaticPointsRevision === "string"
        ? dobot.automaticPointsRevision
        : null,
    estado,
    execucaoId: textoOpcional(automatico.execucaoId, 80),
    cicloAtual: inteiroNoIntervalo(automatico.cicloAtual, 0, 20, 0),
    etapaAtual: inteiroNoIntervalo(automatico.etapaAtual, 0, 1000, 0),
    etapa: textoOpcional(automatico.etapa, 180),
    progresso: numeroNoIntervalo(automatico.progresso, 0, 100, 0),
    iniciadoEm: textoOpcional(automatico.iniciadoEm, 80),
    estadoAtualizadoEm: textoOpcional(automatico.estadoAtualizadoEm, 80),
    iniciadoPor: textoOpcional(automatico.iniciadoPor, 180),
    origem: textoOpcional(automatico.origem, 40),
    erro: textoOpcional(automatico.erro, 500)
  };
}

export function prepararAutomaticoDobot(maquina, body = {}, revisao = new Date().toISOString()) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const erro = new Error("A configuração automática do Dobot deve ser um objeto.");
    erro.statusCode = 400;
    throw erro;
  }

  const anterior = automaticoDobotAtual(maquina);
  const pontos = pontosAutomaticosDobot(body.points ?? body.pontos ?? anterior.pontos);
  const ciclos = Number(body.ciclos ?? anterior.ciclos ?? 1);
  const velocidade = Number(body.velocidade ?? anterior.velocidade ?? 15);
  if (!Number.isInteger(ciclos) || ciclos < 1 || ciclos > 20 || !Number.isFinite(velocidade) || velocidade < 1 || velocidade > 40) {
    const erro = new Error("Use 1 a 20 ciclos e velocidade entre 1 e 40%.");
    erro.statusCode = 400;
    throw erro;
  }
  if (body.versao !== undefined && Number(body.versao) !== anterior.versao) {
    const erro = new Error("O ensino foi alterado em outro dispositivo. Atualize antes de salvar.");
    erro.statusCode = 409;
    throw erro;
  }
  const integracaoMeta = metaDobotComPontos(maquina, pontos, revisao);
  integracaoMeta.dobot.automatico = {
    ...anterior,
    pontos,
    ciclos,
    velocidade,
    versao: anterior.versao + 1,
    atualizadoEm: revisao
  };
  return integracaoMeta;
}

export function prepararEstadoAutomaticoDobot(
  maquina,
  patch = {},
  revisao = new Date().toISOString()
) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    const erro = new Error("O estado automático do Dobot deve ser um objeto.");
    erro.statusCode = 400;
    throw erro;
  }

  const anterior = automaticoDobotAtual(maquina);
  const estadoBruto = String(patch.estado ?? anterior.estado).trim().toUpperCase();
  if (!DOBOT_AUTOMATIC_STATES.has(estadoBruto)) {
    const erro = new Error("Estado automático do Dobot inválido.");
    erro.statusCode = 400;
    throw erro;
  }

  const automatico = {
    ...anterior,
    ...patch,
    estado: estadoBruto,
    execucaoId: textoOpcional(valorDoPatch(patch, "execucaoId", anterior.execucaoId), 80),
    cicloAtual: inteiroNoIntervalo(valorDoPatch(patch, "cicloAtual", anterior.cicloAtual), 0, 20, anterior.cicloAtual),
    etapaAtual: inteiroNoIntervalo(valorDoPatch(patch, "etapaAtual", anterior.etapaAtual), 0, 1000, anterior.etapaAtual),
    etapa: textoOpcional(valorDoPatch(patch, "etapa", anterior.etapa), 180),
    progresso: numeroNoIntervalo(valorDoPatch(patch, "progresso", anterior.progresso), 0, 100, anterior.progresso),
    iniciadoEm: textoOpcional(valorDoPatch(patch, "iniciadoEm", anterior.iniciadoEm), 80),
    estadoAtualizadoEm: revisao,
    iniciadoPor: textoOpcional(valorDoPatch(patch, "iniciadoPor", anterior.iniciadoPor), 180),
    origem: textoOpcional(valorDoPatch(patch, "origem", anterior.origem), 40),
    erro: textoOpcional(valorDoPatch(patch, "erro", anterior.erro), 500)
  };

  const integracaoMeta = metaDobotComPontos(
    maquina,
    automatico.pontos,
    automatico.atualizadoEm
  );
  integracaoMeta.dobot.automatico = automatico;
  return integracaoMeta;
}
