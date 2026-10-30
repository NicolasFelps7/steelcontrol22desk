import { commandAllowedNow, commandEnvelope } from "../../lib/commandSafety.js";
import { prisma } from "../../lib/prisma.js";
import { processarTelemetria } from "../../lib/telemetryService.js";
import { publicarEventoMaquina, publicarEventoEmpresa, assinarEventosMaquina } from "../../lib/realtime.js";
import { calcularEstadoConexao } from "../../lib/machinePolicy.js";
import { dataLimiteReentrega, comandoJaFinalizado, normalizarStatusAck } from "../../lib/industrialPolicy.js";

const COMMAND_LEASE_MS = Math.max(
  5_000,
  Number(process.env.DEVICE_COMMAND_LEASE_MS) || 15_000
);

export async function receberTelemetriaDevice(req, res, next) {
  try {
    const maquina = req.device.maquina;

    if (maquina.modoSimulacao !== false) {
      return res.status(409).json({
        mensagem: "A máquina está em modo simulação. Altere para Equipamento real antes de enviar telemetria."
      });
    }

    const snapshot = await processarTelemetria({
      maquina,
      dados: req.body,
      origem: req.body.origem || maquina.controlador || maquina.protocolo || "EQUIPAMENTO"
    });

    // Telemetria bruta fica em TelemetryReading. AuditLog é reservado para ações/eventos,
    // evitando uma linha de auditoria a cada pacote do equipamento.
    res.json({
      ok: true,
      maquinaId: maquina.id,
      recebidoEm: new Date().toISOString(),
      status: snapshot.status,
      paradaSeguranca: snapshot.paradaSeguranca,
      motivoParada: snapshot.motivoParada
    });
  } catch (erro) {
    next(erro);
  }
}

export async function heartbeatDevice(req, res, next) {
  try {
    const maquina = req.device.maquina;
    const agora = new Date();

    const atualizada = await prisma.maquina.update({
      where: { id: maquina.id },
      data: {
        ultimoHeartbeatEm: agora,
        statusConexao: "Conectada"
      }
    });

    const dadosPresenca = {
      maquinaId: maquina.id,
      ultimoHeartbeatEm: agora.toISOString(),
      intervaloLeitura: atualizada.intervaloLeitura,
      estadoConexao: calcularEstadoConexao(atualizada, agora.getTime())
    };

    publicarEventoMaquina(maquina.id, "heartbeat", dadosPresenca);
    publicarEventoEmpresa(maquina.empresaId, "maquina.presenca", dadosPresenca);

    res.json({
      ok: true,
      servidorEm: agora.toISOString(),
      intervaloLeitura: atualizada.intervaloLeitura,
      paradaSeguranca: atualizada.paradaSeguranca
    });
  } catch (erro) {
    next(erro);
  }
}

export async function configuracaoDevice(req, res) {
  const maquina = req.device.maquina;

  res.json({
    maquinaId: maquina.id,
    codigo: maquina.codigo,
    nome: maquina.nome,
    controlador: maquina.controlador,
    protocolo: maquina.protocolo,
    host: maquina.host,
    porta: maquina.porta,
    unitId: maquina.unitId,
    endpoint: maquina.endpoint,
    topico: maquina.topico,
    intervaloLeitura: maquina.intervaloLeitura,
    integracaoMeta: maquina.integracaoMeta ?? null,
    limites: {
      tempAtencao: maquina.tempAtencao,
      tempCritica: maquina.tempCritica,
      energiaAtencao: maquina.energiaAtencao,
      energiaCritica: maquina.energiaCritica,
      vibracaoAtencao: maquina.vibracaoAtencao,
      vibracaoCritica: maquina.vibracaoCritica,
      ciclosManutencao: maquina.ciclosManutencao,
      ciclosUltimaManutencao: maquina.ciclosUltimaManutencao
    },
    unidadeCargaEletrica: "%",
    paradaSeguranca: maquina.paradaSeguranca,
    motivoParada: maquina.motivoParada
  });
}

async function reivindicarProximoComando(maquina) {
    const maquinaId = maquina.id;
    const limiteReentrega = dataLimiteReentrega(Date.now(), COMMAND_LEASE_MS);
    let entregue = null;

    // Claim otimista: evita duas requisições concorrentes entregarem o mesmo
    // comando ao mesmo tempo. Se outro poller ganhar a corrida, tentamos de novo.
    for (let tentativa = 0; tentativa < 8 && !entregue; tentativa++) {
      const comando = await prisma.comandoMaquina.findFirst({
        where: {
          maquinaId,
          OR: [
            { status: "PENDENTE" },
            {
              status: "ENTREGUE",
              OR: [
                { entregueEm: null },
                { entregueEm: { lt: limiteReentrega } }
              ]
            }
          ]
        },
        orderBy: { criadoEm: "asc" }
      });

      if (!comando) {
        return null;
      }

      // Comandos operacionais da IHM possuem TTL curto. Se o equipamento
      // ficou offline, eles não podem "acordar" e executar minutos depois.
      if (!commandAllowedNow(maquina, comando)) {
        await prisma.comandoMaquina.updateMany({
          where: { id: comando.id, maquinaId, status: { in: ["PENDENTE", "ENTREGUE"] } },
          data: { status: "CANCELADO", concluidoEm: new Date() }
        });
        continue;
      }

      const claim = await prisma.comandoMaquina.updateMany({
        where: {
          id: comando.id,
          maquinaId,
          OR: [
            { status: "PENDENTE" },
            {
              status: "ENTREGUE",
              OR: [
                { entregueEm: null },
                { entregueEm: { lt: limiteReentrega } }
              ]
            }
          ]
        },
        data: {
          status: "ENTREGUE",
          entregueEm: new Date(),
          tentativasEntrega: { increment: 1 }
        }
      });

      if (claim.count === 1) {
        entregue = await prisma.comandoMaquina.findUnique({
          where: { id: comando.id }
        });
      }
    }

    return entregue;
}

export async function proximoComando(req, res, next) {
  try {
    const maquina = req.device.maquina;
    let entregue = await reivindicarProximoComando(maquina);

    // Long-poll curto: o Edge fica aguardando o evento de fila e acorda no
    // mesmo instante em que desktop ou mobile cria o comando. Uma segunda
    // consulta após assinar o canal fecha a janela de corrida entre SELECT e
    // assinatura. O timeout curto mantém heartbeat e telemetria frequentes.
    const waitMs = Math.max(0, Math.min(250, Number(req.query.waitMs) || 0));
    if (!entregue && waitMs > 0) {
      let finalizarEspera;
      const acordou = new Promise(resolve => { finalizarEspera = resolve; });
      const cancelar = assinarEventosMaquina(maquina.id, evento => {
        if (evento?.tipo === "comando") finalizarEspera();
      });
      const timer = setTimeout(finalizarEspera, waitMs);
      const fechar = () => finalizarEspera();
      res.once("close", fechar);

      try {
        entregue = await reivindicarProximoComando(maquina);
        if (!entregue) {
          await acordou;
          if (!req.destroyed && !res.destroyed && !res.writableEnded) {
            entregue = await reivindicarProximoComando(maquina);
          }
        }
      } finally {
        clearTimeout(timer);
        cancelar();
        res.off("close", fechar);
      }
    }

    if (!entregue) {
      if (req.destroyed || res.destroyed || res.writableEnded) return;
      return res.status(204).end();
    }

    res.json({
      ...commandEnvelope(entregue),
      confirmarEm: `/device/${maquina.id}/comandos/${entregue.id}/confirmar`
    });
  } catch (erro) {
    next(erro);
  }
}

export async function confirmarComando(req, res, next) {
  try {
    const maquina = req.device.maquina;
    const comandoId = Number(req.params.comandoId);

    if (!Number.isInteger(comandoId)) {
      return res.status(400).json({ mensagem: "Comando inválido." });
    }

    const status = normalizarStatusAck(req.body.status);

    if (!status) {
      return res.status(400).json({
        codigo: "ACK_STATUS_INVALIDO",
        mensagem: "Status de confirmação inválido. Use CONCLUIDO ou FALHOU."
      });
    }

    const comando = await prisma.comandoMaquina.findFirst({
      where: { id: comandoId, maquinaId: maquina.id }
    });

    if (!comando) {
      return res.status(404).json({ mensagem: "Comando não encontrado." });
    }

    // ACK idempotente: repetir confirmação não cria novos logs nem altera o resultado.
    if (["CONCLUIDO", "FALHOU"].includes(comando.status)) {
      return res.json({ ok: true, status: comando.status, idempotente: true });
    }

    if (comandoJaFinalizado(comando.status)) {
      return res.status(409).json({
        mensagem: "Este comando foi cancelado pelo SteelControl e não aceita confirmação."
      });
    }

    // Compare-and-swap dentro da transação: ACK de PENDENTE/CANCELADO não
    // pode ressuscitar um comando nem vencer uma revogação concorrente.
    const accepted = await prisma.$transaction(async tx => {
      const changed = await tx.comandoMaquina.updateMany({
        where: { id: comandoId, maquinaId: maquina.id, status: "ENTREGUE" },
        data: { status, concluidoEm: new Date() }
      });
      if (changed.count !== 1) return false;
      await tx.log.create({ data: {
        maquinaId: maquina.id,
        mensagem: `Equipamento confirmou comando ${comando.comando}: ${status}.`
      }});
      return true;
    });
    if (!accepted) return res.status(409).json({ mensagem: "Comando não está mais entregue para execução." });

    res.json({ ok: true, status, idempotente: false });
  } catch (erro) {
    next(erro);
  }
}

// O Edge consulta imediatamente antes da escrita física. Isso reduz a janela
// de revogação; não substitui intertravamentos ou parada local independente.
export async function autorizarExecucao(req, res, next) {
  try {
    const id = Number(req.params.comandoId);
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ mensagem: "Comando inválido." });
    const maquina = req.device.maquina;
    const command = await prisma.comandoMaquina.findFirst({ where: { id, maquinaId: maquina.id } });
    if (!command) return res.status(404).json({ mensagem: "Comando não encontrado." });
    if (command.status !== "ENTREGUE" || !commandAllowedNow(maquina, command)) {
      return res.status(409).json({ mensagem: "Execução revogada, vencida ou bloqueada." });
    }
    // O solicitante ainda precisa pertencer à empresa e ter permissão atual.
    if (command.solicitanteId) {
      const user = await prisma.usuario.findFirst({ where: {
        id: command.solicitanteId, empresaId: maquina.empresaId, ativo: true
      }, select: { cargo: true } });
      const roles = ["ADMINISTRADOR", "SUPERVISOR", "TECNICO"];
      if (['DOBOT_STOP', 'PARAR_SEGURANCA', 'IHM_STOP', 'IHM_ACK'].includes(command.comando)) roles.push("OPERADOR");
      if (!user || !roles.includes(user.cargo)) return res.status(403).json({ mensagem: "Autorização do solicitante revogada." });
    }
    return res.json(commandEnvelope(command));
  } catch (error) { next(error); }
}
