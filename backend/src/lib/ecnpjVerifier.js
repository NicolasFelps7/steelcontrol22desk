import { X509Certificate, createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as asn1js from "asn1js";
import { ContentInfo, SignedData, Certificate } from "pkijs";

const run = promisify(execFile);
const DIGESTS = new Set(["2.16.840.1.101.3.4.2.1", "2.16.840.1.101.3.4.2.2", "2.16.840.1.101.3.4.2.3"]);
export const sha256 = value => createHash("sha256").update(value).digest("hex");
function failure(message, statusCode = 422) { return Object.assign(new Error(message), { statusCode, codigo: "ECNPJ_VALIDATION_FAILED" }); }
function parseDer(bytes) {
  const value = asn1js.fromBER(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  if (value.offset !== bytes.length || value.result.error) throw failure("Estrutura criptográfica inválida.");
  return value.result;
}

export function verificarFormatoCms(signature) {
  if (!Buffer.isBuffer(signature) || !signature.length || signature.length > 1024 * 1024) throw failure("Envie somente a assinatura destacada .p7s, de até 1 MB.");
  try {
    const info = new ContentInfo({ schema: parseDer(signature) });
    if (info.contentType !== "1.2.840.113549.1.7.2") throw failure("O arquivo não é uma assinatura CMS.");
    const data = new SignedData({ schema: info.content });
    if (data.signerInfos.length !== 1 || data.encapContentInfo.eContent || data.encapContentInfo.eContentType !== "1.2.840.113549.1.7.1") {
      throw failure("Use uma assinatura CMS destacada com exatamente um signatário, sobre o arquivo original baixado.");
    }
    if (!DIGESTS.has(data.signerInfos[0].digestAlgorithm.algorithmId) ||
        !data.digestAlgorithms.length || data.digestAlgorithms.some(d => !DIGESTS.has(d.algorithmId))) throw failure("A assinatura deve usar SHA-256, SHA-384 ou SHA-512.");
    if (data.certificates?.length > 12) throw failure("Cadeia de certificados excede o limite permitido.");
  } catch (e) { if (e.statusCode) throw e; throw failure("Assinatura .p7s inválida ou não suportada."); }
}

export function cnpjDoCertificado(pem) {
  const blocks = String(pem).match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) || [];
  if (blocks.length !== 1) throw failure("É necessário exatamente um certificado signatário.");
  const x509 = new X509Certificate(blocks[0]);
  if (x509.ca) throw failure("O signatário deve ser um e-CNPJ de usuário final, não uma autoridade certificadora.");
  const certificate = new Certificate({ schema: parseDer(x509.raw) });
  const extensions = certificate.extensions || [];
  const sanExt = extensions.filter(x => x.extnID === "2.5.29.17");
  if (sanExt.length !== 1) throw failure("Certificado sem identificação empresarial ICP-Brasil.");
  const names = parseDer(Buffer.from(sanExt[0].extnValue.valueBlock.valueHexView)).valueBlock.value;
  const cnpjs = [];
  for (const name of names || []) {
    if (name.idBlock.tagClass !== 3 || name.idBlock.tagNumber !== 0) continue;
    const parts = name.valueBlock.value;
    if (parts?.[0]?.valueBlock?.toString() !== "2.16.76.1.3.3") continue;
    const explicit = parts[1];
    const string = explicit?.valueBlock?.value?.[0];
    if (parts.length !== 2 || explicit.idBlock.tagClass !== 3 || explicit.idBlock.tagNumber !== 0 ||
        explicit.valueBlock.value.length !== 1 || string?.idBlock.tagClass !== 1 ||
        ![4, 12, 19, 22].includes(string.idBlock.tagNumber) || string.idBlock.isConstructed) throw failure("Identificador CNPJ inválido no certificado.");
    cnpjs.push(string.idBlock.tagNumber === 4 ? Buffer.from(string.valueBlock.valueHexView).toString("latin1") : string.valueBlock.value);
  }
  if (cnpjs.length !== 1 || !/^\d{14}$/.test(cnpjs[0])) throw failure("Use certificado e-CNPJ com o CNPJ no campo ICP-Brasil correto. Nome do titular ou texto do documento não substituem esse campo.");
  const usage = extensions.find(x => x.extnID === "2.5.29.15");
  if (!usage || !(parseDer(Buffer.from(usage.extnValue.valueBlock.valueHexView)).valueBlock.valueHexView[0] & 0xc0)) throw failure("Certificado não autorizado para assinatura digital.");
  const policies = extensions.find(x => x.extnID === "2.5.29.32");
  const policyList = policies && parseDer(Buffer.from(policies.extnValue.valueBlock.valueHexView)).valueBlock.value;
  if (!policyList?.some(x => x.valueBlock.value?.[0]?.valueBlock?.toString().startsWith("2.16.76.1.2."))) throw failure("Certificado sem política de certificação ICP-Brasil.");
  const details = x509.publicKey.asymmetricKeyDetails || {};
  if (["rsa", "rsa-pss"].includes(x509.publicKey.asymmetricKeyType) && details.modulusLength < 2048) throw failure("Chave RSA abaixo do mínimo de segurança.");
  if (!["rsa", "rsa-pss", "ec"].includes(x509.publicKey.asymmetricKeyType)) throw failure("Tipo de chave do certificado não suportado.");
  if (x509.publicKey.asymmetricKeyType === "ec" && !["prime256v1", "secp384r1", "secp521r1"].includes(details.namedCurve)) throw failure("Curva elíptica não suportada.");
  const policyOids = policyList.map(x => x.valueBlock.value[0].valueBlock.toString());
  return { cnpj: cnpjs[0], policyOids, fingerprint: x509.fingerprint256.replaceAll(":", "").toLowerCase() };
}

export async function verificarAssinaturaEcnpj({ documento, assinatura, cnpj, rootsPath = process.env.ECNPJ_ROOTS_PEM, crlsPath = process.env.ECNPJ_CRLS_PEM, allowedPolicies = String(process.env.ECNPJ_ALLOWED_POLICY_OIDS || "").split(",").map(x => x.trim()).filter(Boolean) }) {
  if (!rootsPath || !crlsPath) throw failure("Validação e-CNPJ não configurada no servidor. A empresa permanece bloqueada.", 503);
  if (!Array.isArray(allowedPolicies) || !allowedPolicies.length || allowedPolicies.some(x => !/^2\.16\.76\.1\.2\.[1-4](?:\.\d+)+$/.test(x))) throw failure("Configure as políticas de certificado e-CNPJ aceitas (ECNPJ_ALLOWED_POLICY_OIDS) com base na documentação oficial dos emissores.", 503);
  verificarFormatoCms(assinatura);
  let roots, crls;
  try { roots = await readFile(rootsPath); crls = await readFile(crlsPath); }
  catch { throw failure("Não foi possível carregar as raízes ICP-Brasil e listas de revogação do servidor.", 503); }
  const rootBlocks = roots.toString().match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g) || [];
  if (!rootBlocks.length || rootBlocks.some(pem => { const cert = new X509Certificate(pem); return !cert.ca || !cert.checkIssued(cert) || !cert.verify(cert.publicKey); })) throw failure("Configure apenas raízes ICP-Brasil autênticas no arquivo de confiança.", 503);
  if (!crls.toString().includes("-----BEGIN X509 CRL-----")) throw failure("Listas de revogação ausentes. A empresa permanece bloqueada.", 503);
  const folder = await mkdtemp(path.join(tmpdir(), "steelcontrol-ecnpj-"));
  try {
    const file = name => path.join(folder, name);
    await Promise.all([
      writeFile(file("document.txt"), documento, { mode: 0o600 }),
      writeFile(file("signature.p7s"), assinatura, { mode: 0o600 }),
      writeFile(file("trust.pem"), Buffer.concat([roots, Buffer.from("\n"), crls]), { mode: 0o600 })
    ]);
    try {
      await run(process.env.ECNPJ_OPENSSL_BIN || "openssl", ["cms", "-verify", "-verify_retcode", "-binary", "-inform", "DER",
        "-in", file("signature.p7s"), "-content", file("document.txt"), "-CAfile", file("trust.pem"),
        "-no-CApath", "-no-CAstore", "-crl_check_all", "-purpose", "any", "-auth_level", "2", "-verify_depth", "8",
        "-signer", file("signer.pem"), "-out", file("verified.txt")], { timeout: 15_000, maxBuffer: 256 * 1024, windowsHide: true });
    } catch (error) {
      if (error.code === "ENOENT") throw failure("OpenSSL 3 não está instalado no servidor.", 503);
      throw failure("Assinatura recusada: conteúdo alterado, certificado não confiável, vencido ou revogado, cadeia incompleta ou lista de revogação indisponível/vencida.");
    }
    const verified = await readFile(file("verified.txt"));
    if (!verified.equals(Buffer.from(documento, "utf8"))) throw failure("A assinatura não corresponde aos bytes da autorização emitida.");
    const signer = cnpjDoCertificado(await readFile(file("signer.pem"), "utf8"));
    if (signer.cnpj !== String(cnpj).replace(/\D/g, "")) throw failure("O e-CNPJ pertence a outra empresa. A ativação foi recusada.");
    const politica = signer.policyOids.find(x => allowedPolicies.includes(x));
    if (!politica) throw failure("A política deste certificado não está habilitada para autorização empresarial e-CNPJ nesta instalação.");
    return { cnpj: signer.cnpj, fingerprint: signer.fingerprint, politica, assinaturaHash: sha256(assinatura), rootsHash: sha256(roots), crlsHash: sha256(crls) };
  } finally { await rm(folder, { recursive: true, force: true }); }
}
