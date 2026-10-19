import nodemailer from "nodemailer";

import { env } from "../config/env.js";


// =========================================================
// HELPERS
// =========================================================

function escaparHtml(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =========================================================
// TRANSPORTER SMTP
// =========================================================

function criarTransporter() {
  if (
    !env.emailUser ||
    !env.emailAppPassword
  ) {
    const erro =
      new Error(
        "Envio por SMTP não configurado. Defina EMAIL_USER e EMAIL_APP_PASSWORD no arquivo .env."
      );

    erro.statusCode =
      503;

    throw erro;
  }

  const auth = {
    user: env.emailUser,
    pass: env.emailAppPassword
  };

  const transporte = env.smtpHost
    ? {
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        requireTLS: !env.smtpSecure,
        auth
      }
    : {
        service: "gmail",
        auth
      };

  return nodemailer.createTransport({
    ...transporte,
    disableFileAccess: true,
    disableUrlAccess: true,
    tls: {
      minVersion: "TLSv1.2"
    }
  });
}


// =========================================================
// TEMPLATE VISUAL
// =========================================================

function criarTemplateEmail({
  titulo,
  subtitulo,
  nome,
  codigo,
  mensagemPrincipal,
  mensagemSecundaria
}) {
  const nomeSeguro =
    escaparHtml(
      nome || "usuário"
    );

  const tituloSeguro =
    escaparHtml(
      titulo
    );

  const subtituloSeguro =
    escaparHtml(
      subtitulo
    );

  const mensagemPrincipalSegura =
    escaparHtml(
      mensagemPrincipal
    );

  const mensagemSecundariaSegura =
    escaparHtml(
      mensagemSecundaria
    );

  return `
    <!DOCTYPE html>

    <html lang="pt-BR">

      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          ${tituloSeguro}
        </title>
      </head>


      <body
        style="
          margin:0;
          padding:0;
          background:#eef1f3;
          font-family:Arial,Helvetica,sans-serif;
        "
      >

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          role="presentation"
          style="
            width:100%;
            background:#eef1f3;
            padding:40px 16px;
          "
        >

          <tr>

            <td align="center">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                role="presentation"
                style="
                  width:100%;
                  max-width:600px;
                  background:#ffffff;
                  border-radius:20px;
                  overflow:hidden;
                  border:1px solid #d8dde2;
                  box-shadow:0 16px 38px rgba(20,28,35,0.10);
                "
              >


                <!-- CABEÇALHO INDUSTRIAL -->

                <tr>

                  <td
                    align="left"
                    style="
                      padding:34px 34px 30px;
                      background:#1a2026;
                      border-bottom:3px solid #9d7b45;
                    "
                  >

                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      role="presentation"
                      style="margin:0 0 18px;"
                    >
                      <tr>
                        <td
                          style="
                            width:9px;
                            height:9px;
                            border-radius:50%;
                            background:#9d7b45;
                            font-size:0;
                            line-height:0;
                          "
                        >
                          &nbsp;
                        </td>
                        <td
                          style="
                            padding-left:10px;
                            color:#d7dde2;
                            font-size:11px;
                            font-weight:700;
                            letter-spacing:2.2px;
                            text-transform:uppercase;
                          "
                        >
                          STEELCONTROL &nbsp;•&nbsp; GESTÃO INDUSTRIAL
                        </td>
                      </tr>
                    </table>


                    <h1
                      style="
                        margin:0;
                        color:#ffffff;
                        font-size:28px;
                        line-height:1.25;
                        font-weight:800;
                        letter-spacing:-0.4px;
                      "
                    >
                      ${tituloSeguro}
                    </h1>


                    <p
                      style="
                        margin:11px 0 0;
                        color:#b9c2ca;
                        font-size:14px;
                        line-height:1.6;
                      "
                    >
                      ${subtituloSeguro}
                    </p>

                  </td>

                </tr>


                <!-- CONTEÚDO -->

                <tr>

                  <td
                    style="
                      padding:34px 34px 30px;
                    "
                  >

                    <p
                      style="
                        margin:0 0 14px;
                        color:#20272e;
                        font-size:16px;
                        line-height:1.7;
                      "
                    >
                      Olá,
                      <strong>
                        ${nomeSeguro}
                      </strong>.
                    </p>


                    <p
                      style="
                        margin:0 0 24px;
                        color:#5f6b76;
                        font-size:14px;
                        line-height:1.75;
                      "
                    >
                      ${mensagemPrincipalSegura}
                    </p>


                    <!-- CÓDIGO -->

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      role="presentation"
                      style="margin:26px 0;"
                    >

                      <tr>

                        <td
                          align="center"
                          style="
                            padding:26px 20px;
                            border-radius:16px;
                            border:1px solid #d5dbe0;
                            border-left:4px solid #9d7b45;
                            background:#f5f7f8;
                          "
                        >

                          <div
                            style="
                              color:#66727d;
                              font-size:11px;
                              font-weight:700;
                              letter-spacing:1.6px;
                              text-transform:uppercase;
                              margin-bottom:12px;
                            "
                          >
                            Código de confirmação
                          </div>


                          <div
                            style="
                              color:#20272e;
                              font-size:40px;
                              line-height:1;
                              font-weight:800;
                              letter-spacing:10px;
                            "
                          >
                            ${codigo}
                          </div>

                        </td>

                      </tr>

                    </table>


                    <!-- VALIDADE -->

                    <div
                      style="
                        display:block;
                        margin:0 0 16px;
                        padding:14px 16px;
                        border-radius:12px;
                        background:#f1f3f5;
                        border:1px solid #dde2e6;
                        color:#58636d;
                        font-size:13px;
                        line-height:1.6;
                      "
                    >
                      ⏱ Este código expira em
                      <strong style="color:#2d353c;">
                        10 minutos
                      </strong>.
                    </div>


                    <p
                      style="
                        margin:0;
                        color:#66727d;
                        font-size:13px;
                        line-height:1.7;
                      "
                    >
                      ${mensagemSecundariaSegura}
                    </p>


                    <!-- SEGURANÇA -->

                    <div
                      style="
                        margin-top:24px;
                        padding:16px;
                        border-radius:12px;
                        background:#f8f5ef;
                        border:1px solid #e4d7c0;
                        color:#6d5940;
                        font-size:12px;
                        line-height:1.6;
                      "
                    >
                      🔒 Se você não solicitou esta ação,
                      pode ignorar este e-mail com segurança.
                    </div>

                  </td>

                </tr>


                <!-- RODAPÉ -->

                <tr>

                  <td
                    align="center"
                    style="
                      padding:22px 24px 24px;
                      border-top:1px solid #e0e5e9;
                      background:#f6f7f8;
                    "
                  >

                    <div
                      style="
                        color:#27313a;
                        font-size:13px;
                        font-weight:700;
                        margin-bottom:5px;
                      "
                    >
                      SteelControl
                    </div>


                    <div
                      style="
                        color:#7a858f;
                        font-size:11px;
                        line-height:1.6;
                      "
                    >
                      Gestão industrial inteligente
                    </div>


                    <div
                      style="
                        color:#a1aab2;
                        font-size:10px;
                        margin-top:8px;
                      "
                    >
                      Segurança • Monitoramento • Controle
                    </div>

                  </td>

                </tr>


              </table>


            </td>

          </tr>

        </table>

      </body>

    </html>
  `;
}


// =========================================================
// ENVIO BASE
// =========================================================

async function enviarEmailBrevo({
  destino,
  subject,
  html
}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    env.brevoTimeoutMs
  );
  timeout.unref?.();

  try {
    const resposta = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": env.brevoApiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sender: {
            name: env.brevoFromName,
            email: env.brevoFromEmail
          },
          to: [{ email: destino }],
          subject,
          htmlContent: html
        }),
        signal: controller.signal
      }
    );

    const corpoTexto = await resposta.text();
    let corpo = {};
    try {
      corpo = corpoTexto ? JSON.parse(corpoTexto) : {};
    } catch {
      corpo = {};
    }

    if (!resposta.ok) {
      let mensagem = "Não foi possível enviar o código por e-mail agora.";
      let statusCode = 502;

      if (resposta.status === 401 || resposta.status === 403) {
        mensagem =
          "O Brevo recusou a chave de envio. Confira BREVO_API_KEY e a permissão de e-mail transacional.";
        statusCode = 503;
      } else if (resposta.status === 400) {
        mensagem =
          "O Brevo recusou os dados do remetente. Confira se BREVO_FROM_EMAIL está verificado na sua conta.";
        statusCode = 503;
      } else if (resposta.status === 429) {
        mensagem =
          "O serviço de e-mail atingiu um limite temporário. Aguarde alguns minutos e tente novamente.";
        statusCode = 429;
      } else if (resposta.status >= 500) {
        mensagem =
          "O serviço de e-mail está temporariamente indisponível. Tente novamente em instantes.";
        statusCode = 503;
      }

      const erro = new Error(mensagem);
      erro.statusCode = statusCode;
      erro.emailProvider = "brevo";
      erro.emailErrorCode = `BREVO_HTTP_${resposta.status}`;
      throw erro;
    }

    const messageId = String(corpo?.messageId || "");
    console.log(
      "E-mail SteelControl enviado via Brevo:",
      messageId || "aceito"
    );

    return {
      messageId,
      provider: "brevo",
      accepted: [destino]
    };
  } catch (erroOriginal) {
    if (erroOriginal?.emailProvider === "brevo") {
      console.error("Falha no envio Brevo:", erroOriginal.emailErrorCode);
      throw erroOriginal;
    }

    const expirou =
      controller.signal.aborted ||
      erroOriginal?.name === "AbortError" ||
      erroOriginal?.name === "TimeoutError";
    const erro = new Error(
      expirou
        ? "O serviço de e-mail demorou demais para responder. Tente novamente em instantes."
        : "Não foi possível conectar ao serviço de e-mail. Tente novamente em instantes."
    );
    erro.statusCode = 503;
    erro.emailProvider = "brevo";
    erro.emailErrorCode = expirou ? "BREVO_TIMEOUT" : "BREVO_NETWORK";
    console.error("Falha no envio Brevo:", erro.emailErrorCode);
    throw erro;
  } finally {
    clearTimeout(timeout);
  }
}

async function enviarEmailSmtp({
  destino,
  subject,
  html
}) {
  const transporter =
    criarTransporter();


  try {
    const info =
      await transporter.sendMail({
        from:
          env.emailFrom ||
          `SteelControl <${env.emailUser}>`,

        to:
          destino,

        subject,

        html
      });


    console.log(
      "E-mail SteelControl enviado:",
      info.messageId
    );


    return info;

  } catch (erroOriginal) {
    console.error(
      "Falha no envio SMTP:",
      String(erroOriginal?.code || "SMTP_ERROR")
    );

    const codigo =
      String(erroOriginal?.code || "").toUpperCase();

    const resposta =
      String(erroOriginal?.response || erroOriginal?.message || "")
        .toLowerCase();

    let mensagem =
      "Não foi possível enviar o código por e-mail. Verifique a configuração SMTP.";

    let statusCode = 502;

    if (
      codigo === "EAUTH" ||
      resposta.includes("535") ||
      resposta.includes("badcredentials") ||
      resposta.includes("username and password not accepted")
    ) {
      mensagem =
        "O Gmail recusou a autenticação. Use uma Senha de app do Google em EMAIL_APP_PASSWORD (não use a senha normal da conta) e reinicie o backend.";
      statusCode = 503;
    } else if (
      ["ETIMEDOUT", "ECONNECTION", "ECONNREFUSED", "ENOTFOUND", "ESOCKET"].includes(codigo)
    ) {
      mensagem =
        "Não foi possível conectar ao servidor SMTP. Verifique sua internet, firewall/antivírus e tente novamente.";
      statusCode = 503;
    } else if (
      resposta.includes("daily user sending limit") ||
      resposta.includes("quota") ||
      resposta.includes("rate limit")
    ) {
      mensagem =
        "O servidor de e-mail recusou temporariamente o envio por limite da conta. Aguarde alguns minutos e tente novamente.";
      statusCode = 429;
    }

    const erro = new Error(mensagem);
    erro.statusCode = statusCode;
    erro.emailErrorCode = codigo || null;
    throw erro;
  }
}

async function enviarEmail({ destino, subject, html }) {
  if (env.brevoApiKey && env.brevoFromEmail) {
    return enviarEmailBrevo({ destino, subject, html });
  }

  return enviarEmailSmtp({ destino, subject, html });
}


// =========================================================
// DIAGNÓSTICO DE E-MAIL
// =========================================================

export async function verificarConfiguracaoEmail() {
  if (env.brevoApiKey && env.brevoFromEmail) {
    return {
      ok: true,
      email: env.brevoFromEmail,
      provider: "brevo"
    };
  }

  const transporter = criarTransporter();

  try {
    await transporter.verify();
    return { ok: true, email: env.emailUser, provider: "smtp" };
  } catch (erroOriginal) {
    const codigo = String(erroOriginal?.code || "").toUpperCase();
    const resposta = String(erroOriginal?.response || erroOriginal?.message || "").toLowerCase();

    const erro = new Error(
      codigo === "EAUTH" || resposta.includes("535")
        ? "O Gmail recusou a autenticação. Gere uma Senha de app do Google e coloque-a em EMAIL_APP_PASSWORD."
        : "Não foi possível validar a conexão com o Gmail."
    );
    erro.statusCode = 503;
    throw erro;
  } finally {
    transporter.close?.();
  }
}

export async function enviarEmailTeste() {
  const destino = env.brevoFromEmail || env.emailUser;

  if (!destino) {
    const erro = new Error("Nenhum provedor de e-mail está configurado.");
    erro.statusCode = 503;
    throw erro;
  }

  return enviarEmail({
    destino,
    subject: "SteelControl — teste de e-mail",
    html: criarTemplateEmail({
      titulo: "E-mail configurado",
      subtitulo: "Teste do backend SteelControl",
      nome: "Administrador",
      codigo: "OK",
      mensagemPrincipal: "O backend conseguiu autenticar e enviar e-mail pelo provedor configurado.",
      mensagemSecundaria: "Você já pode voltar ao cadastro da empresa e solicitar o código de confirmação."
    })
  });
}

// =========================================================
// ALTERAÇÃO DE E-MAIL
// =========================================================

export async function enviarCodigoAlteracaoEmail({
  destino,
  codigo,
  nome
}) {
  const html =
    criarTemplateEmail({
      titulo:
        "Confirme seu novo e-mail",

      subtitulo:
        "Proteção adicional para sua conta SteelControl",

      nome,

      codigo,

      mensagemPrincipal:
        "Recebemos uma solicitação para alterar o e-mail de acesso da sua conta SteelControl. Use o código abaixo para confirmar a alteração.",

      mensagemSecundaria:
        "O endereço de acesso só será alterado depois da confirmação deste código."
    });


  return enviarEmail({
    destino,

    subject:
      "SteelControl — confirme seu novo e-mail",

    html
  });
}


// =========================================================
// CADASTRO DA EMPRESA
// =========================================================

export async function enviarCodigoCadastroEmpresa({
  destino,
  codigo,
  nome,
  empresa
}) {
  const empresaSegura =
    String(
      empresa ||
      "sua empresa"
    );


  const html =
    criarTemplateEmail({
      titulo:
        "Confirme seu e-mail",

      subtitulo:
        "Finalize o cadastro da sua empresa no SteelControl",

      nome,

      codigo,

      mensagemPrincipal:
        `Recebemos uma solicitação para cadastrar a empresa ${empresaSegura} no SteelControl. Digite o código abaixo na tela de cadastro.`,

      mensagemSecundaria:
        "E-mail e rosto confirmam identidade. O acesso exige validação independente da empresa ou aprovação de seu administrador."
    });


  return enviarEmail({
    destino,

    subject:
      "SteelControl — código de confirmação",

    html
  });
}
// =========================================================
// SEGUNDO FATOR PARA IDENTIDADE FACIAL AMBIGUA
// =========================================================

export async function enviarCodigoSegundoFatorFacial({
  destino,
  codigo,
  nome
}) {
  const html =
    criarTemplateEmail({
      titulo:
        "Confirme sua identidade",

      subtitulo:
        "Segundo fator para reconhecimento facial",

      nome,

      codigo,

      mensagemPrincipal:
        "O SteelControl detectou duas identidades faciais muito próximas. Para impedir acesso ao perfil errado, confirme sua identidade com o código abaixo.",

      mensagemSecundaria:
        "Se você não tentou entrar por reconhecimento facial, ignore esta mensagem. O código expira em poucos minutos."
    });

  return enviarEmail({
    destino,
    subject:
      "SteelControl — confirmação de identidade facial",
    html
  });
}

export async function enviarCodigoMfaAdministrador({ destino, codigo, nome }) {
  const html = criarTemplateEmail({
    titulo: "Confirme seu acesso",
    subtitulo: "Autenticação multifator SteelControl",
    nome,
    codigo,
    mensagemPrincipal:
      "Uma autenticação por senha ou biometria tentou acessar sua conta. Digite este código para concluir o login.",
    mensagemSecundaria:
      "O código é de uso único. Se a tentativa não foi sua, altere a senha e revise a auditoria da empresa."
  });

  return enviarEmail({
    destino,
    subject: "SteelControl — código de segundo fator",
    html
  });
}
