import { prisma } from "../lib/prisma.js";
import { compararDeviceKey } from "../lib/deviceSecurity.js";

export async function deviceRequired(req, res, next) {
  try {
    const maquinaId = Number(req.params.id);
    const chave = String(req.headers["x-device-key"] || "").trim();

    if (!Number.isInteger(maquinaId) || maquinaId <= 0 || maquinaId > 2147483647 || !chave || chave.length > 512) {
      return res.status(401).json({
        mensagem: "Credencial do equipamento ausente ou inválida."
      });
    }

    const maquina = await prisma.maquina.findFirst({
      where: {
        id: maquinaId,
        ativo: true
      },
      include: { empresa: { select: { status: true } } }
    });

    if (
      !maquina ||
      !maquina.deviceKeyHash ||
      !compararDeviceKey(chave, maquina.deviceKeyHash)
    ) {
      return res.status(401).json({
        mensagem: "Credencial do equipamento inválida."
      });
    }

    req.auditIdentity = { empresaId: maquina.empresaId };
    if (maquina.empresa?.status !== "ATIVA") return res.status(403).json({
      codigo: "COMPANY_VALIDATION_PENDING", mensagem: "Empresa não autorizada para integração Edge."
    });

    req.device = {
      maquina,
      maquinaId: maquina.id,
      empresaId: maquina.empresaId
    };

    next();
  } catch (erro) {
    next(erro);
  }
}
