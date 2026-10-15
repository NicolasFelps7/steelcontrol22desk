import test, { after } from "node:test";
import assert from "node:assert/strict";

const apiKeyTeste = "xkeysib-chave-somente-para-teste-automatizado";

Object.assign(process.env, {
  NODE_ENV: "development",
  DATABASE_URL: "postgresql://user:pass@127.0.0.1:5432/steelcontrol",
  JWT_SECRET: "a".repeat(64),
  BREVO_API_KEY: apiKeyTeste,
  BREVO_FROM_EMAIL: "remetente@example.com",
  BREVO_FROM_NAME: "SteelControl Teste",
  BREVO_TIMEOUT_MS: "5000",
  EMAIL_USER: "",
  EMAIL_APP_PASSWORD: "",
  GMAIL_USER: "",
  GMAIL_APP_PASSWORD: "",
  EMAIL_PASS: "",
  MAIL_USER: "",
  MAIL_PASS: ""
});

const fetchOriginal = globalThis.fetch;
const { enviarEmailTeste, verificarConfiguracaoEmail } = await import(
  "../src/lib/mailer.js"
);

after(() => {
  globalThis.fetch = fetchOriginal;
});

test("diagnóstico reconhece o Brevo sem abrir conexão SMTP", async () => {
  const status = await verificarConfiguracaoEmail();
  assert.deepEqual(status, {
    ok: true,
    email: "remetente@example.com",
    provider: "brevo"
  });
});

test("envia e-mail pelo endpoint HTTPS do Brevo", async () => {
  let requisicao;
  globalThis.fetch = async (url, options) => {
    requisicao = { url, options };
    return new Response(JSON.stringify({ messageId: "teste-123" }), {
      status: 201,
      headers: { "content-type": "application/json" }
    });
  };

  const resultado = await enviarEmailTeste();
  const payload = JSON.parse(requisicao.options.body);

  assert.equal(requisicao.url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(requisicao.options.method, "POST");
  assert.equal(requisicao.options.headers["api-key"], apiKeyTeste);
  assert.deepEqual(payload.sender, {
    name: "SteelControl Teste",
    email: "remetente@example.com"
  });
  assert.deepEqual(payload.to, [{ email: "remetente@example.com" }]);
  assert.match(payload.subject, /teste de e-mail/i);
  assert.match(payload.htmlContent, /E-mail configurado/);
  assert.equal(resultado.messageId, "teste-123");
  assert.equal(resultado.provider, "brevo");
});

test("não expõe a chave quando o Brevo recusa a autenticação", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });

  await assert.rejects(
    () => enviarEmailTeste(),
    erro => {
      assert.equal(erro.statusCode, 503);
      assert.equal(erro.emailErrorCode, "BREVO_HTTP_401");
      assert.doesNotMatch(erro.message, new RegExp(apiKeyTeste));
      return true;
    }
  );
});
