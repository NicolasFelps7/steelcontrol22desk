import test, { afterEach, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import express from "express";

Object.assign(process.env, {
  NODE_ENV: "development", SECURITY_PROFILE: "development", REDIS_URL: "",
  DATABASE_URL: "postgresql://test:test@127.0.0.1:5432/test",
  JWT_SECRET: "hardening-tests-".repeat(5)
});
const { prisma } = await import("../src/lib/prisma.js");
const { signSessionToken, verifySessionToken } = await import("../src/lib/sessionToken.js");
const { criarRateLimit, csrfCookieGuard } = await import("../src/middlewares/security.js");
const { commandAllowedNow } = await import("../src/lib/commandSafety.js");
const { redactSecrets } = await import("../src/lib/audit.js");
const { validarPayloadDobot } = await import("../src/lib/dobotPolicy.js");
const { deviceRoutes } = await import("../src/modules/device/device.routes.js");
const { machineRoutes } = await import("../src/modules/machines/machine.routes.js");
const { gerarDeviceKey, hashDeviceKey } = await import("../src/lib/deviceSecurity.js");
const restores = [];
function patch(obj, key, fn) { const old = obj[key]; obj[key] = fn; restores.push(() => obj[key] = old); }
afterEach(() => { while (restores.length) restores.pop()(); });
const app = express(); app.use(express.json()); app.use("/device", deviceRoutes); app.use("/maquinas", machineRoutes);
app.use((e, req, res, next) => res.status(e.statusCode || 500).json({ error: "test" }));
const server = app.listen(0, "127.0.0.1"); await new Promise(r => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;
after(async () => { server.closeAllConnections(); await new Promise(r => server.close(r)); await prisma.$disconnect(); });
const key = gerarDeviceKey();
const machine = { id: 7, empresaId: 3, ativo: true, modoSimulacao: false, controlador: "DOBOT_MAGICIAN",
  deviceKeyHash: hashDeviceKey(key), empresa: { status: "ATIVA" }, integracaoMeta: { dobot: { remoteControlEnabled: true } } };
function command(extra = {}) { return { id: 10, maquinaId: 7, solicitanteId: 2, status: "ENTREGUE", comando: "DOBOT_ROTATE",
  tentativasEntrega: 1, criadoEm: new Date(), payload: { delta: 2, expiresAt: new Date(Date.now() + 5000).toISOString() }, ...extra }; }
function response() { return { code: 200, headers: {}, setHeader(k,v) { this.headers[k]=v; }, status(code) { this.code=code; return this; }, json(body) { this.body=body; return this; } }; }
function deviceAuth(current = machine) { patch(prisma.maquina, "findFirst", async q => { assert.equal(q.where.id, 7); assert.equal(q.where.ativo, true); return current; }); }
async function device(path, body = {}) { return fetch(base + "/device/7" + path, { method: "POST", headers: { "x-device-key": key, "X-SteelControl-Command-Protocol":"2", "content-type": "application/json" }, body: JSON.stringify(body) }); }

test("sessão exige assinatura HS256, emissor, destinatário, expiração e identificador", () => {
  const token = signSessionToken({ usuarioId: 2, tokenVersion: 0 });
  assert.equal(verifySessionToken(token).usuarioId, 2);
  assert.notEqual(verifySessionToken(token).jti, verifySessionToken(signSessionToken({ usuarioId: 2, tokenVersion: 0 })).jti);
  const claims = jwt.decode(token); delete claims.exp;
  assert.throws(() => verifySessionToken(jwt.sign(claims, process.env.JWT_SECRET)));
  for (const change of [{ aud: "other" }, { iss: "other" }, { exp: 1 }, { usuarioId: -1 }, { tokenVersion: "0" }]) {
    assert.throws(() => verifySessionToken(jwt.sign({ ...jwt.decode(token), ...change }, process.env.JWT_SECRET)));
  }
  assert.throws(() => verifySessionToken(jwt.sign(jwt.decode(token), process.env.JWT_SECRET, { algorithm: "HS384" })));
});
test("mudar e-mail não contorna a cota do IP", () => {
  const limiter = criarRateLimit({ prefixo: "hardening-ip", limite: 1 });
  let count = 0;
  for (const email of ["a@example.test", "b@example.test"]) {
    const res = response(); limiter({ ip: "1.2.3.4", body: { email } }, res, () => count++);
    if (email.startsWith("b")) assert.equal(res.code, 429);
  }
  assert.equal(count, 1);
});
test("cota da conta permanece ao alternar IP", () => {
  const limiter = criarRateLimit({ prefixo: "hardening-account", limite: 1, escopo: "conta" });
  limiter({ ip: "1", body: { email: "PERSON@example.test" } }, response(), () => {});
  const res=response(); limiter({ ip: "2", body: { email: "person@example.test" } }, res, () => assert.fail());
  assert.equal(res.code, 429);
});
test("cookie em escrita exige evidência de origem; bearer continua disponível ao mobile", () => {
  for (const headers of [{}, { origin: "https://evil.test" }, { "sec-fetch-site": "cross-site" }]) {
    const req = { auth: {}, authTransport: "cookie", method: "POST", protocol: "https", get: k => headers[k] || (k === "host" ? "steel.test" : "") };
    const res=response(); csrfCookieGuard(req,res,()=>assert.fail()); assert.equal(res.code,403);
  }
  let count=0;
  csrfCookieGuard({auth:{},authTransport:"bearer",method:"POST"},response(),()=>count++);
  csrfCookieGuard({auth:{},authTransport:"cookie",method:"POST",protocol:"https",get:k=>({origin:"https://steel.test",host:"steel.test"})[k]},response(),()=>count++);
  assert.equal(count,2);
});
test("auditoria remove segredos aninhados, bearer e device key", () => {
  const scrubbed=JSON.stringify(redactSecrets({ senha:"sensitive", nested:[{ token:"sensitive", message:"Bearer abc.def.sig scd_abcdef" }], cargo:"TECNICO" }));
  assert.ok(!scrubbed.includes("sensitive")); assert.ok(!scrubbed.includes("abc.def")); assert.ok(!scrubbed.includes("scd_")); assert.ok(scrubbed.includes("TECNICO"));
});
test("PTP recusa null, booleanos, objetos, strings e valores não finitos", () => {
  for (const value of [null,true,{},"150",NaN,Infinity,-Infinity]) {
    assert.throws(()=>validarPayloadDobot("DOBOT_PTP",{x:value,y:0,z:100,r:0}));
  }
});
test("fila recusa prazo ausente, inválido, vencido, longo e cadastro revogado", () => {
  const c=command(); assert.equal(commandAllowedNow(machine,c),true);
  assert.equal(commandAllowedNow(machine,{...c,comando:"DOBOT_HOME"}),false);
  for(const payload of [{},{expiresAt:"bad"},{expiresAt:new Date(1).toISOString()},{expiresAt:new Date(Date.now()+120000).toISOString()}]) {
    assert.equal(commandAllowedNow(machine,{...c,payload}),false);
  }
  for(const change of [{ativo:false},{paradaSeguranca:true},{modoSimulacao:true},{integracaoMeta:{}}]) assert.equal(commandAllowedNow({...machine,...change},c),false);
});
test("autorizar usa a máquina da credencial e impede ID de outra máquina", async () => {
  deviceAuth(); patch(prisma.comandoMaquina,"findFirst",async q=>{assert.deepEqual(q.where,{id:999,maquinaId:7});return null;});
  assert.equal((await device("/comandos/999/autorizar")).status,404);
});
for (const status of ["PENDENTE","CANCELADO","CONCLUIDO"]) test(`comando ${status} não recebe autorização física`,async()=>{
  deviceAuth();patch(prisma.comandoMaquina,"findFirst",async()=>command({status}));
  assert.equal((await device("/comandos/10/autorizar")).status,409);
});
test("permissão revogada do solicitante bloqueia comando já entregue",async()=>{
  deviceAuth();patch(prisma.comandoMaquina,"findFirst",async()=>command());
  patch(prisma.usuario,"findFirst",async q=>{assert.deepEqual(q.where,{id:2,empresaId:3,ativo:true});return {cargo:"VISITANTE"};});
  assert.equal((await device("/comandos/10/autorizar")).status,403);
});
test("autorização devolve o conteúdo atual autenticado, incluindo alvo",async()=>{
  deviceAuth();patch(prisma.comandoMaquina,"findFirst",async()=>command());patch(prisma.usuario,"findFirst",async()=>({cargo:"TECNICO"}));
  const r=await device("/comandos/10/autorizar");assert.equal(r.status,200);assert.equal((await r.json()).maquinaId,7);
});
test("ACK concorrente não ressuscita cancelamento e não grava log falso",async()=>{
  deviceAuth();patch(prisma.comandoMaquina,"findFirst",async()=>command());
  patch(prisma,"$transaction",async fn=>fn({comandoMaquina:{updateMany:async q=>{assert.equal(q.where.status,"ENTREGUE");assert.equal(q.where.maquinaId,7);return {count:0};}},log:{create:()=>assert.fail()}}));
  assert.equal((await device("/comandos/10/confirmar",{status:"CONCLUIDO"})).status,409);
});
test("chave revogada não pode autorizar movimento",async()=>{
  deviceAuth({...machine,deviceKeyHash:null});
  patch(prisma.comandoMaquina,"findFirst",()=>assert.fail());
  assert.equal((await device("/comandos/10/autorizar")).status,401);
});
test("usuário de outra empresa não acessa comando mesmo forjando empresa no JWT",async()=>{
  patch(prisma.usuario,"findUnique",async()=>({id:2,empresaId:99,ativo:true,cargo:"TECNICO",tokenVersion:0,emailVerificadoEm:new Date(),statusVinculo:"APROVADO",empresa:{status:"ATIVA"}}));
  patch(prisma.maquina,"findFirst",async q=>{assert.equal(q.where.empresaId,99);return null;});
  patch(prisma.comandoMaquina,"create",()=>assert.fail());
  const token=signSessionToken({usuarioId:2,tokenVersion:0,empresaId:3});
  const r=await fetch(base+"/maquinas/7/comandos",{method:"POST",headers:{authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify({comando:"DOBOT_HOME"})});
  assert.equal(r.status,404);
});

test("Edge antigo não recebe comandos até atualizar o protocolo", async()=>{
  deviceAuth();patch(prisma.comandoMaquina,"findFirst",()=>assert.fail());
  const r=await fetch(base+"/device/7/comandos/proximo",{headers:{"x-device-key":key}});
  assert.equal(r.status,426);
});
test("telemetria humana não pode forjar sensores físicos",async()=>{
  patch(prisma.usuario,"findUnique",async()=>({id:2,empresaId:3,ativo:true,cargo:"ADMINISTRADOR",tokenVersion:0,emailVerificadoEm:new Date(),statusVinculo:"APROVADO",empresa:{status:"ATIVA"}}));
  const token=signSessionToken({usuarioId:2,tokenVersion:0});
  const r=await fetch(base+"/maquinas/7/telemetria",{method:"POST",headers:{authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify({dadosExtras:{hmi:{interlocks:{startPermitted:true}}}})});
  assert.equal(r.status,410);
});
test("logout revoga tokens no banco e cancela movimentos pendentes",async()=>{
  const {logout}=await import("../src/modules/auth/auth.controller.js");
  const writes=[];
  patch(prisma.usuario,"update",q=>{writes.push(q);return Promise.resolve({});});
  patch(prisma.comandoMaquina,"updateMany",q=>{writes.push(q);return Promise.resolve({count:1});});
  patch(prisma,"$transaction",async operations=>Promise.all(operations));
  const res=response();await logout({auth:{usuarioId:2}},res,e=>{throw e;});
  assert.equal(writes[0].data.tokenVersion.increment,1);
  assert.equal(writes[1].where.solicitanteId,2);assert.equal(writes[1].data.status,"CANCELADO");
  assert.ok(writes[1].where.comando.notIn.includes("DOBOT_STOP"));
});
test("stream aberto perde acesso após expiração, revogação e mudança de empresa",async()=>{
  const {streamSessionValid}=await import("../src/lib/streamAuthorization.js");
  const auth={usuarioId:2,empresaId:3,cargo:"TECNICO",tokenVersion:0,expiresAt:Date.now()+5000};
  const user={id:2,empresaId:3,cargo:"TECNICO",ativo:true,tokenVersion:0,statusVinculo:"APROVADO",emailVerificadoEm:new Date(),empresa:{status:"ATIVA"}};
  for(const change of [{tokenVersion:1},{empresaId:99},{cargo:"VISITANTE"},{ativo:false},{empresa:{status:"PENDENTE"}}]) {
    patch(prisma.usuario,"findUnique",async()=>({...user,...change}));
    assert.equal(await streamSessionValid(auth),false);
  }
  patch(prisma.usuario,"findUnique",async()=>user);
  assert.equal(await streamSessionValid(auth),true);assert.equal(await streamSessionValid({...auth,expiresAt:1}),false);
});

test("sessão de conta confirmada não exige MFA recorrente, mantendo autorização pelo banco",async()=>{
  const {env}=await import("../src/config/env.js");patch(env,"adminMfaRequired",true);
  const {authRequired}=await import("../src/middlewares/auth.js");
  patch(prisma.usuario,"findUnique",async()=>({id:2,empresaId:3,ativo:true,cargo:"TECNICO",tokenVersion:0,emailVerificadoEm:new Date(),statusVinculo:"APROVADO",empresa:{status:"ATIVA"}}));
  const token=signSessionToken({usuarioId:2,tokenVersion:0,mfaVerified:false});let passed=false;
  const req={headers:{authorization:`Bearer ${token}`},get:()=>""};
  await authRequired(req,response(),error=>{if(error)throw error;passed=true;});
  assert.equal(passed,true);assert.equal(req.auth.empresaId,3);assert.equal(req.auth.cargo,"TECNICO");
});
