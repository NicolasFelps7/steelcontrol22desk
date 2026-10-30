export function redactSecrets(value, depth = 0) {
  if (depth > 12) return "[LIMITE]";
  if (Array.isArray(value)) return value.slice(0, 100).map(item => redactSecrets(item, depth + 1));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key, /password|senha|secret|segredo|token|device.?key|credencial|authorization|cookie|embedding/i.test(key)
      ? "[OCULTO]" : redactSecrets(item, depth + 1)
  ]));
  if (typeof value === "string") return value.replace(/scd_[A-Za-z0-9_-]+/g, "[OCULTO]").replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [OCULTO]").slice(0, 2000);
  return value;
}

import { prisma } from "./prisma.js";

export async function registrarAuditoria({
  req = null,
  empresaId = null,
  usuarioId = null,
  acao,
  entidade,
  entidadeId = null,
  detalhes = null
}) {
  try {
    const empresaFinal =
      Number(empresaId || req?.auth?.empresaId || 0);

    const usuarioFinal =
      usuarioId || req?.auth?.usuarioId || null;

    if (
      !acao ||
      !entidade
    ) {
      return;
    }

    await prisma.auditLog.create({
      data: {
        empresaId: Number.isInteger(empresaFinal) && empresaFinal > 0 ? empresaFinal : null,
        usuarioId:
          usuarioFinal === null
            ? null
            : Number(usuarioFinal),
        acao: String(acao).slice(0, 80),
        entidade: String(entidade).slice(0, 80),
        entidadeId:
          entidadeId === null
            ? null
            : Number(entidadeId),
        detalhes: redactSecrets(detalhes) || undefined
      }
    });
  } catch (erro) {
    // Auditoria nunca derruba a operação principal.
    console.error("[AUDITORIA] Não foi possível gravar o evento.");
  }
}
