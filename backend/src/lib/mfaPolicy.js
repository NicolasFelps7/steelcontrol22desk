import { env } from "../config/env.js";

export function requiresPrivilegedMfa(user) {
  return env.adminMfaRequired && ["ADMINISTRADOR", "SUPERVISOR", "TECNICO"].includes(user?.cargo);
}
