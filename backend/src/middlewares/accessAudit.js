import { registrarAuditoria } from "../lib/audit.js";
export function accessAudit(req, res, next) {
  if (!/^\/(auth|empresa|maquinas|device|descoberta|conexoes)(\/|$)/.test(req.path)) return next();
  const rota = req.path;
  // All authentication attempts, all denials, and industrial write attempts.
  res.once("finish", () => {
    if (!rota.startsWith("/auth/") && res.statusCode < 400 && req.method === "GET") return;
    void registrarAuditoria({
      empresaId: req.auth?.empresaId || req.device?.empresaId || req.auditIdentity?.empresaId,
      usuarioId: req.auth?.usuarioId || req.auditIdentity?.usuarioId,
      acao: res.statusCode >= 400 ? "ACESSO_NEGADO" : "ACESSO_PROCESSADO",
      entidade: "SEGURANCA",
      detalhes: { metodo: req.method, rota: rota.slice(0, 180), status: res.statusCode, ip: req.ip || null }
    });
  });
  next();
}
