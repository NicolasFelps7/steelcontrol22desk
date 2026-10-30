import { prisma } from "../lib/prisma.js";
export async function requireControlCredential(req, res, next) {
  try {
    const id=Number(req.params.id);
    if (!Number.isSafeInteger(id) || id<=0 || id>2147483647) return res.status(400).json({ mensagem: "Identificador de máquina inválido." });
    if (!["ADMINISTRADOR", "SUPERVISOR", "TECNICO", "OPERADOR"].includes(req.auth?.cargo)) {
      return res.status(403).json({ mensagem: "Seu cargo não permite controlar máquinas." });
    }
    const maquina = await prisma.maquina.findFirst({
      where: { id, empresaId: req.auth.empresaId, ativo: true },
      select: { deviceKeyHash: true, modoSimulacao: true }
    });
    if (!maquina) return res.status(404).json({ mensagem: "Máquina não encontrada." });
    if (maquina.modoSimulacao === false && !maquina.deviceKeyHash) return res.status(409).json({
      mensagem: "Vincule uma chave de equipamento ao SteelControl Edge antes de controlar a máquina real."
    });
    next();
  } catch (erro) { next(erro); }
}
