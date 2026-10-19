import { prisma } from "../../lib/prisma.js";
import { publicarEventoEmpresa } from "../../lib/realtime.js";

export async function listarSolicitacoes(req, res, next) {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { empresaId: req.auth.empresaId, ativo: true, statusVinculo: "SOLICITADO" },
      select: { id: true, nome: true, email: true, criadaEm: true, emailVerificadoEm: true },
      orderBy: { criadaEm: "asc" }
    });
    res.json(usuarios);
  } catch (erro) { next(erro); }
}

export async function decidirSolicitacao(req, res, next) {
  try {
    const usuarioId = Number(req.params.usuarioId);
    const decisao = req.body?.decisao;
    if (!Number.isInteger(usuarioId) || !["APROVAR", "REJEITAR"].includes(decisao)) {
      return res.status(400).json({ mensagem: "Informe usuário e decisão válidos." });
    }
    const aprovado = decisao === "APROVAR";
    const alterado = await prisma.$transaction(async tx => {
      const result = await tx.usuario.updateMany({
        where: { id: usuarioId, empresaId: req.auth.empresaId, ativo: true, statusVinculo: "SOLICITADO", emailVerificadoEm: { not: null } },
        data: { statusVinculo: aprovado ? "APROVADO" : "REJEITADO", cargo: "VISITANTE", tokenVersion: { increment: 1 } }
      });
      if (result.count !== 1) return false;
      await tx.auditLog.create({ data: {
        empresaId: req.auth.empresaId, usuarioId: req.auth.usuarioId,
        acao: aprovado ? "APROVAR_VINCULO" : "REJEITAR_VINCULO",
        entidade: "USUARIO", entidadeId: usuarioId,
        detalhes: { cargoInicial: "VISITANTE" }
      } });
      return true;
    });
    if (!alterado) return res.status(409).json({ mensagem: "Solicitação indisponível, não verificada ou já analisada." });
    publicarEventoEmpresa(req.auth.empresaId, "usuario.solicitacao-analisada", { usuarioId });
    res.json({ mensagem: aprovado ? "Acesso aprovado como Visitante. Altere o cargo depois, se necessário." : "Solicitação rejeitada." });
  } catch (erro) { next(erro); }
}
