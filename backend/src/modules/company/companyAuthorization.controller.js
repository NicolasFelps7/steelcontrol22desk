import { randomBytes, randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { verificarAssinaturaEcnpj, sha256 } from "../../lib/ecnpjVerifier.js";
import { registrarAuditoria } from "../../lib/audit.js";

function audience() {
  const value = String(process.env.ECNPJ_SERVICE_ORIGIN || "").replace(/\/$/, "");
  let parsed;
  try { parsed = new URL(value); } catch { /* rejected below */ }
  if (!parsed || parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) throw Object.assign(new Error("Configure ECNPJ_SERVICE_ORIGIN com a origem HTTPS oficial desta instalação, sem caminhos. A empresa permanece bloqueada."), { statusCode: 503 });
  return parsed.origin;
}
export async function emitirAutorizacao(req, res, next) {
  try {
    const usuario = req.bootstrap;
    const servico = audience();
    const id = randomUUID();
    const expiraEm = new Date(Date.now() + 30 * 60_000);
    const documento = JSON.stringify({
      tipo: "STEELCONTROL_AUTORIZACAO_ADMINISTRADOR_V1", servico,
      declaracao: "Autorizo expressamente a conta identificada neste documento a administrar esta empresa no SteelControl e a gerenciar seus funcionários e máquinas.",
      autorizacaoId: id, desafio: randomBytes(32).toString("hex"),
      empresa: { id: usuario.empresaId, nome: usuario.empresa.nome, cnpj: String(usuario.empresa.cnpj || "").replace(/\D/g, "") },
      administrador: { id: usuario.id, nome: usuario.nome, email: usuario.email, tokenVersion: Number(usuario.tokenVersion || 0) },
      emitidaEm: new Date().toISOString(), expiraEm: expiraEm.toISOString()
    }, null, 2) + "\n";
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Usuario" WHERE id = ${usuario.id} FOR UPDATE`;
      const quantidade = await tx.companyAuthorization.count({ where: { usuarioId: usuario.id, criadaEm: { gt: new Date(Date.now() - 3600_000) } } });
      if (quantidade >= 5) throw Object.assign(new Error("Limite de solicitações atingido. Aguarde uma hora para emitir outra autorização."), { statusCode: 429 });
      await tx.companyAuthorization.updateMany({ where: { usuarioId: usuario.id, usadoEm: null, revogadoEm: null }, data: { revogadoEm: new Date() } });
      await tx.companyAuthorization.create({ data: { id, usuarioId: usuario.id, empresaId: usuario.empresaId, documento, documentoHash: sha256(documento), expiraEm } });
      await tx.auditLog.create({ data: { empresaId: usuario.empresaId, usuarioId: usuario.id, acao: "EMITIR_AUTORIZACAO_ECNPJ", entidade: "EMPRESA", entidadeId: usuario.empresaId, detalhes: { autorizacaoId: id, documentoHash: sha256(documento) } } });
    });
    res.json({ autorizacaoId: id, documento, arquivo: `steelcontrol-autorizacao-${id}.txt`, expiraEm,
      instrucoes: "Assine este arquivo sem alterá-lo, com o e-CNPJ da empresa, em CMS/CAdES destacado (.p7s, DER, SHA-256 ou superior). Envie somente a assinatura; nunca envie PFX, P12, chave privada ou senha do certificado." });
  } catch (error) { next(error); }
}

export async function concluirAutorizacao(req, res, next) {
  try {
    const usuario = req.bootstrap;
    const id = String(req.body?.autorizacaoId || "");
    const assinatura = req.file?.buffer;
    if (!id || !assinatura) return res.status(400).json({ mensagem: "Envie o identificador e a assinatura destacada .p7s." });
    const challenge = await prisma.companyAuthorization.findFirst({ where: { id, usuarioId: usuario.id, empresaId: usuario.empresaId, usadoEm: null, revogadoEm: null, expiraEm: { gt: new Date() }, tentativas: { lt: 5 } } });
    if (!challenge) return res.status(409).json({ mensagem: "Autorização expirada, já utilizada ou indisponível. Emita outra solicitação." });
    const reserved = await prisma.companyAuthorization.updateMany({ where: { id, usadoEm: null, revogadoEm: null, expiraEm: { gt: new Date() }, tentativas: { lt: 5 } }, data: { tentativas: { increment: 1 } } });
    if (reserved.count !== 1) return res.status(409).json({ mensagem: "Autorização indisponível." });
    const content = JSON.parse(challenge.documento);
    if (sha256(challenge.documento) !== challenge.documentoHash || content.servico !== audience() ||
        content.administrador?.id !== usuario.id || content.administrador?.email !== usuario.email ||
        content.administrador?.tokenVersion !== Number(usuario.tokenVersion || 0) || content.empresa?.id !== usuario.empresaId ||
        content.empresa?.cnpj !== String(usuario.empresa.cnpj || "").replace(/\D/g, "")) {
      return res.status(409).json({ mensagem: "Os dados da empresa ou da conta mudaram. Emita outra autorização." });
    }
    const proof = await verificarAssinaturaEcnpj({ documento: challenge.documento, assinatura, cnpj: usuario.empresa.cnpj });
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Empresa" WHERE id = ${usuario.empresaId} FOR UPDATE`;
      const current = await tx.usuario.findUnique({ where: { id: usuario.id }, include: { empresa: true } });
      if (!current?.ativo || current.empresa?.status !== "PENDENTE" || current.statusVinculo !== "ADMIN_PENDENTE" || !current.emailVerificadoEm || current.empresaId !== usuario.empresaId || current.empresa.cnpj !== usuario.empresa.cnpj || current.email !== usuario.email || current.tokenVersion !== usuario.tokenVersion) throw Object.assign(new Error("Cadastro alterado durante a validação. Entre novamente."), { statusCode: 409 });
      const consumed = await tx.companyAuthorization.updateMany({ where: { id, usadoEm: null, revogadoEm: null, expiraEm: { gt: new Date() } }, data: { usadoEm: new Date(), assinaturaHash: proof.assinaturaHash, certificadoFingerprint: proof.fingerprint } });
      if (consumed.count !== 1) throw Object.assign(new Error("Esta autorização já foi utilizada ou expirou."), { statusCode: 409 });
      await tx.empresa.update({ where: { id: usuario.empresaId }, data: { status: "ATIVA", validadaEm: new Date() } });
      await tx.usuario.update({ where: { id: usuario.id }, data: { cargo: "ADMINISTRADOR", statusVinculo: "APROVADO" } });
      await tx.usuario.updateMany({ where: { empresaId: usuario.empresaId, id: { not: usuario.id }, statusVinculo: "ADMIN_PENDENTE" }, data: { statusVinculo: "SOLICITADO", cargo: "VISITANTE" } });
      await tx.usuario.updateMany({ where: { empresaId: usuario.empresaId }, data: { tokenVersion: { increment: 1 } } });
      await tx.companyAuthorization.updateMany({ where: { empresaId: usuario.empresaId, usadoEm: null }, data: { revogadoEm: new Date() } });
      await tx.auditLog.create({ data: { empresaId: usuario.empresaId, usuarioId: usuario.id, acao: "ATIVAR_EMPRESA_ECNPJ", entidade: "EMPRESA", entidadeId: usuario.empresaId, detalhes: { autorizacaoId: id, documentoHash: challenge.documentoHash, ...proof } } });
    });
    res.json({ validada: true, mensagem: "Empresa validada com e-CNPJ. Faça login novamente e confirme o segundo fator para acessar." });
  } catch (error) {
    await registrarAuditoria({ empresaId: req.bootstrap?.empresaId, usuarioId: req.bootstrap?.id, acao: "RECUSAR_AUTORIZACAO_ECNPJ", entidade: "EMPRESA", detalhes: { codigo: error.codigo || "VALIDATION_ERROR" } });
    next(error);
  }
}
