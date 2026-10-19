import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";
const AUDIENCE = "steelcontrol:company-authorization";
export function tokenValidacaoEmpresa(usuario) {
  // No usuarioId, cargo or mfaVerified: this is never an application session.
  return jwt.sign({ bootstrapUserId: usuario.id, empresaId: usuario.empresaId,
    tokenVersion: Number(usuario.tokenVersion || 0), email: usuario.email }, env.jwtSecret,
    { audience: AUDIENCE, expiresIn: "45m" });
}
export function respostaValidacaoEmpresa(usuario) {
  return { codigo: "COMPANY_SIGNATURE_REQUIRED", pendente: true, metodoValidacao: "ECNPJ",
    mensagem: "Confirme a autorização da empresa com uma assinatura e-CNPJ. Nenhum acesso operacional foi liberado.",
    validacaoToken: tokenValidacaoEmpresa(usuario) };
}
export async function companyBootstrapRequired(req, res, next) {
  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer /, "");
    const payload = jwt.verify(token, env.jwtSecret, { audience: AUDIENCE });
    if (!Number.isInteger(payload.bootstrapUserId) || payload.usuarioId || payload.mfaVerified) throw new Error();
    const usuario = await prisma.usuario.findUnique({ where: { id: payload.bootstrapUserId }, include: { empresa: true } });
    if (!usuario?.ativo || !usuario.emailVerificadoEm || usuario.statusVinculo !== "ADMIN_PENDENTE" || usuario.empresa?.status !== "PENDENTE" ||
        usuario.empresaId !== payload.empresaId || usuario.email !== payload.email || Number(usuario.tokenVersion || 0) !== payload.tokenVersion) throw new Error();
    req.bootstrap = usuario;
    req.auditIdentity = { empresaId: usuario.empresaId, usuarioId: usuario.id };
    res.setHeader("Cache-Control", "no-store");
    next();
  } catch { return res.status(401).json({ codigo: "COMPANY_VALIDATION_SESSION_EXPIRED", mensagem: "A sessão de validação expirou ou o cadastro mudou. Entre novamente e confirme o código de e-mail." }); }
}
