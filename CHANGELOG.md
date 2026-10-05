# 2026-10-05 — Landing 3D industrial V3
- Seção “Sobre o projeto” transformada em uma experiência cinematográfica e tecnológica.
- Núcleo industrial 3D criado em Canvas, com partículas em profundidade e interação com o ponteiro.
- HUD apresenta máquinas, processos, segurança e os módulos centrais do SteelControl.
- Renderização é local e offline, sem bibliotecas ou serviços externos.
- Quantidade de partículas reduzida no mobile e animação pausada fora da área visível.
- Preferência de acessibilidade para redução de movimento respeitada.
- Login, rotas, dashboards, telemetria e comandos industriais não foram alterados.

# 2026-10-02 — Dashboard por perfil de máquina V2
- O cadastro manual agora recomenda módulos conforme o tipo de equipamento.
- Administradores podem ativar/desativar OEE, produção, segurança, manutenção e energia antes de salvar.
- A seleção fica em `integracaoMeta.dashboard` e é compartilhada por Desktop e Mobile.
- O dashboard mostra somente módulos escolhidos que possuam telemetria real.
- Máquinas sem painel configurado não recebem um bloco genérico automaticamente.
- IHMs dedicadas, comandos, filas e políticas de segurança foram preservados.

# 2026-09-28 — Dashboard industrial dinâmico V1
- Camada comum de indicadores para qualquer tipo de máquina industrial.
- OEE calculado quando disponibilidade, desempenho e qualidade são publicados.
- Seções personalizadas declaradas no cadastro da máquina, sem alterar o frontend.
- Contrato único para Desktop e Mobile, mantendo as IHMs especializadas existentes.
- Valores ausentes aparecem como “Não informado”; nenhum dado industrial é simulado.
- O bloco avançado inicia recolhido, oculta categorias vazias e evita repetir indicadores da visão geral.
- Abertura do painel e das categorias agora é preservada durante as atualizações periódicas de telemetria.

# 2026-09-28 — Biometric Command Center V12
- Login e cadastro facial receberam o mesmo HUD industrial do aplicativo Mobile.
- Indicadores visuais para câmera, rastreamento, prova de vida e processamento.
- Superfícies, profundidade, grade técnica e moldura biométrica modernizadas.
- Fluxo facial, liveness, backend, permissões e IDs existentes preservados.

# 2026-09-09 — Organização final de arquivos

## 2026-09-14 — IHM dedicada para impressora 3D
- Impressoras 3D agora usam uma IHM exclusiva em vez dos cartões industriais genéricos.
- Painel adaptativo para FDM/FFF, SLA/MSLA/DLP, SLS e controladores proprietários.
- Trabalho, temperaturas, processo, material, eixos, conexão, segurança e tendência térmica local.
- Edge normaliza sinais adicionais no contrato `steelcontrol-printer3d-hmi-v2`.

- Removido o workflow legado `.github/workflows/flutter-quality.yml`; o repositório Desktop não executa mais CI de Flutter/Mobile.
- Removidos resíduos Flutter/Mobile que estavam por engano no projeto Desktop.
- Removidas notas antigas de patches e assets sem referência.
- CSS, imagens e documentação receberam nomes semânticos e profissionais.
- Documentação técnica foi centralizada em `docs/`.
- Referências internas e validações foram atualizadas para os novos caminhos.
- Nenhuma regra funcional, API, banco, Face API, IHM, telemetria ou segurança foi alterada.

# 2026-09-07 — Command Center V3: cores e tipografia

- Padronização da paleta de todos os dashboards (padrão, controladores, IHM e Dobot).
- Remoção de grandes blocos bege/âmbar e gradientes inconsistentes nos painéis técnicos.
- Dobot passou a usar o mesmo hero grafite do restante do Command Center.
- Cards de coordenadas, telemetria e controladores usam superfícies neutras e âmbar apenas como acento.
- Cadastro de máquinas recebeu tipografia corporativa natural, pesos menores e menos caixa alta/letter-spacing.
- Preview “Painel que será criado” e preset de robô foram neutralizados para não parecer template gerado.
- Tema escuro recebeu as mesmas regras de superfície/contraste.
- Nenhuma rota, API, regra de segurança, telemetria, IHM ou backend foi alterado.


## 2026-09-07 — Correção de contraste da logo no tema escuro

- Corrigido o desaparecimento visual da logo preta no sidebar em tema escuro.
- A marca lateral agora preserva as cores originais sobre uma placa neutra clara.
- Removida a inversão automática aplicada à logo do sidebar; logos internas continuam com contraste automático.
- Alteração exclusivamente visual/de tema, sem mudança em APIs, IHM, telemetria ou regras de segurança.


## 2026-09-07 — Plataforma realtime + hardening operacional

- Sessões JWT agora possuem `tokenVersion` para revogação server-side.
- `/auth/session-events` conectado ao backend e logout remoto instantâneo preparado para Desktop/Mobile.
- Desativação e troca de senha revogam sessões existentes.
- ACK de equipamento rejeita status desconhecido em vez de assumir sucesso.
- Liberação de parada em equipamento real exige conexão estável e telemetria recente.
- Registro de manutenção passou a ser transacional e não mascara parada de segurança ativa.

# Changelog

## 3.6.5 — 2026-10-05

- Corrigido conflito de CSS que empurrava o capacete até o círculo de confirmação.
- Corpo do mascote e capacete agora compartilham o mesmo posicionamento absoluto.
- Ponto final da queda recalibrado para encaixar o capacete sobre a cabeça.

## 3.6.4 — 2026-10-05

- Braço robótico removido da abertura pública.
- Home agora apresenta uma demonstração realista da plataforma SteelControl.
- Logo inicial do login restaurada para o símbolo original, limpo e proporcional.
- Queda do capacete movida exclusivamente para a confirmação de acesso.
- Animação pós-login reforçada com Web Animations API, independente do cache CSS.
- Textos da demonstração da plataforma integrados aos seis idiomas.

## 3.6.3 — 2026-10-05

- Logo do login reduzida ao mascote preto, sem o nome SteelControl.
- Capacete industrial separado do mascote e animado até encaixar na cabeça.
- Abertura do Home transformada em experiência cinematográfica guiada pelo scroll.
- Quatro capítulos conectam máquina, Edge, telemetria e controle ao braço CAD interativo.
- Tradução do Home sincronizada com o seletor global de PT, EN, ES, FR, DE e IT.
- Idioma selecionado deixou de ser redefinido para português ao abrir o login.

## 3.6.2 — 2026-10-05

- Home redesenhado com linguagem CAD e interface de software industrial.
- Braço robótico recriado em SVG técnico interativo, com juntas e ferramenta articuladas.
- Elementos abstratos substituídos por terminal de segurança e arquitetura em camadas.
- Animação do login reiniciada somente após o overlay ficar visível.
- Cache atualizado para carregar imediatamente o novo JavaScript e CSS do login.

## 3.6.1 — 2026-10-05

- Transição de entrada ampliada para 4,5 segundos, sem cortar a animação.
- Sequência sincronizada: capacete encaixa na marca, confirmação aparece e o painel abre.
- Barra de carregamento agora acompanha todo o tempo real da transição.

## 3.6.0 — 2026-10-05

- Home com célula robótica 3D interativa por mouse e toque no lugar do núcleo abstrato.
- Marca animada no acesso: capacete industrial desce e encaixa na assinatura SteelControl.
- Núcleo `SC` substituído por identidade validada, com função visual clara.
- Reconhecimento redesenhado como estação profissional de controle de acesso industrial.
- Terminologia pública atualizada para identidade, permissão e acesso operacional.

## 2026-09-03 — IHM industrial supervisionada

- nova IHM visual para controladores genéricos, com processo, sensores, intertravamentos, métricas e alarmes;
- comandos START, STOP operacional, RESET, ACK e seleção AUTO/MANUAL;
- modo simulação funcional sem hardware e integração real pela fila autenticada de comandos;
- controle remoto real desativado por padrão e START condicionado a telemetria recente e intertravamentos positivos;
- TTL para comandos críticos, cancelamento de comandos conflitantes e preservação do ACK/idempotência existentes;
- exemplo ESP32 atualizado com telemetria da IHM e bloqueio seguro de partida remota por padrão;
- traduções e tema claro/escuro;
- testes e validadores ampliados para a IHM.


## 2026-09-03 — Confirmação profissional de manutenção

- removido o alerta nativo do navegador ao excluir uma manutenção;
- novo modal SteelControl com contexto da máquina e do registro;
- botão de exclusão mais claro, responsivo e acessível;
- feedback de sucesso por notificação visual;
- suporte completo aos seis idiomas e aos temas claro/escuro;
- cache atualizado para carregar imediatamente o novo visual.

## 2026-09-01 — Engineering hardening

Mudanças somente na camada de engenharia/entrega:

- quality gate consolidado;
- correção dos validadores para as rotas `/app/*`;
- validação dos painéis adaptativos atualizada para as rotas profissionais;
- scanner de segredos;
- manifesto SHA-256 do código congelado;
- Docker non-root + healthchecks;
- GitHub Actions com PostgreSQL E2E;
- Dependabot;
- documentação de release, segurança e evidência de testes.

**Nenhum arquivo funcional congelado foi alterado.**

## 2026-09-03 — Descoberta automática de equipamentos

- Descoberta LAN via UDP/4210 com registro efêmero no backend.
- Aprovação exclusiva de administrador antes do cadastro.
- Provisionamento automático de Machine ID + Device Key para dispositivos compatíveis.
- `discoveryId` único no PostgreSQL para impedir dupla reivindicação.
- Desktop e Mobile com área “Descoberta automática”.
- Exemplo ESP32 atualizado com anúncio UDP, nonce de pareamento, endpoint de provisionamento e persistência NVS.
- Controle remoto permanece desativado por padrão; segurança física não é substituída.

## 2026-09-03 — descoberta resiliente

- adicionado botão **Procurar novamente** com broadcast por todas as interfaces IPv4 privadas detectadas;
- adicionado fallback seguro por IPv4 em `POST /descoberta/por-ip`;
- adicionado diagnóstico em `GET /descoberta/diagnostico`;
- Desktop mostra possíveis causas de falha, interfaces, UDP e última resposta válida;
- firmware ESP32 2.1 expõe `GET /steelcontrol/discovery` sem revelar Device Key;
- controle remoto continua desativado após descoberta/provisionamento.

## 2026-09-07 — Command Center Industrial UI

- Nova camada visual `industrial-command-center.css` carregada por último em Home, Login, Máquinas, Dashboard e Minha Empresa.
- Dashboard reorganizado visualmente como centro de operação industrial: sidebar grafite, KPIs em faixa técnica, instrumentos compactos, gráficos/painéis planos e estados semânticos.
- Redução de sombras, gradientes, arredondamentos e cores decorativas para remover aparência de template genérico.
- Âmbar reservado para ação/destaque; verde, amarelo e vermelho reservados para estados operacionais.
- Tema escuro e responsividade preservados.
- Nenhuma alteração de backend, banco, autenticação, facial, IHM, telemetria, rotas ou regras de segurança.

## 2026-09-07 — Command Center V2
- Corrigido contraste da logo no sidebar em tema claro e escuro.
- Painel de controlador refinado com linguagem visual grafite/industrial.
- Melhorada legibilidade do título e status do controlador.
- IHM supervisória recebeu superfícies mais técnicas, menos arredondamento e maior contraste.
- Tema escuro da IHM refinado sem alterar comandos, telemetria ou regras de segurança.

## 2026-09-14 — Backup/Restore 1.0 e organização

- backup PostgreSQL com `pg_dump` e manifesto SHA-256;
- `backend/.env` protegido por DPAPI dentro do backup;
- restauração com backup de segurança prévio e confirmação explícita;
- perfis do SteelControl Edge incluídos opcionalmente;
- `backups/` ignorado pelo Git;
- manifesto `CODE_FREEZE.sha256` atualizado após correções validadas de sessão/Edge, corrigindo o Quality Gate do GitHub.
## 3.4.0 - 2026-10-05

- Home completamente redesenhada como experiência 3D em preto, branco e laranja.
- Imagem industrial removida; toda a composição visual agora é criada em HTML, CSS e Canvas.
- Novo núcleo 3D interativo, fluxo operacional, ecossistema em cards, segurança holográfica e seção tecnológica orbital.
- Movimento responsivo ao ponteiro, animações suaves e tratamento dedicado para celular e redução de movimento.
## 3.4.1 - 2026-10-05

- Landing 3D ajustada para refletir diretamente os módulos e a identidade do SteelControl.
- Conteúdo consolidado em português, sem seletor ou troca de idioma na página pública.
- Dobot, Steel Edge, dashboard dinâmico, Face ID, telemetria, auditoria, desktop e mobile passaram a compor a narrativa visual.
## 3.5.0 - 2026-10-05

- Fluxo 3D da Home redimensionado para ocupar o painel com quatro módulos legíveis.
- Seção final compactada para manter proporção adequada em monitores grandes.
- Login e cadastro receberam cenário 3D SteelControl sem imagem externa.
- Marca do acesso reduzida ao mascote de capacete, agora com flutuação, órbita e varredura animadas.
- Confirmação de login e cadastro atualizada para exibir apenas o mascote animado.
- Seletor de idiomas removido da tela de acesso, mantendo a interface em português.
## 3.5.1 - 2026-10-05

- Removido o conflito legado que ainda carregava a fotografia industrial no login.
- Fundo do login e cadastro agora é totalmente 3D, gerado por CSS, com grade, núcleo e órbitas.
- Mascote removido do núcleo atrás do texto e mantido somente como marca animada do acesso.
- Movimento do mascote reforçado com flutuação, inclinação, escala, órbita e varredura.
- Tela de acesso fixada em português para não herdar idioma antigo salvo no navegador.
