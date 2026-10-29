# Atualização SteelControl — 29/10/2026

## O que mudou

- Home substituído pelo HTML enviado, com sua cena WebGL, seções, capturas e navegação. Entrar aponta para `/app/login`. Lenis e fontes agora são locais, compatíveis com a política de conteúdo do Railway. Sem WebGL, a página preserva a navegação nativa.
- Código do equipamento reutilizável após exclusão. A unicidade continua garantida pelo PostgreSQL para máquinas ativas da mesma empresa. O ID interno da máquina nova será diferente; logs, manutenção e histórico continuam ligados à máquina antiga.
- Exclusão encerra a conexão, revoga a chave e cancela comandos pendentes na mesma transação. A migration também corrige conexões que ficaram ativas após exclusões antigas, liberando a COM para outro cadastro.
- A página de máquinas voltou a carregar os scripts e estilos do Edge integrado. Configurar Edge agora abre o fluxo de conexão, em vez de apenas renovar a Device Key.
- `npm start` do Desktop usa `.venv-edge` automaticamente, se existente, respeitando `STEELCONTROL_PYTHON` quando definido.
- O atalho e o protocolo do Edge usam o Desktop integrado ao Railway. O pacote baixável foi atualizado com os arquivos necessários e o instalador instala também o Desktop.

## Aplicar no seu repositório

1. Extraia este ZIP fora do seu repositório e copie seu conteúdo para a pasta do projeto no PC, substituindo os arquivos correspondentes. Preserve sua pasta `.git` e suas configurações locais.
2. Confira `git diff --stat` e `git diff`. Não use `prisma migrate reset` nem recrie o banco existente.
3. Envie as alterações na branch que o Railway acompanha. Exemplo, na raiz do projeto:

```powershell
git add frontend backend desktop steelcontrol-edge tools CODE_FREEZE.sha256 ATUALIZACAO_29_OUTUBRO.md
git commit -m "Atualiza home e corrige exclusao de maquinas e conexao Edge"
git push
```

O `npm start` da raiz já executa `prisma migrate deploy` antes do servidor.
Aguarde o deploy e confirme a aplicação de `20261029190000_reutilizar_codigo_maquina` nos logs.
A migration altera a regra de unicidade sem apagar máquinas nem seu histórico.
O novo código no ZIP ainda não está publicado no Git/Railway.

## Ligar o Desktop e conectar o Dobot

Na raiz do projeto, se o Edge ainda não tiver suas dependências instaladas:

```powershell
powershell -ExecutionPolicy Bypass -File .\INSTALAR_STEELCONTROL_EDGE.ps1
```

Para iniciar nas próximas vezes:

```powershell
npm --prefix desktop start
```

Ou abra `INICIAR_STEELCONTROL_EDGE.bat` na raiz. Feche a interface antiga
`python edge_app.py` antes de iniciar o Desktop. As duas versões compartilham
uma proteção contra execução simultânea; o Edge antigo usa descoberta LAN e
não anuncia as portas USB ao Railway.

1. Ligue a alimentação do Dobot e o cabo USB ao mesmo PC. Feche DobotStudio e qualquer outro aplicativo que esteja usando sua COM.
2. No Edge integrado, entre na **mesma empresa** usada no site.
3. Clique em **Vincular este Edge à empresa**, depois em **Vincular este computador** no diálogo.
4. Cadastre/edite o braço como **Equipamento real**, controlador **Dobot Magician** e protocolo **USB/Serial**. Cadastro em simulação não aceita hardware real.
5. Escolha o equipamento no Edge, clique em **Configurar conexão**, selecione o computador online, **Dobot Magician (USB)**, a porta COM do braço e baud **115200**.
6. Clique em **Salvar e conectar**. A primeira telemetria confirma a conexão no site/mobile. Isso não libera comandos físicos automaticamente.

A conexão local pode funcionar durante `npm start`; não é obrigatório gerar um instalador .exe.
Se a COM não aparecer nem no Gerenciador de Dispositivos do Windows, confira cabo, alimentação e o driver USB do modelo. Se aparecer, mas houver erro, envie a COM, a mensagem e a tela do Edge para continuarmos o diagnóstico. O handshake físico depende do modelo/firmware e não pôde ser validado sem o seu braço.

## Validações

- Testes de API, regras e migrations com PostgreSQL compilado para WASM (PGlite), sem acessar o banco do Railway.
- Testes de Desktop/IPC e seleção do Python local.
- Testes Python do Edge, incluindo processo real com API HTTP local e driver MOCK, sincronização, revogação e testes do protocolo Dobot com serial simulada.
- Inspeção do home no navegador: links, navegação e troca das capturas. A animação WebGL permanece no arquivo; o navegador de teste não disponibilizou WebGL e validou o fallback.
- Dobot físico, Python/DPAPI do Windows e instalador Windows precisam de validação no PC. Não houve acesso ao USB nem alteração no Railway.

Para reconstruir o pacote de download após futuras alterações:

```powershell
python tools/package-edge.py
node tools/update-code-freeze.mjs
```
