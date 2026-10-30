import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

const issuer = "steelcontrol-api";
const audience = "steelcontrol-clients";

export function signSessionToken(claims) {
  return jwt.sign(claims, env.jwtSecret, {
    algorithm: "HS256", issuer, audience,
    jwtid: randomUUID(), expiresIn: env.jwtExpiresIn
  });
}

export function verifySessionToken(token) {
  const claims = jwt.verify(token, env.jwtSecret, {
    algorithms: ["HS256"], issuer, audience
  });
  if (!claims || !Number.isInteger(claims.exp) || !Number.isInteger(claims.iat) ||
      claims.iat > Math.floor(Date.now() / 1000) + 30 ||
      typeof claims.jti !== "string" || !claims.jti ||
      !Number.isSafeInteger(claims.usuarioId) || claims.usuarioId <= 0 ||
      !Number.isSafeInteger(claims.tokenVersion) || claims.tokenVersion < 0) {
    throw new Error("Sessão inválida.");
  }
  return claims;
}
