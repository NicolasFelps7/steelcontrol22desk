# SteelControl · Supervisão técnica R4

Desktop baseado em c6f3b24; mobile 1.25.0+58. A tela identifica a revisão como 06.11-R4 para distinguir versões antigas.

## Conteúdo da tela

O dashboard passa a usar dados técnicos do equipamento selecionado. Não há cartões de produção, pedidos, desperdício ou metas nesta tela. O módulo de registros anterior permanece no backend por compatibilidade, sem apagar históricos existentes.

| Família | Dados técnicos, quando recebidos do equipamento |
| --- | --- |
| Dobot | J1/J2/J3/J4 em graus; X/Y/Z em mm; R; garra, sucção e fila |
| Robô / solda | TCP, juntas, modo/programa; corrente, tensão, arame e gás para solda |
| Esteira | velocidade, sensores, ocupação, corrente e frequência do inversor |
| Injetora | pressão, temperatura, força de fechamento, estado do molde e receita |
| Fresadora / torno | eixos, spindle, avanço, ferramenta, programa e carga |
| Prensa | força, pressão, curso, posição e proteção |
| Impressora 3D | temperaturas, trabalho, camada, progresso e material |
| Embaladora / envasadora | selagem, filme, dose, vazão, nível e pressão |
| Compressor / forno | pressão, temperatura, vazão, carga; etapa térmica e referência |
| CLP / genérico | varredura, CPU, entradas/saídas, comunicação e sinais do processo |

Os caminhos exatos ficam em frontend/assets/machine-profiles.json e assets/machine-profiles.json no Flutter. Os dois arquivos são idênticos. Um campo sem sensor/mapeamento válido mostra Sem dados; o cadastro de uma categoria não cria sensores. A API exige empresa, sessão e credenciais existentes. Telemetria incompleta nunca vira um zero artificial na nova tela.

Voltar para Máquinas é um link/botão destacado no topo, inclusive no tablet. Manutenção, Alertas, Logs, Auditoria, Conexão e Controles autorizados são acessos diretos. No mobile, a área da máquina mantém essas funções em abas; a aba de produção foi retirada. A troca de equipamento troca modelo, telemetria e histórico juntos.

Auditoria e logs continuam restritos à administração. Auditoria usa filtro por empresa e máquina no banco, incluindo manutenção e operação vinculadas. Ausência de permissão aparece como acesso restrito e não habilita novos cargos. Os controles físicos mantêm as verificações do backend e Edge.

## Modelos 3D

Modelos procedurais distintos para 15 famílias, sem fotografia como cenário. Foram adicionados carenagens, flanges, parafusos, mangueiras, cabos, ventilações, elementos de fixação, transparência de portas e detalhes específicos de cada família. O braço tem etiquetas J1–J4 projetadas sobre as articulações.

A cena é uma representação por família, não um CAD dimensional da máquina da empresa. Não oferece cálculo de colisão ou validação de alcance. Os modelos giram/recebem zoom por mouse ou toque; esses gestos não enviam comandos.

O braço usa juntas medidas do controlador. O modelo considera a referência vertical de J2 e a horizontal de J3, com ferramenta nivelada. Referência de coordenadas: manual Dobot Magician, seção de coordenadas: https://download.dobot.cc/product-manual/dobot-magician/pdf/en/dobot-magician-user-manualV1.2.5.pdf . A ferramenta/CAD exatos ainda exigem conferência no equipamento instalado.

A interpolação de 120 ms suaviza somente amostras recebidas. O alvo de um comando não é tratado como posição confirmada. Leitura atrasada é sinalizada; a WebView e o desktop não animam juntas como atuais sem conexão e amostra recente. No mobile, pacotes mais antigos não substituem juntas novas. A cadência depende de USB, rede e Edge, sem promessa de tempo real determinístico.

O Edge transmite poses intermediárias durante PTP/rotação, até quatro publicações por segundo. A serial continua sendo usada pela mesma thread. Erros seguem o tratamento de parada/bloqueio existente. A latência USB apresentada é medida na troca GetPose, em vez de usar a constante anterior de 5 ms. Não é uma medição da latência completa de rede.

## Atualização

1. Baixe o ATUALIZAR_3D_STEELCONTROL.ps1 desta revisão, substituindo a cópia antiga em Downloads.
2. Execute o script e informe a cópia clonada de steelcontrol22desk. Ele exige main e árvore limpa, faz pull --ff-only, valida/aplica a alteração, confere manifesto e referências, cria commit e faz push. Não faz reset ou force push. Se houver conflito, interrompe sem sobrescrever mudanças.
3. Aguarde o Railway concluir o deploy, abra /app/dashboard e use Ctrl+F5. Confira 06.11-R4 no topo. Esta revisão não requer nova migration.
4. Feche o Edge antigo e abra steelcontrol-edge/INICIAR_STEELCONTROL_EDGE.bat da cópia atualizada. Um executável instalado separadamente não se atualiza com o Railway; o script não recompila EXE. Caso o runtime local ainda não esteja preparado, consulte steelcontrol-edge/INSTALAR_EDGE.ps1.
5. No mobile, extraia o ZIP em uma pasta nova, execute flutter pub get e scripts/verify-mobile.ps1. Instale o novo APK no tablet; Railway não atualiza APK. Android mínimo 24 e WebView com WebGL. O login mobile continua sem fotografia.

## Verificação e entrega à empresa

Foram aprovados 245 testes do backend e 53 testes Python do Edge; testes de geometria/seleção/postura em Three.js; verificação DOM funcional de retorno, ângulos reais, troca de perfil/modelo, manutenção, logs, auditoria e cargos; modelo Dart executado para amostra recente, descarte de atraso e offline. Referências estáticas, hashes e sintaxe/formatação Dart conferidos. Não foram enviados movimentos a hardware nos testes.

Testes de widgets Flutter foram atualizados, mas não executados: este ambiente não tem Flutter/engine completo. Não foi gerado APK, testada aceleração gráfica no navegador/tablet ou validada integração com um Dobot físico. A entrega é uma revisão de software, não uma certificação de segurança industrial. Consulte ENTREGA_EMPRESA.md para os pontos de aceitação ainda abertos.


## Revisão de interface · 06.11-R4

O cabeçalho usa o símbolo oficial SVG do SteelControl, nome da máquina selecionada e nome/cargo da sessão validada pelo backend. A preferência de tema global é preservada; o cockpit usa tema escuro próprio para evitar textos claros em cartões brancos. Voltar para Máquinas permanece destacado no cabeçalho.

Ângulos e posição ficam em faixas imediatamente acima do canvas 3D. Os demais sensores continuam ao lado, sem repetir os mesmos cartões de pose. No tablet, as faixas ficam na própria área do modelo e se reorganizam em duas ou quatro colunas.

Controle manual abre um diálogo central. Manual e Automático ficam no mesmo módulo, com atalho Modo automático no dashboard do Dobot. Abrir ou alternar a apresentação não inicia movimento. O diálogo mantém limites, autorização, ensinamento de pontos e confirmação do Edge já existentes. Ao fechar, o executor local não deve enfileirar novas etapas; o ciclo local ativo solicita parada pelo contrato existente. Um INICIAR que só responde depois de fechar a janela também é cancelado. Esta é parada por software, dependente da comunicação.

Manutenção agora inclui cartões de situação, última intervenção, próxima referência do cadastro e quantidade de registros ativos; busca no histórico; cartões de intervenção com data, responsável e descrição; formulário separado para nova intervenção. O responsável é a identidade autenticada, derivada novamente no backend, e não um nome digitado livremente. Não foram inventados estados de ordem de serviço, agendamentos, peças ou datas que o banco não armazena.

Auditoria aparece no topo da tela de Máquinas e em cada cartão de equipamento. O diálogo permite escolher a máquina e consultar os 300 eventos mais recentes disponíveis. No dashboard, o diálogo técnico consulta os 100 mais recentes. Há busca e filtro por ação. As contagens indicam somente eventos carregados, sem se apresentar como histórico integral. Cargos sem permissão veem acesso restrito; nenhum acesso administrativo foi ampliado.

Verificação R4: 245 testes backend aprovados, mais testes DOM funcionais de logo/usuário, faixas de leitura, modal manual/automático, fechamento, auditoria no cadastro, filtro por máquina, cargo e formulário de manutenção. Um teste do componente de controle real com servidor simulado verifica que fechar durante INICIAR cancela a confirmação tardia sem enfileirar movimento. Os 53 testes Edge da R3 se referem ao mesmo código Edge incluído nesta revisão. Arquivos Dart passaram por verificação de sintaxe/formatação; testes Flutter e APK continuam pendentes de ambiente com Flutter completo, assim como validação gráfica/hardware.
