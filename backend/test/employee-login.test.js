import test, { afterEach, after } from "node:test";
import assert from "node:assert/strict";
import { nomeParaSufixo, garantirSufixoEmpresa, montarLoginInterno, emailContato } from "../src/lib/employeeLogin.js";
Object.assign(process.env, { NODE_ENV: "development", SECURITY_PROFILE: "development", JWT_SECRET: "t".repeat(64), DATABASE_URL: "postgresql://test:test@127.0.0.1:5432/test", BREVO_API_KEY: "test-provider-no-network", BREVO_FROM_EMAIL: "sender@example.com", REDIS_URL: "" });
const { prisma } = await import("../src/lib/prisma.js");
const { criarUsuario } = await import("../src/modules/company/company.controller.js");
const { login } = await import("../src/modules/auth/auth.controller.js");
const bcrypt = (await import("bcryptjs")).default;
const restores = []; const originalFetch = globalThis.fetch;
function patch(obj, name, fn) { const original = obj[name]; obj[name] = fn; restores.push(() => { obj[name] = original; }); }
afterEach(() => { while (restores.length) restores.pop()(); globalThis.fetch = originalFetch; });
after(() => prisma.$disconnect());
async function call(fn, req) {
  const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(data) { this.body = data; return this; }, setHeader() {} };
  await fn({ headers: {}, body: {}, get() { return ""; }, ...req }, res, e => { if(e) throw e; }); return res;
}
test("nome da empresa gera sufixo legível sem espaços, pontuação ou acentos", () => {
  assert.equal(nomeParaSufixo("Metalúrgica Alfa Ltda."), "metalurgicaalfaltda");
  assert.equal(nomeParaSufixo("✨"), "empresa");
  assert.equal(nomeParaSufixo("a".repeat(100)).length, 40);
});
test("servidor completa apenas a parte local e normaliza maiúsculas", () => {
  assert.equal(montarLoginInterno(" Joao.Silva ", "metalurgicaalfa.com"), "joao.silva@metalurgicaalfa.com");
});
for(const invalid of ["", "joao@outra.com", "joão", "joao silva", ".joao", "joao.", "joao..silva", "a".repeat(65)]) {
  test(`login rejeita entrada inválida ${JSON.stringify(invalid)}`, () => assert.throws(() => montarLoginInterno(invalid, "alfa.com"), e => e.statusCode === 400));
}
test("e-mail real de contato permanece independente e admite Gmail", () => {
  assert.equal(emailContato(" PESSOA@gmail.com "), "pessoa@gmail.com");
  assert.throws(() => emailContato("joao"), /e-mail real/);
});
test("empresas homônimas recebem sufixos únicos, sem mudar os já atribuídos", async () => {
  let saved;
  const tx = { $queryRawUnsafe: async () => [], empresa: {
    findUnique: async q => q.where.id ? { id: 2 } : q.where.loginDomain === "alfa.com" ? { id: 1 } : null,
    update: async q => { saved = q; }
  } };
  assert.equal(await garantirSufixoEmpresa(tx, { id: 2, nome: "Alfa" }), "alfa-2.com");
  assert.equal(saved.where.id, 2);
  assert.equal(await garantirSufixoEmpresa({}, { id: 2, nome: "Novo Nome", loginDomain: "alfa-2.com" }), "alfa-2.com");
});
test("somente administrador pode cadastrar funcionário", async () => {
  const res = await call(criarUsuario, { auth: { cargo: "OPERADOR", empresaId: 3 }, body: {} });
  assert.equal(res.statusCode, 403);
});
test("cadastro usa empresa da sessão e ignora sufixo/login completo adulterados", async () => {
  let query, saved;
  patch(prisma.empresa, "findUnique", async q => { query=q; return { loginDomain: "alfa.com" }; });
  patch(prisma.usuario, "findFirst", async () => null);
  patch(prisma.usuario, "findUnique", async () => null);
  patch(prisma.usuario, "create", async ({data}) => { saved=data; return { id:9,...data }; });
  patch(prisma.auditLog, "create", async () => ({}));
  const res = await call(criarUsuario, { auth: { cargo:"ADMINISTRADOR", empresaId:3, usuarioId:7 }, body: {
    nome:"João Silva", loginParte:"joao.silva", email:"joao@gmail.com", senha:"senha-123-forte", cargo:"ADMINISTRADOR",
    empresaId:999, loginDomain:"outra.com", loginInterno:"joao@outra.com"
  } });
  assert.equal(res.statusCode,201); assert.equal(query.where.id,3); assert.equal(saved.empresaId,3);
  assert.equal(saved.loginInterno,"joao.silva@alfa.com"); assert.equal(saved.email,"joao@gmail.com");
  assert.equal(saved.cargo,"VISITANTE"); assert.equal(res.body.usuario.loginInterno,"joao.silva@alfa.com");
});
test("API não permite digitar @ de outra empresa na parte do funcionário", async () => {
  patch(prisma.empresa,"findUnique",async()=>({loginDomain:"alfa.com"}));
  await assert.rejects(() => call(criarUsuario,{auth:{cargo:"ADMINISTRADOR",empresaId:3},body:{nome:"Pessoa",loginParte:"pessoa@outra.com",email:"p@gmail.com",senha:"senha-forte-123",cargo:"VISITANTE"}}),e=>e.statusCode===400);
});
test("API recusa login que coincide com outra conta ou seu e-mail", async () => {
  patch(prisma.empresa,"findUnique",async()=>({loginDomain:"alfa.com"}));
  patch(prisma.usuario,"findFirst",async()=>({id:55,email:"outra@gmail.com",empresaId:3}));
  const res=await call(criarUsuario,{auth:{cargo:"ADMINISTRADOR",empresaId:3},body:{nome:"Pessoa",loginParte:"pessoa",email:"p@gmail.com",senha:"senha-forte-123",cargo:"VISITANTE"}});
  assert.equal(res.statusCode,409);
});
test("login interno autentica, mas código é enviado ao e-mail real salvo", async () => {
  const senhaHash=await bcrypt.hash("senha-forte-123",4); let destination;
  patch(prisma.usuario,"findUnique",async q=>q.where.email?null:{id:9,empresaId:3,nome:"João",email:"joao@gmail.com",loginInterno:"joao@alfa.com",senhaHash,ativo:true,statusVinculo:"APROVADO",tokenVersion:0,empresa:{status:"ATIVA"}});
  globalThis.fetch=async(url,options)=>{assert.match(String(url),/api.brevo.com/);destination=JSON.parse(options.body).to[0].email;return Response.json({messageId:"test"},{status:201});};
  const res=await call(login,{body:{email:"joao@alfa.com",senha:"senha-forte-123"}});
  assert.equal(res.statusCode,202);assert.equal(destination,"joao@gmail.com");assert.equal(res.body.token,undefined);
});
