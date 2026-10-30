import { requiresPrivilegedMfa } from "../lib/mfaPolicy.js";
import { guardSessionStream } from "../lib/streamAuthorization.js";
import { verifySessionToken } from "../lib/sessionToken.js";
import { organizationAccessError } from "../lib/organizationPolicy.js";

import { prisma } from "../lib/prisma.js";
import { sessionTokenFromCookie } from "../lib/sessionCookie.js";
import { csrfCookieGuard } from "./security.js";

export async function authRequired(
  req,
  res,
  next
) {
  const auth =
    req.headers.authorization;

  const bearerToken =
    auth?.startsWith("Bearer ")
      ? auth.substring(7)
      : "";

  const cookieToken =
    bearerToken ? "" : sessionTokenFromCookie(req);

  const token = bearerToken || cookieToken;

  if (
    !token
  ) {
    return res
      .status(401)
      .json({
        mensagem:
          "Faça login para continuar."
      });
  }

  try {
    const payload =
      verifySessionToken(token);

    const usuarioId =
      Number(payload.usuarioId);

    if (
      !Number.isInteger(usuarioId)
    ) {
      return res
        .status(401)
        .json({
          mensagem:
            "Sessão inválida."
        });
    }

    // O token não é a fonte final de verdade para cargo/empresa/ativo.
    // A cada requisição protegida, o banco confirma o estado atual.
    const usuario =
      await prisma.usuario.findUnique({
        where: {
          id: usuarioId
        },
        select: {
          id: true,
          empresaId: true,
          cargo: true,
          ativo: true,
          tokenVersion: true,
          email: true,
          loginInterno: true,
          nome: true,
          statusVinculo: true,
          emailVerificadoEm: true,
          empresa: { select: { status: true } }
        }
      });

    if (
      !usuario ||
      !usuario.ativo
    ) {
      return res
        .status(401)
        .json({
          mensagem:
            "Conta inexistente ou desativada. Faça login novamente."
        });
    }

    const versaoToken = Number(payload.tokenVersion ?? 0);
    if (versaoToken !== Number(usuario.tokenVersion || 0)) {
      return res
        .status(401)
        .json({
          codigo: "SESSION_REVOKED",
          mensagem:
            "Esta sessão foi revogada. Faça login novamente."
        });
    }

    if (requiresPrivilegedMfa(usuario) && payload.mfaVerified !== true) {
      return res.status(401).json({ codigo: "ADMIN_MFA_REQUIRED", mensagem: "Confirme o segundo fator para acessar sua conta privilegiada." });
    }
    req.auditIdentity = { empresaId: usuario.empresaId, usuarioId: usuario.id };
    const acesso = organizationAccessError(usuario);
    if (acesso) return res.status(403).json(acesso);
    if (!usuario.emailVerificadoEm) return res.status(401).json({
      codigo: "EMAIL_CONFIRMATION_REQUIRED", mensagem: "Confirme seu e-mail uma única vez para concluir o cadastro."
    });

    req.auth = {
      tokenVersion: Number(usuario.tokenVersion || 0),
      expiresAt: payload.exp * 1000,
      usuarioId:
        usuario.id,
      empresaId:
        usuario.empresaId,
      cargo:
        usuario.cargo,
      loginInterno: usuario.loginInterno || null,
      email:
        usuario.email,
      nome:
        usuario.nome
    };

    req.authTransport = bearerToken ? "bearer" : "cookie";

    guardSessionStream(req, res);
    return csrfCookieGuard(req, res, next);

  } catch (erro) {
    return res
      .status(401)
      .json({
        mensagem:
          "Sessão inválida ou expirada."
      });
  }
}

export function requireRoles(
  ...cargosPermitidos
) {
  return function roleGuard(
    req,
    res,
    next
  ) {
    if (
      !req.auth ||
      !cargosPermitidos.includes(
        req.auth.cargo
      )
    ) {
      return res
        .status(403)
        .json({
          mensagem:
            "Você não possui permissão para realizar esta ação."
        });
    }

    next();
  };
}
