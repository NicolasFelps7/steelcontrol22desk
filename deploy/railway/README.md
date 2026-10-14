# SteelControl online 24 horas — Railway

Este deploy deixa o site, a API, o PostgreSQL, o Redis e o reconhecimento
facial na nuvem. O `SteelControl Edge` continua no computador ligado à máquina,
pois é ele que acessa USB, serial, Modbus, OPC UA e os demais protocolos locais.

## Arquitetura final

| Componente | Onde fica | Acesso público |
| --- | --- | --- |
| `steelcontrol-web` | Railway | Sim, HTTPS |
| `steelcontrol-face` | Railway | Não; somente rede privada |
| PostgreSQL | Railway | Não |
| Redis | Railway | Não |
| SteelControl Edge | PC da máquina | Não |

## 1. Preparar e enviar ao GitHub

Abra o PowerShell na raiz do projeto e execute:

```powershell
git rm -r --cached --ignore-unmatch face-api/venv face-api/.venv
git add .gitignore Dockerfile backend/prisma/seed.js deploy docs/DEPLOY.md
git commit -m "Preparar deploy seguro no Railway"
git push origin main
```

O primeiro comando só remove o ambiente virtual do versionamento. Ele não
apaga o ambiente Python do seu computador e não altera a segurança da facial.

## 2. Criar os quatro serviços no Railway

1. Entre em <https://railway.com> e crie um projeto vazio.
2. Adicione **PostgreSQL** e mantenha o nome `Postgres`.
3. Adicione **Redis** e mantenha o nome `Redis`.
4. Adicione um serviço a partir do repositório GitHub e nomeie-o
   `steelcontrol-web`.
5. Adicione outro serviço usando o mesmo repositório e nomeie-o
   `steelcontrol-face`.

Use exatamente esses nomes, porque as referências seguras entre os serviços
dependem deles.

## 3. Configurar a Face API

No serviço `steelcontrol-face`:

1. Em **Settings > Source**, defina **Root Directory** como `/face-api`.
2. Confirme que o Railway encontrou `face-api/Dockerfile`.
3. Em **Variables > Raw Editor**, copie as variáveis de
   `deploy/railway/face-api.env.example` e substitua o marcador da chave.
4. Em **Settings > Healthcheck**, use `/health` e timeout de `600` segundos.
5. Não gere domínio público para este serviço.

O primeiro build demora mais porque o modelo `buffalo_l` é instalado dentro da
imagem. Comece com pelo menos 2 GB de memória para a Face API e ajuste depois de
observar o consumo real.

## 4. Configurar o painel e a API

No serviço `steelcontrol-web`:

1. Deixe **Root Directory** vazio ou `/`.
2. Confirme que o Railway encontrou o `Dockerfile` da raiz.
3. Em **Variables > Raw Editor**, copie
   `deploy/railway/backend.env.example` e substitua todos os marcadores.
4. Em **Settings > Healthcheck**, use `/api/health/live` e timeout de `300`
   segundos.
5. Em **Settings > Networking**, gere um domínio Railway público.

O frontend e a API usam o mesmo domínio. Não é necessário publicar uma segunda
URL para o frontend.

## 5. Gerar segredos sem inventar senhas

Execute cada comando no PowerShell. Use uma saída diferente em cada variável,
exceto `FACE_API_KEY`, que deve ser idêntica nos dois serviços.

```powershell
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# SENSITIVE_DATA_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# FACE_API_KEY
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# MONITORING_TOKEN
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Guarde esses valores somente nas variáveis protegidas do Railway. Não envie
prints nem publique arquivos `.env`.

## 6. Confirmar o deploy

Depois que os dois serviços mostrarem `Active`, abra:

```text
https://SEU-DOMINIO.up.railway.app/api/health/live
https://SEU-DOMINIO.up.railway.app/api/health
https://SEU-DOMINIO.up.railway.app/app/login
```

Os dois healthchecks devem responder com status `ok`. Faça o primeiro login e
troque a senha administrativa. Em seguida, apague do Railway as variáveis
`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`,
`SEED_COMPANY_NAME` e `SEED_COMPANY_CNPJ`. O usuário já estará salvo no banco.

## 7. Apontar o Edge para a nuvem

No PC conectado ao equipamento, altere somente a URL do Edge:

```env
STEELCONTROL_URL=https://SEU-DOMINIO.up.railway.app
```

Mantenha `MACHINE_ID` e `DEVICE_KEY` da máquina. Depois reinicie apenas o Edge.
O site continuará online mesmo quando esse PC estiver desligado; nesse período,
a máquina aparecerá offline e nenhum comando físico será executado.

## 8. Apontar o aplicativo mobile

Para testar:

```powershell
flutter run --dart-define="API_URL=https://SEU-DOMINIO.up.railway.app"
```

Para gerar o APK:

```powershell
flutter build apk --release --dart-define="API_URL=https://SEU-DOMINIO.up.railway.app"
```

## Banco atual ou banco novo

O PostgreSQL criado no Railway começa vazio. O deploy executa as migrations e,
se `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` estiverem definidos, cria um
administrador inicial seguro.

Para levar usuários, máquinas, faciais e histórico do banco local, faça uma
migração com `pg_dump`/`pg_restore` antes de começar a usar o banco da nuvem.
Biometrias já criptografadas exigem a mesma `SENSITIVE_DATA_KEY`; se essa chave
não estiver disponível, recadastre as faciais em vez de enfraquecer a proteção.

## Checklist antes da apresentação

- `steelcontrol-web`, `steelcontrol-face`, PostgreSQL e Redis estão ativos.
- Somente `steelcontrol-web` possui domínio público.
- `/api/health` confirma PostgreSQL e Redis conectados.
- Login e MFA funcionam pelo domínio HTTPS.
- O Edge usa a URL HTTPS e mostra a máquina online.
- Uma captura facial de teste funciona no desktop e no mobile.
- Alertas e comandos foram testados com área do robô livre.
- Existe um plano B de demonstração sem movimento físico.

## Observações importantes

- Hospedagem 24 horas consome recursos e pode ultrapassar o crédito mensal do
  plano. Configure limite de gasto e alertas no Railway.
- O Railway substitui o container a cada deploy. Dados permanentes devem ficar
  no PostgreSQL/Redis, nunca apenas no filesystem do container.
- Não publique a Face API, o banco, o Redis ou a porta do Edge na internet.
