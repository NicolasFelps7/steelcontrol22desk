import "dotenv/config";
import { readFile } from "node:fs/promises";
import { X509Certificate } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as asn1js from "asn1js";
import { CertificateRevocationList } from "pkijs";
const execute = promisify(execFile);
try {
  const origin = new URL(process.env.ECNPJ_SERVICE_ORIGIN || "");
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) throw new Error("Use somente a origem HTTPS oficial em ECNPJ_SERVICE_ORIGIN, sem caminho, consulta ou credenciais.");
  const { stdout } = await execute(process.env.ECNPJ_OPENSSL_BIN || "openssl", ["version"], { timeout: 5000 });
  if (!/^OpenSSL 3\./.test(stdout)) throw new Error("Instale OpenSSL 3 no servidor.");
  const policies = String(process.env.ECNPJ_ALLOWED_POLICY_OIDS || "").split(",").map(x => x.trim()).filter(Boolean);
  if (!policies.length || policies.some(x => !/^2\.16\.76\.1\.2\.[1-4](?:\.\d+)+$/.test(x))) throw new Error("Configure as políticas e-CNPJ permitidas em ECNPJ_ALLOWED_POLICY_OIDS conforme o emissor oficial.");
  console.log("Políticas e-CNPJ permitidas:", policies.join(", "));
  const roots = await readFile(process.env.ECNPJ_ROOTS_PEM, "utf8");
  const crls = await readFile(process.env.ECNPJ_CRLS_PEM, "utf8");
  const anchors = roots.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) || [];
  const lists = crls.match(/-----BEGIN X509 CRL-----[\s\S]+?-----END X509 CRL-----/g) || [];
  if (!anchors.length || !lists.length) throw new Error("Forneça raízes públicas ICP-Brasil e LCRs em PEM, em arquivos separados.");
  for (const pem of anchors) {
    const cert = new X509Certificate(pem);
    if (!cert.ca || !cert.checkIssued(cert) || !cert.verify(cert.publicKey) || new Date(cert.validTo) <= new Date()) throw new Error("Raiz inválida, não autossinada ou vencida.");
    console.log("Raiz configurada:", cert.subject, "SHA-256:", cert.fingerprint256);
  }
  for (const pem of lists) {
    const bytes = Buffer.from(pem.replace(/-----[^\n]+-----/g, "").replace(/\s/g, ""), "base64");
    const parsed = asn1js.fromBER(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length));
    if (parsed.offset !== bytes.length) throw new Error("LCR inválida.");
    const list = new CertificateRevocationList({ schema: parsed.result });
    if (!list.nextUpdate?.value || list.thisUpdate.value > new Date() || list.nextUpdate.value <= new Date()) throw new Error("Existe LCR ausente de prazo, futura ou vencida. Atualize as listas antes de liberar validações.");
    console.log("LCR vigente até:", list.nextUpdate.value.toISOString());
  }
  console.log("Configuração disponível. Compare as impressões digitais das raízes com fontes oficiais do ITI. Cada upload ainda precisa passar por validação criptográfica completa, cadeia e revogação.");
} catch (error) { console.error("e-CNPJ indisponível:", error.message); process.exitCode = 1; }
