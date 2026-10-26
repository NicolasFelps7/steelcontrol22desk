> Fluxo atual sem instalador: consulte `CONEXOES_INTEGRADAS.md`.
> Este documento descreve a ponte Windows opcional, não necessária para USB / serial JSON pelo navegador.

# Atualização

A versão 1.1 usa a página de máquinas para configurar as conexões. Siga
[CONEXOES_INTEGRADAS.md](CONEXOES_INTEGRADAS.md). O procedimento da versão 1.0
abaixo descreve a janela antiga, que não é mais aberta na versão integrada.

# SteelControl Desktop com Edge integrado

Esta atualização cria o aplicativo Windows que abre o SteelControl e mantém as
conexões das máquinas em segundo plano. O mobile continua usando a mesma API e
a mesma empresa: não precisa de alteração nem de novo APK para esta integração.
Não há alteração ou limpeza do banco de dados. As duas alterações de frontend
apenas atualizam a orientação ao copiar a chave; publique-as no Railway pelo
fluxo normal do repositório para mostrar o texto atualizado no site.

## Gerar o instalador pelo GitHub (sem instalar ferramentas no seu PC)

1. Extraia os arquivos deste pacote na raiz do repositório desktop, mantendo as
   pastas. Inclua também `.github/workflows/desktop-windows.yml`.
2. Faça commit e push desses arquivos para seu repositório desktop.
3. No GitHub, abra **Actions → Gerar instalador SteelControl Desktop**.
4. Clique em **Run workflow → Run workflow**.
5. Quando terminar com sucesso, abra a execução e baixe o artifact
   **SteelControl-Instalador-Windows**.
6. Extraia o artifact e abra **SteelControl-Instalador-1.0.0.exe**.

O workflow é manual: não altera o Railway nem publica uma release. Se o GitHub
pedir para habilitar Actions no repositório, habilite antes de executar.
O instalador ainda precisa ser gerado em Windows; este pacote contém o código,
o workflow e o script de geração, não um `.exe` já compilado.

## Outra opção: gerar no próprio Windows

Na máquina de desenvolvimento, instale **Node.js 22 LTS** e **Python 3.12**.
Dê dois cliques em **GERAR_INSTALADOR_DESKTOP.bat**. O script cria um ambiente
isolado, empacota o Python e os drivers com PyInstaller, valida o executável do
Edge e gera o instalador em `desktop/release/`.

Somente quem gera o instalador precisa de Node/Python. Quem instala o programa
precisa apenas do instalador, de acesso ao site e dos drivers USB do fabricante
quando o equipamento exigir. Feche a versão antiga do Edge antes de usar a nova.

## Como usar

1. Instale e abra **SteelControl** pelo atalho.
2. Entre na sua conta. A janela abre a API/site do Railway já usado no tablet:
   `https://web-production-6682df.up.railway.app/app/login`.
3. No site, cadastre a máquina e gere sua Device Key. Use **Copiar para Edge**.
4. No menu superior do aplicativo, abra **Máquinas → Conectar máquina /
   Gerenciar conexões** (atalho Ctrl+Shift+M).
5. Expanda **Colar pacote de conexão**, cole e clique em **Preencher com o pacote**.
   Também é possível preencher o ID e a chave manualmente.
6. Escolha o driver ou deixe **Automático pelo cadastro**. Configure o IP/porta
   ou a porta USB/serial e baud rate. O botão **Detectar portas USB / serial**
   lista as portas disponíveis. Protocolos que exigem mapeamento específico
   aceitam **Parâmetros avançados (JSON)** com as mesmas opções dos drivers atuais.
7. Clique em **Salvar e conectar**. A chave é validada na API antes de salvar.
   Aguarde o estado **Conectada**, emitido somente depois da conexão do driver.
8. No mobile, entre na mesma empresa e abra a máquina cadastrada. A telemetria
   passa pelo backend compartilhado; o tablet não precisa se conectar diretamente
   à porta USB do computador.

O simulador exige escolher explicitamente **Simulador / MOCK**; ele não demonstra
controle de um equipamento físico. O driver precisa corresponder ao protocolo
real da máquina, e o cadastro do servidor deve ser compatível.

## Inicialização e encerramento

- **Iniciar com o Windows** vem habilitado no aplicativo instalado e pode ser
  desligado na janela de conexões. Inicia ao entrar no Windows com o mesmo
  usuário que configurou as máquinas; não é um serviço de sistema antes do login.
- As conexões salvas e habilitadas são restauradas. Não é preciso abrir terminal.
- Fechar a janela mantém o processo no ícone próximo ao relógio. Clique duas
  vezes no ícone para abrir o sistema ou use o menu para gerenciar conexões.
- **Desconectar** salva a conexão como desabilitada: ela não volta no próximo login.
- **Remover** apaga somente o perfil local e sua chave protegida. Não remove a
  máquina, seus dados ou seus usuários do servidor.
- **Sair e desconectar máquinas** encerra os drivers. As conexões habilitadas
  continuam configuradas para a próxima abertura do programa.
- O computador precisa permanecer ligado, com Windows em execução, sem suspensão,
  com acesso ao servidor e à máquina. Sem internet não há controle pelo mobile.
  O Edge tenta restabelecer as conexões quando elas voltam.

## Segurança e limites

A página remota não recebe acesso ao Node, ao sistema operacional ou às chaves
locais. Somente a janela local de conexões recebe uma API restrita por IPC, com
validação da origem e do frame principal. O Edge integrado usa stdin/stdout;
não abre servidor de controle nem provisionamento HTTP na rede local.

As chaves são protegidas com DPAPI no Windows, vinculadas ao usuário e salvas em
`%APPDATA%/SteelControl/Edge/edge-profiles.json`. O diretório efetivo acompanha o
`userData` do Electron. Nada vai para Git ou para logs da interface. Perfis da
versão antiga em ProgramData permanecem intactos; importe novamente o pacote
para migrar a conexão ao perfil do Desktop.

Comandos físicos vêm desabilitados em novas conexões. A opção local é explícita;
a validação de chave, cargo/permissões e controle remoto do backend continua
valendo. O login do usuário não é substituído pelo Edge. Iniciar uma conexão não
envia automaticamente um comando de movimento, mas habilita o recebimento de
comandos autorizados quando a opção local já tiver sido liberada.

**Desconectar ou fechar o aplicativo não substitui a parada de emergência física.**
A reconexão e o monitoramento não garantem a segurança funcional da máquina.

O instalador gerado não tem assinatura comercial de código. A assinatura e a
homologação no Windows e nos equipamentos reais ficam como etapas de distribuição;
não há binário Windows validado neste ambiente Linux. Não desative as proteções
do Windows para executar um arquivo cuja origem você não tenha conferido.

## Validação

- Testes do supervisor e da fronteira IPC do Desktop.
- Testes de persistência: reinício, desconexão, remoção, manutenção da chave,
  rejeição de chave inválida e rollback em falha de gravação.
- Teste de integração real do processo Python com API HTTP local e driver MOCK:
  valida credencial, conecta, publica telemetria, desconecta e encerra com EOF.
- Testes existentes dos limites e da recuperação de alarmes Dobot.
- O build Windows executa self-test do Edge empacotado, incluindo DPAPI, antes
  de gerar o instalador. A execução do workflow ainda deve confirmar esse build.

Para desenvolvimento, use um ambiente Python com `steelcontrol-edge/requirements.txt`
e `npm ci` em `desktop/`. Depois `npm start` nessa pasta. O modo de desenvolvimento
não registra inicialização automática no Windows. `STEELCONTROL_PYTHON` permite
selecionar o executável Python do ambiente de desenvolvimento.
