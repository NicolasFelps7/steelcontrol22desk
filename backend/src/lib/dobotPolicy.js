export const DOBOT_LIMITS = Object.freeze({
  x: Object.freeze({ min: -290, max: 290 }),
  y: Object.freeze({ min: -290, max: 290 }),
  z: Object.freeze({ min: -10, max: 220 }),
  r: Object.freeze({ min: -180, max: 180 }),
  velocidade: Object.freeze({ min: 1, max: 60 })
});

const TTL_MS = Object.freeze({
  DOBOT_STOP: 15_000,
  DOBOT_CLEAR_ALARMS: 10_000,
  DOBOT_HOME: 8_000,
  DOBOT_PTP: 5_000,
  DOBOT_ROTATE: 8_000,
  DOBOT_SUCTION_ON: 5_000,
  DOBOT_SUCTION_OFF: 5_000,
  DOBOT_GRIPPER_OPEN: 5_000,
  DOBOT_GRIPPER_CLOSE: 5_000
});

export function controleRemotoDobotHabilitado(maquina) {
  return maquina?.modoSimulacao === false &&
    maquina?.integracaoMeta?.dobot?.remoteControlEnabled === true;
}

export function expiraEmComandoDobot(comando, agora = Date.now()) {
  const ttl = TTL_MS[String(comando || "").toUpperCase()] || 5_000;
  return new Date(Number(agora) + ttl).toISOString();
}

export function validarPayloadDobot(comando, payload = {}) {
  if (comando === "DOBOT_ROTATE") {
    const delta = Number(payload?.delta);
    if (!Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 20) {
      const erro = new Error("Informe uma rotação entre -20° e 20° por comando.");
      erro.statusCode = 400;
      throw erro;
    }

    const velocidade = Number(payload?.velocidade ?? 20);
    if (
      !Number.isFinite(velocidade) ||
      velocidade < DOBOT_LIMITS.velocidade.min ||
      velocidade > DOBOT_LIMITS.velocidade.max
    ) {
      const erro = new Error(
        `Velocidade fora do limite seguro (${DOBOT_LIMITS.velocidade.min}% a ${DOBOT_LIMITS.velocidade.max}%).`
      );
      erro.statusCode = 400;
      throw erro;
    }

    return { delta, velocidade };
  }
  if (comando !== "DOBOT_PTP") return {};
  const resultado = {};

  for (const campo of ["x", "y", "z", "r"]) {
    const valor = Number(payload?.[campo]);
    const limite = DOBOT_LIMITS[campo];
    if (!Number.isFinite(valor)) {
      const erro = new Error(`Informe ${campo.toUpperCase()} para o movimento PTP.`);
      erro.statusCode = 400;
      throw erro;
    }
    if (valor < limite.min || valor > limite.max) {
      const erro = new Error(
        `${campo.toUpperCase()} fora do envelope seguro (${limite.min} a ${limite.max}).`
      );
      erro.statusCode = 400;
      throw erro;
    }
    resultado[campo] = valor;
  }

  // O volume útil do Magician não é um quadrado. Validar somente X/Y
  // isoladamente permitia que os cantos (por exemplo 290/290) chegassem ao
  // robô e disparassem o alarme de junta 18. A margem radial impede o erro
  // antes de tocar no hardware e mantém livre o movimento no sentido oposto.
  const raio = Math.hypot(resultado.x, resultado.y);
  if (raio < 80 || raio > 290) {
    const erro = new Error(
      "Alvo fora da área cartesiana preventiva do Dobot (raio permitido: 80 a 290 mm). Mova no sentido oposto."
    );
    erro.statusCode = 400;
    throw erro;
  }

  const velocidade = Number(payload?.velocidade ?? 30);
  if (
    !Number.isFinite(velocidade) ||
    velocidade < DOBOT_LIMITS.velocidade.min ||
    velocidade > DOBOT_LIMITS.velocidade.max
  ) {
    const erro = new Error(
      `Velocidade fora do limite seguro (${DOBOT_LIMITS.velocidade.min}% a ${DOBOT_LIMITS.velocidade.max}%).`
    );
    erro.statusCode = 400;
    throw erro;
  }

  resultado.velocidade = velocidade;
  return resultado;
}
