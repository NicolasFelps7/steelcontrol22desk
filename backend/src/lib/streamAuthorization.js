import { prisma } from "./prisma.js";
import { organizationAccessError } from "./organizationPolicy.js";

export async function streamSessionValid(auth, now = Date.now()) {
  if (!auth || !Number.isFinite(auth.expiresAt) || auth.expiresAt <= now) return false;
  const user = await prisma.usuario.findUnique({ where: { id: auth.usuarioId }, select: {
    id: true, ativo: true, empresaId: true, cargo: true, tokenVersion: true,
    statusVinculo: true, emailVerificadoEm: true, empresa: { select: { status: true } }
  }});
  return Boolean(user?.ativo && user.emailVerificadoEm && !organizationAccessError(user) &&
    user.empresaId === auth.empresaId && user.cargo === auth.cargo && user.tokenVersion === auth.tokenVersion);
}

export function guardSessionStream(req, res) {
  if (req.method !== "GET" || !/\/(stream|session-events)$/.test(req.path || "")) return;
  let checking = false;
  const end = () => { if (!res.writableEnded) res.end(); };
  // A expiração é local; revogações são rechecadas também entre réplicas.
  const expiry = setTimeout(end, Math.max(1, req.auth.expiresAt - Date.now()));
  const recheck = setInterval(async () => {
    if (checking || res.writableEnded) return;
    checking = true;
    try { if (!await streamSessionValid(req.auth)) end(); }
    catch { end(); }
    finally { checking = false; }
  }, 15000);
  expiry.unref?.(); recheck.unref?.();
  res.once("close", () => { clearTimeout(expiry); clearInterval(recheck); });
}
