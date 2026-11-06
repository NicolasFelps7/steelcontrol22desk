import { redactSecrets } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";

export async function listarAuditoria(
  req,
  res,
  next
) {
  try {
    if (
      req.auth?.cargo !==
      "ADMINISTRADOR"
    ) {
      return res.status(403).json({
        mensagem:
          "Somente administradores podem consultar a auditoria."
      });
    }

    const limite =
      Math.min(
        300,
        Math.max(
          1,
          Math.trunc(Number(req.query.limit)) ||
          100
        )
      );

    const machineId = req.query.maquinaId == null ? null : Number(req.query.maquinaId);
    if (machineId !== null && (!Number.isSafeInteger(machineId) || machineId <= 0 || machineId > 2147483647)) return res.status(400).json({mensagem:'Máquina inválida.'});
    if (machineId !== null && !await prisma.maquina.findFirst({where:{id:machineId,empresaId:req.auth.empresaId,ativo:true},select:{id:true}})) return res.status(404).json({mensagem:'Máquina não encontrada.'});
    const machineFilter = machineId === null ? {} : {OR:[{entidade:'MAQUINA',entidadeId:machineId},{detalhes:{path:['maquinaId'],equals:machineId}}]};
    const itens =
      await prisma.auditLog.findMany({
        where: {
          empresaId:
            req.auth.empresaId,
          ...machineFilter
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        },
        orderBy: {
          criadoEm: "desc"
        },
        take: limite
      });

    res.json(itens.map(item=>({...item,detalhes:redactSecrets(item.detalhes)})));
  } catch (erro) {
    next(erro);
  }
}
