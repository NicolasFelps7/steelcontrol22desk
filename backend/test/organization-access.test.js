import test, { after, afterEach } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

Object.assign(process.env, {
  NODE_ENV: "development", SECURITY_PROFILE: "development",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:5432/steeltest",
  JWT_SECRET: "s".repeat(64), BREVO_API_KEY: "test-no-real-provider",
  BREVO_FROM_EMAIL: "sender@example.com", REDIS_URL: "", ADMIN_MFA_REQUIRED: "false"
});
const { prisma } = await import("../src/lib/prisma.js");
const { authRequired } = await import("../src/middlewares/auth.js");
const { deviceRequired } = await import("../src/middlewares/deviceAuth.js");
const { requireControlCredential } = await import("../src/middlewares/controlAuthorization.js");
const { organizationAccessError } = await import("../src/lib/organizationPolicy.js");
const { decidirSolicitacao } = await import("../src/modules/company/access.controller.js");
const { gerarDeviceKey, hashDeviceKey } = await import("../src/lib/deviceSecurity.js");
const auth = await import("../src/modules/auth/auth.controller.js");
const originalFetch = globalThis.fetch;
const restores = [];
function patch(obj, name, fn) {
  const original = obj[name];
  obj[name] = fn;
  restores.push(() => { obj[name] = original; });
}
afterEach(() => { while (restores.length) restores.pop()(); globalThis.fetch = originalFetch; });
after(() => prisma.$disconnect());

function response() {
  return { statusCode: 200, headers: {}, status(n) { this.statusCode = n; return this; },
    json(body) { this.body = body; return this; }, setHeader(k,v) { this.headers[k] = v; } };
}
function user(extra = {}) {
  return { id: 7, empresaId: 3, nome: "Pessoa", email: "pessoa@gmail.com", ativo: true,
    cargo: "ADMINISTRADOR", tokenVersion: 0, statusVinculo: "APROVADO",
    emailVerificadoEm: new Date(), empresa: { id: 3, status: "ATIVA" }, ...extra };
}
async function call(fn, req = {}) {
  const res = response(); let next = false;
  await fn({ headers: {}, body: {}, get() { return ""; }, ...req }, res, error => { if (error) throw error; next = true; });
  return { res, next };
}
function token(payload = {}) {
  return jwt.sign({ usuarioId: 7, tokenVersion: 0, mfaVerified: true, ...payload }, process.env.JWT_SECRET);
}

test("CNPJ, e-mail e cargo administrativo não autorizam empresa pendente", () => {
  assert.equal(organizationAccessError(user({ empresa: { status: "PENDENTE" } })).codigo, "COMPANY_VALIDATION_PENDING");
  assert.equal(organizationAccessError(user({ statusVinculo: "SOLICITADO" })).codigo, "MEMBERSHIP_PENDING");
  assert.ok(organizationAccessError(user({ empresa: {} })));
});
for (const status of ["PENDENTE", "REJEITADA"]) {
  test(`API rejeita JWT válido de empresa ${status}`, async () => {
    patch(prisma.usuario, "findUnique", async () => user({ empresa: { status } }));
    const { res, next } = await call(authRequired, { headers: { authorization: `Bearer ${token()}` } });
    assert.equal(res.statusCode, 403); assert.equal(next, false);
  });
}
test("permissões não vêm do cargo forjado no JWT", async () => {
  patch(prisma.usuario, "findUnique", async () => user({ cargo: "VISITANTE" }));
  const req = { headers: { authorization: `Bearer ${token({ cargo: "ADMINISTRADOR" })}` }, get() { return ""; } };
  const { next } = await call(authRequired, req);
  assert.equal(next, true);
  // Inspect the exact middleware request, rather than a copied object.
  await authRequired(req, response(), () => {});
  assert.equal(req.auth.cargo, "VISITANTE");
});
test("usuário pendente não lê nem controla máquinas com token antigo", async () => {
  patch(prisma.usuario, "findUnique", async () => user({ statusVinculo: "SOLICITADO" }));
  const { res, next } = await call(authRequired, { headers: { authorization: `Bearer ${token()}` } });
  assert.equal(res.body.codigo, "MEMBERSHIP_PENDING"); assert.equal(next, false);
});
test("sessão de e-mail confirmado dispensa MFA recorrente e continua revogável", async () => {
  patch(prisma.usuario, "findUnique", async () => user());
  assert.equal((await call(authRequired, { headers: { authorization: `Bearer ${token({ mfaVerified: false })}` } })).next, true);
  assert.equal((await call(authRequired, { headers: { authorization: `Bearer ${token({ tokenVersion: 8 })}` } })).res.body.codigo, "SESSION_REVOKED");
});
test("Visitante aprovado não pode controlar equipamento", async () => {
  const { res, next } = await call(requireControlCredential, { auth: { cargo: "VISITANTE", empresaId: 3 }, params: { id: 1 } });
  assert.equal(res.statusCode, 403); assert.equal(next, false);
});
test("máquina real sem chave Edge é bloqueada e busca usa empresa da sessão", async () => {
  let query;
  patch(prisma.maquina, "findFirst", async q => { query = q; return { modoSimulacao: false }; });
  const { res } = await call(requireControlCredential, { auth: { cargo: "OPERADOR", empresaId: 3 }, params: { id: 1 } });
  assert.equal(res.statusCode, 409); assert.equal(query.where.empresaId, 3);
});
test("Edge com chave válida continua bloqueado se empresa não estiver ativa", async () => {
  const key = gerarDeviceKey();
  patch(prisma.maquina, "findFirst", async () => ({ id: 1, empresaId: 3, deviceKeyHash: hashDeviceKey(key), empresa: { status: "PENDENTE" } }));
  const { res, next } = await call(deviceRequired, { params: { id: 1 }, headers: { "x-device-key": key } });
  assert.equal(res.statusCode, 403); assert.equal(next, false);
});
test("aprovação de funcionário fica no tenant e sempre começa Visitante", async () => {
  let query, audit;
  patch(prisma, "$transaction", async fn => fn({
    usuario: { updateMany: async q => { query = q; return { count: 1 }; } },
    auditLog: { create: async q => { audit = q; } }
  }));
  const { res } = await call(decidirSolicitacao, { auth: { empresaId: 3, usuarioId: 7 }, params: { usuarioId: 8 }, body: { decisao: "APROVAR", cargo: "ADMINISTRADOR", empresaId: 999 } });
  assert.equal(res.statusCode, 200); assert.equal(query.where.empresaId, 3);
  assert.equal(query.data.cargo, "VISITANTE"); assert.equal(query.data.statusVinculo, "APROVADO");
  assert.equal(audit.data.acao, "APROVAR_VINCULO");
});
test("solicitação de outro tenant ou já analisada não é aprovada", async () => {
  patch(prisma, "$transaction", async fn => fn({ usuario: { updateMany: async () => ({ count: 0 }) } }));
  assert.equal((await call(decidirSolicitacao, { auth: { empresaId: 3, usuarioId: 7 }, params: { usuarioId: 8 }, body: { decisao: "APROVAR" } })).res.statusCode, 409);
});
async function mockMailAndFace() {
  let code;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes("api.brevo.com")) {
      const body = JSON.parse(options.body);
      code = body.htmlContent.match(/\b\d{6}\b/)?.[0];
      return Response.json({ messageId: "test-only" }, { status: 201 });
    }
    if (String(url).endsWith("/face/analyze")) return Response.json({ detectado: true, quantidadeRostos: 1, pronto: true, pose: { yaw: 15 } });
    if (String(url).endsWith("/face/embedding")) return Response.json({ embedding: Array.from({ length: 512 }, (_, i) => i === 0 ? 1 : 0) });
    throw new Error(`Unexpected network: ${url}`);
  };
  return () => code;
}
for (const existing of [false, true, "pending"]) {
  test(`cadastro com Gmail ${existing === "pending" ? "recusa duplicar CNPJ pendente" : existing ? "é recusado para CNPJ ativo: funcionário é cadastrado pelo administrador" : "conclui empresa ativa e administrador sem certificado"}`, async () => {
    const mailCode = await mockMailAndFace(); let companyCreates = 0, savedUser;
    patch(prisma.usuario, "findUnique", async () => null);
    patch(prisma.empresa, "findUnique", async () => existing ? { id: 3, status: existing === "pending" ? "PENDENTE" : "ATIVA" } : null);
    const tx = {
      $queryRawUnsafe: async () => [],
      empresa: { findUnique: async q => q.where.cnpj && existing === "pending" ? { id: 3, status: "PENDENTE", nome: "Empresa Teste", cnpj: "11.222.333/0001-81", loginDomain: "empresateste.com" } : null, update: async () => ({}), create: async ({ data }) => { companyCreates++; return { id: 3, status: "ATIVA", ...data }; } },
      usuario: { findUnique: async () => null, create: async ({ data }) => { savedUser = { id: 7, ativo: true, tokenVersion: 0, ...data }; return savedUser; } },
      faceEmbedding: { findMany: async () => [], create: async () => ({ id: 1 }) },
      auditLog: { create: async () => ({}) }
    };
    patch(prisma, "$transaction", async fn => fn(tx));
    if (existing) {
      await assert.rejects(() => call(auth.requestCompanyRegistrationCode, { body: {
        empresa: { nome: "Empresa Teste", cnpj: "11.222.333/0001-81" },
        administrador: { nome: "Pessoa", email: "existing@gmail.com", senha: "senha-forte-123" }
      } }), /Gestão Industrial/);
      assert.equal(companyCreates, 0);
      return;
    }
    const requested = await call(auth.requestCompanyRegistrationCode, { body: {
      empresa: { nome: "Empresa Teste", cnpj: "11.222.333/0001-81" },
      administrador: { nome: "Pessoa", email: `${existing ? 'existing' : 'new'}@gmail.com`, senha: "senha-forte-123" }
    } });
    assert.equal(requested.res.statusCode, 200);
    const verificacaoId = requested.res.body.verificacaoId;
    assert.match(mailCode(), /^\d{6}$/);
    const confirmed = await call(auth.confirmCompanyRegistrationCode, { body: { verificacaoId, codigo: mailCode() } });
    assert.equal(confirmed.res.statusCode, 200);
    const image = { buffer: Buffer.from([0xff, 0xd8, 0xff, 0x00]) };
    const { res } = await call(auth.completeCompanyRegistrationWithFace, { body: { verificacaoId }, files: { imagem: [image], inicial: [image], liveness: [image] } });
    assert.equal(res.statusCode, 201); assert.equal(res.body.pendente, undefined); assert.equal(res.body.validacaoToken, undefined);
    assert.equal(res.body.empresa.status, "ATIVA");
    assert.equal(companyCreates, existing ? 0 : 1); assert.equal(savedUser.cargo, "ADMINISTRADOR");
    assert.equal(savedUser.statusVinculo, "APROVADO");
    assert.ok(savedUser.emailVerificadoEm);
    assert.equal(res.body.usuario.cargo, "Administrador");
    const sessionCookie = String(res.headers["Set-Cookie"]);
    const sessionToken = sessionCookie.match(/=([^;]+)/)?.[1];
    assert.equal(jwt.verify(sessionToken, process.env.JWT_SECRET).mfaVerified, true);
    assert.ok(JSON.stringify(res.headers).includes("eyJ"));
  });
}
test("e-mail não confirmado exige código uma vez e rejeita replay", async () => {
  const code = await mockMailAndFace();
  patch(prisma.usuario, "findUnique", async () => user({ emailVerificadoEm: null, senhaHash: await bcrypt.hash("senha-teste-123", 4) }));
  patch(prisma.usuario, "findFirst", async () => user());
  patch(prisma.usuario, "update", async () => user());
  const challenge = (await call(auth.login, { body: { email: "pessoa@gmail.com", senha: "senha-teste-123" } })).res;
  assert.equal(challenge.statusCode, 202); assert.equal(challenge.body.token, undefined);
  const verified = (await call(auth.verifyAdminMfa, { body: { challengeId: challenge.body.challengeId, codigo: code() } })).res;
  assert.equal(verified.statusCode, 200);
  assert.equal(jwt.verify(verified.body.token, process.env.JWT_SECRET).mfaVerified, true);
  const replay = (await call(auth.verifyAdminMfa, { body: { challengeId: challenge.body.challengeId, codigo: code() } })).res;
  assert.equal(replay.statusCode, 401);
});
test("facial inequívoca de e-mail confirmado dispensa código recorrente", async () => {
  await mockMailAndFace();
  const embedding = Array.from({ length: 512 }, (_, i) => i === 0 ? 1 : 0);
  patch(prisma.faceEmbedding, "findMany", async () => [{ id: 1, usuarioId: 7, embedding, usuario: user() }]);
  const { res } = await call(auth.loginFace, { body: { embedding } });
  assert.equal(res.statusCode, 200); assert.equal(res.body.mfaRequired, undefined);
  assert.equal(res.body.autenticacao.metodo, "facial");
  assert.equal(jwt.verify(res.body.token, process.env.JWT_SECRET).mfaVerified, false);
});

test("MFA não emite mais token de assinatura empresarial para estado legado pendente", async () => {
  const code = await mockMailAndFace();
  const pending = user({ statusVinculo: "ADMIN_PENDENTE", emailVerificadoEm: null, empresa: { status: "PENDENTE" }, senhaHash: await bcrypt.hash("senha-teste-123", 4) });
  let confirmed = false;
  patch(prisma.usuario, "findUnique", async () => pending);
  patch(prisma.usuario, "findFirst", async () => pending);
  patch(prisma.usuario, "update", async () => { confirmed = true; return pending; });
  const challenge = (await call(auth.login, { body: { email: pending.email, senha: "senha-teste-123" } })).res.body;
  const { res } = await call(auth.verifyAdminMfa, { body: { challengeId: challenge.challengeId, codigo: code() } });
  assert.equal(confirmed, true); assert.equal(res.statusCode, 403);
  assert.equal(res.body.codigo, "COMPANY_VALIDATION_PENDING");
  assert.equal(res.body.validacaoToken, undefined);
  assert.equal(res.body.token, undefined); assert.equal(res.headers["Set-Cookie"], undefined);
});
test("alterar conta após emissão do desafio invalida MFA", async () => {
  const code = await mockMailAndFace();
  patch(prisma.usuario, "findUnique", async () => user({ emailVerificadoEm: null, senhaHash: await bcrypt.hash("senha-teste-123", 4) }));
  patch(prisma.usuario, "findFirst", async () => user({ tokenVersion: 1 }));
  const challenge = (await call(auth.login, { body: { email: "pessoa@gmail.com", senha: "senha-teste-123" } })).res.body;
  const { res } = await call(auth.verifyAdminMfa, { body: { challengeId: challenge.challengeId, codigo: code() } });
  assert.equal(res.statusCode, 401); assert.equal(res.body.token, undefined);
});

test("rotas de assinatura empresarial não estão publicadas", async () => {
  const { authRoutes } = await import("../src/modules/auth/auth.routes.js");
  const paths = authRoutes.stack.filter(layer => layer.route).map(layer => layer.route.path);
  assert.ok(!paths.some(path => path.includes("company-authorization")));
});

test("senha com e-mail confirmado entra sem enviar código nem afirmar MFA", async () => {
  patch(prisma.usuario, "findUnique", async () => user({ senhaHash: await bcrypt.hash("senha-teste-123", 4) }));
  globalThis.fetch = async () => { throw new Error("Não deve enviar e-mail"); };
  const {res} = await call(auth.login, {body:{email:"pessoa@gmail.com",senha:"senha-teste-123"}});
  assert.equal(res.statusCode,200); assert.equal(res.body.autenticacao.metodo,"senha");
  assert.equal(jwt.verify(res.body.token,process.env.JWT_SECRET).mfaVerified,false);
});
test("conta sem e-mail confirmado não usa token antigo para acessar API", async () => {
  patch(prisma.usuario, "findUnique", async () => user({ emailVerificadoEm:null }));
  const {res,next}=await call(authRequired,{headers:{authorization:`Bearer ${token()}`}});
  assert.equal(res.body.codigo,"EMAIL_CONFIRMATION_REQUIRED"); assert.equal(next,false);
});
test("API facial recusa retorno ainda virado antes de comparar a identidade", async () => {
  globalThis.fetch=async()=>Response.json({detectado:true,quantidadeRostos:1,pronto:true,pose:{yaw:15}});
  const image={buffer:Buffer.from([0xff,0xd8,0xff,0])};
  const {res}=await call(auth.loginFaceImage,{files:{imagem:[image],liveness:[image]}});
  assert.equal(res.statusCode,401); assert.equal(res.body.codigo,"FACE_FINAL_POSITION_INVALID");
});
