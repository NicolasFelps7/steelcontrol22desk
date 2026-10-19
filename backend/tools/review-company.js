import { pathToFileURL } from "node:url";
import { prisma } from "../src/lib/prisma.js";

export async function reviewCompany(db, { empresaId, usuarioId, decisao, revisor, referencia }) {
  if (!Number.isInteger(empresaId) || empresaId <= 0 || !Number.isInteger(usuarioId) || usuarioId <= 0 ||
      !["APROVAR", "REJEITAR", "SUSPENDER"].includes(decisao) ||
      typeof revisor !== "string" || revisor.trim().length < 3 ||
      typeof referencia !== "string" || referencia.trim().length < 8) {
    throw new Error("Informe empresa, usuário, APROVAR/REJEITAR/SUSPENDER, revisor e referência da análise independente (mínimo 8 caracteres).");
  }
  if (decisao === "APROVAR") throw new Error("Ativação manual desativada. O responsável deve concluir a autorização assinada com e-CNPJ.");
  return db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Empresa" WHERE id = ${empresaId} FOR UPDATE`;
    const empresa = await tx.empresa.findUnique({ where: { id: empresaId } });
    const usuario = await tx.usuario.findFirst({ where: { id: usuarioId, empresaId, ativo: true } });
    if (!empresa || !usuario) throw new Error("Empresa ou responsável não encontrado.");

      await tx.empresa.update({ where: { id: empresaId }, data: { status: decisao === "REJEITAR" ? "REJEITADA" : "PENDENTE", validadaEm: null } });
      if (decisao === "REJEITAR") await tx.usuario.update({ where: { id: usuarioId }, data: { statusVinculo: "REJEITADO" } });
      if (decisao === "SUSPENDER") await tx.usuario.updateMany({ where: { empresaId, cargo: "ADMINISTRADOR", statusVinculo: "APROVADO" }, data: { statusVinculo: "ADMIN_PENDENTE" } });
    await tx.usuario.updateMany({ where: { empresaId }, data: { tokenVersion: { increment: 1 } } });
    await tx.auditLog.create({ data: {
      empresaId, usuarioId, acao: `${decisao}_EMPRESA`, entidade: "EMPRESA", entidadeId: empresaId,
      detalhes: { revisor: revisor.trim().slice(0,120), referencia: referencia.trim().slice(0,200), responsavelId: usuarioId }
    } });
    return { empresaId, usuarioId, decisao };
  });
}

// Importing this module for tests never executes the CLI.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [acao, empresa, usuario, revisor, referencia] = process.argv.slice(2);
    if (acao === "listar") {
      console.table(await prisma.usuario.findMany({
        where: { empresa: { status: "PENDENTE" }, ativo: true },
        select: { id: true, empresaId: true, nome: true, email: true, statusVinculo: true, emailVerificadoEm: true }
      }));
    } else {
      console.log(await reviewCompany(prisma, { empresaId: Number(empresa), usuarioId: Number(usuario), decisao: acao?.toUpperCase(), revisor, referencia }));
    }
  } catch (erro) { console.error(erro.message); process.exitCode = 1; }
  finally { await prisma.$disconnect(); }
}
