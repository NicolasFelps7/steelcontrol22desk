# SteelControl — Hospedagem

Arquitetura recomendada: frontend servido pelo Node/Express, PostgreSQL gerenciado e Face API em serviço Python separado.

Para o procedimento completo de hospedagem 24 horas no Railway, consulte
[`deploy/railway/README.md`](../deploy/railway/README.md).

## Produção
- Execute `CONFIGURAR_PRODUCAO_NIVEL9.ps1`; não monte o `.env` manualmente.
- Use HTTPS na borda/reverse proxy.
- Configure `JWT_SECRET`, `DATABASE_URL`, `FACE_API_URL`, `FACE_API_KEY`, e-mail transacional e `CORS_ORIGINS`.
- No Railway, use `BREVO_API_KEY`, `BREVO_FROM_EMAIL` e `BREVO_FROM_NAME`; o envio ocorre pela API HTTPS. SMTP/Gmail continua disponível para instalação local.
- Execute `prisma migrate deploy` antes do Node.
- Face API em container usa `STEELCONTROL_ENV=production` e recusa iniciar sem `FACE_API_KEY` forte.
- Nunca publique `.env`, keystore, Device Key em texto puro ou credenciais/chaves do provedor de e-mail.

## Escala
No perfil `level9`, Redis é obrigatório para rate limit, MFA administrativo e challenges faciais compartilhados. Presença realtime e eventos entre múltiplas instâncias ainda devem usar afinidade de sessão ou um barramento Redis/NATS antes de expansão horizontal ampla.
