# Revisão de segurança do SteelControl — 30/10/2026

Esta entrega reforça o código existente; não é certificação, pentest completo ou garantia de segurança de 100%. A análise abrange API Node/Express, sessão web/bearer, fila de comandos e execução Python no Edge. As regras da API também protegem os pedidos do mobile. O app Flutter não foi recompilado nesta revisão.

## Alterações verificáveis

- JWT emitido e validado com HS256 fixo, emissor/destinatário próprios, expiração, identificador aleatório e versão de sessão. Tokens antigos são recusados: fazer login novamente após publicar.
- Cookie de produção somente `__Host-sc_session`, HttpOnly, Secure e SameSite=Strict. Escritas por cookie precisam apresentar origem válida ou Fetch Metadata same-origin; bearer permanece disponível para mobile/API.
- Quando ADMIN_MFA_REQUIRED está habilitado (padrão de produção), administradores, supervisores e técnicos precisam do segundo fator em cada login. A API rejeita sessões privilegiadas sem essa confirmação. Desafio administrativo é consumido atomicamente (GETDEL no Redis) antes da verificação para impedir resgate concorrente; Redis configurado e indisponível bloqueia o fluxo.
- Limite por IP independente do e-mail informado; limite adicional por conta no login. Redis continua sendo usado quando configurado. Movimentos têm uma cota curta; STOP permanece disponível.
- Logout incrementa tokenVersion no PostgreSQL e encerra as sessões do usuário em todos os dispositivos, cancelando movimentos pendentes/entregues. STOP não é cancelado. Streams fecham ao expirar e revalidam usuário/empresa/permissões a cada 15 segundos; falha de consulta fecha o stream.
- Respostas autenticadas/credenciais/telemetria sem cache. Objeto de erro Prisma/HTTP não é mais impresso integralmente. Auditoria oculta campos sensíveis aninhados, bearer e Device Key.
- Sessões de pessoas não podem enviar sensores/intertravamentos como telemetria real: a rota antiga retorna 410. Dados reais entram pela credencial do equipamento em `/device/:id/telemetria`.
- Validação de máquina/empresa ativa e chave revogada é mantida; permissões do solicitante são revalidadas imediatamente antes da escrita física. Novos testes exercitam acesso entre empresas, inclusive empresa forjada no JWT.
- Comandos contêm ID, máquina de destino, data de criação, tentativa e validade curta. Fila e Edge rejeitam validade inválida/ausente/vencida, comandos desconhecidos e alvo de outra máquina. STOP legado também vence em 15 segundos.
- A API fornece `/device/:id/comandos/:comandoId/autorizar`. O Edge confere se a resposta autenticada coincide com o conteúdo entregue antes de executar. Cancelamentos, parada ativa, perda de permissão e configuração desabilitada bloqueiam a autorização.
- ACK usa comparação de estado dentro de transação: comando cancelado/pendente não pode ser marcado concluído por uma corrida. ACK repetido de resultado final continua idempotente.
- Registro SQLite local grava INICIADO e confirma a gravação antes da escrita física. Reinício com resultado desconhecido falha fechado. Resultados repetidos são reconfirmados sem repetir a operação. Mesmo ID com outro conteúdo é recusado. Um contador monotônico preserva proteção após compactar os últimos 1.000 resultados.
- A proteção anterior a reentrega permanece: comando de movimento visto primeiro na tentativa >1 é registrado como FALHOU. É uma política de admissão no máximo uma vez, não uma promessa de execução física exatamente uma vez.
- Dobot rejeita NaN, infinito, booleanos e pose não finita, além dos limites cartesianos/radiais, junta J4, passo e velocidade já existentes. Estes limites são preventivos e não demonstram ausência de colisões.
- Conectar o Dobot para a fila anterior e a descarta, sem limpar alarmes ou retomar a fila automaticamente. Alarmes exigem inspeção e ação explícita de limpeza. Conectar não inicia movimento; a parada de fila altera o estado operacional e deve ser feita com o equipamento sob supervisão.
- Durante a espera de PTP/rotação, um verificador consulta a autorização periodicamente e observa o encerramento local. Falha de comunicação/execução aciona parada de software best effort quando disponível e trava novos comandos até inspeção/reconexão explícita. HOME remoto fica bloqueado no servidor e no Edge, pois o driver atual não comprova sua conclusão física; calibrar localmente conforme o manual. Efetuadores não têm o mesmo acompanhamento contínuo de pose; os retornos do driver não constituem prova certificada de conclusão física.
- HTTPS obrigatório para servidor remoto; HTTP somente em loopback de desenvolvimento. Requisições com Device Key/token de computador recusam redirecionamentos. Verificação TLS padrão de requests permanece habilitada; proxy/credenciais de ambiente não são herdados.
- Comandos de impressora têm payload construído no servidor: não repassam G-code/parâmetros arbitrários do usuário.

## Atualização coordenada

O cabeçalho `X-SteelControl-Command-Protocol: 2` é necessário para receber, autorizar e confirmar comandos. Edge antigo recebe 426 e deve ser atualizado; telemetria/heartbeat continuam disponíveis. Este cabeçalho sinaliza compatibilidade, não é autenticação nem atestado de integridade do executável.

1. Encerrar o Edge e interromper operação física antes da atualização.
2. Aplicar a alteração ao Git e publicar backend/frontend no Railway.
3. Reiniciar o Edge executado a partir do clone atualizado (`steelcontrol-edge/INICIAR_STEELCONTROL_EDGE.bat`). Se usar uma instalação/ZIP em outra pasta, atualizar também essa cópia; mudar apenas o site não atualiza o Python local.
4. Fazer login novamente no site e no mobile. Na ligação do Edge, pode ser necessário inspecionar a máquina e reconectar explicitamente após uma falha durante a troca de versões.
5. Validar primeiro com simulação e depois em bancada com responsável, seguindo o manual do fabricante. Não remover o registro SQLite para contornar bloqueios sem investigar o resultado físico incerto.

Não há alteração no schema Prisma ou migration nova nesta entrega. O SQLite local é criado pelo Edge. Não mudar JWT_SECRET sem planejar a renovação das credenciais de conexão já cifradas com essa chave.

## Configuração de produção que depende do operador

Não foi possível inspecionar ou alterar as variáveis privadas do Railway. Conferir NODE_ENV=production, ENFORCE_HTTPS=true, JWT_SECRET aleatório, CORS_ORIGINS restrito, SENSITIVE_DATA_KEY, FACE_API_KEY, provedor de e-mail e privilégios mínimos do banco. O perfil existente `SECURITY_PROFILE=level9` faz checagens adicionais e exige Redis, MFA administrativo e demais variáveis; o nome é um rótulo interno, não classificação/certificação de segurança. Só ativar depois de atender às exigências de `backend/src/config/env.js`. Fora dele, indisponibilidade do Redis pode usar limitação local, sem garantia de cota global entre réplicas.

DPAPI protege as chaves persistidas no Windows. O fallback legado não Windows usa base64 com permissões de arquivo; isso NÃO é criptografia e precisa ser substituído por cofre do sistema para produção nesses sistemas. Não compartilhar perfis/contas Windows. TLS da API não acrescenta autenticação ou criptografia ao protocolo USB/serial do braço.

O site ainda possui handlers inline/CSP com `unsafe-inline`; esta revisão não elimina toda a superfície de XSS. É necessário migrar esses handlers e avaliar a interface completa antes de alegar uma política CSP estrita. Revisar também cadeia de distribuição/assinatura dos instaladores e atualizações, backups, recuperação, monitoramento e operação com várias réplicas. O barramento em memória não distribui eventos entre réplicas; consultas autenticadas são a fonte de autorização atual.

## Segurança física e limitações

A tela identifica PARAR como pedido de parada por software. Rede, sistema operacional e USB não oferecem garantia de tempo de resposta de segurança. PTP/rotação consultam autorização em intervalos nominais de 0,5 s, com timeout de rede por operação; isso não é prazo máximo certificado. Queda de energia, processo travado, falha do PC ou driver sem safety_stop podem impedir o pedido local de parada. Não desligar automaticamente ventosa/garra em uma falha: isso pode derrubar uma peça.

Instalar/verificar parada de emergência física, proteção da área e intertravamentos independentes adequados ao equipamento, conforme avaliação por responsável habilitado e manual do fabricante. O software não verifica a instalação desses dispositivos e não transforma telemetria em função de segurança certificada. Um invasor com controle do PC/servidor/chave de equipamento ou administrador com permissão de configuração ainda representa risco.

Testes de falha reais somente em bancada supervisionada, com área isolada e condições definidas pelo responsável. Nenhum teste desta entrega movimentou um robô físico. Não usar o resultado dos testes unitários como autorização para operação industrial sem avaliação de riscos.

## Evidências e referências

Os testes automatizados usam HTTP local, Prisma simulado, banco PGlite em testes de schema e adapters falsos/driver MOCK. Cobrem alteração de payload, expiração, reentrega, resultado incerto após reinício, isolamento de máquina/empresa, revogação de chave/permissão, corrida de ACK, indisponibilidade da rede, valores numéricos inválidos, sessão e encerramento de stream. Conferir contagens e execução final em `docs/VALIDACAO_SEGURANCA.md`.

- OWASP REST Security: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- Express em produção: https://expressjs.com/en/advanced/best-practice-security/
- NIST SP 800-82r3: https://csrc.nist.gov/pubs/sp/800/82/r3/final
