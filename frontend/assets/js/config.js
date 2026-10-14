const STEELCONTROL_BUILD = "20260902_SINGLE_ORIGIN_APP_ROUTES";
console.info("[SteelControl] build", STEELCONTROL_BUILD);

// A sessão web vive em cookie HttpOnly. `credentials: include` também mantém
// o ambiente de desenvolvimento (frontend e API em portas diferentes)
// compatível, sem expor o JWT ao JavaScript.
(() => {
  if (window.__steelFetchWithCredentials) return;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) =>
    nativeFetch(input, { credentials: "include", ...init });
  window.__steelFetchWithCredentials = true;
})();
// =========================================================
// ENDPOINTS — LOCAL + PRODUÇÃO
// =========================================================
// Frontend e API são servidos pelo backend na mesma origem. O fallback
// separado permanece apenas para abrir cópias antigas durante a migração.

(function configurarEndpointsSteelControl() {
  const override =
    String(window.STEELCONTROL_API_URL || "").trim();

  if (override) {
    window.STEELCONTROL_API_URL =
      override.replace(/\/$/, "");
    return;
  }

  const host = window.location.hostname;
  const porta = window.location.port;
  const local =
    host === "localhost" ||
    host === "127.0.0.1";

  const frontendSeparado =
    window.location.protocol === "file:" ||
    (local && porta && porta !== "3000");

  window.STEELCONTROL_API_URL =
    frontendSeparado
      ? `http://${host || "localhost"}:3000`
      : window.location.origin;
})();

// =========================================================
// STEELCONTROL
// CONFIGURAÇÃO GLOBAL
// IDIOMA + TEMA
// =========================================================
//
// IMPORTANTE:
// carregue este arquivo ANTES do JS de cada página:
//
// <script src="config.js"></script>
// <script src="pagina.js"></script>
//
// =========================================================


// =========================================================
// CONFIGURAÇÕES
// =========================================================

const IDIOMAS_SUPORTADOS = [
  "pt",
  "en",
  "es",
  "fr",
  "de",
  "it"
];


// =========================================================
// PORTUGUÊS
// =========================================================

const PT = {

  simulationMode: "Modo simulação",
  realIntegration: "Integração real",
  machineConnected: "Máquina conectada",
  machineOffline: "Máquina offline",
  liveTelemetry: "Dados em tempo real",
  awaitingRealTelemetry: "Aguardando telemetria real",
  connectionNotConfigured: "Conexão não configurada",
  simulationGeneratedData: "Dados gerados pelo SteelControl",

  apiOffline: "API offline",
  erroApiTexto: "Não foi possível carregar os dados da máquina.",
  statusAlertaTexto: "A máquina requer atenção.",
  statusManutencaoTexto: "A máquina está em manutenção.",
  statusOkTexto: "Operação normal.",
  verificarEnergia: "Verificar carga elétrica",
  verificarSuperaquecimento: "Verificar superaquecimento",

  manutencaoPreventivaNecessaria: "Manutenção preventiva necessária",

  // =======================================================
  // GERAL
  // =======================================================

  usuario: "Usuário",
  cargo: "Cargo",
  sair: "Sair",
  confirmarSaidaTitulo: "Sair da conta?",
  confirmarSaidaMensagem: "Tem certeza de que deseja encerrar sua sessão? Você precisará entrar novamente para acessar sua empresa.",
  confirmarSaidaCancelar: "Continuar no sistema",
  confirmarSaidaAcao: "Sair da conta",
  voltar: "Voltar",
  salvar: "Salvar",
  cancelar: "Cancelar",
  editar: "Editar",
  excluir: "Excluir",
  fechar: "Fechar",
  buscar: "Buscar",
  carregando: "Carregando...",
  carregandoInformacoes: "Carregando informações...",
  naoInformado: "Não informado",
  semRegistro: "Sem registro",
  normal: "Normal",
  sim: "Sim",
  nao: "Não",
  ativo: "Ativo",
  inativo: "Inativo",

  // =======================================================
  // NAVEGAÇÃO
  // =======================================================

  inicio: "Início",
  sobre: "Sobre",
  recursos: "Recursos",
  seguranca: "Segurança",
  tecnologia: "Tecnologia",
  contato: "Contato",

  maquinas: "Máquinas",
  producao: "Produção",
  manutencao: "Manutenção",
  logs: "Logs",
  alertas: "Alertas",
  configuracoes: "Configurações",

  minhaEmpresa: "Minha Empresa",

  entrar: "Entrar",
  entrarSistema: "Entrar no sistema",

  dashboard: "Dashboard",

  // =======================================================
  // HOME
  // =======================================================

  homeTituloPagina:
    "SteelControl | Gestão Industrial Inteligente",

  homeMetaDescricao:
    "SteelControl é uma plataforma de monitoramento industrial, manutenção, segurança e gestão empresarial.",

  homeIndustrialIntelligence:
    "Industrial Intelligence",

  homePlataformaGestao:
    "Plataforma de gestão industrial",

  homeHeroTituloAntes:
    "Controle industrial",

  homeHeroTituloDestaque:
    "inteligente",

  homeHeroTituloDepois:
    "em uma única plataforma.",

  homeHeroDescricao:
    "Monitore máquinas, produção, manutenção, alertas, segurança e equipes em tempo real com uma solução criada para ambientes industriais.",

  homeConhecerPlataforma:
    "Conhecer a plataforma",

  homeMonitoramentoTempoReal:
    "Monitoramento em tempo real",

  homeSegurancaEmpresarial:
    "Segurança empresarial",

  homeGestaoEquipes:
    "Gestão de equipes",

  homeOnline:
    "Online",

  homeAdministrador:
    "Administrador",

  homeEmpresaExemplo:
    "Empresa Exemplo",

  homeTemperatura:
    "Temperatura",

  homeProducao:
    "Produção",

  homeCiclos:
    "Ciclos",

  homeEnergia:
    "Energia",

  homeHoje:
    "hoje",

  homeProducaoUltimasHoras:
    "Produção nas últimas horas",

  homeUltimas8Horas:
    "Últimas 8 horas",

  homeAlertasRecentes:
    "Alertas recentes",

  homeTemperaturaAlta:
    "Temperatura alta",

  homeMaquina03:
    "Máquina 03",

  homeManutencaoPreventiva:
    "Manutenção preventiva",

  homeMaquina07:
    "Máquina 07",

  homeConsumoElevado:
    "Carga elevada",

  homeMaquina02:
    "Máquina 02",

  homeVerAlertas:
    "Ver todos os alertas",

  homeMonitoramentoContinuo:
    "Monitoramento contínuo",

  homeGestaoCentralizada:
    "Gestão centralizada",

  homeDadosOperacionais:
    "Dados operacionais",

  homeMultiusuario:
    "Multiusuário",

  homeControleEquipes:
    "Controle de equipes",

  homeSobreNos:
    "Sobre nós",

  homeSobreTitulo:
    "Tecnologia criada para tornar a gestão industrial mais inteligente.",

  homeSobreTexto1:
    "O SteelControl nasceu com o objetivo de centralizar informações importantes de uma operação industrial em um único ambiente.",

  homeSobreTexto2:
    "Nossa plataforma reúne monitoramento, produção, manutenção, segurança, equipes e informações empresariais, oferecendo maior visibilidade da operação.",

  homeSobreTexto3:
    "A proposta é permitir que empresas acompanhem seus processos de maneira simples, moderna e preparada para futuras integrações com automação industrial.",

  homeInteligenciaIndustrial:
    "Inteligência industrial",

  homeMonitoramentoMaquinas:
    "Monitoramento de máquinas",

  homeControleProducao:
    "Controle de produção",

  homeGestaoManutencao:
    "Gestão de manutenção",

  homeSegurancaBiometrica:
    "Segurança biométrica",

  homeGestaoFuncionarios:
    "Gestão de funcionários",

  homeIntegracaoAutomacao:
    "Integração com automação",

  homeRecursosTitulo:
    "Tudo que sua operação precisa em um só lugar.",

  homeRecursosTexto:
    "Uma plataforma criada para centralizar as principais informações de uma operação industrial.",

  homeMaquinasTexto:
    "Cadastre e acompanhe equipamentos, setores, modelos, status e dados operacionais.",

  homeProducaoTexto:
    "Visualize indicadores e acompanhe a evolução da produtividade.",

  homeManutencaoTexto:
    "Registre manutenções preventivas, corretivas e acompanhe históricos.",

  homeAlertasTexto:
    "Identifique rapidamente situações que precisam da atenção da equipe.",

  homeEquipes:
    "Equipes",

  homeEquipesTexto:
    "Gerencie funcionários, cargos, permissões e acessos empresariais.",

  homeReconhecimentoFacial:
    "Reconhecimento facial",

  homeReconhecimentoFacialTexto:
    "Autenticação biométrica integrada para adicionar uma camada extra de segurança.",

  homeSegurancaTitulo:
    "Controle de acesso preparado para ambientes corporativos.",

  homeSegurancaTexto:
    "Cada funcionário pode possuir sua própria conta e diferentes níveis de permissão, proporcionando maior controle sobre o acesso às informações.",

  homeCargosPermissoes:
    "Cargos e permissões",

  homeCargosPermissoesTexto:
    "Controle de acesso por função.",

  homeEmpresasSeparadas:
    "Empresas separadas",

  homeEmpresasSeparadasTexto:
    "Dados organizados por organização.",

  homeTecnologiaTitulo:
    "Tecnologia preparada para crescer com a indústria.",

  homeNodeTexto:
    "APIs e regras",

  homePostgresTexto:
    "Banco de dados",

  homePrismaTexto:
    "ORM moderno",

  homePythonTexto:
    "Visão computacional",

  homeIoT:
    "IoT",

  homeIoTTexto:
    "Sensores e dispositivos",

  homeRobotica:
    "Robótica",

  homeRoboticaTexto:
    "Integração industrial",

  homePreparadoFuturo:
    "Preparado para o futuro",

  homeFuturoTitulo:
    "Sensores, automação e robótica industrial.",

  homeFuturoTexto:
    "O SteelControl foi pensado para evoluir junto com a operação industrial, permitindo futuras integrações com sensores, microcontroladores e equipamentos.",

  homeSensores:
    "Sensores",

  homeAutomacao:
    "Automação",

  homeCtaTitulo:
    "Mais controle para sua operação. Mais informação para suas decisões.",

  homeCtaTexto:
    "Entre na plataforma e acompanhe sua operação industrial em um ambiente centralizado e seguro.",

  homeEntrarSteelControl:
    "Entrar no SteelControl",

  homeConhecerMais:
    "Conhecer mais",

  homePlataforma:
    "Plataforma",

  homeEmpresa:
    "Empresa",

  homeContato:
    "Contato",

  homeTodosDireitos:
    "Todos os direitos reservados.",

  alterarTema:
    "Alterar tema",

  abrirMenu:
    "Abrir menu",

  // =======================================================
  // LOGIN
  // =======================================================

  loginAcessoEmpresarial:
    "Acesso empresarial",

  loginTitulo:
    "Acesse sua empresa",

  loginSubtitulo:
    "Entre no ambiente industrial da sua organização e acompanhe tudo pelo SteelControl.",

  loginConfiancaTitulo:
    "Confie sua operação ao SteelControl",

  loginConfiancaTexto:
    "Centralize máquinas, produção, manutenção, alertas, equipes e segurança em uma única plataforma.",

  emailLabel:
    "E-mail",

  senhaLabel:
    "Senha",

  emailPlaceholder:
    "nome@empresa.com",

  senhaPlaceholder:
    "Digite sua senha",

  loginAcessarEmpresa:
    "Acessar minha empresa",

  reconhecimentoFacial:
    "Reconhecimento facial",

  loginBiometria:
    "Entre com sua biometria",

  loginEmpresaNaoEsta:
    "SUA EMPRESA AINDA NÃO ESTÁ AQUI?",

  loginLeveIndustria:
    "Leve sua indústria para o SteelControl",

  loginCadastroDescricao:
    "Cadastre sua empresa e tenha um ambiente próprio para gerenciar máquinas, funcionários, segurança, produção e manutenção.",

  monitoramentoCentralizado:
    "Monitoramento centralizado",

  gestaoEquipes:
    "Gestão de equipes",

  segurancaBiometrica:
    "Segurança biométrica",

  cadastrarMinhaEmpresa:
    "Cadastrar minha empresa",

  novaOrganizacao:
    "Nova organização",

  cadastrarEmpresaTitulo:
    "Cadastre sua empresa",

  cadastrarEmpresaSubtitulo:
    "Crie o ambiente industrial da sua organização e cadastre o primeiro administrador.",

  primeiroAdministrador:
    "Primeiro administrador",

  primeiroAdministradorTexto:
    "Esse usuário terá acesso administrativo para configurar sua empresa no SteelControl.",

  informacoesEmpresa:
    "Informações da empresa",

  nomeEmpresa:
    "Nome da empresa",

  nomeEmpresaPlaceholder:
    "Ex: SteelTech Indústria",

  cnpj:
    "CNPJ",

  cnpjPlaceholder:
    "00.000.000/0000-00",

  administradorEmpresa:
    "Administrador da empresa",

  nomeAdministrador:
    "Nome do administrador",

  nomeAdministradorPlaceholder:
    "Seu nome completo",

  emailCorporativo:
    "E-mail corporativo",

  emailCorporativoPlaceholder:
    "admin@empresa.com",

  senhaCadastroPlaceholder:
    "Mínimo 6 caracteres",

  criarMinhaEmpresa:
    "Criar minha empresa",

  voltarLogin:
    "Voltar para o login",

  ambienteSeguro:
    "Ambiente seguro",

  plataformaEmpresarial:
    "Plataforma empresarial",

  loginSideTag:
    "STEELCONTROL",

  loginSideTituloAntes:
    "Sua indústria",

  loginSideTituloDestaque:
    "conectada,",

  loginSideTituloDepois:
    "segura e inteligente.",

  loginSideTexto:
    "Tecnologia para acompanhar sua operação, melhorar processos e transformar dados industriais em decisões.",

  monitoramento:
    "Monitoramento",

  gestaoIndustrial:
    "Gestão industrial",

  loginInfoTitulo:
    "Todo o controle da sua operação em um único lugar.",

  loginInfoTexto:
    "Máquinas, logs, temperatura, produção, manutenção, alertas, equipes e autenticação integrados em uma única plataforma.",

  loginTecnologiaIndustrial:
    "Tecnologia desenvolvida para ambientes industriais",

  faceTitulo:
    "Reconhecimento facial",

  facePrepareTitulo:
    "Prepare-se para o reconhecimento facial",

  facePrepareTexto:
    "Centralize seu rosto dentro do oval. O reconhecimento acontece automaticamente.",

  faceAutomatico:
    "Reconhecimento automático — não é necessário apertar nenhum botão.",

  faceTexto:
    "Posicione seu rosto em frente à câmera",

  iniciandoCamera:
    "Iniciando câmera...",

  procurandoRosto:
    "Procurando rosto...",

  olharCamera:
    "Olhe diretamente para a câmera",

  cameraSomenteAutenticacao:
    "A câmera é utilizada somente durante a autenticação.",

  faceValidationAutomatic:
    "Validação automática",
  faceFlowSupervised:
    "Fluxo biométrico supervisionado",
  faceStepPositionTitle:
    "Posição inicial",
  faceStepPositionText:
    "Centralize o rosto e mantenha o enquadramento.",
  faceStepLivenessTitle:
    "Prova de vida",
  faceStepLivenessText:
    "Movimente levemente a cabeça quando solicitado.",
  faceStepReturnTitle:
    "Retorno ao centro",
  faceStepReturnText:
    "Olhe novamente para a câmera.",
  faceStepVerifyTitle:
    "Validando identidade",
  faceStepVerifyText:
    "O backend confirma a identidade com segurança.",

  mostrarSenha:
    "Mostrar senha",

  fecharReconhecimentoFacial:
    "Fechar reconhecimento facial",

  loginSucesso:
    "Login realizado com sucesso!",

  erroLogin:
    "E-mail ou senha inválidos.",

  erroCampos:
    "Preencha todos os campos.",

  // =======================================================
  // DASHBOARD
  // =======================================================

  dashboardTitulo:
    "Dashboard de Máquinas Industriais",

  dashboardSubtitulo:
    "Sistema de monitoramento em tempo real",

  temperatura:
    "Temperatura",

  temperaturaDesc:
    "Temperatura atual da máquina",

  producaoCard:
    "Produção",

  producaoDesc:
    "Peças produzidas",

  ciclos:
    "Ciclos",

  ciclosDesc:
    "Ciclos executados",

  energia:
    "Energia",

  energiaDesc:
    "Percentual normalizado (0–100%)",

  producaoTempoReal:
    "Produção em tempo real",

  situacaoMaquina:
    "Situação da máquina",

  manutencaoResumo:
    "Manutenção",

  temperaturaMaquina:
    "Temperatura da máquina",

  consumoEnergia:
    "Carga elétrica (%)",

  maquinaSelecionada:
    "Máquina selecionada",

  maquinaSelecionadaDesc:
    "Visualização da máquina monitorada pelo sistema",

  verDetalhes:
    "Ver detalhes",

  producaoMaquina:
    "Produção da máquina",

  producaoMaquinaDesc:
    "Acompanhamento da produção realizada em tempo real",

  graficoProducao:
    "Gráfico de produção",

  resumoProdutivo:
    "Resumo produtivo",

  totalProduzido:
    "Total produzido:",

  ciclosExecutados:
    "Ciclos executados:",

  status:
    "Status:",

  manutencaoTitulo:
    "Manutenção",

  manutencaoDesc:
    "Controle de manutenção preventiva e corretiva da máquina",

  ultimaManutencao:
    "Última manutenção",

  ultimaManutencaoDesc:
    "Registro mais recente",

  proximaManutencao:
    "Próxima manutenção",

  proximaManutencaoDesc:
    "Previsão preventiva",

  situacao:
    "Situação",

  situacaoDesc:
    "Status atual",

  ciclosManutencaoDesc:
    "Base para revisão",

  cadastrarManutencao:
    "Cadastrar manutenção",

  tipoManutencao:
    "Tipo de manutenção",

  selecioneTipo:
    "Selecione o tipo",

  preventiva:
    "Preventiva",

  corretiva:
    "Corretiva",

  nomeTecnico:
    "Nome do técnico",

  responsavelAutenticado:
    "Responsável autenticado",

  responsavelSessaoAjuda:
    "Identificado pela conta conectada",

  logoFormatsHelp:
    "PNG, JPG, WEBP, GIF, AVIF ou BMP • até 5 MB",

  nomeTecnicoPlaceholder:
    "Digite o nome do técnico",

  descricao:
    "Descrição",

  descricaoManutencaoPlaceholder:
    "Descreva o serviço realizado",

  salvarManutencao:
    "Salvar manutenção",

  historicoManutencoes:
    "Histórico de manutenções",

  carregandoHistorico:
    "Carregando histórico...",

  logsTitulo:
    "Logs da máquina",

  logsDesc:
    "Histórico de eventos gerados automaticamente",

  alertasTitulo:
    "Alertas",

  alertasDesc:
    "Ocorrências que precisam de atenção",

  nenhumLog:
    "Nenhum log registrado.",

  nenhumAlerta:
    "Nenhum alerta registrado.",

  nenhumaManutencao:
    "Nenhuma manutenção registrada.",

  manutencaoSucesso:
    "Manutenção cadastrada com sucesso!",

  erroCadastrarManutencao:
    "Erro ao cadastrar manutenção.",

  configDesc:
    "Personalize o idioma e o tema visual do sistema.",

  idioma:
    "Idioma",

  tema:
    "Tema",

  claro:
    "Claro",

  escuro:
    "Escuro",

  gerenciarEmpresaTitle:
    "Gerenciar empresa, funcionários e reconhecimento facial",

  // =======================================================
  // MÁQUINAS
  // =======================================================

  equipamentosEmpresa:
    "Equipamentos da sua empresa",

  equipamentosIntro:
    "Cadastre máquinas, robôs industriais e outros equipamentos da sua operação. O SteelControl organiza os dados e acompanha temperatura, produção, ciclos, energia, manutenção e alertas.",

  monitoramentoIndustrial:
    "Monitoramento industrial em tempo real",

  historicoOperacional:
    "Histórico operacional",

  manutencaoIntegrada:
    "Manutenção integrada",

  equipamentos:
    "Equipamentos",

  emOperacao:
    "Em operação",

  emManutencao:
    "Em manutenção",

  comAlerta:
    "Com alerta",

  gestaoEquipamentos:
    "Gestão de equipamentos",

  cadastrarEquipamento:
    "Cadastrar novo equipamento",

  cadastrarEquipamentoTexto:
    "Informe os dados de identificação. O monitoramento será iniciado automaticamente após o cadastro.",

  novoEquipamento:
    "Novo equipamento",

  cadastrarQualquerEquipamento:
    "Cadastre qualquer equipamento industrial",

  cadastrarQualquerEquipamentoTexto:
    "Inclusive braços robóticos, esteiras, prensas, tornos, máquinas de corte e equipamentos personalizados.",

  vaiCadastrarBraco:
    "Vai cadastrar um braço robótico?",

  vaiCadastrarBracoTexto:
    "Preencha automaticamente um exemplo e altere apenas os dados do seu equipamento.",

  usarModelo:
    "Usar modelo",

  identificacaoEquipamento:
    "Identificação do equipamento",

  nomeEquipamento:
    "Nome do equipamento",

  nomeEquipamentoPlaceholder:
    "Ex: Braço robótico 01",

  setorLabel:
    "Setor",

  setorPlaceholder:
    "Ex: Automação",

  tipoEquipamento:
    "Tipo de equipamento",

  selecionarTipo:
    "Selecione o tipo",

  bracoRobotico:
    "Braço robótico",

  roboIndustrial:
    "Robô industrial",

  esteiraIndustrial:
    "Esteira industrial",

  prensa:
    "Prensa",

  torno:
    "Torno",

  solda:
    "Solda",

  corte:
    "Corte",

  embalagem:
    "Embalagem",

  cnc:
    "CNC",

  impressora3D:
    "Impressora 3D",

  outro:
    "Outro",

  modeloLabel:
    "Modelo",

  modeloPlaceholder:
    "Ex: RB-500",

  fabricanteLabel:
    "Fabricante",

  fabricantePlaceholder:
    "Ex: ABB, KUKA, FANUC...",

  codigoLabel:
    "Código / Patrimônio",

  codigoPlaceholder:
    "Ex: ROB-001",

  funcaoProcesso:
    "Função no processo industrial",

  descricaoEquipamento:
    "Descrição",

  descricaoEquipamentoPlaceholder:
    "Ex: Braço robótico responsável pela movimentação e posicionamento de peças na linha de automação.",

  cancelarCadastro:
    "Cancelar",

  cadastrarEquipamentoBotao:
    "Cadastrar equipamento",

  parqueIndustrial:
    "Parque industrial",

  equipamentosCadastrados:
    "Equipamentos cadastrados",

  equipamentosCadastradosTexto:
    "Consulte e acesse os equipamentos da sua empresa.",

  buscarEquipamento:
    "Buscar equipamento...",

  todosTipos:
    "Todos os tipos",

  robotica:
    "Robótica",

  esteiras:
    "Esteiras",

  prensas:
    "Prensas",

  outros:
    "Outros",

  todosStatus:
    "Todos os status",

  carregandoEquipamentos:
    "Carregando equipamentos...",

  fabricante:
    "Fabricante",

  modelo:
    "Modelo",

  codigo:
    "Código",

  setor:
    "Setor",

  tipo:
    "Tipo",

  pecas:
    "peças",

  situacaoManutencao:
    "Situação de manutenção",

  abrirMonitoramento:
    "Abrir monitoramento",

  nenhumEquipamento:
    "Nenhum equipamento encontrado",

  nenhumEquipamentoTexto:
    "Cadastre uma máquina ou braço robótico para iniciar o monitoramento industrial.",

  erroCarregarEquipamentos:
    "Não foi possível carregar os equipamentos",

  erroBackend:
    "Verifique se o backend SteelControl está funcionando.",

  preenchendoRobo:
    "Modelo de braço robótico preenchido. Altere os dados conforme seu equipamento.",

  erroCamposEquipamento:
    "Preencha todos os dados do equipamento.",

  cadastrandoEquipamento:
    "Cadastrando equipamento...",

  equipamentoCadastrado:
    "Equipamento cadastrado com sucesso! Monitoramento iniciado.",

  erroCadastrarEquipamento:
    "Erro ao cadastrar equipamento.",

  erroServidor:
    "Erro ao conectar com o servidor.",

  ligado:
    "Ligada",

  alertaStatus:
    "Alerta",

  manutencaoStatus:
    "Manutenção",

  // =======================================================
  // EMPRESA
  // =======================================================

  empresaTitulo:
    "Minha Empresa",

  empresaSubtitulo:
    "Gerencie dados institucionais, localização, funcionários e segurança.",

  dadosEmpresa:
    "Dados da empresa",

  editarDados:
    "Editar dados",

  salvarAlteracoes:
    "Salvar alterações",

  telefone:
    "Telefone",

  site:
    "Site",

  endereco:
    "Endereço",

  numero:
    "Número",

  complemento:
    "Complemento",

  bairro:
    "Bairro",

  cidade:
    "Cidade",

  estado:
    "Estado",

  pais:
    "País",

  cep:
    "CEP",

  localizacao:
    "Localização",

  abrirMapa:
    "Abrir no mapa",

  enderecoNaoCadastrado:
    "Endereço não cadastrado",

  adicionarLocalizacao:
    "Adicione a localização da empresa.",

  funcionarios:
    "Funcionários",

  novoFuncionario:
    "Novo funcionário",

  totalFuncionarios:
    "Funcionários",

  totalComFacial:
    "Com facial",

  administradores:
    "Administradores",

  nomeFuncionario:
    "Nome",

  cargoFuncionario:
    "Cargo",

  criarFuncionario:
    "Cadastrar funcionário",

  facialAtiva:
    "Reconhecimento facial ativo",

  facialNaoCadastrada:
    "Facial não cadastrada",

  cadastrarFacial:
    "Cadastrar facial",

  adicionarFacial:
    "Adicionar facial",

  removerFaciais:
    "Remover faciais",

  // =======================================================
  // CARGOS
  // =======================================================

  cargoAdministrador:
    "Administrador",

  cargoSupervisor:
    "Supervisor",

  cargoTecnico:
    "Técnico",

  cargoOperador:
    "Operador",

  cargoVisitante:
    "Visitante"
};


// =========================================================
// INGLÊS
// =========================================================

const EN = {

  ...PT,

  simulationMode: "Simulation mode",
  realIntegration: "Real integration",
  machineConnected: "Machine connected",
  machineOffline: "Machine offline",
  liveTelemetry: "Live data",
  awaitingRealTelemetry: "Waiting for real telemetry",
  connectionNotConfigured: "Connection not configured",
  simulationGeneratedData: "Data generated by SteelControl",

  apiOffline: "API offline",
  erroApiTexto: "Could not load machine data.",
  statusAlertaTexto: "The machine requires attention.",
  statusManutencaoTexto: "The machine is under maintenance.",
  statusOkTexto: "Normal operation.",
  verificarEnergia: "Check electrical load",
  verificarSuperaquecimento: "Check overheating",

  manutencaoPreventivaNecessaria: "Preventive maintenance required",

  usuario: "User",
  cargo: "Role",
  sair: "Logout",
  confirmarSaidaTitulo: "Sign out?",
  confirmarSaidaMensagem: "Are you sure you want to end your session? You will need to sign in again to access your company.",
  confirmarSaidaCancelar: "Stay signed in",
  confirmarSaidaAcao: "Sign out",
  voltar: "Back",
  salvar: "Save",
  cancelar: "Cancel",
  editar: "Edit",
  excluir: "Delete",
  fechar: "Close",
  buscar: "Search",
  carregando: "Loading...",
  carregandoInformacoes: "Loading information...",
  naoInformado: "Not provided",
  semRegistro: "No record",
  ativo: "Active",
  inativo: "Inactive",

  inicio: "Home",
  sobre: "About",
  recursos: "Features",
  seguranca: "Security",
  tecnologia: "Technology",
  contato: "Contact",

  maquinas: "Machines",
  producao: "Production",
  manutencao: "Maintenance",
  logs: "Logs",
  alertas: "Alerts",
  configuracoes: "Settings",

  minhaEmpresa: "My Company",

  entrar: "Sign in",
  entrarSistema: "Sign in",
  dashboard: "Dashboard",

  homeTituloPagina:
    "SteelControl | Intelligent Industrial Management",

  homeMetaDescricao:
    "SteelControl is an industrial monitoring, maintenance, security and business management platform.",

  homePlataformaGestao:
    "Industrial management platform",

  homeHeroTituloAntes:
    "Industrial control",

  homeHeroTituloDestaque:
    "intelligent",

  homeHeroTituloDepois:
    "on a single platform.",

  homeHeroDescricao:
    "Monitor machines, production, maintenance, alerts, security and teams in real time with a solution designed for industrial environments.",

  homeConhecerPlataforma:
    "Discover the platform",

  homeMonitoramentoTempoReal:
    "Real-time monitoring",

  homeSegurancaEmpresarial:
    "Business security",

  homeGestaoEquipes:
    "Team management",

  homeOnline:
    "Online",

  homeAdministrador:
    "Administrator",

  homeEmpresaExemplo:
    "Example Company",

  homeTemperatura:
    "Temperature",

  homeProducao:
    "Production",

  homeCiclos:
    "Cycles",

  homeEnergia:
    "Energy",

  homeHoje:
    "today",

  homeProducaoUltimasHoras:
    "Production in recent hours",

  homeUltimas8Horas:
    "Last 8 hours",

  homeAlertasRecentes:
    "Recent alerts",

  homeTemperaturaAlta:
    "High temperature",

  homeMaquina03:
    "Machine 03",

  homeManutencaoPreventiva:
    "Preventive maintenance",

  homeMaquina07:
    "Machine 07",

  homeConsumoElevado:
    "High electrical load",

  homeMaquina02:
    "Machine 02",

  homeVerAlertas:
    "View all alerts",

  homeMonitoramentoContinuo:
    "Continuous monitoring",

  homeGestaoCentralizada:
    "Centralized management",

  homeDadosOperacionais:
    "Operational data",

  homeMultiusuario:
    "Multi-user",

  homeControleEquipes:
    "Team control",

  homeSobreNos:
    "About us",

  homeSobreTitulo:
    "Technology created to make industrial management smarter.",

  homeSobreTexto1:
    "SteelControl was created to centralize important industrial operation information in a single environment.",

  homeSobreTexto2:
    "Our platform brings together monitoring, production, maintenance, security, teams and business information, providing greater operational visibility.",

  homeSobreTexto3:
    "Our goal is to enable companies to monitor their processes in a simple, modern way prepared for future industrial automation integrations.",

  homeInteligenciaIndustrial:
    "Industrial intelligence",

  homeMonitoramentoMaquinas:
    "Machine monitoring",

  homeControleProducao:
    "Production control",

  homeGestaoManutencao:
    "Maintenance management",

  homeSegurancaBiometrica:
    "Biometric security",

  homeGestaoFuncionarios:
    "Employee management",

  homeIntegracaoAutomacao:
    "Automation integration",

  homeRecursosTitulo:
    "Everything your operation needs in one place.",

  homeRecursosTexto:
    "A platform designed to centralize the main information of an industrial operation.",

  homeMaquinasTexto:
    "Register and monitor equipment, sectors, models, statuses and operational data.",

  homeProducaoTexto:
    "View indicators and monitor productivity development.",

  homeManutencaoTexto:
    "Register preventive and corrective maintenance and monitor history.",

  homeAlertasTexto:
    "Quickly identify situations requiring team attention.",

  homeEquipes:
    "Teams",

  homeEquipesTexto:
    "Manage employees, roles, permissions and business access.",

  homeReconhecimentoFacial:
    "Facial recognition",

  homeReconhecimentoFacialTexto:
    "Integrated biometric authentication adds an extra layer of security.",

  homeSegurancaTitulo:
    "Access control designed for business environments.",

  homeSegurancaTexto:
    "Each employee can have their own account and different permission levels, providing greater control over information access.",

  homeCargosPermissoes:
    "Roles and permissions",

  homeCargosPermissoesTexto:
    "Role-based access control.",

  homeEmpresasSeparadas:
    "Separated companies",

  homeEmpresasSeparadasTexto:
    "Data organized by company.",

  homeTecnologiaTitulo:
    "Technology ready to grow with industry.",

  homeNodeTexto:
    "APIs and business rules",

  homePostgresTexto:
    "Database",

  homePrismaTexto:
    "Modern ORM",

  homePythonTexto:
    "Computer vision",

  homeIoTTexto:
    "Sensors and devices",

  homeRobotica:
    "Robotics",

  homeRoboticaTexto:
    "Industrial integration",

  homePreparadoFuturo:
    "Ready for the future",

  homeFuturoTitulo:
    "Sensors, automation and industrial robotics.",

  homeFuturoTexto:
    "SteelControl was designed to evolve with industrial operations, allowing future integrations with sensors, microcontrollers and equipment.",

  homeSensores:
    "Sensors",

  homeAutomacao:
    "Automation",

  homeCtaTitulo:
    "More control for your operation. More information for your decisions.",

  homeCtaTexto:
    "Access the platform and monitor your industrial operation in a centralized and secure environment.",

  homeEntrarSteelControl:
    "Enter SteelControl",

  homeConhecerMais:
    "Learn more",

  homePlataforma:
    "Platform",

  homeEmpresa:
    "Company",

  homeContato:
    "Contact",

  homeTodosDireitos:
    "All rights reserved.",

  alterarTema:
    "Change theme",

  abrirMenu:
    "Open menu",

  loginAcessoEmpresarial:
    "Business access",

  loginTitulo:
    "Access your company",

  loginSubtitulo:
    "Enter your organization's industrial environment and manage everything through SteelControl.",

  loginConfiancaTitulo:
    "Trust your operation to SteelControl",

  loginConfiancaTexto:
    "Centralize machines, production, maintenance, alerts, teams and security on a single platform.",

  emailLabel:
    "Email",

  senhaLabel:
    "Password",

  emailPlaceholder:
    "name@company.com",

  senhaPlaceholder:
    "Enter your password",

  loginAcessarEmpresa:
    "Access my company",

  reconhecimentoFacial:
    "Facial recognition",

  loginBiometria:
    "Sign in with biometrics",

  loginEmpresaNaoEsta:
    "IS YOUR COMPANY NOT HERE YET?",

  loginLeveIndustria:
    "Bring your industry to SteelControl",

  loginCadastroDescricao:
    "Register your company and get your own environment to manage machines, employees, security, production and maintenance.",

  monitoramentoCentralizado:
    "Centralized monitoring",

  gestaoEquipes:
    "Team management",

  segurancaBiometrica:
    "Biometric security",

  cadastrarMinhaEmpresa:
    "Register my company",

  novaOrganizacao:
    "New organization",

  cadastrarEmpresaTitulo:
    "Register your company",

  cadastrarEmpresaSubtitulo:
    "Create your organization's industrial environment and register the first administrator.",

  primeiroAdministrador:
    "First administrator",

  primeiroAdministradorTexto:
    "This user will have administrative access to configure your company in SteelControl.",

  informacoesEmpresa:
    "Company information",

  nomeEmpresa:
    "Company name",

  nomeEmpresaPlaceholder:
    "Ex: SteelTech Industry",

  cnpj:
    "Company ID",

  administradorEmpresa:
    "Company administrator",

  nomeAdministrador:
    "Administrator name",

  nomeAdministradorPlaceholder:
    "Your full name",

  emailCorporativo:
    "Business email",

  emailCorporativoPlaceholder:
    "admin@company.com",

  senhaCadastroPlaceholder:
    "Minimum 6 characters",

  criarMinhaEmpresa:
    "Create my company",

  voltarLogin:
    "Back to login",

  ambienteSeguro:
    "Secure environment",

  plataformaEmpresarial:
    "Business platform",

  loginSideTituloAntes:
    "Your industry",

  loginSideTituloDestaque:
    "connected,",

  loginSideTituloDepois:
    "secure and intelligent.",

  loginSideTexto:
    "Technology to monitor your operation, improve processes and transform industrial data into decisions.",

  monitoramento:
    "Monitoring",

  gestaoIndustrial:
    "Industrial management",

  loginInfoTitulo:
    "Complete control of your operation in one place.",

  loginInfoTexto:
    "Machines, logs, temperature, production, maintenance, alerts, teams and authentication integrated into a single platform.",

  loginTecnologiaIndustrial:
    "Technology developed for industrial environments",

  faceTitulo:
    "Facial recognition",

  facePrepareTitulo:
    "Get ready for facial recognition",

  facePrepareTexto:
    "Center your face inside the oval. Recognition happens automatically.",

  faceAutomatico:
    "Automatic recognition — you do not need to press any button.",

  faceTexto:
    "Position your face in front of the camera",

  iniciandoCamera:
    "Starting camera...",

  procurandoRosto:
    "Looking for a face...",

  olharCamera:
    "Look directly at the camera",

  cameraSomenteAutenticacao:
    "The camera is used only during authentication.",

  faceValidationAutomatic:
    "Automatic validation",
  faceFlowSupervised:
    "Supervised biometric flow",
  faceStepPositionTitle:
    "Initial position",
  faceStepPositionText:
    "Center your face and keep it inside the frame.",
  faceStepLivenessTitle:
    "Liveness check",
  faceStepLivenessText:
    "Move your head slightly when requested.",
  faceStepReturnTitle:
    "Return to center",
  faceStepReturnText:
    "Look directly at the camera again.",
  faceStepVerifyTitle:
    "Verifying identity",
  faceStepVerifyText:
    "The backend securely confirms your identity.",

  mostrarSenha:
    "Show password",

  fecharReconhecimentoFacial:
    "Close facial recognition",

  loginSucesso:
    "Login successful!",

  erroLogin:
    "Invalid email or password.",

  erroCampos:
    "Fill in all fields.",

  dashboardTitulo:
    "Industrial Machines Dashboard",

  dashboardSubtitulo:
    "Real-time monitoring system",

  temperatura:
    "Temperature",

  temperaturaDesc:
    "Current machine temperature",

  producaoCard:
    "Production",

  producaoDesc:
    "Parts produced",

  ciclos:
    "Cycles",

  ciclosDesc:
    "Executed cycles",

  energia:
    "Energy",

  energiaDesc:
    "Normalized percentage (0–100%)",

  producaoTempoReal:
    "Real-time production",

  situacaoMaquina:
    "Machine status",

  manutencaoResumo:
    "Maintenance",

  temperaturaMaquina:
    "Machine temperature",

  consumoEnergia:
    "Electrical load (%)",

  maquinaSelecionada:
    "Selected machine",

  maquinaSelecionadaDesc:
    "View of the machine monitored by the system",

  verDetalhes:
    "View details",

  producaoMaquina:
    "Machine production",

  producaoMaquinaDesc:
    "Real-time production monitoring",

  graficoProducao:
    "Production chart",

  resumoProdutivo:
    "Production summary",

  totalProduzido:
    "Total produced:",

  ciclosExecutados:
    "Executed cycles:",

  manutencaoDesc:
    "Preventive and corrective machine maintenance control",

  ultimaManutencao:
    "Last maintenance",

  ultimaManutencaoDesc:
    "Most recent record",

  proximaManutencao:
    "Next maintenance",

  proximaManutencaoDesc:
    "Preventive forecast",

  situacao:
    "Situation",

  situacaoDesc:
    "Current status",

  ciclosManutencaoDesc:
    "Review basis",

  cadastrarManutencao:
    "Register maintenance",

  tipoManutencao:
    "Maintenance type",

  selecioneTipo:
    "Select type",

  preventiva:
    "Preventive",

  corretiva:
    "Corrective",

  nomeTecnico:
    "Technician name",

  responsavelAutenticado:
    "Authenticated operator",

  responsavelSessaoAjuda:
    "Identified by the signed-in account",

  logoFormatsHelp:
    "PNG, JPG, WEBP, GIF, AVIF, or BMP • up to 5 MB",

  nomeTecnicoPlaceholder:
    "Enter technician name",

  descricao:
    "Description",

  descricaoManutencaoPlaceholder:
    "Describe the service performed",

  salvarManutencao:
    "Save maintenance",

  historicoManutencoes:
    "Maintenance history",

  carregandoHistorico:
    "Loading history...",

  logsTitulo:
    "Machine logs",

  logsDesc:
    "History of automatically generated events",

  alertasTitulo:
    "Alerts",

  alertasDesc:
    "Events that require attention",

  nenhumLog:
    "No logs registered.",

  nenhumAlerta:
    "No alerts registered.",

  nenhumaManutencao:
    "No maintenance registered.",

  manutencaoSucesso:
    "Maintenance registered successfully!",

  erroCadastrarManutencao:
    "Error registering maintenance.",

  configDesc:
    "Customize the system language and visual theme.",

  idioma:
    "Language",

  tema:
    "Theme",

  claro:
    "Light",

  escuro:
    "Dark",

  gerenciarEmpresaTitle:
    "Manage company, employees and facial recognition",

  equipamentosEmpresa:
    "Your company's equipment",

  equipamentosIntro:
    "Register machines, industrial robots and other equipment in your operation. SteelControl organizes data and monitors temperature, production, cycles, energy, maintenance and alerts.",

  monitoramentoIndustrial:
    "Real-time industrial monitoring",

  historicoOperacional:
    "Operational history",

  manutencaoIntegrada:
    "Integrated maintenance",

  equipamentos:
    "Equipment",

  emOperacao:
    "In operation",

  emManutencao:
    "Under maintenance",

  comAlerta:
    "With alerts",

  gestaoEquipamentos:
    "Equipment management",

  cadastrarEquipamento:
    "Register new equipment",

  cadastrarEquipamentoTexto:
    "Enter the identification details. Monitoring will start automatically after registration.",

  novoEquipamento:
    "New equipment",

  cadastrarQualquerEquipamento:
    "Register any industrial equipment",

  cadastrarQualquerEquipamentoTexto:
    "Including robotic arms, conveyors, presses, lathes, cutting machines and custom equipment.",

  vaiCadastrarBraco:
    "Are you registering a robotic arm?",

  vaiCadastrarBracoTexto:
    "Automatically fill in an example and change only your equipment details.",

  usarModelo:
    "Use template",

  identificacaoEquipamento:
    "Equipment identification",

  nomeEquipamento:
    "Equipment name",

  nomeEquipamentoPlaceholder:
    "Ex: Robotic arm 01",

  setorLabel:
    "Sector",

  setorPlaceholder:
    "Ex: Automation",

  tipoEquipamento:
    "Equipment type",

  selecionarTipo:
    "Select type",

  bracoRobotico:
    "Robotic arm",

  roboIndustrial:
    "Industrial robot",

  esteiraIndustrial:
    "Industrial conveyor",

  prensa:
    "Press",

  torno:
    "Lathe",

  solda:
    "Welding",

  corte:
    "Cutting",

  embalagem:
    "Packaging",

  impressora3D:
    "3D printer",

  outro:
    "Other",

  modeloLabel:
    "Model",

  modeloPlaceholder:
    "Ex: RB-500",

  fabricanteLabel:
    "Manufacturer",

  fabricantePlaceholder:
    "Ex: ABB, KUKA, FANUC...",

  codigoLabel:
    "Code / Asset",

  codigoPlaceholder:
    "Ex: ROB-001",

  funcaoProcesso:
    "Function in the industrial process",

  descricaoEquipamento:
    "Description",

  descricaoEquipamentoPlaceholder:
    "Ex: Robotic arm responsible for moving and positioning parts on the automation line.",

  cancelarCadastro:
    "Cancel",

  cadastrarEquipamentoBotao:
    "Register equipment",

  parqueIndustrial:
    "Industrial equipment",

  equipamentosCadastrados:
    "Registered equipment",

  equipamentosCadastradosTexto:
    "View and access your company's equipment.",

  buscarEquipamento:
    "Search equipment...",

  todosTipos:
    "All types",

  robotica:
    "Robotics",

  esteiras:
    "Conveyors",

  prensas:
    "Presses",

  outros:
    "Others",

  todosStatus:
    "All statuses",

  carregandoEquipamentos:
    "Loading equipment...",

  fabricante:
    "Manufacturer",

  modelo:
    "Model",

  codigo:
    "Code",

  setor:
    "Sector",

  tipo:
    "Type",

  pecas:
    "parts",

  situacaoManutencao:
    "Maintenance status",

  abrirMonitoramento:
    "Open monitoring",

  nenhumEquipamento:
    "No equipment found",

  nenhumEquipamentoTexto:
    "Register a machine or robotic arm to start industrial monitoring.",

  erroCarregarEquipamentos:
    "Could not load equipment",

  erroBackend:
    "Check whether the SteelControl backend is running.",

  preenchendoRobo:
    "Robotic arm template filled in. Change the details according to your equipment.",

  erroCamposEquipamento:
    "Fill in all equipment details.",

  cadastrandoEquipamento:
    "Registering equipment...",

  equipamentoCadastrado:
    "Equipment registered successfully! Monitoring started.",

  erroCadastrarEquipamento:
    "Error registering equipment.",

  erroServidor:
    "Error connecting to the server.",

  ligado:
    "On",

  alertaStatus:
    "Alert",

  manutencaoStatus:
    "Maintenance",

  empresaTitulo:
    "My Company",

  empresaSubtitulo:
    "Manage company information, location, employees and security.",

  dadosEmpresa:
    "Company information",

  editarDados:
    "Edit information",

  salvarAlteracoes:
    "Save changes",

  telefone:
    "Phone",

  site:
    "Website",

  endereco:
    "Address",

  numero:
    "Number",

  complemento:
    "Additional information",

  bairro:
    "District",

  cidade:
    "City",

  estado:
    "State",

  pais:
    "Country",

  cep:
    "Postal code",

  localizacao:
    "Location",

  abrirMapa:
    "Open map",

  enderecoNaoCadastrado:
    "Address not registered",

  adicionarLocalizacao:
    "Add the company location.",

  funcionarios:
    "Employees",

  novoFuncionario:
    "New employee",

  totalFuncionarios:
    "Employees",

  totalComFacial:
    "With facial recognition",

  administradores:
    "Administrators",

  nomeFuncionario:
    "Name",

  cargoFuncionario:
    "Role",

  criarFuncionario:
    "Register employee",

  facialAtiva:
    "Facial recognition active",

  facialNaoCadastrada:
    "Facial recognition not registered",

  cadastrarFacial:
    "Register facial recognition",

  adicionarFacial:
    "Add facial sample",

  removerFaciais:
    "Remove facial samples",

  cargoAdministrador:
    "Administrator",

  cargoSupervisor:
    "Supervisor",

  cargoTecnico:
    "Technician",

  cargoOperador:
    "Operator",

  cargoVisitante:
    "Visitor"
};


// =========================================================
// ESPANHOL
// =========================================================

const ES = {

  ...EN,

  simulationMode: "Modo simulación",
  realIntegration: "Integración real",
  machineConnected: "Máquina conectada",
  machineOffline: "Máquina fuera de línea",
  liveTelemetry: "Datos en tiempo real",
  awaitingRealTelemetry: "Esperando telemetría real",
  connectionNotConfigured: "Conexión no configurada",
  simulationGeneratedData: "Datos generados por SteelControl",

  apiOffline: "API fuera de línea",
  erroApiTexto: "No se pudieron cargar los datos de la máquina.",
  statusAlertaTexto: "La máquina requiere atención.",
  statusManutencaoTexto: "La máquina está en mantenimiento.",
  statusOkTexto: "Operación normal.",
  verificarEnergia: "Verificar carga eléctrica",
  verificarSuperaquecimento: "Verificar sobrecalentamiento",

  manutencaoPreventivaNecessaria: "Mantenimiento preventivo necesario",

  usuario: "Usuario",
  cargo: "Cargo",
  sair: "Salir",
  confirmarSaidaTitulo: "¿Cerrar sesión?",
  confirmarSaidaMensagem: "¿Está seguro de que desea finalizar su sesión? Deberá iniciar sesión nuevamente para acceder a su empresa.",
  confirmarSaidaCancelar: "Permanecer conectado",
  confirmarSaidaAcao: "Cerrar sesión",
  voltar: "Volver",
  salvar: "Guardar",
  cancelar: "Cancelar",
  editar: "Editar",
  excluir: "Eliminar",
  fechar: "Cerrar",
  buscar: "Buscar",
  carregando: "Cargando...",
  naoInformado: "No informado",

  inicio: "Inicio",
  sobre: "Nosotros",
  recursos: "Recursos",
  seguranca: "Seguridad",
  tecnologia: "Tecnología",
  contato: "Contacto",

  maquinas: "Máquinas",
  producao: "Producción",
  manutencao: "Mantenimiento",
  alertas: "Alertas",
  configuracoes: "Configuración",

  minhaEmpresa: "Mi Empresa",

  entrar: "Entrar",
  entrarSistema: "Entrar al sistema",

  homeTituloPagina:
    "SteelControl | Gestión Industrial Inteligente",

  homePlataformaGestao:
    "Plataforma de gestión industrial",

  homeHeroTituloAntes:
    "Control industrial",

  homeHeroTituloDestaque:
    "inteligente",

  homeHeroTituloDepois:
    "en una sola plataforma.",

  homeHeroDescricao:
    "Monitorea máquinas, producción, mantenimiento, alertas, seguridad y equipos en tiempo real con una solución diseñada para entornos industriales.",

  homeConhecerPlataforma:
    "Conocer la plataforma",

  homeMonitoramentoTempoReal:
    "Monitoreo en tiempo real",

  homeSegurancaEmpresarial:
    "Seguridad empresarial",

  homeGestaoEquipes:
    "Gestión de equipos",

  homeAdministrador:
    "Administrador",

  homeEmpresaExemplo:
    "Empresa Ejemplo",

  homeTemperatura:
    "Temperatura",

  homeProducao:
    "Producción",

  homeCiclos:
    "Ciclos",

  homeEnergia:
    "Energía",

  homeHoje:
    "hoy",

  homeProducaoUltimasHoras:
    "Producción en las últimas horas",

  homeUltimas8Horas:
    "Últimas 8 horas",

  homeAlertasRecentes:
    "Alertas recientes",

  homeTemperaturaAlta:
    "Temperatura alta",

  homeMaquina03:
    "Máquina 03",

  homeManutencaoPreventiva:
    "Mantenimiento preventivo",

  homeMaquina07:
    "Máquina 07",

  homeConsumoElevado:
    "Carga elevada",

  homeMaquina02:
    "Máquina 02",

  homeVerAlertas:
    "Ver todas las alertas",

  homeMonitoramentoContinuo:
    "Monitoreo continuo",

  homeGestaoCentralizada:
    "Gestión centralizada",

  homeDadosOperacionais:
    "Datos operativos",

  homeMultiusuario:
    "Multiusuario",

  homeControleEquipes:
    "Control de equipos",

  homeSobreNos:
    "Sobre nosotros",

  homeSobreTitulo:
    "Tecnología creada para hacer más inteligente la gestión industrial.",

  homeSobreTexto1:
    "SteelControl nació con el objetivo de centralizar información importante de una operación industrial en un único entorno.",

  homeSobreTexto2:
    "Nuestra plataforma reúne monitoreo, producción, mantenimiento, seguridad, equipos e información empresarial, ofreciendo mayor visibilidad de la operación.",

  homeSobreTexto3:
    "La propuesta es permitir que las empresas acompañen sus procesos de forma simple, moderna y preparada para futuras integraciones con automatización industrial.",

  homeInteligenciaIndustrial:
    "Inteligencia industrial",

  homeMonitoramentoMaquinas:
    "Monitoreo de máquinas",

  homeControleProducao:
    "Control de producción",

  homeGestaoManutencao:
    "Gestión de mantenimiento",

  homeSegurancaBiometrica:
    "Seguridad biométrica",

  homeGestaoFuncionarios:
    "Gestión de empleados",

  homeIntegracaoAutomacao:
    "Integración con automatización",

  homeRecursosTitulo:
    "Todo lo que su operación necesita en un solo lugar.",

  homeRecursosTexto:
    "Una plataforma creada para centralizar la información principal de una operación industrial.",

  homeMaquinasTexto:
    "Registra y monitorea equipos, sectores, modelos, estados y datos operativos.",

  homeProducaoTexto:
    "Visualiza indicadores y monitorea la evolución de la productividad.",

  homeManutencaoTexto:
    "Registra mantenimientos preventivos y correctivos y consulta el historial.",

  homeAlertasTexto:
    "Identifica rápidamente situaciones que requieren atención del equipo.",

  homeEquipes:
    "Equipos",

  homeEquipesTexto:
    "Gestiona empleados, cargos, permisos y accesos empresariales.",

  homeReconhecimentoFacial:
    "Reconocimiento facial",

  homeReconhecimentoFacialTexto:
    "Autenticación biométrica integrada para añadir una capa extra de seguridad.",

  homeSegurancaTitulo:
    "Control de acceso preparado para entornos empresariales.",

  homeSegurancaTexto:
    "Cada empleado puede tener su propia cuenta y diferentes niveles de permisos.",

  homeCargosPermissoes:
    "Cargos y permisos",

  homeCargosPermissoesTexto:
    "Control de acceso por función.",

  homeEmpresasSeparadas:
    "Empresas separadas",

  homeEmpresasSeparadasTexto:
    "Datos organizados por empresa.",

  homeTecnologiaTitulo:
    "Tecnología preparada para crecer con la industria.",

  homeNodeTexto:
    "APIs y reglas",

  homePostgresTexto:
    "Base de datos",

  homePrismaTexto:
    "ORM moderno",

  homePythonTexto:
    "Visión computacional",

  homeIoTTexto:
    "Sensores y dispositivos",

  homeRobotica:
    "Robótica",

  homeRoboticaTexto:
    "Integración industrial",

  homePreparadoFuturo:
    "Preparado para el futuro",

  homeFuturoTitulo:
    "Sensores, automatización y robótica industrial.",

  homeFuturoTexto:
    "SteelControl fue diseñado para evolucionar junto con la operación industrial, permitiendo futuras integraciones con sensores, microcontroladores y equipos.",

  homeSensores:
    "Sensores",

  homeAutomacao:
    "Automatización",

  homeCtaTitulo:
    "Más control para su operación. Más información para sus decisiones.",

  homeCtaTexto:
    "Entra en la plataforma y monitorea tu operación industrial en un entorno centralizado y seguro.",

  homeEntrarSteelControl:
    "Entrar en SteelControl",

  homeConhecerMais:
    "Conocer más",

  homePlataforma:
    "Plataforma",

  homeEmpresa:
    "Empresa",

  homeContato:
    "Contacto",

  homeTodosDireitos:
    "Todos los derechos reservados.",

  alterarTema:
    "Cambiar tema",

  abrirMenu:
    "Abrir menú",

  loginAcessoEmpresarial:
    "Acceso empresarial",

  loginTitulo:
    "Accede a tu empresa",

  loginSubtitulo:
    "Entra al entorno industrial de tu organización y gestiona todo con SteelControl.",

  loginConfiancaTitulo:
    "Confía tu operación a SteelControl",

  loginConfiancaTexto:
    "Centraliza máquinas, producción, mantenimiento, alertas, equipos y seguridad en una sola plataforma.",

  emailLabel:
    "Correo electrónico",

  senhaLabel:
    "Contraseña",

  emailPlaceholder:
    "nombre@empresa.com",

  senhaPlaceholder:
    "Introduce tu contraseña",

  loginAcessarEmpresa:
    "Acceder a mi empresa",

  reconhecimentoFacial:
    "Reconocimiento facial",

  loginBiometria:
    "Entrar con biometría",

  loginEmpresaNaoEsta:
    "¿TU EMPRESA TODAVÍA NO ESTÁ AQUÍ?",

  loginLeveIndustria:
    "Lleva tu industria a SteelControl",

  loginCadastroDescricao:
    "Registra tu empresa y obtén un entorno propio para gestionar máquinas, empleados, seguridad, producción y mantenimiento.",

  monitoramentoCentralizado:
    "Monitoreo centralizado",

  gestaoEquipes:
    "Gestión de equipos",

  segurancaBiometrica:
    "Seguridad biométrica",

  cadastrarMinhaEmpresa:
    "Registrar mi empresa",

  novaOrganizacao:
    "Nueva organización",

  cadastrarEmpresaTitulo:
    "Registra tu empresa",

  cadastrarEmpresaSubtitulo:
    "Crea el entorno industrial de tu organización y registra al primer administrador.",

  primeiroAdministrador:
    "Primer administrador",

  primeiroAdministradorTexto:
    "Este usuario tendrá acceso administrativo para configurar tu empresa en SteelControl.",

  informacoesEmpresa:
    "Información de la empresa",

  nomeEmpresa:
    "Nombre de la empresa",

  nomeEmpresaPlaceholder:
    "Ej: SteelTech Industria",

  cnpj:
    "Identificación fiscal",

  administradorEmpresa:
    "Administrador de la empresa",

  nomeAdministrador:
    "Nombre del administrador",

  nomeAdministradorPlaceholder:
    "Tu nombre completo",

  emailCorporativo:
    "Correo corporativo",

  emailCorporativoPlaceholder:
    "admin@empresa.com",

  senhaCadastroPlaceholder:
    "Mínimo 6 caracteres",

  criarMinhaEmpresa:
    "Crear mi empresa",

  voltarLogin:
    "Volver al inicio de sesión",

  ambienteSeguro:
    "Entorno seguro",

  plataformaEmpresarial:
    "Plataforma empresarial",

  loginSideTituloAntes:
    "Tu industria",

  loginSideTituloDestaque:
    "conectada,",

  loginSideTituloDepois:
    "segura e inteligente.",

  loginSideTexto:
    "Tecnología para monitorear tu operación, mejorar procesos y transformar datos industriales en decisiones.",

  monitoramento:
    "Monitoreo",

  gestaoIndustrial:
    "Gestión industrial",

  loginInfoTitulo:
    "Todo el control de tu operación en un solo lugar.",

  loginInfoTexto:
    "Máquinas, registros, temperatura, producción, mantenimiento, alertas, equipos y autenticación integrados en una sola plataforma.",

  loginTecnologiaIndustrial:
    "Tecnología desarrollada para entornos industriales",

  faceTitulo:
    "Reconocimiento facial",

  facePrepareTitulo:
    "Prepárate para el reconocimiento facial",

  facePrepareTexto:
    "Centra tu rostro dentro del óvalo. El reconocimiento ocurre automáticamente.",

  faceAutomatico:
    "Reconocimiento automático — no es necesario pulsar ningún botón.",

  faceTexto:
    "Coloca tu rostro frente a la cámara",

  iniciandoCamera:
    "Iniciando cámara...",

  procurandoRosto:
    "Buscando rostro...",

  olharCamera:
    "Mira directamente a la cámara",

  cameraSomenteAutenticacao:
    "La cámara se utiliza únicamente durante la autenticación.",

  faceValidationAutomatic:
    "Validación automática",
  faceFlowSupervised:
    "Flujo biométrico supervisado",
  faceStepPositionTitle:
    "Posición inicial",
  faceStepPositionText:
    "Centre el rostro y mantenga el encuadre.",
  faceStepLivenessTitle:
    "Prueba de vida",
  faceStepLivenessText:
    "Mueva ligeramente la cabeza cuando se le indique.",
  faceStepReturnTitle:
    "Volver al centro",
  faceStepReturnText:
    "Mire nuevamente directamente a la cámara.",
  faceStepVerifyTitle:
    "Verificando identidad",
  faceStepVerifyText:
    "El backend confirma su identidad de forma segura.",

  loginSucesso:
    "¡Inicio de sesión exitoso!",

  erroLogin:
    "Correo o contraseña inválidos.",

  erroCampos:
    "Completa todos los campos.",

  dashboardTitulo:
    "Panel de Máquinas Industriales",

  dashboardSubtitulo:
    "Sistema de monitoreo en tiempo real",

  temperatura:
    "Temperatura",

  temperaturaDesc:
    "Temperatura actual de la máquina",

  producaoCard:
    "Producción",

  producaoDesc:
    "Piezas producidas",

  ciclos:
    "Ciclos",

  ciclosDesc:
    "Ciclos ejecutados",

  energia:
    "Energía",

  energiaDesc:
    "Percentual normalizado (0–100%)",

  producaoTempoReal:
    "Producción en tiempo real",

  situacaoMaquina:
    "Estado de la máquina",

  manutencaoResumo:
    "Mantenimiento",

  temperaturaMaquina:
    "Temperatura de la máquina",

  consumoEnergia:
    "Carga eléctrica (%)",

  maquinaSelecionada:
    "Máquina seleccionada",

  maquinaSelecionadaDesc:
    "Vista de la máquina monitoreada por el sistema",

  verDetalhes:
    "Ver detalles",

  producaoMaquina:
    "Producción de la máquina",

  producaoMaquinaDesc:
    "Seguimiento de producción en tiempo real",

  graficoProducao:
    "Gráfico de producción",

  resumoProdutivo:
    "Resumen productivo",

  totalProduzido:
    "Total producido:",

  ciclosExecutados:
    "Ciclos ejecutados:",

  manutencaoDesc:
    "Control de mantenimiento preventivo y correctivo de la máquina",

  ultimaManutencao:
    "Último mantenimiento",

  ultimaManutencaoDesc:
    "Registro más reciente",

  proximaManutencao:
    "Próximo mantenimiento",

  proximaManutencaoDesc:
    "Previsión preventiva",

  situacao:
    "Situación",

  situacaoDesc:
    "Estado actual",

  ciclosManutencaoDesc:
    "Base para revisión",

  cadastrarManutencao:
    "Registrar mantenimiento",

  tipoManutencao:
    "Tipo de mantenimiento",

  selecioneTipo:
    "Selecciona el tipo",

  preventiva:
    "Preventivo",

  corretiva:
    "Correctivo",

  nomeTecnico:
    "Nombre del técnico",

  responsavelAutenticado:
    "Responsable autenticado",

  responsavelSessaoAjuda:
    "Identificado por la cuenta conectada",

  logoFormatsHelp:
    "PNG, JPG, WEBP, GIF, AVIF o BMP • hasta 5 MB",

  nomeTecnicoPlaceholder:
    "Introduce el nombre del técnico",

  descricao:
    "Descripción",

  descricaoManutencaoPlaceholder:
    "Describe el servicio realizado",

  salvarManutencao:
    "Guardar mantenimiento",

  historicoManutencoes:
    "Historial de mantenimientos",

  carregandoHistorico:
    "Cargando historial...",

  logsTitulo:
    "Registros de la máquina",

  logsDesc:
    "Historial de eventos generados automáticamente",

  alertasTitulo:
    "Alertas",

  alertasDesc:
    "Eventos que requieren atención",

  nenhumLog:
    "No hay registros.",

  nenhumAlerta:
    "No hay alertas registradas.",

  nenhumaManutencao:
    "No hay mantenimientos registrados.",

  manutencaoSucesso:
    "¡Mantenimiento registrado correctamente!",

  erroCadastrarManutencao:
    "Error al registrar mantenimiento.",

  configDesc:
    "Personaliza el idioma y el tema visual del sistema.",

  idioma:
    "Idioma",

  tema:
    "Tema",

  claro:
    "Claro",

  escuro:
    "Oscuro",

  equipamentosEmpresa:
    "Equipos de tu empresa",

  equipamentosIntro:
    "Registra máquinas, robots industriales y otros equipos de tu operación. SteelControl organiza los datos y monitorea temperatura, producción, ciclos, energía, mantenimiento y alertas.",

  monitoramentoIndustrial:
    "Monitoreo industrial en tiempo real",

  historicoOperacional:
    "Historial operativo",

  manutencaoIntegrada:
    "Mantenimiento integrado",

  equipamentos:
    "Equipos",

  emOperacao:
    "En funcionamiento",

  emManutencao:
    "En mantenimiento",

  comAlerta:
    "Con alertas",

  gestaoEquipamentos:
    "Gestión de equipos",

  cadastrarEquipamento:
    "Registrar nuevo equipo",

  cadastrarEquipamentoTexto:
    "Introduce los datos de identificación. El monitoreo comenzará automáticamente después del registro.",

  novoEquipamento:
    "Nuevo equipo",

  cadastrarQualquerEquipamento:
    "Registra cualquier equipo industrial",

  cadastrarQualquerEquipamentoTexto:
    "Incluidos brazos robóticos, cintas, prensas, tornos, máquinas de corte y equipos personalizados.",

  vaiCadastrarBraco:
    "¿Vas a registrar un brazo robótico?",

  vaiCadastrarBracoTexto:
    "Completa automáticamente un ejemplo y modifica solo los datos de tu equipo.",

  usarModelo:
    "Usar modelo",

  identificacaoEquipamento:
    "Identificación del equipo",

  nomeEquipamento:
    "Nombre del equipo",

  nomeEquipamentoPlaceholder:
    "Ej: Brazo robótico 01",

  setorLabel:
    "Sector",

  setorPlaceholder:
    "Ej: Automatización",

  tipoEquipamento:
    "Tipo de equipo",

  selecionarTipo:
    "Selecciona el tipo",

  bracoRobotico:
    "Brazo robótico",

  roboIndustrial:
    "Robot industrial",

  esteiraIndustrial:
    "Cinta transportadora industrial",

  prensa:
    "Prensa",

  torno:
    "Torno",

  solda:
    "Soldadura",

  corte:
    "Corte",

  embalagem:
    "Embalaje",

  impressora3D:
    "Impresora 3D",

  outro:
    "Otro",

  modeloLabel:
    "Modelo",

  fabricanteLabel:
    "Fabricante",

  codigoLabel:
    "Código / Patrimonio",

  funcaoProcesso:
    "Función en el proceso industrial",

  descricaoEquipamento:
    "Descripción",

  cancelarCadastro:
    "Cancelar",

  cadastrarEquipamentoBotao:
    "Registrar equipo",

  parqueIndustrial:
    "Parque industrial",

  equipamentosCadastrados:
    "Equipos registrados",

  equipamentosCadastradosTexto:
    "Consulta y accede a los equipos de tu empresa.",

  buscarEquipamento:
    "Buscar equipo...",

  todosTipos:
    "Todos los tipos",

  robotica:
    "Robótica",

  esteiras:
    "Cintas",

  prensas:
    "Prensas",

  outros:
    "Otros",

  todosStatus:
    "Todos los estados",

  carregandoEquipamentos:
    "Cargando equipos...",

  fabricante:
    "Fabricante",

  modelo:
    "Modelo",

  codigo:
    "Código",

  setor:
    "Sector",

  tipo:
    "Tipo",

  pecas:
    "piezas",

  situacaoManutencao:
    "Estado de mantenimiento",

  abrirMonitoramento:
    "Abrir monitoreo",

  nenhumEquipamento:
    "No se encontraron equipos",

  nenhumEquipamentoTexto:
    "Registra una máquina o brazo robótico para iniciar el monitoreo industrial.",

  erroCarregarEquipamentos:
    "No se pudieron cargar los equipos",

  erroBackend:
    "Comprueba que el backend de SteelControl esté funcionando.",

  erroCamposEquipamento:
    "Completa todos los datos del equipo.",

  cadastrandoEquipamento:
    "Registrando equipo...",

  equipamentoCadastrado:
    "¡Equipo registrado correctamente! Monitoreo iniciado.",

  erroCadastrarEquipamento:
    "Error al registrar el equipo.",

  erroServidor:
    "Error al conectar con el servidor.",

  ligado:
    "Encendida",

  alertaStatus:
    "Alerta",

  manutencaoStatus:
    "Mantenimiento",

  empresaTitulo:
    "Mi Empresa",

  empresaSubtitulo:
    "Gestiona datos institucionales, ubicación, empleados y seguridad.",

  dadosEmpresa:
    "Datos de la empresa",

  editarDados:
    "Editar datos",

  salvarAlteracoes:
    "Guardar cambios",

  telefone:
    "Teléfono",

  endereco:
    "Dirección",

  numero:
    "Número",

  complemento:
    "Complemento",

  bairro:
    "Barrio",

  cidade:
    "Ciudad",

  estado:
    "Estado",

  pais:
    "País",

  cep:
    "Código postal",

  localizacao:
    "Ubicación",

  abrirMapa:
    "Abrir mapa",

  enderecoNaoCadastrado:
    "Dirección no registrada",

  adicionarLocalizacao:
    "Añade la ubicación de la empresa.",

  funcionarios:
    "Empleados",

  novoFuncionario:
    "Nuevo empleado",

  totalFuncionarios:
    "Empleados",

  totalComFacial:
    "Con reconocimiento facial",

  administradores:
    "Administradores",

  nomeFuncionario:
    "Nombre",

  cargoFuncionario:
    "Cargo",

  criarFuncionario:
    "Registrar empleado",

  facialAtiva:
    "Reconocimiento facial activo",

  facialNaoCadastrada:
    "Reconocimiento facial no registrado",

  cadastrarFacial:
    "Registrar reconocimiento facial",

  adicionarFacial:
    "Añadir muestra facial",

  removerFaciais:
    "Eliminar muestras faciales",

  cargoAdministrador:
    "Administrador",

  cargoSupervisor:
    "Supervisor",

  cargoTecnico:
    "Técnico",

  cargoOperador:
    "Operador",

  cargoVisitante:
    "Visitante"
};


// =========================================================
// FRANCÊS
// =========================================================

const FR = {

  ...EN,

  simulationMode: "Mode simulation",
  realIntegration: "Intégration réelle",
  machineConnected: "Machine connectée",
  machineOffline: "Machine hors ligne",
  liveTelemetry: "Données en temps réel",
  awaitingRealTelemetry: "En attente de télémétrie réelle",
  connectionNotConfigured: "Connexion non configurée",
  simulationGeneratedData: "Données générées par SteelControl",

  apiOffline: "API hors ligne",
  erroApiTexto: "Impossible de charger les données de la machine.",
  statusAlertaTexto: "La machine nécessite une attention.",
  statusManutencaoTexto: "La machine est en maintenance.",
  statusOkTexto: "Fonctionnement normal.",
  verificarEnergia: "Vérifier la charge électrique",
  verificarSuperaquecimento: "Vérifier la surchauffe",

  manutencaoPreventivaNecessaria: "Maintenance préventive nécessaire",

  usuario: "Utilisateur",
  cargo: "Rôle",
  sair: "Déconnexion",
  confirmarSaidaTitulo: "Se déconnecter ?",
  confirmarSaidaMensagem: "Voulez-vous vraiment fermer votre session ? Vous devrez vous reconnecter pour accéder à votre entreprise.",
  confirmarSaidaCancelar: "Rester connecté",
  confirmarSaidaAcao: "Se déconnecter",
  voltar: "Retour",
  salvar: "Enregistrer",
  cancelar: "Annuler",
  editar: "Modifier",
  excluir: "Supprimer",
  fechar: "Fermer",
  buscar: "Rechercher",
  carregando: "Chargement...",

  inicio: "Accueil",
  sobre: "À propos",
  recursos: "Fonctionnalités",
  seguranca: "Sécurité",
  tecnologia: "Technologie",
  contato: "Contact",

  maquinas: "Machines",
  producao: "Production",
  manutencao: "Maintenance",
  logs: "Journaux",
  alertas: "Alertes",
  configuracoes: "Paramètres",

  minhaEmpresa: "Mon entreprise",

  entrar: "Connexion",
  entrarSistema: "Se connecter",

  homeTituloPagina:
    "SteelControl | Gestion Industrielle Intelligente",

  homePlataformaGestao:
    "Plateforme de gestion industrielle",

  homeHeroTituloAntes:
    "Contrôle industriel",

  homeHeroTituloDestaque:
    "intelligent",

  homeHeroTituloDepois:
    "sur une seule plateforme.",

  homeHeroDescricao:
    "Surveillez les machines, la production, la maintenance, les alertes, la sécurité et les équipes en temps réel.",

  homeConhecerPlataforma:
    "Découvrir la plateforme",

  homeMonitoramentoTempoReal:
    "Surveillance en temps réel",

  homeSegurancaEmpresarial:
    "Sécurité d'entreprise",

  homeGestaoEquipes:
    "Gestion des équipes",

  homeTemperatura:
    "Température",

  homeProducao:
    "Production",

  homeCiclos:
    "Cycles",

  homeEnergia:
    "Énergie",

  homeHoje:
    "aujourd'hui",

  homeProducaoUltimasHoras:
    "Production des dernières heures",

  homeUltimas8Horas:
    "8 dernières heures",

  homeAlertasRecentes:
    "Alertes récentes",

  homeTemperaturaAlta:
    "Température élevée",

  homeManutencaoPreventiva:
    "Maintenance préventive",

  homeConsumoElevado:
    "Consommation élevée",

  homeVerAlertas:
    "Voir toutes les alertes",

  homeMonitoramentoContinuo:
    "Surveillance continue",

  homeGestaoCentralizada:
    "Gestion centralisée",

  homeDadosOperacionais:
    "Données opérationnelles",

  homeMultiusuario:
    "Multi-utilisateur",

  homeControleEquipes:
    "Contrôle des équipes",

  homeSobreNos:
    "À propos de nous",

  homeSobreTitulo:
    "Une technologie créée pour rendre la gestion industrielle plus intelligente.",

  homeInteligenciaIndustrial:
    "Intelligence industrielle",

  homeMonitoramentoMaquinas:
    "Surveillance des machines",

  homeControleProducao:
    "Contrôle de production",

  homeGestaoManutencao:
    "Gestion de la maintenance",

  homeSegurancaBiometrica:
    "Sécurité biométrique",

  homeGestaoFuncionarios:
    "Gestion des employés",

  homeIntegracaoAutomacao:
    "Intégration de l'automatisation",

  homeRecursosTitulo:
    "Tout ce dont votre activité a besoin au même endroit.",

  homeEquipes:
    "Équipes",

  homeReconhecimentoFacial:
    "Reconnaissance faciale",

  homeSegurancaTitulo:
    "Un contrôle d'accès conçu pour les environnements professionnels.",

  homeCargosPermissoes:
    "Rôles et autorisations",

  homeEmpresasSeparadas:
    "Entreprises séparées",

  homeTecnologiaTitulo:
    "Une technologie prête à évoluer avec l'industrie.",

  homePostgresTexto:
    "Base de données",

  homePythonTexto:
    "Vision par ordinateur",

  homeIoTTexto:
    "Capteurs et appareils",

  homeRobotica:
    "Robotique",

  homeRoboticaTexto:
    "Intégration industrielle",

  homePreparadoFuturo:
    "Prêt pour l'avenir",

  homeFuturoTitulo:
    "Capteurs, automatisation et robotique industrielle.",

  homeSensores:
    "Capteurs",

  homeAutomacao:
    "Automatisation",

  homeCtaTitulo:
    "Plus de contrôle pour votre activité. Plus d'informations pour vos décisions.",

  homeEntrarSteelControl:
    "Entrer dans SteelControl",

  homeConhecerMais:
    "En savoir plus",

  homePlataforma:
    "Plateforme",

  homeEmpresa:
    "Entreprise",

  homeContato:
    "Contact",

  homeTodosDireitos:
    "Tous droits réservés.",

  loginAcessoEmpresarial:
    "Accès entreprise",

  loginTitulo:
    "Accédez à votre entreprise",

  loginSubtitulo:
    "Accédez à l'environnement industriel de votre organisation avec SteelControl.",

  loginConfiancaTitulo:
    "Confiez votre activité à SteelControl",

  emailLabel:
    "E-mail",

  senhaLabel:
    "Mot de passe",

  senhaPlaceholder:
    "Saisissez votre mot de passe",

  loginAcessarEmpresa:
    "Accéder à mon entreprise",

  reconhecimentoFacial:
    "Reconnaissance faciale",

  loginBiometria:
    "Connexion biométrique",

  loginEmpresaNaoEsta:
    "VOTRE ENTREPRISE N'EST PAS ENCORE ICI ?",

  loginLeveIndustria:
    "Connectez votre industrie à SteelControl",

  cadastrarMinhaEmpresa:
    "Enregistrer mon entreprise",

  novaOrganizacao:
    "Nouvelle organisation",

  cadastrarEmpresaTitulo:
    "Enregistrez votre entreprise",

  primeiroAdministrador:
    "Premier administrateur",

  informacoesEmpresa:
    "Informations sur l'entreprise",

  nomeEmpresa:
    "Nom de l'entreprise",

  administradorEmpresa:
    "Administrateur de l'entreprise",

  nomeAdministrador:
    "Nom de l'administrateur",

  emailCorporativo:
    "E-mail professionnel",

  criarMinhaEmpresa:
    "Créer mon entreprise",

  voltarLogin:
    "Retour à la connexion",

  ambienteSeguro:
    "Environnement sécurisé",

  plataformaEmpresarial:
    "Plateforme professionnelle",

  loginSideTituloAntes:
    "Votre industrie",

  loginSideTituloDestaque:
    "connectée,",

  loginSideTituloDepois:
    "sécurisée et intelligente.",

  monitoramento:
    "Surveillance",

  gestaoIndustrial:
    "Gestion industrielle",

  faceTitulo:
    "Reconnaissance faciale",

  facePrepareTitulo:
    "Préparez-vous à la reconnaissance faciale",

  facePrepareTexto:
    "Centrez votre visage dans l’ovale. La reconnaissance se fait automatiquement.",

  faceAutomatico:
    "Reconnaissance automatique — aucun bouton n’est nécessaire.",

  faceValidationAutomatic:
    "Validation automatique",
  faceFlowSupervised:
    "Flux biométrique supervisé",
  faceStepPositionTitle:
    "Position initiale",
  faceStepPositionText:
    "Centrez votre visage et conservez le cadrage.",
  faceStepLivenessTitle:
    "Test de présence",
  faceStepLivenessText:
    "Bougez légèrement la tête lorsque cela est demandé.",
  faceStepReturnTitle:
    "Retour au centre",
  faceStepReturnText:
    "Regardez à nouveau directement la caméra.",
  faceStepVerifyTitle:
    "Vérification de l'identité",
  faceStepVerifyText:
    "Le backend confirme votre identité de manière sécurisée.",

  faceTexto:
    "Placez votre visage devant la caméra",

  iniciandoCamera:
    "Démarrage de la caméra...",

  procurandoRosto:
    "Recherche du visage...",

  olharCamera:
    "Regardez directement la caméra",

  loginSucesso:
    "Connexion réussie !",

  erroLogin:
    "E-mail ou mot de passe incorrect.",

  erroCampos:
    "Remplissez tous les champs.",

  dashboardTitulo:
    "Tableau de bord des machines industrielles",

  dashboardSubtitulo:
    "Système de surveillance en temps réel",

  temperatura:
    "Température",

  producaoCard:
    "Production",

  ciclos:
    "Cycles",

  energia:
    "Énergie",

  producaoTempoReal:
    "Production en temps réel",

  situacaoMaquina:
    "État de la machine",

  consumoEnergia:
    "Charge électrique (%)",

  maquinaSelecionada:
    "Machine sélectionnée",

  verDetalhes:
    "Voir les détails",

  producaoMaquina:
    "Production de la machine",

  graficoProducao:
    "Graphique de production",

  resumoProdutivo:
    "Résumé de production",

  totalProduzido:
    "Total produit :",

  ciclosExecutados:
    "Cycles exécutés :",

  ultimaManutencao:
    "Dernière maintenance",

  proximaManutencao:
    "Prochaine maintenance",

  situacao:
    "Situation",

  cadastrarManutencao:
    "Enregistrer une maintenance",

  tipoManutencao:
    "Type de maintenance",

  selecioneTipo:
    "Sélectionnez le type",

  preventiva:
    "Préventive",

  corretiva:
    "Corrective",

  nomeTecnico:
    "Nom du technicien",

  responsavelAutenticado:
    "Responsable authentifié",

  responsavelSessaoAjuda:
    "Identifié par le compte connecté",

  logoFormatsHelp:
    "PNG, JPG, WEBP, GIF, AVIF ou BMP • jusqu’à 5 Mo",

  descricao:
    "Description",

  salvarManutencao:
    "Enregistrer la maintenance",

  historicoManutencoes:
    "Historique des maintenances",

  logsTitulo:
    "Journaux de la machine",

  alertasTitulo:
    "Alertes",

  idioma:
    "Langue",

  tema:
    "Thème",

  claro:
    "Clair",

  escuro:
    "Sombre",

  equipamentosEmpresa:
    "Équipements de votre entreprise",

  monitoramentoIndustrial:
    "Surveillance industrielle en temps réel",

  equipamentos:
    "Équipements",

  emOperacao:
    "En fonctionnement",

  emManutencao:
    "En maintenance",

  comAlerta:
    "Avec alertes",

  gestaoEquipamentos:
    "Gestion des équipements",

  cadastrarEquipamento:
    "Ajouter un nouvel équipement",

  novoEquipamento:
    "Nouvel équipement",

  cadastrarQualquerEquipamento:
    "Enregistrez tout équipement industriel",

  vaiCadastrarBraco:
    "Vous enregistrez un bras robotisé ?",

  usarModelo:
    "Utiliser le modèle",

  identificacaoEquipamento:
    "Identification de l'équipement",

  nomeEquipamento:
    "Nom de l'équipement",

  setorLabel:
    "Secteur",

  tipoEquipamento:
    "Type d'équipement",

  selecionarTipo:
    "Sélectionnez le type",

  bracoRobotico:
    "Bras robotisé",

  roboIndustrial:
    "Robot industriel",

  esteiraIndustrial:
    "Convoyeur industriel",

  prensa:
    "Presse",

  torno:
    "Tour",

  solda:
    "Soudage",

  corte:
    "Découpe",

  embalagem:
    "Emballage",

  impressora3D:
    "Imprimante 3D",

  outro:
    "Autre",

  modeloLabel:
    "Modèle",

  fabricanteLabel:
    "Fabricant",

  codigoLabel:
    "Code / Actif",

  funcaoProcesso:
    "Fonction dans le processus industriel",

  descricaoEquipamento:
    "Description",

  cadastrarEquipamentoBotao:
    "Enregistrer l'équipement",

  parqueIndustrial:
    "Parc industriel",

  equipamentosCadastrados:
    "Équipements enregistrés",

  buscarEquipamento:
    "Rechercher un équipement...",

  todosTipos:
    "Tous les types",

  robotica:
    "Robotique",

  esteiras:
    "Convoyeurs",

  prensas:
    "Presses",

  outros:
    "Autres",

  todosStatus:
    "Tous les statuts",

  carregandoEquipamentos:
    "Chargement des équipements...",

  fabricante:
    "Fabricant",

  modelo:
    "Modèle",

  codigo:
    "Code",

  setor:
    "Secteur",

  tipo:
    "Type",

  pecas:
    "pièces",

  situacaoManutencao:
    "État de maintenance",

  abrirMonitoramento:
    "Ouvrir la surveillance",

  nenhumEquipamento:
    "Aucun équipement trouvé",

  erroServidor:
    "Erreur de connexion au serveur.",

  empresaTitulo:
    "Mon entreprise",

  empresaSubtitulo:
    "Gérez les informations, la localisation, les employés et la sécurité de l'entreprise.",

  dadosEmpresa:
    "Informations de l'entreprise",

  editarDados:
    "Modifier les informations",

  salvarAlteracoes:
    "Enregistrer les modifications",

  telefone:
    "Téléphone",

  endereco:
    "Adresse",

  numero:
    "Numéro",

  complemento:
    "Complément",

  bairro:
    "Quartier",

  cidade:
    "Ville",

  estado:
    "État / Région",

  pais:
    "Pays",

  cep:
    "Code postal",

  localizacao:
    "Localisation",

  abrirMapa:
    "Ouvrir la carte",

  funcionarios:
    "Employés",

  novoFuncionario:
    "Nouvel employé",

  totalFuncionarios:
    "Employés",

  totalComFacial:
    "Avec reconnaissance faciale",

  administradores:
    "Administrateurs",

  nomeFuncionario:
    "Nom",

  cargoFuncionario:
    "Rôle",

  criarFuncionario:
    "Enregistrer l'employé",

  facialAtiva:
    "Reconnaissance faciale active",

  facialNaoCadastrada:
    "Reconnaissance faciale non enregistrée",

  cadastrarFacial:
    "Enregistrer le visage",

  adicionarFacial:
    "Ajouter un visage",

  removerFaciais:
    "Supprimer les visages",

  cargoAdministrador:
    "Administrateur",

  cargoSupervisor:
    "Superviseur",

  cargoTecnico:
    "Technicien",

  cargoOperador:
    "Opérateur",

  cargoVisitante:
    "Visiteur"
};


// =========================================================
// ALEMÃO
// =========================================================

const DE = {

  ...EN,

  simulationMode: "Simulationsmodus",
  realIntegration: "Reale Integration",
  machineConnected: "Maschine verbunden",
  machineOffline: "Maschine offline",
  liveTelemetry: "Echtzeitdaten",
  awaitingRealTelemetry: "Warte auf reale Telemetrie",
  connectionNotConfigured: "Verbindung nicht konfiguriert",
  simulationGeneratedData: "Von SteelControl erzeugte Daten",

  apiOffline: "API offline",
  erroApiTexto: "Maschinendaten konnten nicht geladen werden.",
  statusAlertaTexto: "Die Maschine erfordert Aufmerksamkeit.",
  statusManutencaoTexto: "Die Maschine wird gewartet.",
  statusOkTexto: "Normalbetrieb.",
  verificarEnergia: "Elektrische Last prüfen",
  verificarSuperaquecimento: "Überhitzung prüfen",

  manutencaoPreventivaNecessaria: "Vorbeugende Wartung erforderlich",

  usuario: "Benutzer",
  cargo: "Rolle",
  sair: "Abmelden",
  confirmarSaidaTitulo: "Abmelden?",
  confirmarSaidaMensagem: "Möchten Sie Ihre Sitzung wirklich beenden? Sie müssen sich erneut anmelden, um auf Ihr Unternehmen zuzugreifen.",
  confirmarSaidaCancelar: "Angemeldet bleiben",
  confirmarSaidaAcao: "Abmelden",
  voltar: "Zurück",
  salvar: "Speichern",
  cancelar: "Abbrechen",
  editar: "Bearbeiten",
  excluir: "Löschen",
  fechar: "Schließen",
  buscar: "Suchen",
  carregando: "Wird geladen...",

  inicio: "Startseite",
  sobre: "Über uns",
  recursos: "Funktionen",
  seguranca: "Sicherheit",
  tecnologia: "Technologie",
  contato: "Kontakt",

  maquinas: "Maschinen",
  producao: "Produktion",
  manutencao: "Wartung",
  logs: "Protokolle",
  alertas: "Warnungen",
  configuracoes: "Einstellungen",

  minhaEmpresa: "Mein Unternehmen",

  entrar: "Anmelden",
  entrarSistema: "Anmelden",

  homeTituloPagina:
    "SteelControl | Intelligentes Industriemanagement",

  homePlataformaGestao:
    "Industrielle Managementplattform",

  homeHeroTituloAntes:
    "Industrielle Steuerung",

  homeHeroTituloDestaque:
    "intelligent",

  homeHeroTituloDepois:
    "auf einer einzigen Plattform.",

  homeHeroDescricao:
    "Überwachen Sie Maschinen, Produktion, Wartung, Warnungen, Sicherheit und Teams in Echtzeit.",

  homeConhecerPlataforma:
    "Plattform entdecken",

  homeMonitoramentoTempoReal:
    "Echtzeitüberwachung",

  homeSegurancaEmpresarial:
    "Unternehmenssicherheit",

  homeGestaoEquipes:
    "Teamverwaltung",

  homeAdministrador:
    "Administrator",

  homeEmpresaExemplo:
    "Beispielunternehmen",

  homeTemperatura:
    "Temperatur",

  homeProducao:
    "Produktion",

  homeCiclos:
    "Zyklen",

  homeEnergia:
    "Energie",

  homeHoje:
    "heute",

  homeProducaoUltimasHoras:
    "Produktion der letzten Stunden",

  homeUltimas8Horas:
    "Letzte 8 Stunden",

  homeAlertasRecentes:
    "Aktuelle Warnungen",

  homeTemperaturaAlta:
    "Hohe Temperatur",

  homeManutencaoPreventiva:
    "Vorbeugende Wartung",

  homeConsumoElevado:
    "Hoher Verbrauch",

  homeVerAlertas:
    "Alle Warnungen anzeigen",

  homeMonitoramentoContinuo:
    "Kontinuierliche Überwachung",

  homeGestaoCentralizada:
    "Zentralisierte Verwaltung",

  homeDadosOperacionais:
    "Betriebsdaten",

  homeMultiusuario:
    "Mehrbenutzer",

  homeControleEquipes:
    "Teamsteuerung",

  homeSobreNos:
    "Über uns",

  homeSobreTitulo:
    "Technologie für ein intelligenteres Industriemanagement.",

  homeInteligenciaIndustrial:
    "Industrielle Intelligenz",

  homeMonitoramentoMaquinas:
    "Maschinenüberwachung",

  homeControleProducao:
    "Produktionskontrolle",

  homeGestaoManutencao:
    "Wartungsmanagement",

  homeSegurancaBiometrica:
    "Biometrische Sicherheit",

  homeGestaoFuncionarios:
    "Mitarbeiterverwaltung",

  homeIntegracaoAutomacao:
    "Automatisierungsintegration",

  homeRecursosTitulo:
    "Alles, was Ihr Betrieb braucht, an einem Ort.",

  homeEquipes:
    "Teams",

  homeReconhecimentoFacial:
    "Gesichtserkennung",

  homeSegurancaTitulo:
    "Zugriffskontrolle für Unternehmensumgebungen.",

  homeCargosPermissoes:
    "Rollen und Berechtigungen",

  homeEmpresasSeparadas:
    "Getrennte Unternehmen",

  homeTecnologiaTitulo:
    "Technologie, die mit der Industrie wächst.",

  homePostgresTexto:
    "Datenbank",

  homePythonTexto:
    "Computer Vision",

  homeIoTTexto:
    "Sensoren und Geräte",

  homeRobotica:
    "Robotik",

  homeRoboticaTexto:
    "Industrielle Integration",

  homePreparadoFuturo:
    "Bereit für die Zukunft",

  homeFuturoTitulo:
    "Sensoren, Automatisierung und Industrierobotik.",

  homeSensores:
    "Sensoren",

  homeAutomacao:
    "Automatisierung",

  homeCtaTitulo:
    "Mehr Kontrolle für Ihren Betrieb. Mehr Informationen für Ihre Entscheidungen.",

  homeEntrarSteelControl:
    "SteelControl öffnen",

  homeConhecerMais:
    "Mehr erfahren",

  homePlataforma:
    "Plattform",

  homeEmpresa:
    "Unternehmen",

  homeContato:
    "Kontakt",

  homeTodosDireitos:
    "Alle Rechte vorbehalten.",

  loginAcessoEmpresarial:
    "Unternehmenszugang",

  loginTitulo:
    "Auf Ihr Unternehmen zugreifen",

  loginSubtitulo:
    "Öffnen Sie die industrielle Umgebung Ihres Unternehmens mit SteelControl.",

  loginConfiancaTitulo:
    "Vertrauen Sie Ihren Betrieb SteelControl an",

  emailLabel:
    "E-Mail",

  senhaLabel:
    "Passwort",

  senhaPlaceholder:
    "Geben Sie Ihr Passwort ein",

  loginAcessarEmpresa:
    "Auf mein Unternehmen zugreifen",

  reconhecimentoFacial:
    "Gesichtserkennung",

  loginBiometria:
    "Mit Biometrie anmelden",

  loginEmpresaNaoEsta:
    "IST IHR UNTERNEHMEN NOCH NICHT HIER?",

  loginLeveIndustria:
    "Bringen Sie Ihre Industrie zu SteelControl",

  cadastrarMinhaEmpresa:
    "Mein Unternehmen registrieren",

  cadastrarEmpresaTitulo:
    "Unternehmen registrieren",

  primeiroAdministrador:
    "Erster Administrator",

  informacoesEmpresa:
    "Unternehmensinformationen",

  nomeEmpresa:
    "Unternehmensname",

  administradorEmpresa:
    "Unternehmensadministrator",

  nomeAdministrador:
    "Name des Administrators",

  emailCorporativo:
    "Geschäftliche E-Mail",

  criarMinhaEmpresa:
    "Mein Unternehmen erstellen",

  voltarLogin:
    "Zurück zur Anmeldung",

  ambienteSeguro:
    "Sichere Umgebung",

  plataformaEmpresarial:
    "Unternehmensplattform",

  loginSideTituloAntes:
    "Ihre Industrie",

  loginSideTituloDestaque:
    "vernetzt,",

  loginSideTituloDepois:
    "sicher und intelligent.",

  monitoramento:
    "Überwachung",

  gestaoIndustrial:
    "Industriemanagement",

  faceTitulo:
    "Gesichtserkennung",

  facePrepareTitulo:
    "Bereiten Sie sich auf die Gesichtserkennung vor",

  facePrepareTexto:
    "Zentrieren Sie Ihr Gesicht im Oval. Die Erkennung erfolgt automatisch.",

  faceAutomatico:
    "Automatische Erkennung — Sie müssen keine Taste drücken.",

  faceValidationAutomatic:
    "Automatische Validierung",
  faceFlowSupervised:
    "Überwachter biometrischer Ablauf",
  faceStepPositionTitle:
    "Ausgangsposition",
  faceStepPositionText:
    "Zentrieren Sie Ihr Gesicht und halten Sie den Bildausschnitt.",
  faceStepLivenessTitle:
    "Lebenderkennung",
  faceStepLivenessText:
    "Bewegen Sie den Kopf leicht, wenn Sie dazu aufgefordert werden.",
  faceStepReturnTitle:
    "Zurück zur Mitte",
  faceStepReturnText:
    "Schauen Sie wieder direkt in die Kamera.",
  faceStepVerifyTitle:
    "Identität wird geprüft",
  faceStepVerifyText:
    "Das Backend bestätigt Ihre Identität sicher.",

  faceTexto:
    "Positionieren Sie Ihr Gesicht vor der Kamera",

  iniciandoCamera:
    "Kamera wird gestartet...",

  procurandoRosto:
    "Gesicht wird gesucht...",

  olharCamera:
    "Schauen Sie direkt in die Kamera",

  loginSucesso:
    "Anmeldung erfolgreich!",

  erroLogin:
    "Ungültige E-Mail oder Passwort.",

  erroCampos:
    "Füllen Sie alle Felder aus.",

  dashboardTitulo:
    "Dashboard für Industriemaschinen",

  dashboardSubtitulo:
    "Echtzeit-Überwachungssystem",

  temperatura:
    "Temperatur",

  producaoCard:
    "Produktion",

  ciclos:
    "Zyklen",

  energia:
    "Energie",

  producaoTempoReal:
    "Produktion in Echtzeit",

  situacaoMaquina:
    "Maschinenstatus",

  consumoEnergia:
    "Elektrische Last (%)",

  maquinaSelecionada:
    "Ausgewählte Maschine",

  verDetalhes:
    "Details anzeigen",

  producaoMaquina:
    "Maschinenproduktion",

  graficoProducao:
    "Produktionsdiagramm",

  resumoProdutivo:
    "Produktionsübersicht",

  totalProduzido:
    "Gesamt produziert:",

  ciclosExecutados:
    "Ausgeführte Zyklen:",

  ultimaManutencao:
    "Letzte Wartung",

  proximaManutencao:
    "Nächste Wartung",

  situacao:
    "Situation",

  cadastrarManutencao:
    "Wartung erfassen",

  tipoManutencao:
    "Wartungsart",

  selecioneTipo:
    "Typ auswählen",

  preventiva:
    "Vorbeugend",

  corretiva:
    "Korrektiv",

  nomeTecnico:
    "Name des Technikers",

  responsavelAutenticado:
    "Authentifizierter Verantwortlicher",

  responsavelSessaoAjuda:
    "Durch das angemeldete Konto identifiziert",

  logoFormatsHelp:
    "PNG, JPG, WEBP, GIF, AVIF oder BMP • bis 5 MB",

  descricao:
    "Beschreibung",

  salvarManutencao:
    "Wartung speichern",

  historicoManutencoes:
    "Wartungsverlauf",

  logsTitulo:
    "Maschinenprotokolle",

  alertasTitulo:
    "Warnungen",

  idioma:
    "Sprache",

  tema:
    "Design",

  claro:
    "Hell",

  escuro:
    "Dunkel",

  equipamentosEmpresa:
    "Ausrüstung Ihres Unternehmens",

  monitoramentoIndustrial:
    "Industrielle Echtzeitüberwachung",

  equipamentos:
    "Ausrüstung",

  emOperacao:
    "In Betrieb",

  emManutencao:
    "In Wartung",

  comAlerta:
    "Mit Warnungen",

  gestaoEquipamentos:
    "Geräteverwaltung",

  cadastrarEquipamento:
    "Neue Ausrüstung registrieren",

  novoEquipamento:
    "Neue Ausrüstung",

  cadastrarQualquerEquipamento:
    "Industrielle Ausrüstung registrieren",

  vaiCadastrarBraco:
    "Registrieren Sie einen Roboterarm?",

  usarModelo:
    "Vorlage verwenden",

  identificacaoEquipamento:
    "Geräteidentifikation",

  nomeEquipamento:
    "Gerätename",

  setorLabel:
    "Bereich",

  tipoEquipamento:
    "Gerätetyp",

  selecionarTipo:
    "Typ auswählen",

  bracoRobotico:
    "Roboterarm",

  roboIndustrial:
    "Industrieroboter",

  esteiraIndustrial:
    "Industrieförderband",

  prensa:
    "Presse",

  torno:
    "Drehmaschine",

  solda:
    "Schweißen",

  corte:
    "Schneiden",

  embalagem:
    "Verpackung",

  impressora3D:
    "3D-Drucker",

  outro:
    "Andere",

  modeloLabel:
    "Modell",

  fabricanteLabel:
    "Hersteller",

  codigoLabel:
    "Code / Inventar",

  funcaoProcesso:
    "Funktion im Industrieprozess",

  descricaoEquipamento:
    "Beschreibung",

  cadastrarEquipamentoBotao:
    "Ausrüstung registrieren",

  parqueIndustrial:
    "Industriepark",

  equipamentosCadastrados:
    "Registrierte Ausrüstung",

  buscarEquipamento:
    "Ausrüstung suchen...",

  todosTipos:
    "Alle Typen",

  robotica:
    "Robotik",

  esteiras:
    "Förderbänder",

  prensas:
    "Pressen",

  outros:
    "Andere",

  todosStatus:
    "Alle Status",

  carregandoEquipamentos:
    "Ausrüstung wird geladen...",

  fabricante:
    "Hersteller",

  modelo:
    "Modell",

  codigo:
    "Code",

  setor:
    "Bereich",

  tipo:
    "Typ",

  pecas:
    "Teile",

  situacaoManutencao:
    "Wartungsstatus",

  abrirMonitoramento:
    "Überwachung öffnen",

  nenhumEquipamento:
    "Keine Ausrüstung gefunden",

  erroServidor:
    "Fehler bei der Verbindung zum Server.",

  empresaTitulo:
    "Mein Unternehmen",

  dadosEmpresa:
    "Unternehmensdaten",

  editarDados:
    "Daten bearbeiten",

  salvarAlteracoes:
    "Änderungen speichern",

  telefone:
    "Telefon",

  endereco:
    "Adresse",

  numero:
    "Nummer",

  complemento:
    "Zusatz",

  bairro:
    "Bezirk",

  cidade:
    "Stadt",

  estado:
    "Bundesland",

  pais:
    "Land",

  cep:
    "Postleitzahl",

  localizacao:
    "Standort",

  abrirMapa:
    "Karte öffnen",

  funcionarios:
    "Mitarbeiter",

  novoFuncionario:
    "Neuer Mitarbeiter",

  totalFuncionarios:
    "Mitarbeiter",

  totalComFacial:
    "Mit Gesichtserkennung",

  administradores:
    "Administratoren",

  nomeFuncionario:
    "Name",

  cargoFuncionario:
    "Rolle",

  criarFuncionario:
    "Mitarbeiter registrieren",

  facialAtiva:
    "Gesichtserkennung aktiv",

  facialNaoCadastrada:
    "Gesichtserkennung nicht registriert",

  cadastrarFacial:
    "Gesicht registrieren",

  adicionarFacial:
    "Gesicht hinzufügen",

  removerFaciais:
    "Gesichter entfernen",

  cargoAdministrador:
    "Administrator",

  cargoSupervisor:
    "Supervisor",

  cargoTecnico:
    "Techniker",

  cargoOperador:
    "Bediener",

  cargoVisitante:
    "Besucher"
};


// =========================================================
// ITALIANO
// =========================================================

const IT = {

  ...EN,

  simulationMode: "Modalità simulazione",
  realIntegration: "Integrazione reale",
  machineConnected: "Macchina connessa",
  machineOffline: "Macchina offline",
  liveTelemetry: "Dati in tempo reale",
  awaitingRealTelemetry: "In attesa della telemetria reale",
  connectionNotConfigured: "Connessione non configurata",
  simulationGeneratedData: "Dati generati da SteelControl",

  apiOffline: "API offline",
  erroApiTexto: "Impossibile caricare i dati della macchina.",
  statusAlertaTexto: "La macchina richiede attenzione.",
  statusManutencaoTexto: "La macchina è in manutenzione.",
  statusOkTexto: "Funzionamento normale.",
  verificarEnergia: "Verificare il carico elettrico",
  verificarSuperaquecimento: "Verificare il surriscaldamento",

  manutencaoPreventivaNecessaria: "Manutenzione preventiva necessaria",

  usuario: "Utente",
  cargo: "Ruolo",
  sair: "Esci",
  confirmarSaidaTitulo: "Uscire dall’account?",
  confirmarSaidaMensagem: "Vuoi davvero terminare la sessione? Dovrai accedere nuovamente per entrare nella tua azienda.",
  confirmarSaidaCancelar: "Rimani connesso",
  confirmarSaidaAcao: "Esci dall’account",
  voltar: "Indietro",
  salvar: "Salva",
  cancelar: "Annulla",
  editar: "Modifica",
  excluir: "Elimina",
  fechar: "Chiudi",
  buscar: "Cerca",
  carregando: "Caricamento...",

  inicio: "Home",
  sobre: "Chi siamo",
  recursos: "Funzionalità",
  seguranca: "Sicurezza",
  tecnologia: "Tecnologia",
  contato: "Contatto",

  maquinas: "Macchine",
  producao: "Produzione",
  manutencao: "Manutenzione",
  logs: "Registri",
  alertas: "Avvisi",
  configuracoes: "Impostazioni",

  minhaEmpresa: "La mia azienda",

  entrar: "Accedi",
  entrarSistema: "Accedi",

  homeTituloPagina:
    "SteelControl | Gestione Industriale Intelligente",

  homePlataformaGestao:
    "Piattaforma di gestione industriale",

  homeHeroTituloAntes:
    "Controllo industriale",

  homeHeroTituloDestaque:
    "intelligente",

  homeHeroTituloDepois:
    "in un'unica piattaforma.",

  homeHeroDescricao:
    "Monitora macchine, produzione, manutenzione, avvisi, sicurezza e team in tempo reale.",

  homeConhecerPlataforma:
    "Scopri la piattaforma",

  homeMonitoramentoTempoReal:
    "Monitoraggio in tempo reale",

  homeSegurancaEmpresarial:
    "Sicurezza aziendale",

  homeGestaoEquipes:
    "Gestione dei team",

  homeAdministrador:
    "Amministratore",

  homeEmpresaExemplo:
    "Azienda Esempio",

  homeTemperatura:
    "Temperatura",

  homeProducao:
    "Produzione",

  homeCiclos:
    "Cicli",

  homeEnergia:
    "Energia",

  homeHoje:
    "oggi",

  homeProducaoUltimasHoras:
    "Produzione nelle ultime ore",

  homeUltimas8Horas:
    "Ultime 8 ore",

  homeAlertasRecentes:
    "Avvisi recenti",

  homeTemperaturaAlta:
    "Temperatura elevata",

  homeManutencaoPreventiva:
    "Manutenzione preventiva",

  homeConsumoElevado:
    "Consumo elevato",

  homeVerAlertas:
    "Visualizza tutti gli avvisi",

  homeMonitoramentoContinuo:
    "Monitoraggio continuo",

  homeGestaoCentralizada:
    "Gestione centralizzata",

  homeDadosOperacionais:
    "Dati operativi",

  homeMultiusuario:
    "Multiutente",

  homeControleEquipes:
    "Controllo dei team",

  homeSobreNos:
    "Chi siamo",

  homeSobreTitulo:
    "Tecnologia creata per rendere più intelligente la gestione industriale.",

  homeInteligenciaIndustrial:
    "Intelligenza industriale",

  homeMonitoramentoMaquinas:
    "Monitoraggio delle macchine",

  homeControleProducao:
    "Controllo della produzione",

  homeGestaoManutencao:
    "Gestione della manutenzione",

  homeSegurancaBiometrica:
    "Sicurezza biometrica",

  homeGestaoFuncionarios:
    "Gestione dei dipendenti",

  homeIntegracaoAutomacao:
    "Integrazione dell'automazione",

  homeRecursosTitulo:
    "Tutto ciò che serve alla tua attività in un unico posto.",

  homeEquipes:
    "Team",

  homeReconhecimentoFacial:
    "Riconoscimento facciale",

  homeSegurancaTitulo:
    "Controllo degli accessi pensato per gli ambienti aziendali.",

  homeCargosPermissoes:
    "Ruoli e autorizzazioni",

  homeEmpresasSeparadas:
    "Aziende separate",

  homeTecnologiaTitulo:
    "Tecnologia pronta a crescere con l'industria.",

  homePostgresTexto:
    "Database",

  homePythonTexto:
    "Visione artificiale",

  homeIoTTexto:
    "Sensori e dispositivi",

  homeRobotica:
    "Robotica",

  homeRoboticaTexto:
    "Integrazione industriale",

  homePreparadoFuturo:
    "Pronto per il futuro",

  homeFuturoTitulo:
    "Sensori, automazione e robotica industriale.",

  homeSensores:
    "Sensori",

  homeAutomacao:
    "Automazione",

  homeCtaTitulo:
    "Più controllo per la tua attività. Più informazioni per le tue decisioni.",

  homeEntrarSteelControl:
    "Entra in SteelControl",

  homeConhecerMais:
    "Scopri di più",

  homePlataforma:
    "Piattaforma",

  homeEmpresa:
    "Azienda",

  homeContato:
    "Contatto",

  homeTodosDireitos:
    "Tutti i diritti riservati.",

  loginAcessoEmpresarial:
    "Accesso aziendale",

  loginTitulo:
    "Accedi alla tua azienda",

  loginSubtitulo:
    "Accedi all'ambiente industriale della tua organizzazione con SteelControl.",

  loginConfiancaTitulo:
    "Affida la tua attività a SteelControl",

  emailLabel:
    "E-mail",

  senhaLabel:
    "Password",

  senhaPlaceholder:
    "Inserisci la password",

  loginAcessarEmpresa:
    "Accedi alla mia azienda",

  reconhecimentoFacial:
    "Riconoscimento facciale",

  loginBiometria:
    "Accedi con biometria",

  loginEmpresaNaoEsta:
    "LA TUA AZIENDA NON È ANCORA QUI?",

  loginLeveIndustria:
    "Porta la tua industria su SteelControl",

  cadastrarMinhaEmpresa:
    "Registra la mia azienda",

  cadastrarEmpresaTitulo:
    "Registra la tua azienda",

  primeiroAdministrador:
    "Primo amministratore",

  informacoesEmpresa:
    "Informazioni aziendali",

  nomeEmpresa:
    "Nome dell'azienda",

  administradorEmpresa:
    "Amministratore aziendale",

  nomeAdministrador:
    "Nome dell'amministratore",

  emailCorporativo:
    "E-mail aziendale",

  criarMinhaEmpresa:
    "Crea la mia azienda",

  voltarLogin:
    "Torna al login",

  ambienteSeguro:
    "Ambiente sicuro",

  plataformaEmpresarial:
    "Piattaforma aziendale",

  loginSideTituloAntes:
    "La tua industria",

  loginSideTituloDestaque:
    "connessa,",

  loginSideTituloDepois:
    "sicura e intelligente.",

  monitoramento:
    "Monitoraggio",

  gestaoIndustrial:
    "Gestione industriale",

  faceTitulo:
    "Riconoscimento facciale",

  facePrepareTitulo:
    "Preparati al riconoscimento facciale",

  facePrepareTexto:
    "Centra il viso all’interno dell’ovale. Il riconoscimento avviene automaticamente.",

  faceAutomatico:
    "Riconoscimento automatico — non è necessario premere alcun pulsante.",

  faceValidationAutomatic:
    "Validazione automatica",
  faceFlowSupervised:
    "Flusso biometrico supervisionato",
  faceStepPositionTitle:
    "Posizione iniziale",
  faceStepPositionText:
    "Centra il volto e mantieni l’inquadratura.",
  faceStepLivenessTitle:
    "Prova di vitalità",
  faceStepLivenessText:
    "Muovi leggermente la testa quando richiesto.",
  faceStepReturnTitle:
    "Ritorno al centro",
  faceStepReturnText:
    "Guarda di nuovo direttamente la fotocamera.",
  faceStepVerifyTitle:
    "Verifica identità",
  faceStepVerifyText:
    "Il backend conferma la tua identità in modo sicuro.",

  faceTexto:
    "Posiziona il volto davanti alla fotocamera",

  iniciandoCamera:
    "Avvio fotocamera...",

  procurandoRosto:
    "Ricerca volto...",

  olharCamera:
    "Guarda direttamente la fotocamera",

  loginSucesso:
    "Accesso effettuato!",

  erroLogin:
    "E-mail o password non validi.",

  erroCampos:
    "Compila tutti i campi.",

  dashboardTitulo:
    "Dashboard Macchine Industriali",

  dashboardSubtitulo:
    "Sistema di monitoraggio in tempo reale",

  temperatura:
    "Temperatura",

  producaoCard:
    "Produzione",

  ciclos:
    "Cicli",

  energia:
    "Energia",

  producaoTempoReal:
    "Produzione in tempo reale",

  situacaoMaquina:
    "Stato della macchina",

  consumoEnergia:
    "Carico elettrico (%)",

  maquinaSelecionada:
    "Macchina selezionata",

  verDetalhes:
    "Visualizza dettagli",

  producaoMaquina:
    "Produzione della macchina",

  graficoProducao:
    "Grafico di produzione",

  resumoProdutivo:
    "Riepilogo produttivo",

  totalProduzido:
    "Totale prodotto:",

  ciclosExecutados:
    "Cicli eseguiti:",

  ultimaManutencao:
    "Ultima manutenzione",

  proximaManutencao:
    "Prossima manutenzione",

  situacao:
    "Situazione",

  cadastrarManutencao:
    "Registra manutenzione",

  tipoManutencao:
    "Tipo di manutenzione",

  selecioneTipo:
    "Seleziona il tipo",

  preventiva:
    "Preventiva",

  corretiva:
    "Correttiva",

  nomeTecnico:
    "Nome del tecnico",

  responsavelAutenticado:
    "Responsabile autenticato",

  responsavelSessaoAjuda:
    "Identificato dall'account connesso",

  logoFormatsHelp:
    "PNG, JPG, WEBP, GIF, AVIF o BMP • fino a 5 MB",

  descricao:
    "Descrizione",

  salvarManutencao:
    "Salva manutenzione",

  historicoManutencoes:
    "Storico manutenzioni",

  logsTitulo:
    "Registri della macchina",

  alertasTitulo:
    "Avvisi",

  idioma:
    "Lingua",

  tema:
    "Tema",

  claro:
    "Chiaro",

  escuro:
    "Scuro",

  equipamentosEmpresa:
    "Attrezzature della tua azienda",

  monitoramentoIndustrial:
    "Monitoraggio industriale in tempo reale",

  equipamentos:
    "Attrezzature",

  emOperacao:
    "In funzione",

  emManutencao:
    "In manutenzione",

  comAlerta:
    "Con avvisi",

  gestaoEquipamentos:
    "Gestione delle attrezzature",

  cadastrarEquipamento:
    "Registra nuova attrezzatura",

  novoEquipamento:
    "Nuova attrezzatura",

  cadastrarQualquerEquipamento:
    "Registra qualsiasi attrezzatura industriale",

  vaiCadastrarBraco:
    "Stai registrando un braccio robotico?",

  usarModelo:
    "Usa modello",

  identificacaoEquipamento:
    "Identificazione dell'attrezzatura",

  nomeEquipamento:
    "Nome dell'attrezzatura",

  setorLabel:
    "Settore",

  tipoEquipamento:
    "Tipo di attrezzatura",

  selecionarTipo:
    "Seleziona il tipo",

  bracoRobotico:
    "Braccio robotico",

  roboIndustrial:
    "Robot industriale",

  esteiraIndustrial:
    "Nastro trasportatore industriale",

  prensa:
    "Pressa",

  torno:
    "Tornio",

  solda:
    "Saldatura",

  corte:
    "Taglio",

  embalagem:
    "Imballaggio",

  impressora3D:
    "Stampante 3D",

  outro:
    "Altro",

  modeloLabel:
    "Modello",

  fabricanteLabel:
    "Produttore",

  codigoLabel:
    "Codice / Patrimonio",

  funcaoProcesso:
    "Funzione nel processo industriale",

  descricaoEquipamento:
    "Descrizione",

  cadastrarEquipamentoBotao:
    "Registra attrezzatura",

  parqueIndustrial:
    "Parco industriale",

  equipamentosCadastrados:
    "Attrezzature registrate",

  buscarEquipamento:
    "Cerca attrezzatura...",

  todosTipos:
    "Tutti i tipi",

  robotica:
    "Robotica",

  esteiras:
    "Nastri",

  prensas:
    "Presse",

  outros:
    "Altri",

  todosStatus:
    "Tutti gli stati",

  carregandoEquipamentos:
    "Caricamento attrezzature...",

  fabricante:
    "Produttore",

  modelo:
    "Modello",

  codigo:
    "Codice",

  setor:
    "Settore",

  tipo:
    "Tipo",

  pecas:
    "pezzi",

  situacaoManutencao:
    "Stato manutenzione",

  abrirMonitoramento:
    "Apri monitoraggio",

  nenhumEquipamento:
    "Nessuna attrezzatura trovata",

  erroServidor:
    "Errore di connessione al server.",

  empresaTitulo:
    "La mia azienda",

  dadosEmpresa:
    "Dati aziendali",

  editarDados:
    "Modifica dati",

  salvarAlteracoes:
    "Salva modifiche",

  telefone:
    "Telefono",

  endereco:
    "Indirizzo",

  numero:
    "Numero",

  complemento:
    "Complemento",

  bairro:
    "Quartiere",

  cidade:
    "Città",

  estado:
    "Regione",

  pais:
    "Paese",

  cep:
    "CAP",

  localizacao:
    "Posizione",

  abrirMapa:
    "Apri mappa",

  funcionarios:
    "Dipendenti",

  novoFuncionario:
    "Nuovo dipendente",

  totalFuncionarios:
    "Dipendenti",

  totalComFacial:
    "Con riconoscimento facciale",

  administradores:
    "Amministratori",

  nomeFuncionario:
    "Nome",

  cargoFuncionario:
    "Ruolo",

  criarFuncionario:
    "Registra dipendente",

  facialAtiva:
    "Riconoscimento facciale attivo",

  facialNaoCadastrada:
    "Riconoscimento facciale non registrato",

  cadastrarFacial:
    "Registra volto",

  adicionarFacial:
    "Aggiungi volto",

  removerFaciais:
    "Rimuovi volti",

  cargoAdministrador:
    "Amministratore",

  cargoSupervisor:
    "Supervisore",

  cargoTecnico:
    "Tecnico",

  cargoOperador:
    "Operatore",

  cargoVisitante:
    "Visitatore"
};


// =========================================================
// OBJETO FINAL
// =========================================================

const traducoes = {
  pt: PT,
  en: EN,
  es: ES,
  fr: FR,
  de: DE,
  it: IT
};


// =========================================================
// TRADUÇÕES COMPLEMENTARES DO DESKTOP
// =========================================================
//
// Estas chaves cobrem textos que estavam escritos diretamente
// nos arquivos HTML. Assim a troca de idioma alcança também
// títulos, descrições e áreas que ainda não tinham data-i18n.
// =========================================================

const TRADUCOES_COMPLEMENTARES = {
  pt: {
    loginPageTitle: "Entrar | SteelControl",
    dashboardPageTitle: "SteelControl | Painel Industrial",
    machinesPageTitle: "Equipamentos | SteelControl",
    companyPageTitle: "Minha Empresa | SteelControl",
    desktopMonitoramentoAtivo: "Monitoramento ativo",
    desktopOperacaoIndustrial: "Operação Industrial",
    desktopAcompanhamentoMaquina: "Acompanhamento da máquina em tempo real",
    desktopSistemaOnline: "Sistema online",
    desktopAtualizacaoAutomatica: "Atualização automática",
    desktopVisaoGeral: "Visão geral da operação",
    desktopIndicadoresGerais: "Indicadores gerais de todas as máquinas cadastradas na empresa.",
    desktopDadosAtualizados: "Dados atualizados",
    desktopSaudeOperacao: "Saúde da operação",
    desktopResumoOperacional: "Resumo operacional",
    desktopEquipamentosEmpresa: "Equipamentos da sua empresa",
    desktopMinhaEmpresaDescricao: "Gerencie funcionários, dados institucionais, localização e métodos de autenticação da empresa.",
    desktopDadosInstitucionais: "Dados institucionais",
    desktopFuncionariosEmpresa: "Funcionários da empresa",
    desktopGestaoAcessos: "Gestão de acessos",
    desktopAlterarLogo: "Alterar logo",
    desktopOndeEstamos: "Onde estamos",
    desktopSessaoAtual: "Sessão atual",
    desktopUsuarioConectado: "Usuário conectado",
    desktopEntrarFacial: "Entrar com reconhecimento facial",
    desktopNovaEmpresa: "NOVA EMPRESA",
    desktopPrimeiroAcesso: "Primeiro acesso",
    desktopCriarEmpresaAdmin: "Criar empresa e administrador",
    desktopVoltarAcesso: "Voltar para o acesso"
  },
  en: {
    loginPageTitle: "Sign in | SteelControl",
    dashboardPageTitle: "SteelControl | Industrial Dashboard",
    machinesPageTitle: "Equipment | SteelControl",
    companyPageTitle: "My Company | SteelControl",
    desktopMonitoramentoAtivo: "Active monitoring",
    desktopOperacaoIndustrial: "Industrial Operation",
    desktopAcompanhamentoMaquina: "Real-time machine monitoring",
    desktopSistemaOnline: "System online",
    desktopAtualizacaoAutomatica: "Automatic updates",
    desktopVisaoGeral: "Operation overview",
    desktopIndicadoresGerais: "General indicators for all machines registered in the company.",
    desktopDadosAtualizados: "Data updated",
    desktopSaudeOperacao: "Operation health",
    desktopResumoOperacional: "Operational summary",
    desktopEquipamentosEmpresa: "Your company's equipment",
    desktopMinhaEmpresaDescricao: "Manage employees, institutional data, location and company authentication methods.",
    desktopDadosInstitucionais: "Company information",
    desktopFuncionariosEmpresa: "Company employees",
    desktopGestaoAcessos: "Access management",
    desktopAlterarLogo: "Change logo",
    desktopOndeEstamos: "Our location",
    desktopSessaoAtual: "Current session",
    desktopUsuarioConectado: "Signed-in user",
    desktopEntrarFacial: "Sign in with facial recognition",
    desktopNovaEmpresa: "NEW COMPANY",
    desktopPrimeiroAcesso: "First access",
    desktopCriarEmpresaAdmin: "Create company and administrator",
    desktopVoltarAcesso: "Back to sign in"
  },
  es: {
    loginPageTitle: "Iniciar sesión | SteelControl",
    dashboardPageTitle: "SteelControl | Panel Industrial",
    machinesPageTitle: "Equipos | SteelControl",
    companyPageTitle: "Mi Empresa | SteelControl",
    desktopMonitoramentoAtivo: "Monitoreo activo",
    desktopOperacaoIndustrial: "Operación Industrial",
    desktopAcompanhamentoMaquina: "Monitoreo de la máquina en tiempo real",
    desktopSistemaOnline: "Sistema en línea",
    desktopAtualizacaoAutomatica: "Actualización automática",
    desktopVisaoGeral: "Resumen de la operación",
    desktopIndicadoresGerais: "Indicadores generales de todas las máquinas registradas en la empresa.",
    desktopDadosAtualizados: "Datos actualizados",
    desktopSaudeOperacao: "Estado de la operación",
    desktopResumoOperacional: "Resumen operativo",
    desktopEquipamentosEmpresa: "Equipos de su empresa",
    desktopMinhaEmpresaDescricao: "Gestione empleados, datos institucionales, ubicación y métodos de autenticación de la empresa.",
    desktopDadosInstitucionais: "Datos institucionales",
    desktopFuncionariosEmpresa: "Empleados de la empresa",
    desktopGestaoAcessos: "Gestión de accesos",
    desktopAlterarLogo: "Cambiar logotipo",
    desktopOndeEstamos: "Dónde estamos",
    desktopSessaoAtual: "Sesión actual",
    desktopUsuarioConectado: "Usuario conectado",
    desktopEntrarFacial: "Entrar con reconocimiento facial",
    desktopNovaEmpresa: "NUEVA EMPRESA",
    desktopPrimeiroAcesso: "Primer acceso",
    desktopCriarEmpresaAdmin: "Crear empresa y administrador",
    desktopVoltarAcesso: "Volver al acceso"
  },
  fr: {
    loginPageTitle: "Connexion | SteelControl",
    dashboardPageTitle: "SteelControl | Tableau de bord industriel",
    machinesPageTitle: "Équipements | SteelControl",
    companyPageTitle: "Mon Entreprise | SteelControl",
    desktopMonitoramentoAtivo: "Surveillance active",
    desktopOperacaoIndustrial: "Opération industrielle",
    desktopAcompanhamentoMaquina: "Suivi de la machine en temps réel",
    desktopSistemaOnline: "Système en ligne",
    desktopAtualizacaoAutomatica: "Mise à jour automatique",
    desktopVisaoGeral: "Vue d'ensemble de l'opération",
    desktopIndicadoresGerais: "Indicateurs généraux de toutes les machines enregistrées dans l'entreprise.",
    desktopDadosAtualizados: "Données mises à jour",
    desktopSaudeOperacao: "État de l'opération",
    desktopResumoOperacional: "Résumé opérationnel",
    desktopEquipamentosEmpresa: "Équipements de votre entreprise",
    desktopMinhaEmpresaDescricao: "Gérez les employés, les données de l'entreprise, la localisation et les méthodes d'authentification.",
    desktopDadosInstitucionais: "Informations de l'entreprise",
    desktopFuncionariosEmpresa: "Employés de l'entreprise",
    desktopGestaoAcessos: "Gestion des accès",
    desktopAlterarLogo: "Modifier le logo",
    desktopOndeEstamos: "Notre localisation",
    desktopSessaoAtual: "Session actuelle",
    desktopUsuarioConectado: "Utilisateur connecté",
    desktopEntrarFacial: "Se connecter par reconnaissance faciale",
    desktopNovaEmpresa: "NOUVELLE ENTREPRISE",
    desktopPrimeiroAcesso: "Premier accès",
    desktopCriarEmpresaAdmin: "Créer l'entreprise et l'administrateur",
    desktopVoltarAcesso: "Retour à la connexion"
  },
  de: {
    loginPageTitle: "Anmelden | SteelControl",
    dashboardPageTitle: "SteelControl | Industrie-Dashboard",
    machinesPageTitle: "Geräte | SteelControl",
    companyPageTitle: "Mein Unternehmen | SteelControl",
    desktopMonitoramentoAtivo: "Aktive Überwachung",
    desktopOperacaoIndustrial: "Industriebetrieb",
    desktopAcompanhamentoMaquina: "Maschinenüberwachung in Echtzeit",
    desktopSistemaOnline: "System online",
    desktopAtualizacaoAutomatica: "Automatische Aktualisierung",
    desktopVisaoGeral: "Betriebsübersicht",
    desktopIndicadoresGerais: "Allgemeine Kennzahlen aller im Unternehmen registrierten Maschinen.",
    desktopDadosAtualizados: "Daten aktualisiert",
    desktopSaudeOperacao: "Betriebszustand",
    desktopResumoOperacional: "Betriebsübersicht",
    desktopEquipamentosEmpresa: "Ausrüstung Ihres Unternehmens",
    desktopMinhaEmpresaDescricao: "Verwalten Sie Mitarbeiter, Unternehmensdaten, Standort und Authentifizierungsmethoden.",
    desktopDadosInstitucionais: "Unternehmensdaten",
    desktopFuncionariosEmpresa: "Mitarbeiter des Unternehmens",
    desktopGestaoAcessos: "Zugriffsverwaltung",
    desktopAlterarLogo: "Logo ändern",
    desktopOndeEstamos: "Unser Standort",
    desktopSessaoAtual: "Aktuelle Sitzung",
    desktopUsuarioConectado: "Angemeldeter Benutzer",
    desktopEntrarFacial: "Mit Gesichtserkennung anmelden",
    desktopNovaEmpresa: "NEUES UNTERNEHMEN",
    desktopPrimeiroAcesso: "Erster Zugriff",
    desktopCriarEmpresaAdmin: "Unternehmen und Administrator erstellen",
    desktopVoltarAcesso: "Zurück zur Anmeldung"
  },
  it: {
    loginPageTitle: "Accedi | SteelControl",
    dashboardPageTitle: "SteelControl | Dashboard Industriale",
    machinesPageTitle: "Apparecchiature | SteelControl",
    companyPageTitle: "La Mia Azienda | SteelControl",
    desktopMonitoramentoAtivo: "Monitoraggio attivo",
    desktopOperacaoIndustrial: "Operazione industriale",
    desktopAcompanhamentoMaquina: "Monitoraggio della macchina in tempo reale",
    desktopSistemaOnline: "Sistema online",
    desktopAtualizacaoAutomatica: "Aggiornamento automatico",
    desktopVisaoGeral: "Panoramica dell'operazione",
    desktopIndicadoresGerais: "Indicatori generali di tutte le macchine registrate nell'azienda.",
    desktopDadosAtualizados: "Dati aggiornati",
    desktopSaudeOperacao: "Stato dell'operazione",
    desktopResumoOperacional: "Riepilogo operativo",
    desktopEquipamentosEmpresa: "Attrezzature della tua azienda",
    desktopMinhaEmpresaDescricao: "Gestisci dipendenti, dati aziendali, posizione e metodi di autenticazione.",
    desktopDadosInstitucionais: "Dati aziendali",
    desktopFuncionariosEmpresa: "Dipendenti dell'azienda",
    desktopGestaoAcessos: "Gestione accessi",
    desktopAlterarLogo: "Cambia logo",
    desktopOndeEstamos: "Dove siamo",
    desktopSessaoAtual: "Sessione corrente",
    desktopUsuarioConectado: "Utente connesso",
    desktopEntrarFacial: "Accedi con riconoscimento facciale",
    desktopNovaEmpresa: "NUOVA AZIENDA",
    desktopPrimeiroAcesso: "Primo accesso",
    desktopCriarEmpresaAdmin: "Crea azienda e amministratore",
    desktopVoltarAcesso: "Torna all'accesso"
  }
};

Object.entries(TRADUCOES_COMPLEMENTARES).forEach(([idioma, tabela]) => {
  Object.assign(traducoes[idioma], tabela);
});



const TRADUCOES_REFINAMENTO = {
  pt: {
    maintenanceCentralTitle: "Central de manutenção",
    maintenanceCentralDesc: "Registre intervenções e mantenha um histórico técnico rastreável da máquina selecionada.",
    maintenanceAdminOnly: "Administrador: arquivamento de registros habilitado",
    maintenanceFormHelp: "Registre uma manutenção realizada nesta máquina.",
    maintenanceHistoryHelp: "Linha do tempo das intervenções registradas para a máquina.",
    maintenanceTechnician: "Técnico",
    maintenanceDate: "Data",
    maintenanceAt: "às",
    maintenanceDelete: "Arquivar registro de manutenção",
    maintenanceDeleteTitle: "Arquivar registro de manutenção?",
    maintenanceDeleteAction: "Arquivar registro",
    maintenanceOnlyAdminDelete: "Somente administradores podem arquivar registros de manutenção.",
    maintenanceNoMachine: "Selecione uma máquina antes de arquivar o registro.",
    maintenanceDeleteConfirm: "Este registro será arquivado e deixará a lista ativa, mas continuará preservado no histórico de auditoria.",
    maintenanceDeleteError: "Não foi possível arquivar o registro de manutenção.",
    maintenanceDeleteSuccessTitle: "Registro arquivado",
    maintenanceDeleteSuccess: "Registro de manutenção arquivado com sucesso."
  },
  en: {
    maintenanceCentralTitle: "Maintenance center",
    maintenanceCentralDesc: "Register interventions and keep a traceable technical history for the selected machine.",
    maintenanceAdminOnly: "Administrator: record archiving enabled",
    maintenanceFormHelp: "Register maintenance performed on this machine.",
    maintenanceHistoryHelp: "Timeline of interventions registered for the machine.",
    maintenanceTechnician: "Technician",
    maintenanceDate: "Date",
    maintenanceAt: "at",
    maintenanceDelete: "Archive maintenance record",
    maintenanceDeleteTitle: "Archive maintenance record?",
    maintenanceDeleteAction: "Archive record",
    maintenanceOnlyAdminDelete: "Only administrators can archive maintenance records.",
    maintenanceNoMachine: "Select a machine before archiving the record.",
    maintenanceDeleteConfirm: "This record will be archived and removed from the active list, while remaining preserved in the audit history.",
    maintenanceDeleteError: "The maintenance record could not be archived.",
    maintenanceDeleteSuccessTitle: "Record archived",
    maintenanceDeleteSuccess: "Maintenance record archived successfully."
  },
  es: {
    maintenanceCentralTitle: "Centro de mantenimiento",
    maintenanceCentralDesc: "Registre intervenciones y mantenga un historial técnico trazable de la máquina seleccionada.",
    maintenanceAdminOnly: "Administrador: archivado de registros habilitado",
    maintenanceFormHelp: "Registre un mantenimiento realizado en esta máquina.",
    maintenanceHistoryHelp: "Línea de tiempo de las intervenciones registradas para la máquina.",
    maintenanceTechnician: "Técnico",
    maintenanceDate: "Fecha",
    maintenanceAt: "a las",
    maintenanceDelete: "Archivar registro de mantenimiento",
    maintenanceDeleteTitle: "¿Archivar registro de mantenimiento?",
    maintenanceDeleteAction: "Archivar registro",
    maintenanceOnlyAdminDelete: "Solo los administradores pueden archivar registros de mantenimiento.",
    maintenanceNoMachine: "Seleccione una máquina antes de archivar el registro.",
    maintenanceDeleteConfirm: "Este registro se archivará y saldrá de la lista activa, pero permanecerá preservado en el historial de auditoría.",
    maintenanceDeleteError: "No se pudo archivar el registro de mantenimiento.",
    maintenanceDeleteSuccessTitle: "Registro archivado",
    maintenanceDeleteSuccess: "Registro de mantenimiento archivado correctamente."
  },
  fr: {
    maintenanceCentralTitle: "Centre de maintenance",
    maintenanceCentralDesc: "Enregistrez les interventions et conservez un historique technique traçable de la machine sélectionnée.",
    maintenanceAdminOnly: "Administrateur : archivage des enregistrements activé",
    maintenanceFormHelp: "Enregistrez une maintenance effectuée sur cette machine.",
    maintenanceHistoryHelp: "Chronologie des interventions enregistrées pour la machine.",
    maintenanceTechnician: "Technicien",
    maintenanceDate: "Date",
    maintenanceAt: "à",
    maintenanceDelete: "Archiver l'enregistrement de maintenance",
    maintenanceDeleteTitle: "Archiver l'enregistrement de maintenance ?",
    maintenanceDeleteAction: "Archiver l'enregistrement",
    maintenanceOnlyAdminDelete: "Seuls les administrateurs peuvent archiver les enregistrements de maintenance.",
    maintenanceNoMachine: "Sélectionnez une machine avant d'archiver l'enregistrement.",
    maintenanceDeleteConfirm: "Cet enregistrement sera archivé et retiré de la liste active, tout en restant conservé dans l'historique d'audit.",
    maintenanceDeleteError: "Impossible d'archiver l'enregistrement de maintenance.",
    maintenanceDeleteSuccessTitle: "Enregistrement archivé",
    maintenanceDeleteSuccess: "Enregistrement de maintenance archivé."
  },
  de: {
    maintenanceCentralTitle: "Wartungszentrale",
    maintenanceCentralDesc: "Erfassen Sie Eingriffe und führen Sie eine nachvollziehbare technische Historie der ausgewählten Maschine.",
    maintenanceAdminOnly: "Administrator: Archivierung von Einträgen aktiviert",
    maintenanceFormHelp: "Erfassen Sie eine an dieser Maschine durchgeführte Wartung.",
    maintenanceHistoryHelp: "Zeitleiste der für die Maschine erfassten Eingriffe.",
    maintenanceTechnician: "Techniker",
    maintenanceDate: "Datum",
    maintenanceAt: "um",
    maintenanceDelete: "Wartungseintrag archivieren",
    maintenanceDeleteTitle: "Wartungseintrag archivieren?",
    maintenanceDeleteAction: "Eintrag archivieren",
    maintenanceOnlyAdminDelete: "Nur Administratoren können Wartungseinträge archivieren.",
    maintenanceNoMachine: "Wählen Sie eine Maschine aus, bevor Sie den Eintrag archivieren.",
    maintenanceDeleteConfirm: "Dieser Eintrag wird archiviert und aus der aktiven Liste entfernt, bleibt jedoch im Audit-Verlauf erhalten.",
    maintenanceDeleteError: "Der Wartungseintrag konnte nicht archiviert werden.",
    maintenanceDeleteSuccessTitle: "Eintrag archiviert",
    maintenanceDeleteSuccess: "Wartungseintrag erfolgreich archiviert."
  },
  it: {
    maintenanceCentralTitle: "Centro manutenzione",
    maintenanceCentralDesc: "Registra gli interventi e mantieni uno storico tecnico tracciabile della macchina selezionata.",
    maintenanceAdminOnly: "Amministratore: archiviazione dei registri abilitata",
    maintenanceFormHelp: "Registra una manutenzione eseguita su questa macchina.",
    maintenanceHistoryHelp: "Cronologia degli interventi registrati per la macchina.",
    maintenanceTechnician: "Tecnico",
    maintenanceDate: "Data",
    maintenanceAt: "alle",
    maintenanceDelete: "Archivia registro di manutenzione",
    maintenanceDeleteTitle: "Archiviare il registro di manutenzione?",
    maintenanceDeleteAction: "Archivia registro",
    maintenanceOnlyAdminDelete: "Solo gli amministratori possono archiviare i registri di manutenzione.",
    maintenanceNoMachine: "Seleziona una macchina prima di archiviare il registro.",
    maintenanceDeleteConfirm: "Questo registro verrà archiviato e rimosso dalla lista attiva, ma resterà conservato nello storico di audit.",
    maintenanceDeleteError: "Impossibile archiviare il registro di manutenzione.",
    maintenanceDeleteSuccessTitle: "Registro archiviato",
    maintenanceDeleteSuccess: "Registro di manutenzione archiviato."
  }
};

Object.entries(TRADUCOES_REFINAMENTO).forEach(([idioma, tabela]) => {
  Object.assign(traducoes[idioma], tabela);
});



const TRADUCOES_INGLES_COMPLETAS = {
  sim: "Yes",
  nao: "No",
  manutencaoTitulo: "Maintenance",
  cargoSupervisor: "Supervisor",
  modeloPlaceholder: "Example: RB-2000",
  fabricantePlaceholder: "Example: ABB, KUKA, FANUC, Universal Robots",
  codigoPlaceholder: "Example: ROB-001"
};

Object.assign(traducoes.en, TRADUCOES_INGLES_COMPLETAS);


const TRADUCOES_FR_COMPLEMENTARES = {
  homeCtaTexto:
    "Accédez à la plateforme et surveillez votre activité industrielle dans un environnement centralisé et sécurisé.",
  loginConfiancaTexto:
    "Centralisez les machines, la maintenance, la production, les équipes et la sécurité sur une seule plateforme.",
  loginCadastroDescricao:
    "Enregistrez votre organisation et commencez à structurer une gestion industrielle plus connectée, organisée et intelligente.",
  loginSideTexto:
    "Plus de contrôle, plus de sécurité et plus d'informations pour prendre de meilleures décisions.",
  loginInfoTitulo:
    "Accès sécurisé à votre environnement industriel",
  loginInfoTexto:
    "Utilisez votre compte d'entreprise ou la reconnaissance faciale pour vous authentifier.",
  loginTecnologiaIndustrial:
    "Technologie pour les environnements industriels",
  cameraSomenteAutenticacao:
    "La caméra est utilisée uniquement pendant l'authentification.",

  faceValidationAutomatic:
    "Validation automatique",
  faceFlowSupervised:
    "Flux biométrique supervisé",
  faceStepPositionTitle:
    "Position initiale",
  faceStepPositionText:
    "Centrez votre visage et conservez le cadrage.",
  faceStepLivenessTitle:
    "Test de présence",
  faceStepLivenessText:
    "Bougez légèrement la tête lorsque cela est demandé.",
  faceStepReturnTitle:
    "Retour au centre",
  faceStepReturnText:
    "Regardez à nouveau directement la caméra.",
  faceStepVerifyTitle:
    "Vérification de l'identité",
  faceStepVerifyText:
    "Le backend confirme votre identité de manière sécurisée.",
  empresaSubtitulo:
    "Gérez les employés, les données institutionnelles, la localisation et les méthodes d'authentification de l'entreprise.",
  equipamentosIntro:
    "Enregistrez des machines, des robots industriels et d'autres équipements de votre activité.",
  historicoOperacional:
    "Historique opérationnel",
  manutencaoIntegrada:
    "Maintenance intégrée",
  cadastrarEquipamentoTexto:
    "Enregistrez l'identification et, si vous le souhaitez, préparez la communication pour l'intégration avec l'équipement réel.",
  equipamentosCadastradosTexto:
    "Consultez et accédez aux équipements de votre entreprise.",
  nenhumEquipamentoTexto:
    "Aucun équipement enregistré.",
  erroCarregarEquipamentos:
    "Impossible de charger les équipements.",
  erroBackend:
    "Vérifiez que le backend SteelControl est en cours d'exécution.",
  gerenciarEmpresaTitle:
    "Gérer l'entreprise",
  configDesc:
    "Personnalisez SteelControl et gérez votre entreprise.",
  nomeTecnicoPlaceholder:
    "Saisissez le nom du technicien",
  descricaoManutencaoPlaceholder:
    "Décrivez le service effectué",
  manutencaoDesc:
    "Contrôle de la maintenance préventive et corrective de la machine",
  ultimaManutencaoDesc:
    "Enregistrement le plus récent",
  proximaManutencaoDesc:
    "Prévision préventive",
  situacaoDesc:
    "État actuel",
  ciclosManutencaoDesc:
    "Base pour la révision",
  carregandoHistorico:
    "Chargement de l'historique...",
  nenhumLog:
    "Aucun journal enregistré.",
  nenhumAlerta:
    "Aucune alerte enregistrée.",
  nenhumaManutencao:
    "Aucune maintenance enregistrée."
};

Object.assign(traducoes.fr, TRADUCOES_FR_COMPLEMENTARES);


Object.assign(traducoes.es, {
  homeCtaTexto:
    "Acceda a la plataforma y supervise su operación industrial en un entorno centralizado y seguro.",
  loginConfiancaTexto:
    "Centralice máquinas, mantenimiento, producción, equipos y seguridad en una sola plataforma.",
  loginCadastroDescricao:
    "Registre su organización y comience una gestión industrial más conectada, organizada e inteligente.",
  loginSideTexto:
    "Más control, más seguridad y más información para tomar mejores decisiones.",
  empresaSubtitulo:
    "Gestione empleados, datos institucionales, ubicación y métodos de autenticación de la empresa.",
  equipamentosCadastradosTexto:
    "Consulte y acceda a los equipos de su empresa.",
  configDesc:
    "Personalice SteelControl y gestione su empresa."
});

Object.assign(traducoes.de, {
  homeCtaTexto:
    "Greifen Sie auf die Plattform zu und überwachen Sie Ihren Industriebetrieb in einer zentralen und sicheren Umgebung.",
  loginConfiancaTexto:
    "Zentralisieren Sie Maschinen, Wartung, Produktion, Teams und Sicherheit auf einer einzigen Plattform.",
  loginCadastroDescricao:
    "Registrieren Sie Ihre Organisation und strukturieren Sie ein vernetztes, organisiertes und intelligentes Industriemanagement.",
  loginSideTexto:
    "Mehr Kontrolle, mehr Sicherheit und mehr Informationen für bessere Entscheidungen.",
  empresaSubtitulo:
    "Verwalten Sie Mitarbeiter, Unternehmensdaten, Standort und Authentifizierungsmethoden.",
  equipamentosCadastradosTexto:
    "Zeigen Sie die Geräte Ihres Unternehmens an und greifen Sie darauf zu.",
  configDesc:
    "Passen Sie SteelControl an und verwalten Sie Ihr Unternehmen."
});

Object.assign(traducoes.it, {
  homeCtaTexto:
    "Accedi alla piattaforma e monitora la tua attività industriale in un ambiente centralizzato e sicuro.",
  loginConfiancaTexto:
    "Centralizza macchine, manutenzione, produzione, team e sicurezza in un'unica piattaforma.",
  loginCadastroDescricao:
    "Registra la tua organizzazione e inizia una gestione industriale più connessa, organizzata e intelligente.",
  loginSideTexto:
    "Più controllo, più sicurezza e più informazioni per decisioni migliori.",
  empresaSubtitulo:
    "Gestisci dipendenti, dati aziendali, posizione e metodi di autenticazione.",
  equipamentosCadastradosTexto:
    "Consulta e accedi alle attrezzature della tua azienda.",
  configDesc:
    "Personalizza SteelControl e gestisci la tua azienda."
});

// =========================================================
// EXPERIÊNCIA DE ACESSO E CADASTRO
// =========================================================
// Textos usados pelas mensagens visuais de boas-vindas e pelos
// estados dinâmicos do fluxo de criação de conta.

const TRADUCOES_EXPERIENCIA_ACESSO = {
  pt: {
    loginWelcomeTitle: "Bem-vindo, {nome}!",
    loginWelcomeText: "Acesso confirmado. Estamos preparando o painel da sua empresa com segurança.",
    registerWelcomeTitle: "Bem-vindo ao SteelControl, {nome}!",
    registerWelcomeText: "Sua empresa foi criada e sua biometria foi protegida com sucesso. Tudo pronto para começar.",
    redirectingWorkspace: "Abrindo seu ambiente industrial...",
    emailConfirmedFaceNext: "E-mail confirmado. A conta ainda não foi criada; conclua a biometria facial para finalizar o cadastro.",
    registrationFaceRequired: "A conta só será criada depois que a biometria facial for concluída com sucesso.",
    registrationFaceRetry: "A conta ainda não foi criada. Posicione o rosto e tente novamente.",
    faceRegisteredTitle: "Cadastro concluído!",
    faceRegisteredText: "Biometria vinculada com segurança à sua conta.",
    resendCodeIn: "Reenviar código em {segundos}s",
    resendCode: "Reenviar código",
    sendingCode: "Enviando código para o e-mail informado...",
    codeSent: "Código enviado.",
    newCodeSent: "Novo código enviado.",
    invalidCodeLength: "Digite o código de 6 dígitos enviado para seu e-mail.",
    checkingIdentity: "Verificando identidade...",
    doNotMove: "Não se mova",
    faceRecognizedTitle: "Identidade confirmada!",
    faceRecognizedText: "Bem-vindo, {nome}. Seu acesso seguro foi autorizado.",
    cameraStarting: "Iniciando câmera...", cameraWait: "Aguarde alguns segundos",
    faceSearching: "Procurando rosto...", faceCenter: "Posicione seu rosto no centro da câmera",
    cameraUnavailable: "Câmera indisponível", cameraPermission: "Permita o acesso à câmera no navegador",
    movementConfirmed: "Movimento confirmado", lookFrontAgain: "Agora volte a olhar diretamente para a câmera.",
    livenessCheck: "Prova de vida", turnHead: "Vire levemente a cabeça para um dos lados.",
    turnHeadTimed: "Vire levemente a cabeça em até {segundos}s.",
    livenessMovementTimeoutRetry: "Prova de vida não detectada. Você não movimentou a cabeça a tempo. Faça o reconhecimento facial novamente.",
    retryFacialBiometric: "Refazer biometria facial",
    correctPosition: "Posição correta", stayStillCount: "Mantenha-se parado... {atual}/2",
    livenessComplete: "Prova de vida concluída", lookCameraCount: "Olhe para a câmera... {atual}/2",
    analysisFailed: "Falha na análise", checkPythonApi: "Verifique se a API Python está funcionando",
    adjustPosition: "Ajuste sua posição", validationFailed: "Não foi possível validar",
    ambiguousIdentity: "Identidade ambígua", faceNotRegistered: "Rosto não cadastrado",
    faceNotFoundSecurely: "Não encontramos este rosto com segurança. Entre com e-mail e senha.",
    face2faDescription: "Duas identidades ficaram muito próximas. Confirme o e-mail da sua conta para impedir acesso ao perfil errado.",
    face2faEmail: "E-mail da sua conta", face2faSend: "Enviar código", face2faCode: "Código de 6 dígitos",
    face2faVerify: "Confirmar identidade", face2faOtherEmail: "Usar outro e-mail",
    face2faSecurity: "O código expira em 5 minutos. Os perfis candidatos não são exibidos.",
    face2faSending: "Enviando código de confirmação...", face2faConfirming: "Confirmando identidade...",
    face2faInvalidEmail: "Informe o e-mail da sua conta.", face2faInvalidCode: "Digite o código de 6 dígitos."
  },
  en: {
    loginWelcomeTitle: "Welcome, {nome}!",
    loginWelcomeText: "Access confirmed. We are securely preparing your company's dashboard.",
    registerWelcomeTitle: "Welcome to SteelControl, {nome}!",
    registerWelcomeText: "Your company has been created and your biometric data was secured successfully. Everything is ready.",
    redirectingWorkspace: "Opening your industrial workspace...",
    emailConfirmedFaceNext: "Email confirmed. The account has not been created yet; complete facial biometrics to finish registration.",
    registrationFaceRequired: "The account will only be created after facial biometrics are completed successfully.",
    registrationFaceRetry: "The account has not been created yet. Position your face and try again.",
    faceRegisteredTitle: "Registration complete!",
    faceRegisteredText: "Biometric data securely linked to your account.",
    resendCodeIn: "Resend code in {segundos}s",
    resendCode: "Resend code",
    sendingCode: "Sending a code to the provided email...",
    codeSent: "Code sent.",
    newCodeSent: "New code sent.",
    invalidCodeLength: "Enter the 6-digit code sent to your email.",
    checkingIdentity: "Verifying identity...",
    doNotMove: "Do not move",
    faceRecognizedTitle: "Identity confirmed!",
    faceRecognizedText: "Welcome, {nome}. Your secure access has been authorized.",
    cameraStarting: "Starting camera...", cameraWait: "Please wait a few seconds",
    faceSearching: "Searching for a face...", faceCenter: "Position your face in the center of the camera",
    cameraUnavailable: "Camera unavailable", cameraPermission: "Allow camera access in your browser",
    movementConfirmed: "Movement confirmed", lookFrontAgain: "Now look directly at the camera again.",
    livenessCheck: "Liveness check", turnHead: "Turn your head slightly to one side.",
    turnHeadTimed: "Turn your head slightly within {segundos}s.",
    livenessMovementTimeoutRetry: "Liveness was not detected. You did not move your head in time. Start facial recognition again.",
    retryFacialBiometric: "Retry facial biometrics",
    correctPosition: "Correct position", stayStillCount: "Stay still... {atual}/2",
    livenessComplete: "Liveness check complete", lookCameraCount: "Look at the camera... {atual}/2",
    analysisFailed: "Analysis failed", checkPythonApi: "Make sure the Python API is running",
    adjustPosition: "Adjust your position", validationFailed: "Unable to validate",
    ambiguousIdentity: "Ambiguous identity", faceNotRegistered: "Face not registered",
    faceNotFoundSecurely: "We could not identify this face securely. Sign in with email and password.",
    face2faDescription: "Two identities were too close. Confirm your account email to prevent access to the wrong profile.",
    face2faEmail: "Your account email", face2faSend: "Send code", face2faCode: "6-digit code",
    face2faVerify: "Confirm identity", face2faOtherEmail: "Use another email",
    face2faSecurity: "The code expires in 5 minutes. Candidate profiles are not displayed.",
    face2faSending: "Sending confirmation code...", face2faConfirming: "Confirming identity...",
    face2faInvalidEmail: "Enter your account email.", face2faInvalidCode: "Enter the 6-digit code."
  },
  es: {
    loginWelcomeTitle: "¡Bienvenido, {nome}!",
    loginWelcomeText: "Acceso confirmado. Estamos preparando de forma segura el panel de su empresa.",
    registerWelcomeTitle: "¡Bienvenido a SteelControl, {nome}!",
    registerWelcomeText: "Su empresa fue creada y sus datos biométricos se protegieron correctamente. Todo está listo.",
    redirectingWorkspace: "Abriendo su entorno industrial...",
    emailConfirmedFaceNext: "Correo confirmado. La cuenta aún no fue creada; complete la biometría facial para finalizar el registro.",
    registrationFaceRequired: "La cuenta solo se creará después de completar correctamente la biometría facial.",
    registrationFaceRetry: "La cuenta aún no fue creada. Coloque el rostro e inténtelo de nuevo.",
    faceRegisteredTitle: "¡Registro completado!",
    faceRegisteredText: "Biometría vinculada de forma segura a su cuenta.",
    resendCodeIn: "Reenviar código en {segundos}s",
    resendCode: "Reenviar código",
    sendingCode: "Enviando un código al correo indicado...",
    codeSent: "Código enviado.",
    newCodeSent: "Nuevo código enviado.",
    invalidCodeLength: "Ingrese el código de 6 dígitos enviado a su correo.",
    checkingIdentity: "Verificando identidad...",
    doNotMove: "No se mueva",
    faceRecognizedTitle: "¡Identidad confirmada!",
    faceRecognizedText: "Bienvenido, {nome}. Su acceso seguro fue autorizado.",
    cameraStarting: "Iniciando cámara...", cameraWait: "Espere unos segundos",
    faceSearching: "Buscando rostro...", faceCenter: "Coloque su rostro en el centro de la cámara",
    cameraUnavailable: "Cámara no disponible", cameraPermission: "Permita el acceso a la cámara en el navegador",
    movementConfirmed: "Movimiento confirmado", lookFrontAgain: "Vuelva a mirar directamente a la cámara.",
    livenessCheck: "Prueba de vida", turnHead: "Gire ligeramente la cabeza hacia un lado.",
    turnHeadTimed: "Gire ligeramente la cabeza en un máximo de {segundos}s.",
    livenessMovementTimeoutRetry: "No se detectó la prueba de vida. No movió la cabeza a tiempo. Realice nuevamente el reconocimiento facial.",
    retryFacialBiometric: "Repetir biometría facial",
    correctPosition: "Posición correcta", stayStillCount: "Manténgase quieto... {atual}/2",
    livenessComplete: "Prueba de vida completada", lookCameraCount: "Mire a la cámara... {atual}/2",
    analysisFailed: "Error de análisis", checkPythonApi: "Compruebe que la API de Python esté funcionando",
    adjustPosition: "Ajuste su posición", validationFailed: "No fue posible validar",
    ambiguousIdentity: "Identidad ambigua", faceNotRegistered: "Rostro no registrado",
    faceNotFoundSecurely: "No pudimos identificar este rostro de forma segura. Ingrese con correo y contraseña.",
    face2faDescription: "Dos identidades quedaron demasiado próximas. Confirme el correo de su cuenta para evitar el acceso al perfil equivocado.",
    face2faEmail: "Correo de su cuenta", face2faSend: "Enviar código", face2faCode: "Código de 6 dígitos",
    face2faVerify: "Confirmar identidad", face2faOtherEmail: "Usar otro correo",
    face2faSecurity: "El código vence en 5 minutos. Los perfiles candidatos no se muestran.",
    face2faSending: "Enviando código de confirmación...", face2faConfirming: "Confirmando identidad...",
    face2faInvalidEmail: "Ingrese el correo de su cuenta.", face2faInvalidCode: "Ingrese el código de 6 dígitos."
  },
  fr: {
    loginWelcomeTitle: "Bienvenue, {nome} !",
    loginWelcomeText: "Accès confirmé. Nous préparons le tableau de bord de votre entreprise en toute sécurité.",
    registerWelcomeTitle: "Bienvenue sur SteelControl, {nome} !",
    registerWelcomeText: "Votre entreprise a été créée et vos données biométriques ont été sécurisées. Tout est prêt.",
    redirectingWorkspace: "Ouverture de votre environnement industriel...",
    emailConfirmedFaceNext: "E-mail confirmé. Le compte n'a pas encore été créé ; terminez la biométrie faciale pour finaliser l'inscription.",
    registrationFaceRequired: "Le compte ne sera créé qu'après la validation réussie de la biométrie faciale.",
    registrationFaceRetry: "Le compte n'a pas encore été créé. Positionnez votre visage et réessayez.",
    faceRegisteredTitle: "Inscription terminée !",
    faceRegisteredText: "Données biométriques associées à votre compte en toute sécurité.",
    resendCodeIn: "Renvoyer le code dans {segundos}s",
    resendCode: "Renvoyer le code",
    sendingCode: "Envoi d'un code à l'adresse indiquée...",
    codeSent: "Code envoyé.",
    newCodeSent: "Nouveau code envoyé.",
    invalidCodeLength: "Saisissez le code à 6 chiffres envoyé à votre adresse e-mail.",
    checkingIdentity: "Vérification de l'identité...",
    doNotMove: "Ne bougez pas",
    faceRecognizedTitle: "Identité confirmée !",
    faceRecognizedText: "Bienvenue, {nome}. Votre accès sécurisé a été autorisé.",
    cameraStarting: "Démarrage de la caméra...", cameraWait: "Veuillez patienter quelques secondes",
    faceSearching: "Recherche d'un visage...", faceCenter: "Placez votre visage au centre de la caméra",
    cameraUnavailable: "Caméra indisponible", cameraPermission: "Autorisez l'accès à la caméra dans le navigateur",
    movementConfirmed: "Mouvement confirmé", lookFrontAgain: "Regardez de nouveau directement la caméra.",
    livenessCheck: "Test de présence", turnHead: "Tournez légèrement la tête d'un côté.",
    turnHeadTimed: "Tournez légèrement la tête dans les {segundos}s.",
    livenessMovementTimeoutRetry: "La preuve de vie n'a pas été détectée. Vous n'avez pas bougé la tête à temps. Recommencez la reconnaissance faciale.",
    retryFacialBiometric: "Recommencer la biométrie faciale",
    correctPosition: "Position correcte", stayStillCount: "Restez immobile... {atual}/2",
    livenessComplete: "Test de présence terminé", lookCameraCount: "Regardez la caméra... {atual}/2",
    analysisFailed: "Échec de l'analyse", checkPythonApi: "Vérifiez que l'API Python fonctionne",
    adjustPosition: "Ajustez votre position", validationFailed: "Validation impossible",
    ambiguousIdentity: "Identité ambiguë", faceNotRegistered: "Visage non enregistré",
    faceNotFoundSecurely: "Nous n'avons pas pu identifier ce visage de manière sûre. Connectez-vous par e-mail et mot de passe.",
    face2faDescription: "Deux identités sont trop proches. Confirmez l’e-mail de votre compte pour éviter l’accès au mauvais profil.",
    face2faEmail: "E-mail de votre compte", face2faSend: "Envoyer le code", face2faCode: "Code à 6 chiffres",
    face2faVerify: "Confirmer l’identité", face2faOtherEmail: "Utiliser un autre e-mail",
    face2faSecurity: "Le code expire dans 5 minutes. Les profils candidats ne sont pas affichés.",
    face2faSending: "Envoi du code de confirmation...", face2faConfirming: "Confirmation de l’identité...",
    face2faInvalidEmail: "Saisissez l’e-mail de votre compte.", face2faInvalidCode: "Saisissez le code à 6 chiffres."
  },
  de: {
    loginWelcomeTitle: "Willkommen, {nome}!",
    loginWelcomeText: "Zugriff bestätigt. Das Dashboard Ihres Unternehmens wird sicher vorbereitet.",
    registerWelcomeTitle: "Willkommen bei SteelControl, {nome}!",
    registerWelcomeText: "Ihr Unternehmen wurde erstellt und Ihre biometrischen Daten wurden sicher geschützt. Alles ist bereit.",
    redirectingWorkspace: "Ihr industrieller Arbeitsbereich wird geöffnet...",
    emailConfirmedFaceNext: "E-Mail bestätigt. Das Konto wurde noch nicht erstellt; schließen Sie die Gesichtsbiometrie ab, um die Registrierung zu beenden.",
    registrationFaceRequired: "Das Konto wird erst nach erfolgreicher Gesichtsbiometrie erstellt.",
    registrationFaceRetry: "Das Konto wurde noch nicht erstellt. Positionieren Sie Ihr Gesicht und versuchen Sie es erneut.",
    faceRegisteredTitle: "Registrierung abgeschlossen!",
    faceRegisteredText: "Biometrische Daten wurden sicher mit Ihrem Konto verknüpft.",
    resendCodeIn: "Code in {segundos}s erneut senden",
    resendCode: "Code erneut senden",
    sendingCode: "Code wird an die angegebene E-Mail gesendet...",
    codeSent: "Code gesendet.",
    newCodeSent: "Neuer Code gesendet.",
    invalidCodeLength: "Geben Sie den 6-stelligen Code aus Ihrer E-Mail ein.",
    checkingIdentity: "Identität wird überprüft...",
    doNotMove: "Nicht bewegen",
    faceRecognizedTitle: "Identität bestätigt!",
    faceRecognizedText: "Willkommen, {nome}. Ihr sicherer Zugriff wurde autorisiert.",
    cameraStarting: "Kamera wird gestartet...", cameraWait: "Bitte warten Sie einige Sekunden",
    faceSearching: "Gesicht wird gesucht...", faceCenter: "Positionieren Sie Ihr Gesicht in der Mitte der Kamera",
    cameraUnavailable: "Kamera nicht verfügbar", cameraPermission: "Erlauben Sie den Kamerazugriff im Browser",
    movementConfirmed: "Bewegung bestätigt", lookFrontAgain: "Schauen Sie wieder direkt in die Kamera.",
    livenessCheck: "Lebenderkennung", turnHead: "Drehen Sie den Kopf leicht zu einer Seite.",
    turnHeadTimed: "Drehen Sie den Kopf innerhalb von {segundos}s leicht zur Seite.",
    livenessMovementTimeoutRetry: "Die Lebenderkennung wurde nicht bestätigt. Sie haben den Kopf nicht rechtzeitig bewegt. Starten Sie die Gesichtserkennung erneut.",
    retryFacialBiometric: "Gesichtsbiometrie erneut durchführen",
    correctPosition: "Korrekte Position", stayStillCount: "Stillhalten... {atual}/2",
    livenessComplete: "Lebenderkennung abgeschlossen", lookCameraCount: "In die Kamera schauen... {atual}/2",
    analysisFailed: "Analyse fehlgeschlagen", checkPythonApi: "Prüfen Sie, ob die Python-API läuft",
    adjustPosition: "Position anpassen", validationFailed: "Validierung nicht möglich",
    ambiguousIdentity: "Mehrdeutige Identität", faceNotRegistered: "Gesicht nicht registriert",
    faceNotFoundSecurely: "Dieses Gesicht konnte nicht sicher erkannt werden. Melden Sie sich mit E-Mail und Passwort an.",
    face2faDescription: "Zwei Identitäten lagen zu nah beieinander. Bestätigen Sie die E-Mail Ihres Kontos, um den Zugriff auf das falsche Profil zu verhindern.",
    face2faEmail: "E-Mail Ihres Kontos", face2faSend: "Code senden", face2faCode: "6-stelliger Code",
    face2faVerify: "Identität bestätigen", face2faOtherEmail: "Andere E-Mail verwenden",
    face2faSecurity: "Der Code läuft in 5 Minuten ab. Kandidatenprofile werden nicht angezeigt.",
    face2faSending: "Bestätigungscode wird gesendet...", face2faConfirming: "Identität wird bestätigt...",
    face2faInvalidEmail: "Geben Sie die E-Mail Ihres Kontos ein.", face2faInvalidCode: "Geben Sie den 6-stelligen Code ein."
  },
  it: {
    loginWelcomeTitle: "Benvenuto, {nome}!",
    loginWelcomeText: "Accesso confermato. Stiamo preparando in sicurezza la dashboard della tua azienda.",
    registerWelcomeTitle: "Benvenuto su SteelControl, {nome}!",
    registerWelcomeText: "La tua azienda è stata creata e i dati biometrici sono stati protetti. È tutto pronto.",
    redirectingWorkspace: "Apertura del tuo ambiente industriale...",
    emailConfirmedFaceNext: "E-mail confermata. L'account non è ancora stato creato; completa la biometria facciale per terminare la registrazione.",
    registrationFaceRequired: "L'account verrà creato solo dopo il completamento corretto della biometria facciale.",
    registrationFaceRetry: "L'account non è ancora stato creato. Posiziona il volto e riprova.",
    faceRegisteredTitle: "Registrazione completata!",
    faceRegisteredText: "Dati biometrici collegati in modo sicuro al tuo account.",
    resendCodeIn: "Invia nuovamente il codice tra {segundos}s",
    resendCode: "Invia nuovamente il codice",
    sendingCode: "Invio del codice all'e-mail indicata...",
    codeSent: "Codice inviato.",
    newCodeSent: "Nuovo codice inviato.",
    invalidCodeLength: "Inserisci il codice di 6 cifre inviato alla tua e-mail.",
    checkingIdentity: "Verifica dell'identità...",
    doNotMove: "Non muoverti",
    faceRecognizedTitle: "Identità confermata!",
    faceRecognizedText: "Benvenuto, {nome}. Il tuo accesso sicuro è stato autorizzato.",
    cameraStarting: "Avvio fotocamera...", cameraWait: "Attendi alcuni secondi",
    faceSearching: "Ricerca del volto...", faceCenter: "Posiziona il volto al centro della fotocamera",
    cameraUnavailable: "Fotocamera non disponibile", cameraPermission: "Consenti l'accesso alla fotocamera nel browser",
    movementConfirmed: "Movimento confermato", lookFrontAgain: "Guarda di nuovo direttamente la fotocamera.",
    livenessCheck: "Prova di vitalità", turnHead: "Gira leggermente la testa da un lato.",
    turnHeadTimed: "Gira leggermente la testa entro {segundos}s.",
    livenessMovementTimeoutRetry: "La prova di vitalità non è stata rilevata. Non hai mosso la testa in tempo. Ripeti il riconoscimento facciale.",
    retryFacialBiometric: "Ripeti biometria facciale",
    correctPosition: "Posizione corretta", stayStillCount: "Rimani fermo... {atual}/2",
    livenessComplete: "Prova di vitalità completata", lookCameraCount: "Guarda la fotocamera... {atual}/2",
    analysisFailed: "Analisi non riuscita", checkPythonApi: "Verifica che l'API Python sia in esecuzione",
    adjustPosition: "Regola la posizione", validationFailed: "Impossibile convalidare",
    ambiguousIdentity: "Identità ambigua", faceNotRegistered: "Volto non registrato",
    faceNotFoundSecurely: "Non è stato possibile identificare il volto in modo sicuro. Accedi con e-mail e password.",
    face2faDescription: "Due identità sono risultate troppo vicine. Conferma l’e-mail del tuo account per evitare l’accesso al profilo errato.",
    face2faEmail: "E-mail del tuo account", face2faSend: "Invia codice", face2faCode: "Codice a 6 cifre",
    face2faVerify: "Conferma identità", face2faOtherEmail: "Usa un’altra e-mail",
    face2faSecurity: "Il codice scade in 5 minuti. I profili candidati non vengono mostrati.",
    face2faSending: "Invio del codice di conferma...", face2faConfirming: "Conferma dell’identità...",
    face2faInvalidEmail: "Inserisci l’e-mail del tuo account.", face2faInvalidCode: "Inserisci il codice a 6 cifre."
  }
};

Object.entries(TRADUCOES_EXPERIENCIA_ACESSO).forEach(([idioma, tabela]) => {
  Object.assign(traducoes[idioma], tabela);
});

const STEEL_LITERAL_I18N = {
  "MÁQUINA SELECIONADA": {
    "en": "SELECTED MACHINE",
    "es": "MÁQUINA SELECCIONADA",
    "fr": "MACHINE SÉLECTIONNÉE",
    "de": "AUSGEWÄHLTE MASCHINE",
    "it": "MACCHINA SELEZIONATA"
  },
  "Carregando máquina...": {
    "en": "Loading machine...",
    "es": "Cargando máquina...",
    "fr": "Chargement de la machine...",
    "de": "Maschine wird geladen...",
    "it": "Caricamento macchina..."
  },
  "VISÃO GERAL": {
    "en": "OVERVIEW",
    "es": "VISTA GENERAL",
    "fr": "VUE D'ENSEMBLE",
    "de": "ÜBERSICHT",
    "it": "PANORAMICA"
  },
  "Cadastrados na empresa": {
    "en": "Registered in the company",
    "es": "Registrados en la empresa",
    "fr": "Enregistrés dans l'entreprise",
    "de": "Im Unternehmen registriert",
    "it": "Registrati nell'azienda"
  },
  "Funcionando normalmente": {
    "en": "Running normally",
    "es": "Funcionando normalmente",
    "fr": "Fonctionnement normal",
    "de": "Normaler Betrieb",
    "it": "Funzionamento normale"
  },
  "Em alerta": {
    "en": "In alert",
    "es": "En alerta",
    "fr": "En alerte",
    "de": "Alarmstatus",
    "it": "In allerta"
  },
  "Precisam de atenção": {
    "en": "Require attention",
    "es": "Requieren atención",
    "fr": "Nécessitent une attention",
    "de": "Benötigen Aufmerksamkeit",
    "it": "Richiedono attenzione"
  },
  "Equipamentos indisponíveis": {
    "en": "Unavailable equipment",
    "es": "Equipos no disponibles",
    "fr": "Équipements indisponibles",
    "de": "Nicht verfügbare Geräte",
    "it": "Attrezzature non disponibili"
  },
  "DESEMPENHO": {
    "en": "PERFORMANCE",
    "es": "RENDIMIENTO",
    "fr": "PERFORMANCE",
    "de": "LEISTUNG",
    "it": "PRESTAZIONI"
  },
  "Calculando condição geral...": {
    "en": "Calculating overall condition...",
    "es": "Calculando condición general...",
    "fr": "Calcul de l'état général...",
    "de": "Gesamtzustand wird berechnet...",
    "it": "Calcolo della condizione generale..."
  },
  "Operação normal": {
    "en": "Normal operation",
    "es": "Operación normal",
    "fr": "Fonctionnement normal",
    "de": "Normalbetrieb",
    "it": "Funzionamento normale"
  },
  "Atenção": {
    "en": "Attention",
    "es": "Atención",
    "fr": "Attention",
    "de": "Achtung",
    "it": "Attenzione"
  },
  "Crítico": {
    "en": "Critical",
    "es": "Crítico",
    "fr": "Critique",
    "de": "Kritisch",
    "it": "Critico"
  },
  "PRODUÇÃO": {
    "en": "PRODUCTION",
    "es": "PRODUCCIÓN",
    "fr": "PRODUCTION",
    "de": "PRODUKTION",
    "it": "PRODUZIONE"
  },
  "Produção total": {
    "en": "Total production",
    "es": "Producción total",
    "fr": "Production totale",
    "de": "Gesamtproduktion",
    "it": "Produzione totale"
  },
  "Consumo médio": {
    "en": "Average consumption",
    "es": "Consumo medio",
    "fr": "Consommation moyenne",
    "de": "Durchschnittsverbrauch",
    "it": "Consumo medio"
  },
  "energia": {
    "en": "energy",
    "es": "energía",
    "fr": "énergie",
    "de": "Energie",
    "it": "energia"
  },
  "Ciclos totais": {
    "en": "Total cycles",
    "es": "Ciclos totales",
    "fr": "Cycles totaux",
    "de": "Gesamtzyklen",
    "it": "Cicli totali"
  },
  "ciclos": {
    "en": "cycles",
    "es": "ciclos",
    "fr": "cycles",
    "de": "Zyklen",
    "it": "cicli"
  },
  "Temperatura média": {
    "en": "Average temperature",
    "es": "Temperatura media",
    "fr": "Température moyenne",
    "de": "Durchschnittstemperatur",
    "it": "Temperatura media"
  },
  "equipamentos": {
    "en": "equipment",
    "es": "equipos",
    "fr": "équipements",
    "de": "Geräte",
    "it": "attrezzature"
  },
  "Sensor": {
    "en": "Sensor",
    "es": "Sensor",
    "fr": "Capteur",
    "de": "Sensor",
    "it": "Sensore"
  },
  "Operação": {
    "en": "Operation",
    "es": "Operación",
    "fr": "Opération",
    "de": "Betrieb",
    "it": "Operazione"
  },
  "Consumo": {
    "en": "Consumption",
    "es": "Consumo",
    "fr": "Consommation",
    "de": "Verbrauch",
    "it": "Consumo"
  },
  "Evolução da produtividade da máquina": {
    "en": "Machine productivity evolution",
    "es": "Evolución de la productividad de la máquina",
    "fr": "Évolution de la productivité de la machine",
    "de": "Entwicklung der Maschinenproduktivität",
    "it": "Evoluzione della produttività della macchina"
  },
  "AO VIVO": {
    "en": "LIVE",
    "es": "EN VIVO",
    "fr": "EN DIRECT",
    "de": "LIVE",
    "it": "LIVE"
  },
  "Diagnóstico": {
    "en": "Diagnostics",
    "es": "Diagnóstico",
    "fr": "Diagnostic",
    "de": "Diagnose",
    "it": "Diagnostica"
  },
  "Condição operacional": {
    "en": "Operational condition",
    "es": "Condición operativa",
    "fr": "Condition opérationnelle",
    "de": "Betriebszustand",
    "it": "Condizione operativa"
  },
  "Situação atual": {
    "en": "Current status",
    "es": "Situación actual",
    "fr": "Situation actuelle",
    "de": "Aktueller Zustand",
    "it": "Situazione attuale"
  },
  "Status da máquina": {
    "en": "Machine status",
    "es": "Estado de la máquina",
    "fr": "État de la machine",
    "de": "Maschinenstatus",
    "it": "Stato della macchina"
  },
  "Ver manutenção": {
    "en": "View maintenance",
    "es": "Ver mantenimiento",
    "fr": "Voir la maintenance",
    "de": "Wartung anzeigen",
    "it": "Vedi manutenzione"
  },
  "Análise operacional": {
    "en": "Operational analysis",
    "es": "Análisis operativo",
    "fr": "Analyse opérationnelle",
    "de": "Betriebsanalyse",
    "it": "Analisi operativa"
  },
  "Indicadores da máquina": {
    "en": "Machine indicators",
    "es": "Indicadores de la máquina",
    "fr": "Indicateurs de la machine",
    "de": "Maschinenkennzahlen",
    "it": "Indicatori della macchina"
  },
  "Sensor térmico": {
    "en": "Thermal sensor",
    "es": "Sensor térmico",
    "fr": "Capteur thermique",
    "de": "Temperatursensor",
    "it": "Sensore termico"
  },
  "Eficiência": {
    "en": "Efficiency",
    "es": "Eficiencia",
    "fr": "Efficacité",
    "de": "Effizienz",
    "it": "Efficienza"
  },
  "Acessos rápidos": {
    "en": "Quick access",
    "es": "Accesos rápidos",
    "fr": "Accès rapides",
    "de": "Schnellzugriff",
    "it": "Accessi rapidi"
  },
  "Máquina": {
    "en": "Machine",
    "es": "Máquina",
    "fr": "Machine",
    "de": "Maschine",
    "it": "Macchina"
  },
  "Visualizar informações": {
    "en": "View information",
    "es": "Ver información",
    "fr": "Voir les informations",
    "de": "Informationen anzeigen",
    "it": "Visualizza informazioni"
  },
  "Histórico e registros": {
    "en": "History and records",
    "es": "Historial y registros",
    "fr": "Historique et enregistrements",
    "de": "Historie und Einträge",
    "it": "Storico e registri"
  },
  "Ocorrências da máquina": {
    "en": "Machine events",
    "es": "Eventos de la máquina",
    "fr": "Événements de la machine",
    "de": "Maschinenereignisse",
    "it": "Eventi della macchina"
  },
  "Personalize o SteelControl e gerencie sua empresa.": {
    "en": "Customize SteelControl and manage your company.",
    "es": "Personalice SteelControl y gestione su empresa.",
    "fr": "Personnalisez SteelControl et gérez votre entreprise.",
    "de": "Passen Sie SteelControl an und verwalten Sie Ihr Unternehmen.",
    "it": "Personalizza SteelControl e gestisci la tua azienda."
  },
  "Personalização": {
    "en": "Customization",
    "es": "Personalización",
    "fr": "Personnalisation",
    "de": "Personalisierung",
    "it": "Personalizzazione"
  },
  "Aparência": {
    "en": "Appearance",
    "es": "Apariencia",
    "fr": "Apparence",
    "de": "Darstellung",
    "it": "Aspetto"
  },
  "Escolha o idioma e o tema visual do sistema.": {
    "en": "Choose the system language and visual theme.",
    "es": "Elija el idioma y el tema visual del sistema.",
    "fr": "Choisissez la langue et le thème visuel du système.",
    "de": "Wählen Sie Sprache und Design des Systems.",
    "it": "Scegli la lingua e il tema visivo del sistema."
  },
  "Idioma": {
    "en": "Language",
    "es": "Idioma",
    "fr": "Langue",
    "de": "Sprache",
    "it": "Lingua"
  },
  "Idioma utilizado na interface": {
    "en": "Language used in the interface",
    "es": "Idioma utilizado en la interfaz",
    "fr": "Langue utilisée dans l'interface",
    "de": "In der Oberfläche verwendete Sprache",
    "it": "Lingua usata nell'interfaccia"
  },
  "Tema": {
    "en": "Theme",
    "es": "Tema",
    "fr": "Thème",
    "de": "Design",
    "it": "Tema"
  },
  "Aparência geral do SteelControl": {
    "en": "SteelControl overall appearance",
    "es": "Apariencia general de SteelControl",
    "fr": "Apparence générale de SteelControl",
    "de": "Allgemeines Erscheinungsbild von SteelControl",
    "it": "Aspetto generale di SteelControl"
  },
  "Claro": {
    "en": "Light",
    "es": "Claro",
    "fr": "Clair",
    "de": "Hell",
    "it": "Chiaro"
  },
  "Escuro": {
    "en": "Dark",
    "es": "Oscuro",
    "fr": "Sombre",
    "de": "Dunkel",
    "it": "Scuro"
  },
  "Organização": {
    "en": "Organization",
    "es": "Organización",
    "fr": "Organisation",
    "de": "Organisation",
    "it": "Organizzazione"
  },
  "Informações da empresa vinculada à sua conta.": {
    "en": "Company information linked to your account.",
    "es": "Información de la empresa vinculada a su cuenta.",
    "fr": "Informations de l'entreprise liées à votre compte.",
    "de": "Mit Ihrem Konto verknüpfte Unternehmensinformationen.",
    "it": "Informazioni dell'azienda collegate al tuo account."
  },
  "Empresa": {
    "en": "Company",
    "es": "Empresa",
    "fr": "Entreprise",
    "de": "Unternehmen",
    "it": "Azienda"
  },
  "Empresa ativa": {
    "en": "Active company",
    "es": "Empresa activa",
    "fr": "Entreprise active",
    "de": "Aktives Unternehmen",
    "it": "Azienda attiva"
  },
  "Funcionários": {
    "en": "Employees",
    "es": "Empleados",
    "fr": "Employés",
    "de": "Mitarbeiter",
    "it": "Dipendenti"
  },
  "Com facial": {
    "en": "With face ID",
    "es": "Con reconocimiento facial",
    "fr": "Avec reconnaissance faciale",
    "de": "Mit Gesichtserkennung",
    "it": "Con riconoscimento facciale"
  },
  "Gerenciar Minha Empresa": {
    "en": "Manage My Company",
    "es": "Gestionar Mi Empresa",
    "fr": "Gérer Mon Entreprise",
    "de": "Mein Unternehmen verwalten",
    "it": "Gestisci La Mia Azienda"
  },
  "GESTÃO DE EQUIPAMENTOS": {
    "en": "EQUIPMENT MANAGEMENT",
    "es": "GESTIÓN DE EQUIPOS",
    "fr": "GESTION DES ÉQUIPEMENTS",
    "de": "GERÄTEVERWALTUNG",
    "it": "GESTIONE ATTREZZATURE"
  },
  "Cadastre a identificação e, se desejar, deixe preparada a configuração de comunicação para integração com o equipamento real.": {
    "en": "Register the identification and, if desired, prepare the communication settings for integration with the real equipment.",
    "es": "Registre la identificación y, si lo desea, prepare la configuración de comunicación para integrar el equipo real.",
    "fr": "Enregistrez l'identification et, si vous le souhaitez, préparez la configuration de communication pour l'intégration avec l'équipement réel.",
    "de": "Erfassen Sie die Identifikation und bereiten Sie bei Bedarf die Kommunikation für die Integration mit dem realen Gerät vor.",
    "it": "Registra l'identificazione e, se desideri, prepara la configurazione di comunicazione per l'integrazione con l'apparecchiatura reale."
  },
  "Comunicação industrial": {
    "en": "Industrial communication",
    "es": "Comunicación industrial",
    "fr": "Communication industrielle",
    "de": "Industriekommunikation",
    "it": "Comunicazione industriale"
  },
  "Configuração opcional para equipamento real": {
    "en": "Optional setup for real equipment",
    "es": "Configuración opcional para equipo real",
    "fr": "Configuration optionnelle pour équipement réel",
    "de": "Optionale Einrichtung für reale Geräte",
    "it": "Configurazione opzionale per apparecchiatura reale"
  },
  "Informe os dados fornecidos pelo fabricante, CLP, gateway ou controlador. O SteelControl salva essa configuração para a integração futura sem transformar o equipamento em uma simulação.": {
    "en": "Enter the data provided by the manufacturer, PLC, gateway or controller. SteelControl stores this configuration for future integration without turning the equipment into a simulation.",
    "es": "Introduzca los datos proporcionados por el fabricante, PLC, gateway o controlador. SteelControl guarda esta configuración para una integración futura sin convertir el equipo en una simulación.",
    "fr": "Saisissez les données fournies par le fabricant, l'automate, la passerelle ou le contrôleur. SteelControl enregistre cette configuration pour une intégration future sans transformer l'équipement en simulation.",
    "de": "Geben Sie die vom Hersteller, der SPS, dem Gateway oder Controller bereitgestellten Daten ein. SteelControl speichert diese Konfiguration für eine spätere Integration, ohne das Gerät zu simulieren.",
    "it": "Inserisci i dati forniti dal produttore, PLC, gateway o controller. SteelControl salva questa configurazione per una futura integrazione senza trasformare l'apparecchiatura in una simulazione."
  },
  "Protocolo": {
    "en": "Protocol",
    "es": "Protocolo",
    "fr": "Protocole",
    "de": "Protokoll",
    "it": "Protocollo"
  },
  "Configurar depois": {
    "en": "Configure later",
    "es": "Configurar después",
    "fr": "Configurer plus tard",
    "de": "Später konfigurieren",
    "it": "Configura più tardi"
  },
  "IP / Host": {
    "en": "IP / Host",
    "es": "IP / Host",
    "fr": "IP / Hôte",
    "de": "IP / Host",
    "it": "IP / Host"
  },
  "Porta": {
    "en": "Port",
    "es": "Puerto",
    "fr": "Port",
    "de": "Port",
    "it": "Porta"
  },
  "Unit ID / Device ID": {
    "en": "Unit ID / Device ID",
    "es": "Unit ID / Device ID",
    "fr": "Unit ID / Device ID",
    "de": "Unit ID / Device ID",
    "it": "Unit ID / Device ID"
  },
  "Endpoint / caminho": {
    "en": "Endpoint / path",
    "es": "Endpoint / ruta",
    "fr": "Endpoint / chemin",
    "de": "Endpoint / Pfad",
    "it": "Endpoint / percorso"
  },
  "Tópico MQTT (se aplicável)": {
    "en": "MQTT topic (if applicable)",
    "es": "Tema MQTT (si aplica)",
    "fr": "Sujet MQTT (si applicable)",
    "de": "MQTT-Thema (falls zutreffend)",
    "it": "Topic MQTT (se applicabile)"
  },
  "PARQUE INDUSTRIAL": {
    "en": "INDUSTRIAL PARK",
    "es": "PARQUE INDUSTRIAL",
    "fr": "PARC INDUSTRIEL",
    "de": "INDUSTRIEPARK",
    "it": "PARCO INDUSTRIALE"
  },
  "Carregando empresa...": {
    "en": "Loading company...",
    "es": "Cargando empresa...",
    "fr": "Chargement de l'entreprise...",
    "de": "Unternehmen wird geladen...",
    "it": "Caricamento azienda..."
  },
  "Status": {
    "en": "Status",
    "es": "Estado",
    "fr": "Statut",
    "de": "Status",
    "it": "Stato"
  },
  "Protegido": {
    "en": "Protected",
    "es": "Protegido",
    "fr": "Protégé",
    "de": "Geschützt",
    "it": "Protetto"
  },
  "Mantenha os dados e o endereço da organização atualizados.": {
    "en": "Keep your organization's information and address up to date.",
    "es": "Mantenga actualizados los datos y la dirección de la organización.",
    "fr": "Maintenez à jour les données et l'adresse de l'organisation.",
    "de": "Halten Sie die Daten und die Adresse Ihrer Organisation aktuell.",
    "it": "Mantieni aggiornati i dati e l'indirizzo dell'organizzazione."
  },
  "Endereço da empresa": {
    "en": "Company address",
    "es": "Dirección de la empresa",
    "fr": "Adresse de l'entreprise",
    "de": "Unternehmensadresse",
    "it": "Indirizzo dell'azienda"
  },
  "As informações abaixo serão usadas para gerar o mapa.": {
    "en": "The information below will be used to generate the map.",
    "es": "La información siguiente se utilizará para generar el mapa.",
    "fr": "Les informations ci-dessous seront utilisées pour générer la carte.",
    "de": "Die folgenden Informationen werden zur Kartenerstellung verwendet.",
    "it": "Le informazioni seguenti verranno utilizzate per generare la mappa."
  },
  "Rua / Avenida": {
    "en": "Street / Avenue",
    "es": "Calle / Avenida",
    "fr": "Rue / Avenue",
    "de": "Straße / Allee",
    "it": "Via / Viale"
  },
  "Localização cadastrada da empresa.": {
    "en": "Registered company location.",
    "es": "Ubicación registrada de la empresa.",
    "fr": "Localisation enregistrée de l'entreprise.",
    "de": "Registrierter Unternehmensstandort.",
    "it": "Posizione registrata dell'azienda."
  },
  "Localização não cadastrada": {
    "en": "No location registered",
    "es": "Ubicación no registrada",
    "fr": "Localisation non enregistrée",
    "de": "Kein Standort registriert",
    "it": "Posizione non registrata"
  },
  "Clique em editar dados e informe o endereço da empresa.": {
    "en": "Click edit data and enter the company address.",
    "es": "Haga clic en editar datos e introduzca la dirección de la empresa.",
    "fr": "Cliquez sur modifier les données et renseignez l'adresse de l'entreprise.",
    "de": "Klicken Sie auf Daten bearbeiten und geben Sie die Unternehmensadresse ein.",
    "it": "Fai clic su modifica dati e inserisci l'indirizzo dell'azienda."
  },
  "Abrir localização no Google Maps": {
    "en": "Open location in Google Maps",
    "es": "Abrir ubicación en Google Maps",
    "fr": "Ouvrir la localisation dans Google Maps",
    "de": "Standort in Google Maps öffnen",
    "it": "Apri posizione in Google Maps"
  },
  "Informações da conta atualmente autenticada.": {
    "en": "Information about the currently authenticated account.",
    "es": "Información de la cuenta actualmente autenticada.",
    "fr": "Informations sur le compte actuellement authentifié.",
    "de": "Informationen zum aktuell authentifizierten Konto.",
    "it": "Informazioni sull'account attualmente autenticato."
  },
  "Cadastre usuários e configure o reconhecimento facial de cada funcionário.": {
    "en": "Register users and configure facial recognition for each employee.",
    "es": "Registre usuarios y configure el reconocimiento facial de cada empleado.",
    "fr": "Enregistrez les utilisateurs et configurez la reconnaissance faciale de chaque employé.",
    "de": "Registrieren Sie Benutzer und konfigurieren Sie die Gesichtserkennung für jeden Mitarbeiter.",
    "it": "Registra gli utenti e configura il riconoscimento facciale per ogni dipendente."
  },
  "Carregando funcionários...": {
    "en": "Loading employees...",
    "es": "Cargando empleados...",
    "fr": "Chargement des employés...",
    "de": "Mitarbeiter werden geladen...",
    "it": "Caricamento dipendenti..."
  },
  "Cadastre uma pessoa para acessar o SteelControl.": {
    "en": "Register a person to access SteelControl.",
    "es": "Registre una persona para acceder a SteelControl.",
    "fr": "Enregistrez une personne pour accéder à SteelControl.",
    "de": "Registrieren Sie eine Person für den Zugriff auf SteelControl.",
    "it": "Registra una persona per accedere a SteelControl."
  },
  "Nome completo": {
    "en": "Full name",
    "es": "Nombre completo",
    "fr": "Nom complet",
    "de": "Vollständiger Name",
    "it": "Nome completo"
  },
  "Senha inicial": {
    "en": "Initial password",
    "es": "Contraseña inicial",
    "fr": "Mot de passe initial",
    "de": "Initiales Passwort",
    "it": "Password iniziale"
  },
  "Selecione o cargo": {
    "en": "Select role",
    "es": "Seleccione el cargo",
    "fr": "Sélectionnez le rôle",
    "de": "Rolle auswählen",
    "it": "Seleziona ruolo"
  },
  "Funcionário": {
    "en": "Employee",
    "es": "Empleado",
    "fr": "Employé",
    "de": "Mitarbeiter",
    "it": "Dipendente"
  },
  "Confirmo que o funcionário autorizou o uso dos dados biométricos para autenticação.": {
    "en": "I confirm that the employee authorized the use of biometric data for authentication.",
    "es": "Confirmo que el empleado autorizó el uso de datos biométricos para autenticación.",
    "fr": "Je confirme que l'employé a autorisé l'utilisation des données biométriques pour l'authentification.",
    "de": "Ich bestätige, dass der Mitarbeiter der Nutzung biometrischer Daten zur Authentifizierung zugestimmt hat.",
    "it": "Confermo che il dipendente ha autorizzato l'uso dei dati biometrici per l'autenticazione."
  },
  "Abrindo câmera...": {
    "en": "Opening camera...",
    "es": "Abriendo cámara...",
    "fr": "Ouverture de la caméra...",
    "de": "Kamera wird geöffnet...",
    "it": "Apertura fotocamera..."
  },
  "Posicione seu rosto no centro.": {
    "en": "Center your face.",
    "es": "Centre su rostro.",
    "fr": "Centrez votre visage.",
    "de": "Zentrieren Sie Ihr Gesicht.",
    "it": "Centra il volto."
  },
  "Qualidade da captura": {
    "en": "Capture quality",
    "es": "Calidad de captura",
    "fr": "Qualité de la capture",
    "de": "Aufnahmequalität",
    "it": "Qualità acquisizione"
  },
  "Olhe diretamente para a câmera. Evite bonés, óculos escuros e pouca iluminação.": {
    "en": "Look directly at the camera. Avoid hats, dark glasses and poor lighting.",
    "es": "Mire directamente a la cámara. Evite gorras, gafas oscuras y poca iluminación.",
    "fr": "Regardez directement la caméra. Évitez les casquettes, lunettes de soleil et le faible éclairage.",
    "de": "Blicken Sie direkt in die Kamera. Vermeiden Sie Mützen, Sonnenbrillen und schlechte Beleuchtung.",
    "it": "Guarda direttamente la fotocamera. Evita cappelli, occhiali scuri e scarsa illuminazione."
  },
  "Entre com seu e-mail corporativo e acesse o ambiente de gestão da sua empresa no SteelControl.": {
    "en": "Sign in with your corporate email and access your company's management environment in SteelControl.",
    "es": "Inicie sesión con su correo corporativo y acceda al entorno de gestión de su empresa en SteelControl.",
    "fr": "Connectez-vous avec votre e-mail professionnel et accédez à l'environnement de gestion de votre entreprise dans SteelControl.",
    "de": "Melden Sie sich mit Ihrer geschäftlichen E-Mail an und greifen Sie auf die Verwaltungsumgebung Ihres Unternehmens in SteelControl zu.",
    "it": "Accedi con la tua e-mail aziendale e apri l'ambiente di gestione della tua azienda in SteelControl."
  },
  "Centralize máquinas, manutenção, produção, equipes e segurança em uma única plataforma.": {
    "en": "Centralize machines, maintenance, production, teams and security on a single platform.",
    "es": "Centralice máquinas, mantenimiento, producción, equipos y seguridad en una sola plataforma.",
    "fr": "Centralisez les machines, la maintenance, la production, les équipes et la sécurité sur une seule plateforme.",
    "de": "Zentralisieren Sie Maschinen, Wartung, Produktion, Teams und Sicherheit auf einer einzigen Plattform.",
    "it": "Centralizza macchine, manutenzione, produzione, team e sicurezza in un'unica piattaforma."
  },
  "Acesso rápido e seguro por biometria": {
    "en": "Fast and secure biometric access",
    "es": "Acceso biométrico rápido y seguro",
    "fr": "Accès biométrique rapide et sécurisé",
    "de": "Schneller und sicherer biometrischer Zugriff",
    "it": "Accesso biometrico rapido e sicuro"
  },
  "Sua empresa ainda não está no SteelControl?": {
    "en": "Is your company not on SteelControl yet?",
    "es": "¿Su empresa aún no está en SteelControl?",
    "fr": "Votre entreprise n'est pas encore sur SteelControl ?",
    "de": "Ist Ihr Unternehmen noch nicht bei SteelControl?",
    "it": "La tua azienda non è ancora su SteelControl?"
  },
  "Cadastre sua organização e comece a estruturar uma gestão industrial mais conectada, organizada e inteligente.": {
    "en": "Register your organization and start building more connected, organized and intelligent industrial management.",
    "es": "Registre su organización y comience una gestión industrial más conectada, organizada e inteligente.",
    "fr": "Enregistrez votre organisation et commencez à structurer une gestion industrielle plus connectée, organisée et intelligente.",
    "de": "Registrieren Sie Ihre Organisation und beginnen Sie mit einem vernetzteren, organisierteren und intelligenteren Industriemanagement.",
    "it": "Registra la tua organizzazione e inizia una gestione industriale più connessa, organizzata e intelligente."
  },
  "Equipes e acessos": {
    "en": "Teams and access",
    "es": "Equipos y accesos",
    "fr": "Équipes et accès",
    "de": "Teams und Zugriffe",
    "it": "Team e accessi"
  },
  "Monitoramento industrial": {
    "en": "Industrial monitoring",
    "es": "Monitoreo industrial",
    "fr": "Surveillance industrielle",
    "de": "Industrieüberwachung",
    "it": "Monitoraggio industriale"
  },
  "Comece no SteelControl": {
    "en": "Get started with SteelControl",
    "es": "Comience con SteelControl",
    "fr": "Commencez avec SteelControl",
    "de": "Starten Sie mit SteelControl",
    "it": "Inizia con SteelControl"
  },
  "Crie o ambiente da sua organização e cadastre o primeiro administrador do sistema.": {
    "en": "Create your organization's environment and register the first system administrator.",
    "es": "Cree el entorno de su organización y registre al primer administrador del sistema.",
    "fr": "Créez l'environnement de votre organisation et enregistrez le premier administrateur du système.",
    "de": "Erstellen Sie die Umgebung Ihrer Organisation und registrieren Sie den ersten Systemadministrator.",
    "it": "Crea l'ambiente della tua organizzazione e registra il primo amministratore del sistema."
  },
  "O usuário criado abaixo será o primeiro administrador da empresa.": {
    "en": "The user created below will be the company's first administrator.",
    "es": "El usuario creado a continuación será el primer administrador de la empresa.",
    "fr": "L'utilisateur créé ci-dessous sera le premier administrateur de l'entreprise.",
    "de": "Der unten erstellte Benutzer wird der erste Administrator des Unternehmens.",
    "it": "L'utente creato di seguito sarà il primo amministratore dell'azienda."
  },
  "Opcional": {
    "en": "Optional",
    "es": "Opcional",
    "fr": "Optionnel",
    "de": "Optional",
    "it": "Opzionale"
  },
  "Acesso protegido": {
    "en": "Protected access",
    "es": "Acceso protegido",
    "fr": "Accès protégé",
    "de": "Geschützter Zugriff",
    "it": "Accesso protetto"
  },
  "SteelControl Gestão Industrial": {
    "en": "SteelControl Industrial Management",
    "es": "SteelControl Gestión Industrial",
    "fr": "SteelControl Gestion Industrielle",
    "de": "SteelControl Industriemanagement",
    "it": "SteelControl Gestione Industriale"
  },
  "Sua operação industrial": {
    "en": "Your industrial operation",
    "es": "Su operación industrial",
    "fr": "Votre activité industrielle",
    "de": "Ihr Industriebetrieb",
    "it": "La tua attività industriale"
  },
  "conectada": {
    "en": "connected",
    "es": "conectada",
    "fr": "connectée",
    "de": "vernetzt",
    "it": "connessa"
  },
  "em um só lugar.": {
    "en": "in one place.",
    "es": "en un solo lugar.",
    "fr": "en un seul endroit.",
    "de": "an einem Ort.",
    "it": "in un unico posto."
  },
  "Mais controle, mais segurança e mais informação para decisões melhores.": {
    "en": "More control, more security and more information for better decisions.",
    "es": "Más control, más seguridad y más información para tomar mejores decisiones.",
    "fr": "Plus de contrôle, plus de sécurité et plus d'informations pour de meilleures décisions.",
    "de": "Mehr Kontrolle, mehr Sicherheit und mehr Informationen für bessere Entscheidungen.",
    "it": "Più controllo, più sicurezza e più informazioni per decisioni migliori."
  },
  "Tecnologia para ambientes industriais": {
    "en": "Technology for industrial environments",
    "es": "Tecnología para entornos industriales",
    "fr": "Technologie pour les environnements industriels",
    "de": "Technologie für industrielle Umgebungen",
    "it": "Tecnologia per ambienti industriali"
  },
  "em tempo real": {
    "en": "in real time",
    "es": "en tiempo real",
    "fr": "en temps réel",
    "de": "in Echtzeit",
    "it": "in tempo reale"
  },
  "empresarial": {
    "en": "enterprise",
    "es": "empresarial",
    "fr": "d'entreprise",
    "de": "Unternehmen",
    "it": "aziendale"
  },
  "Gestão de": {
    "en": "Team",
    "es": "Gestión de",
    "fr": "Gestion des",
    "de": "Verwaltung von",
    "it": "Gestione di"
  },
  "equipes": {
    "en": "management",
    "es": "equipos",
    "fr": "équipes",
    "de": "Teams",
    "it": "team"
  },
  "Autenticação biométrica integrada.": {
    "en": "Integrated biometric authentication.",
    "es": "Autenticación biométrica integrada.",
    "fr": "Authentification biométrique intégrée.",
    "de": "Integrierte biometrische Authentifizierung.",
    "it": "Autenticazione biometrica integrata."
  },
  "Mais controle para sua operação.": {
    "en": "More control for your operation.",
    "es": "Más control para su operación.",
    "fr": "Plus de contrôle pour votre activité.",
    "de": "Mehr Kontrolle für Ihren Betrieb.",
    "it": "Più controllo per la tua attività."
  },
  "Mais informação para suas decisões.": {
    "en": "More information for your decisions.",
    "es": "Más información para sus decisiones.",
    "fr": "Plus d'informations pour vos décisions.",
    "de": "Mehr Informationen für Ihre Entscheidungen.",
    "it": "Più informazioni per le tue decisioni."
  },
  "Brasil": {
    "en": "Brazil",
    "es": "Brasil",
    "fr": "Brésil",
    "de": "Brasilien",
    "it": "Brasile"
  },
  "© 2026 SteelControl. Todos os direitos reservados.": {
    "en": "© 2026 SteelControl. All rights reserved.",
    "es": "© 2026 SteelControl. Todos los derechos reservados.",
    "fr": "© 2026 SteelControl. Tous droits réservés.",
    "de": "© 2026 SteelControl. Alle Rechte vorbehalten.",
    "it": "© 2026 SteelControl. Tutti i diritti riservati."
  }
};


Object.assign(STEEL_LITERAL_I18N, {
  "Gestão Industrial": {
    en: "Industrial Management",
    es: "Gestión Industrial",
    fr: "Gestion Industrielle",
    de: "Industrielles Management",
    it: "Gestione Industriale"
  },
  "CNPJ:": {
    en: "Company ID:",
    es: "ID de empresa:",
    fr: "Identifiant de l'entreprise :",
    de: "Unternehmens-ID:",
    it: "ID azienda:"
  },
  "CNPJ: -": {
    en: "Company ID: -",
    es: "ID de empresa: -",
    fr: "Identifiant de l'entreprise : -",
    de: "Unternehmens-ID: -",
    it: "ID azienda: -"
  }
});

// Cobertura das telas adicionadas depois do primeiro dicionário.
// A função curta mantém as cinco traduções juntas e facilita a auditoria.
const steelL = (en, es, fr, de, it) => ({ en, es, fr, de, it });

Object.assign(STEEL_LITERAL_I18N, {
  // Login e criação de conta
  "Obrigatório": steelL("Required", "Obligatorio", "Obligatoire", "Erforderlich", "Obbligatorio"),
  "03 Biometria facial": steelL("03 Facial biometrics", "03 Biometría facial", "03 Biométrie faciale", "03 Gesichtsbiometrie", "03 Biometria facciale"),
  "Depois de confirmar o código do e-mail, a câmera abrirá automaticamente para cadastrar o rosto do administrador.": steelL("After confirming the email code, the camera will open automatically to register the administrator's face.", "Después de confirmar el código del correo, la cámara se abrirá automáticamente para registrar el rostro del administrador.", "Après confirmation du code reçu par e-mail, la caméra s'ouvrira automatiquement pour enregistrer le visage de l'administrateur.", "Nach Bestätigung des E-Mail-Codes öffnet sich die Kamera automatisch, um das Gesicht des Administrators zu registrieren.", "Dopo aver confermato il codice e-mail, la fotocamera si aprirà automaticamente per registrare il volto dell'amministratore."),
  "Confirme seu e-mail": steelL("Confirm your email", "Confirme su correo", "Confirmez votre e-mail", "Bestätigen Sie Ihre E-Mail", "Conferma la tua e-mail"),
  "Enviamos um código de 6 dígitos para": steelL("We sent a 6-digit code to", "Enviamos un código de 6 dígitos a", "Nous avons envoyé un code à 6 chiffres à", "Wir haben einen 6-stelligen Code gesendet an", "Abbiamo inviato un codice di 6 cifre a"),
  "seu e-mail": steelL("your email", "su correo", "votre e-mail", "Ihre E-Mail", "la tua e-mail"),
  ". A empresa só será criada depois da confirmação.": steelL(". The company will only be created after confirmation.", ". La empresa solo se creará después de la confirmación.", ". L'entreprise ne sera créée qu'après confirmation.", ". Das Unternehmen wird erst nach der Bestätigung erstellt.", ". L'azienda verrà creata solo dopo la conferma."),
  "Código de confirmação": steelL("Confirmation code", "Código de confirmación", "Code de confirmation", "Bestätigungscode", "Codice di conferma"),
  "Confirmar e criar conta": steelL("Confirm and create account", "Confirmar y crear cuenta", "Confirmer et créer le compte", "Bestätigen und Konto erstellen", "Conferma e crea account"),
  "Reenviar código": steelL("Resend code", "Reenviar código", "Renvoyer le code", "Code erneut senden", "Invia nuovamente il codice"),
  "Alterar dados": steelL("Edit information", "Modificar datos", "Modifier les informations", "Daten ändern", "Modifica dati"),
  "Verificar e-mail e continuar": steelL("Verify email and continue", "Verificar correo y continuar", "Vérifier l'e-mail et continuer", "E-Mail prüfen und fortfahren", "Verifica e-mail e continua"),

  // Minha empresa e biometria
  "Remover logo": steelL("Remove logo", "Eliminar logo", "Supprimer le logo", "Logo entfernen", "Rimuovi logo"),
  "E-mail institucional da empresa": steelL("Company email", "Correo institucional de la empresa", "E-mail institutionnel de l'entreprise", "Unternehmens-E-Mail", "E-mail aziendale"),
  "As informações abaixo ficam disponíveis localmente no SteelControl.": steelL("The information below remains available locally in SteelControl.", "La información siguiente permanece disponible localmente en SteelControl.", "Les informations ci-dessous restent disponibles localement dans SteelControl.", "Die folgenden Informationen bleiben lokal in SteelControl verfügbar.", "Le informazioni seguenti restano disponibili localmente in SteelControl."),
  "Localização cadastrada": steelL("Saved location", "Ubicación registrada", "Emplacement enregistré", "Gespeicherter Standort", "Posizione registrata"),
  "Dados de localização disponíveis mesmo sem internet.": steelL("Location data available even without internet.", "Datos de ubicación disponibles incluso sin internet.", "Données de localisation disponibles même sans Internet.", "Standortdaten sind auch ohne Internet verfügbar.", "Dati sulla posizione disponibili anche senza Internet."),
  "Copiar endereço": steelL("Copy address", "Copiar dirección", "Copier l'adresse", "Adresse kopieren", "Copia indirizzo"),
  "Editar acesso": steelL("Edit access", "Editar acceso", "Modifier l'accès", "Zugriff bearbeiten", "Modifica accesso"),
  "Atualize e-mail, senha, nome e cargo.": steelL("Update email, password, name and role.", "Actualice correo, contraseña, nombre y cargo.", "Mettez à jour l'e-mail, le mot de passe, le nom et le rôle.", "Aktualisieren Sie E-Mail, Passwort, Name und Rolle.", "Aggiorna e-mail, password, nome e ruolo."),
  "E-mail de acesso": steelL("Access email", "Correo de acceso", "E-mail d'accès", "Zugangs-E-Mail", "E-mail di accesso"),
  "Ao alterar o próprio e-mail de administrador, um código de 6 dígitos será enviado ao novo endereço.": steelL("When changing your administrator email, a 6-digit code will be sent to the new address.", "Al cambiar su correo de administrador, se enviará un código de 6 dígitos a la nueva dirección.", "Lors du changement de votre e-mail administrateur, un code à 6 chiffres sera envoyé à la nouvelle adresse.", "Beim Ändern Ihrer Administrator-E-Mail wird ein 6-stelliger Code an die neue Adresse gesendet.", "Quando modifichi l'e-mail amministratore, verrà inviato un codice di 6 cifre al nuovo indirizzo."),
  "Nova senha": steelL("New password", "Nueva contraseña", "Nouveau mot de passe", "Neues Passwort", "Nuova password"),
  "Confirme o novo e-mail": steelL("Confirm the new email", "Confirme el nuevo correo", "Confirmez le nouvel e-mail", "Neue E-Mail bestätigen", "Conferma la nuova e-mail"),
  "Digite o código enviado para o novo endereço.": steelL("Enter the code sent to the new address.", "Ingrese el código enviado a la nueva dirección.", "Saisissez le code envoyé à la nouvelle adresse.", "Geben Sie den an die neue Adresse gesendeten Code ein.", "Inserisci il codice inviato al nuovo indirizzo."),
  "Confirmar código": steelL("Confirm code", "Confirmar código", "Confirmer le code", "Code bestätigen", "Conferma codice"),
  "Nome desta facial": steelL("Name for this face ID", "Nombre de este reconocimiento facial", "Nom de cette biométrie faciale", "Name dieser Gesichts-ID", "Nome di questa biometria facciale"),
  "Esse nome será usado para identificar a amostra na hora de remover.": steelL("This name will identify the sample when it is removed.", "Este nombre identificará la muestra al eliminarla.", "Ce nom identifiera l'échantillon lors de sa suppression.", "Dieser Name kennzeichnet die Probe beim Entfernen.", "Questo nome identificherà il campione durante la rimozione."),
  "Confirmo que o funcionário autorizou o uso dos dados biométricos para autenticação. Cada rosto pode ficar vinculado a apenas um perfil no SteelControl.": steelL("I confirm that the employee authorized the use of biometric data for authentication. Each face can be linked to only one SteelControl profile.", "Confirmo que el empleado autorizó el uso de datos biométricos para autenticación. Cada rostro solo puede vincularse a un perfil de SteelControl.", "Je confirme que l'employé a autorisé l'utilisation des données biométriques pour l'authentification. Chaque visage ne peut être lié qu'à un seul profil SteelControl.", "Ich bestätige, dass der Mitarbeiter die Nutzung biometrischer Daten zur Authentifizierung genehmigt hat. Jedes Gesicht kann nur mit einem SteelControl-Profil verknüpft werden.", "Confermo che il dipendente ha autorizzato l'uso dei dati biometrici per l'autenticazione. Ogni volto può essere collegato a un solo profilo SteelControl."),
  "Biometria cadastrada": steelL("Biometrics registered", "Biometría registrada", "Biométrie enregistrée", "Biometrie registriert", "Biometria registrata"),
  "Este perfil pode possuir apenas uma biometria. Remova-a somente quando precisar cadastrar outro rosto.": steelL("This profile can have only one biometric identity. Remove it only when another face must be registered.", "Este perfil solo puede tener una identidad biométrica. Elimínela únicamente cuando necesite registrar otro rostro.", "Ce profil ne peut avoir qu'une seule identité biométrique. Supprimez-la uniquement pour enregistrer un autre visage.", "Dieses Profil kann nur eine biometrische Identität haben. Entfernen Sie sie nur, wenn ein anderes Gesicht registriert werden muss.", "Questo profilo può avere una sola identità biometrica. Rimuovila solo quando devi registrare un altro volto."),

  // Últimos textos do cadastro desktop (incluídos no multilíngue)
  "Detalhes adicionais": steelL("Additional details", "Detalles adicionales", "Détails supplémentaires", "Zusätzliche Details", "Dettagli aggiuntivi"),
  "Tipo, fabricante e descrição operacional": steelL("Type, manufacturer and operational description", "Tipo, fabricante y descripción operativa", "Type, fabricant et description opérationnelle", "Typ, Hersteller und Betriebsbeschreibung", "Tipo, produttore e descrizione operativa"),
  "Descrição operacional": steelL("Operational description", "Descripción operativa", "Description opérationnelle", "Betriebsbeschreibung", "Descrizione operativa"),
  "Dobot Magician Gateway": steelL("Dobot Magician Gateway", "Gateway Dobot Magician", "Passerelle Dobot Magician", "Dobot Magician Gateway", "Gateway Dobot Magician"),
  "Configuração avançada de rede": steelL("Advanced network configuration", "Configuración avanzada de red", "Configuration réseau avancée", "Erweiterte Netzwerkkonfiguration", "Configurazione di rete avanzata"),
  "Host, porta, endpoint e intervalo de leitura": steelL("Host, port, endpoint and reading interval", "Host, puerto, endpoint e intervalo de lectura", "Hôte, port, endpoint et intervalle de lecture", "Host, Port, Endpunkt und Leseintervall", "Host, porta, endpoint e intervallo di lettura"),
  "Personalizar limites": steelL("Customize limits", "Personalizar límites", "Personnaliser les limites", "Grenzwerte anpassen", "Personalizza limiti"),
  "O sistema já utiliza valores seguros recomendados": steelL("The system already uses recommended safe values", "El sistema ya utiliza valores seguros recomendados", "Le système utilise déjà des valeurs sûres recommandées", "Das System verwendet bereits empfohlene sichere Werte", "Il sistema utilizza già valori di sicurezza consigliati"),
  "Offline": steelL("Offline", "Sin conexión", "Hors ligne", "Offline", "Offline"),
  "Conectada": steelL("Connected", "Conectada", "Connectée", "Verbunden", "Connessa"),
  "Instável": steelL("Unstable", "Inestable", "Instable", "Instabil", "Instabile"),
  "Simulação": steelL("Simulation", "Simulación", "Simulation", "Simulation", "Simulazione"),
  "Conexão instável": steelL("Unstable connection", "Conexión inestable", "Connexion instable", "Instabile Verbindung", "Connessione instabile"),
  "Parada de segurança": steelL("Safety stop", "Parada de seguridad", "Arrêt de sécurité", "Sicherheitsstopp", "Arresto di sicurezza"),

  // Cadastro e comunicação de equipamentos
  "Informe o controlador, protocolo e dados de comunicação fornecidos pelo fabricante, CLP, gateway ou controlador do equipamento.": steelL("Enter the controller, protocol and communication data provided by the equipment manufacturer, PLC, gateway or controller.", "Informe el controlador, protocolo y datos de comunicación proporcionados por el fabricante, PLC, gateway o controlador del equipo.", "Renseignez le contrôleur, le protocole et les données de communication fournis par le fabricant, l'automate, la passerelle ou le contrôleur de l'équipement.", "Geben Sie Controller, Protokoll und Kommunikationsdaten des Herstellers, der SPS, des Gateways oder des Gerätesteuergeräts ein.", "Inserisci controller, protocollo e dati di comunicazione forniti dal produttore, PLC, gateway o controller dell'apparecchiatura."),
  "Modo de operação": steelL("Operating mode", "Modo de operación", "Mode de fonctionnement", "Betriebsmodus", "Modalità operativa"),
  "Simulação do SteelControl": steelL("SteelControl simulation", "Simulación de SteelControl", "Simulation SteelControl", "SteelControl-Simulation", "Simulazione SteelControl"),
  "Equipamento real": steelL("Real equipment", "Equipo real", "Équipement réel", "Reales Gerät", "Apparecchiatura reale"),
  "Use simulação enquanto não houver um equipamento físico conectado.": steelL("Use simulation while no physical equipment is connected.", "Use la simulación mientras no haya un equipo físico conectado.", "Utilisez la simulation tant qu'aucun équipement physique n'est connecté.", "Verwenden Sie die Simulation, solange kein physisches Gerät verbunden ist.", "Usa la simulazione finché non è collegata un'apparecchiatura fisica."),
  "Controlador / Gateway": steelL("Controller / Gateway", "Controlador / Gateway", "Contrôleur / Passerelle", "Controller / Gateway", "Controller / Gateway"),
  "Selecione": steelL("Select", "Seleccione", "Sélectionner", "Auswählen", "Seleziona"),
  "Controlador robótico": steelL("Robot controller", "Controlador robótico", "Contrôleur robotique", "Robotersteuerung", "Controller robotico"),
  "Controlador CNC": steelL("CNC controller", "Controlador CNC", "Contrôleur CNC", "CNC-Steuerung", "Controller CNC"),
  "Gateway industrial": steelL("Industrial gateway", "Gateway industrial", "Passerelle industrielle", "Industrie-Gateway", "Gateway industriale"),
  "PAINEL QUE SERÁ CRIADO": steelL("DASHBOARD TO BE CREATED", "PANEL QUE SE CREARÁ", "TABLEAU DE BORD À CRÉER", "ZU ERSTELLENDES DASHBOARD", "DASHBOARD DA CREARE"),
  "Painel adaptativo": steelL("Adaptive dashboard", "Panel adaptativo", "Tableau de bord adaptatif", "Adaptives Dashboard", "Dashboard adattiva"),
  "Deixe tudo preparado agora em MOCK e troque para REAL quando conectar o braço.": steelL("Prepare everything in MOCK now and switch to REAL when the arm is connected.", "Prepare todo en MOCK ahora y cambie a REAL cuando conecte el brazo.", "Préparez tout en mode MOCK maintenant, puis passez en mode REAL lorsque le bras sera connecté.", "Bereiten Sie jetzt alles im MOCK-Modus vor und wechseln Sie zu REAL, sobald der Arm verbunden ist.", "Prepara tutto in modalità MOCK e passa a REAL quando colleghi il braccio."),
  "Modo do gateway": steelL("Gateway mode", "Modo del gateway", "Mode de la passerelle", "Gateway-Modus", "Modalità gateway"),
  "MOCK — sem braço": steelL("MOCK — no arm", "MOCK — sin brazo", "MOCK — sans bras", "MOCK — ohne Arm", "MOCK — senza braccio"),
  "REAL — USB físico": steelL("REAL — physical USB", "REAL — USB físico", "REAL — USB physique", "REAL — physisches USB", "REAL — USB fisico"),
  "Porta serial": steelL("Serial port", "Puerto serie", "Port série", "Serieller Port", "Porta seriale"),
  "Preparar controle físico (continua protegido pelo gateway)": steelL("Prepare physical control (still protected by the gateway)", "Preparar control físico (sigue protegido por el gateway)", "Préparer le contrôle physique (toujours protégé par la passerelle)", "Physische Steuerung vorbereiten (weiterhin durch das Gateway geschützt)", "Prepara il controllo fisico (ancora protetto dal gateway)"),
  "Segurança: no gateway, DOBOT_ALLOW_MOTION=false continua bloqueando movimento mesmo que a interface esteja preparada.": steelL("Safety: on the gateway, DOBOT_ALLOW_MOTION=false continues to block movement even when the interface is ready.", "Seguridad: en el gateway, DOBOT_ALLOW_MOTION=false sigue bloqueando el movimiento aunque la interfaz esté lista.", "Sécurité : sur la passerelle, DOBOT_ALLOW_MOTION=false continue de bloquer les mouvements même si l'interface est prête.", "Sicherheit: Im Gateway blockiert DOBOT_ALLOW_MOTION=false weiterhin Bewegungen, auch wenn die Oberfläche bereit ist.", "Sicurezza: nel gateway, DOBOT_ALLOW_MOTION=false continua a bloccare il movimento anche quando l'interfaccia è pronta."),
  "Intervalo esperado de leitura": steelL("Expected reading interval", "Intervalo de lectura esperado", "Intervalle de lecture attendu", "Erwartetes Leseintervall", "Intervallo di lettura previsto"),
  "Valor em milissegundos. Ex.: 2000 = 2 segundos.": steelL("Value in milliseconds. Example: 2000 = 2 seconds.", "Valor en milisegundos. Ej.: 2000 = 2 segundos.", "Valeur en millisecondes. Ex. : 2000 = 2 secondes.", "Wert in Millisekunden. Beispiel: 2000 = 2 Sekunden.", "Valore in millisecondi. Es.: 2000 = 2 secondi."),
  "Credencial do equipamento": steelL("Equipment credential", "Credencial del equipo", "Identifiant de l'équipement", "Gerätezugangsdaten", "Credenziale dell'apparecchiatura"),
  "O SteelControl gera automaticamente uma chave exclusiva no cadastro. Ela será usada pelo ESP32, CLP ou gateway para enviar dados com segurança.": steelL("SteelControl automatically generates a unique key during registration. The ESP32, PLC or gateway will use it to send data securely.", "SteelControl genera automáticamente una clave única durante el registro. El ESP32, PLC o gateway la usará para enviar datos de forma segura.", "SteelControl génère automatiquement une clé unique lors de l'enregistrement. L'ESP32, l'automate ou la passerelle l'utilisera pour envoyer les données en toute sécurité.", "SteelControl erzeugt bei der Registrierung automatisch einen eindeutigen Schlüssel. ESP32, SPS oder Gateway verwenden ihn zur sicheren Datenübertragung.", "SteelControl genera automaticamente una chiave univoca durante la registrazione. ESP32, PLC o gateway la useranno per inviare dati in sicurezza."),
  "Limites operacionais e segurança": steelL("Operating limits and safety", "Límites operativos y seguridad", "Limites de fonctionnement et sécurité", "Betriebsgrenzen und Sicherheit", "Limiti operativi e sicurezza"),
  "Alertas configuráveis por equipamento": steelL("Configurable alerts per equipment", "Alertas configurables por equipo", "Alertes configurables par équipement", "Konfigurierbare Warnungen pro Gerät", "Avvisi configurabili per apparecchiatura"),
  "Defina quando o SteelControl deve avisar, gerar alerta crítico e solicitar parada de segurança.": steelL("Define when SteelControl should notify, generate a critical alert and request a safety stop.", "Defina cuándo SteelControl debe avisar, generar una alerta crítica y solicitar una parada de seguridad.", "Définissez quand SteelControl doit avertir, générer une alerte critique et demander un arrêt de sécurité.", "Legen Sie fest, wann SteelControl warnen, einen kritischen Alarm auslösen und einen Sicherheitsstopp anfordern soll.", "Definisci quando SteelControl deve avvisare, generare un allarme critico e richiedere un arresto di sicurezza."),
  "Temperatura de atenção (°C)": steelL("Warning temperature (°C)", "Temperatura de atención (°C)", "Température d'alerte (°C)", "Warntemperatur (°C)", "Temperatura di attenzione (°C)"),
  "Temperatura crítica (°C)": steelL("Critical temperature (°C)", "Temperatura crítica (°C)", "Température critique (°C)", "Kritische Temperatur (°C)", "Temperatura critica (°C)"),
  "Carga elétrica de atenção (%)": steelL("Electrical load warning (%)", "Carga eléctrica de atención (%)", "Alerte de charge électrique (%)", "Warnwert elektrische Last (%)", "Carico elettrico di attenzione (%)"),
  "Carga elétrica crítica (%)": steelL("Critical electrical load (%)", "Carga eléctrica crítica (%)", "Charge électrique critique (%)", "Kritische elektrische Last (%)", "Carico elettrico critico (%)"),
  "Vibração de atenção (mm/s)": steelL("Vibration warning (mm/s)", "Vibración de atención (mm/s)", "Alerte de vibration (mm/s)", "Vibrationswarnwert (mm/s)", "Vibrazione di attenzione (mm/s)"),
  "Vibração crítica (mm/s)": steelL("Critical vibration (mm/s)", "Vibración crítica (mm/s)", "Vibration critique (mm/s)", "Kritische Vibration (mm/s)", "Vibrazione critica (mm/s)"),
  "Ciclos para manutenção preventiva": steelL("Cycles until preventive maintenance", "Ciclos para mantenimiento preventivo", "Cycles avant maintenance préventive", "Zyklen bis zur vorbeugenden Wartung", "Cicli per manutenzione preventiva"),

  // Painéis, diagnóstico e auditoria
  "Carga média": steelL("Average load", "Carga media", "Charge moyenne", "Durchschnittliche Last", "Carico medio"),
  "carga elétrica": steelL("electrical load", "carga eléctrica", "charge électrique", "elektrische Last", "carico elettrico"),
  "Condição": steelL("Condition", "Condición", "État", "Zustand", "Condizione"),
  "Corrente informada pelo controlador": steelL("Current reported by the controller", "Corriente informada por el controlador", "Courant indiqué par le contrôleur", "Vom Controller gemeldeter Strom", "Corrente indicata dal controller"),
  "Diagnóstico da máquina": steelL("Machine diagnostics", "Diagnóstico de la máquina", "Diagnostic de la machine", "Maschinendiagnose", "Diagnostica della macchina"),
  "Comunicação, último sinal, segurança e configuração do dispositivo.": steelL("Communication, last signal, safety and device configuration.", "Comunicación, última señal, seguridad y configuración del dispositivo.", "Communication, dernier signal, sécurité et configuration de l'appareil.", "Kommunikation, letztes Signal, Sicherheit und Gerätekonfiguration.", "Comunicazione, ultimo segnale, sicurezza e configurazione del dispositivo."),
  "Verificando conexão": steelL("Checking connection", "Verificando conexión", "Vérification de la connexion", "Verbindung wird geprüft", "Verifica della connessione"),
  "Último sinal": steelL("Last signal", "Última señal", "Dernier signal", "Letztes Signal", "Ultimo segnale"),
  "Qualidade": steelL("Quality", "Calidad", "Qualité", "Qualität", "Qualità"),
  "Chave do dispositivo": steelL("Device key", "Clave del dispositivo", "Clé de l'appareil", "Geräteschlüssel", "Chiave del dispositivo"),
  "Segurança operacional": steelL("Operational safety", "Seguridad operativa", "Sécurité opérationnelle", "Betriebssicherheit", "Sicurezza operativa"),
  "Operação liberada": steelL("Operation enabled", "Operación habilitada", "Fonctionnement autorisé", "Betrieb freigegeben", "Operazione abilitata"),
  "Nenhuma parada de segurança ativa.": steelL("No active safety stop.", "Ninguna parada de seguridad activa.", "Aucun arrêt de sécurité actif.", "Kein aktiver Sicherheitsstopp.", "Nessun arresto di sicurezza attivo."),
  "Liberar equipamento": steelL("Enable equipment", "Habilitar equipo", "Autoriser l'équipement", "Gerät freigeben", "Abilita apparecchiatura"),
  "Modo demonstração": steelL("Demo mode", "Modo demostración", "Mode démonstration", "Demomodus", "Modalità demo"),
  "Use estes cenários para apresentar o TCC sem equipamento físico.": steelL("Use these scenarios to present the project without physical equipment.", "Use estos escenarios para presentar el proyecto sin equipo físico.", "Utilisez ces scénarios pour présenter le projet sans équipement physique.", "Verwenden Sie diese Szenarien, um das Projekt ohne physische Geräte zu präsentieren.", "Usa questi scenari per presentare il progetto senza apparecchiature fisiche."),
  "Aquecimento": steelL("Heating", "Calentamiento", "Échauffement", "Erwärmung", "Riscaldamento"),
  "Superaquecimento crítico": steelL("Critical overheating", "Sobrecalentamiento crítico", "Surchauffe critique", "Kritische Überhitzung", "Surriscaldamento critico"),
  "Normalizar": steelL("Normalize", "Normalizar", "Normaliser", "Normalisieren", "Normalizza"),
  "Produção e operação vinculadas exclusivamente a este equipamento.": steelL("Production and operation linked exclusively to this equipment.", "Producción y operación vinculadas exclusivamente a este equipo.", "Production et fonctionnement exclusivement liés à cet équipement.", "Produktion und Betrieb ausschließlich mit diesem Gerät verknüpft.", "Produzione e funzionamento collegati esclusivamente a questa apparecchiatura."),
  "Aguardando dados": steelL("Waiting for data", "Esperando datos", "En attente de données", "Warten auf Daten", "In attesa dei dati"),
  "Indicador do controlador": steelL("Controller indicator", "Indicador del controlador", "Indicateur du contrôleur", "Controller-Anzeige", "Indicatore del controller"),
  "Não configurado": steelL("Not configured", "No configurado", "Non configuré", "Nicht konfiguriert", "Non configurato"),
  "O painel será adaptado aos dados enviados pelo equipamento.": steelL("The dashboard will adapt to the data sent by the equipment.", "El panel se adaptará a los datos enviados por el equipo.", "Le tableau de bord s'adaptera aux données envoyées par l'équipement.", "Das Dashboard passt sich den vom Gerät gesendeten Daten an.", "La dashboard si adatterà ai dati inviati dall'apparecchiatura."),
  "Plano e histórico técnico exclusivos deste equipamento.": steelL("Technical plan and history exclusive to this equipment.", "Plan e historial técnico exclusivos de este equipo.", "Plan et historique techniques propres à cet équipement.", "Technischer Plan und Verlauf ausschließlich für dieses Gerät.", "Piano e storico tecnico esclusivi di questa apparecchiatura."),
  "Eventos técnicos gerados somente por este equipamento.": steelL("Technical events generated only by this equipment.", "Eventos técnicos generados únicamente por este equipo.", "Événements techniques générés uniquement par cet équipement.", "Technische Ereignisse, die nur von diesem Gerät erzeugt werden.", "Eventi tecnici generati solo da questa apparecchiatura."),
  "Auditoria do sistema": steelL("System audit", "Auditoría del sistema", "Audit du système", "Systemprüfung", "Audit del sistema"),
  "Ações administrativas registradas com usuário, entidade e horário.": steelL("Administrative actions recorded with user, entity and time.", "Acciones administrativas registradas con usuario, entidad y hora.", "Actions administratives enregistrées avec l'utilisateur, l'entité et l'heure.", "Administrative Aktionen mit Benutzer, Entität und Uhrzeit protokolliert.", "Azioni amministrative registrate con utente, entità e orario."),
  "Atualizar": steelL("Refresh", "Actualizar", "Actualiser", "Aktualisieren", "Aggiorna"),
  "Eventos exibidos": steelL("Events displayed", "Eventos mostrados", "Événements affichés", "Angezeigte Ereignisse", "Eventi visualizzati"),
  "Últimos registros": steelL("Latest records", "Últimos registros", "Derniers enregistrements", "Neueste Einträge", "Ultimi registri"),
  "Usuários envolvidos": steelL("Users involved", "Usuarios involucrados", "Utilisateurs concernés", "Beteiligte Benutzer", "Utenti coinvolti"),
  "Rastreabilidade por conta": steelL("Traceability by account", "Trazabilidad por cuenta", "Traçabilité par compte", "Rückverfolgbarkeit nach Konto", "Tracciabilità per account"),
  "Última atividade": steelL("Last activity", "Última actividad", "Dernière activité", "Letzte Aktivität", "Ultima attività"),
  "Todas as ações": steelL("All actions", "Todas las acciones", "Toutes les actions", "Alle Aktionen", "Tutte le azioni"),
  "Criar": steelL("Create", "Crear", "Créer", "Erstellen", "Crea"),
  "Desativar": steelL("Deactivate", "Desactivar", "Désactiver", "Deaktivieren", "Disattiva"),
  "Carregando auditoria...": steelL("Loading audit...", "Cargando auditoría...", "Chargement de l'audit...", "Audit wird geladen...", "Caricamento audit..."),
  "PAINEL ADAPTATIVO": steelL("ADAPTIVE DASHBOARD", "PANEL ADAPTATIVO", "TABLEAU DE BORD ADAPTATIF", "ADAPTIVES DASHBOARD", "DASHBOARD ADATTIVA"),
  "Recursos e telemetria compatíveis com o equipamento selecionado.": steelL("Features and telemetry compatible with the selected equipment.", "Recursos y telemetría compatibles con el equipo seleccionado.", "Fonctions et télémétrie compatibles avec l'équipement sélectionné.", "Mit dem ausgewählten Gerät kompatible Funktionen und Telemetrie.", "Funzioni e telemetria compatibili con l'apparecchiatura selezionata."),
  "Aguardando telemetria": steelL("Waiting for telemetry", "Esperando telemetría", "En attente de télémétrie", "Warten auf Telemetrie", "In attesa della telemetria"),
  "Qualidade do sinal": steelL("Signal quality", "Calidad de señal", "Qualité du signal", "Signalqualität", "Qualità del segnale"),
  "Última leitura": steelL("Last reading", "Última lectura", "Dernière lecture", "Letzter Messwert", "Ultima lettura"),
  "Indicadores do equipamento": steelL("Equipment indicators", "Indicadores del equipo", "Indicateurs de l'équipement", "Geräteanzeigen", "Indicatori dell'apparecchiatura"),
  "Integração configurada": steelL("Integration configured", "Integración configurada", "Intégration configurée", "Integration konfiguriert", "Integrazione configurata"),
  "Capacidades do painel": steelL("Dashboard capabilities", "Capacidades del panel", "Capacités du tableau de bord", "Dashboard-Funktionen", "Funzionalità della dashboard"),
  "Informações disponíveis": steelL("Available information", "Información disponible", "Informations disponibles", "Verfügbare Informationen", "Informazioni disponibili"),
  "O painel mostra “Não configurado” quando o controlador ainda não envia determinado dado.": steelL("The dashboard shows “Not configured” when the controller does not yet send a given value.", "El panel muestra «No configurado» cuando el controlador aún no envía un dato determinado.", "Le tableau de bord affiche « Non configuré » lorsque le contrôleur n'envoie pas encore une donnée.", "Das Dashboard zeigt „Nicht konfiguriert“, wenn der Controller einen bestimmten Wert noch nicht sendet.", "La dashboard mostra “Non configurato” quando il controller non invia ancora un determinato dato."),
  "PAINEL EXCLUSIVO DA MÁQUINA": steelL("MACHINE-SPECIFIC DASHBOARD", "PANEL EXCLUSIVO DE LA MÁQUINA", "TABLEAU DE BORD DÉDIÉ À LA MACHINE", "MASCHINENSPEZIFISCHES DASHBOARD", "DASHBOARD ESCLUSIVA DELLA MACCHINA"),
  "Aguardando gateway": steelL("Waiting for gateway", "Esperando gateway", "En attente de la passerelle", "Warten auf Gateway", "In attesa del gateway"),
  "Alarmes": steelL("Alarms", "Alarmas", "Alarmes", "Alarme", "Allarmi"),
  "Posição do efetuador": steelL("End-effector position", "Posición del efector", "Position de l'effecteur", "Position des Endeffektors", "Posizione dell'effettore"),
  "Ângulos das juntas": steelL("Joint angles", "Ángulos de las articulaciones", "Angles des articulations", "Gelenkwinkel", "Angoli dei giunti"),
  "Sensores da célula": steelL("Cell sensors", "Sensores de la celda", "Capteurs de la cellule", "Zellensensoren", "Sensori della cella"),
  "Não instalado": steelL("Not installed", "No instalado", "Non installé", "Nicht installiert", "Non installato"),
  "Ferramenta e estado": steelL("Tool and status", "Herramienta y estado", "Outil et état", "Werkzeug und Status", "Strumento e stato"),
  "Comandos do robô": steelL("Robot commands", "Comandos del robot", "Commandes du robot", "Roboterbefehle", "Comandi del robot"),
  "Comandos passam pelo backend, PostgreSQL e fila autenticada do equipamento.": steelL("Commands pass through the backend, PostgreSQL and the equipment's authenticated queue.", "Los comandos pasan por el backend, PostgreSQL y la cola autenticada del equipo.", "Les commandes passent par le backend, PostgreSQL et la file authentifiée de l'équipement.", "Befehle laufen über Backend, PostgreSQL und die authentifizierte Gerätewarteschlange.", "I comandi passano attraverso backend, PostgreSQL e coda autenticata dell'apparecchiatura."),
  "Movimento protegido": steelL("Protected movement", "Movimiento protegido", "Mouvement protégé", "Geschützte Bewegung", "Movimento protetto"),
  "PARAR": steelL("STOP", "DETENER", "ARRÊTER", "STOPP", "ARRESTA"),
  "Limpar alarmes": steelL("Clear alarms", "Limpiar alarmas", "Effacer les alarmes", "Alarme löschen", "Cancella allarmi"),
  "Ventosa ON": steelL("Suction ON", "Ventosa ON", "Ventouse ON", "Sauger EIN", "Ventosa ON"),
  "Ventosa OFF": steelL("Suction OFF", "Ventosa OFF", "Ventouse OFF", "Sauger AUS", "Ventosa OFF"),
  "Abrir garra": steelL("Open gripper", "Abrir pinza", "Ouvrir la pince", "Greifer öffnen", "Apri pinza"),
  "Fechar garra": steelL("Close gripper", "Cerrar pinza", "Fermer la pince", "Greifer schließen", "Chiudi pinza"),
  "Velocidade (%)": steelL("Speed (%)", "Velocidad (%)", "Vitesse (%)", "Geschwindigkeit (%)", "Velocità (%)"),
  "Enviar PTP": steelL("Send PTP", "Enviar PTP", "Envoyer PTP", "PTP senden", "Invia PTP")
});

Object.assign(STEEL_LITERAL_I18N, {
  "Auditoria": steelL("Audit", "Auditoría", "Audit", "Audit", "Audit"),
  "Carga": steelL("Load", "Carga", "Charge", "Last", "Carico"),
  "Carga elétrica": steelL("Electrical load", "Carga eléctrica", "Charge électrique", "Elektrische Last", "Carico elettrico"),
  "Vibração": steelL("Vibration", "Vibración", "Vibration", "Vibration", "Vibrazione"),
  "Vibração atual do equipamento": steelL("Current equipment vibration", "Vibración actual del equipo", "Vibration actuelle de l'équipement", "Aktuelle Gerätevibration", "Vibrazione attuale dell'apparecchiatura"),
  "Elétrica": steelL("Electrical", "Eléctrica", "Électrique", "Elektrisch", "Elettrica"),
  "Corrente": steelL("Current", "Corriente", "Courant", "Strom", "Corrente"),
  "Latência": steelL("Latency", "Latencia", "Latence", "Latenz", "Latenza"),
  "Vibração crítica": steelL("Critical vibration", "Vibración crítica", "Vibration critique", "Kritische Vibration", "Vibrazione critica"),
  "Braço Robótico Industrial": steelL("Industrial Robotic Arm", "Brazo Robótico Industrial", "Bras Robotique Industriel", "Industrieller Roboterarm", "Braccio Robotico Industriale"),
  "Linha de Produção A": steelL("Production Line A", "Línea de Producción A", "Ligne de Production A", "Produktionslinie A", "Linea di Produzione A"),
  "CONTROLADOR": steelL("CONTROLLER", "CONTROLADOR", "CONTRÔLEUR", "CONTROLLER", "CONTROLLER"),
  "Eventos carregados": steelL("Events loaded", "Eventos cargados", "Événements chargés", "Ereignisse geladen", "Eventi caricati"),
  "Origem": steelL("Source", "Origen", "Origine", "Quelle", "Origine"),
  "Controlador": steelL("Controller", "Controlador", "Contrôleur", "Controller", "Controller"),
  "Escopo": steelL("Scope", "Alcance", "Périmètre", "Umfang", "Ambito"),
  "RASTREABILIDADE": steelL("TRACEABILITY", "TRAZABILIDAD", "TRAÇABILITÉ", "RÜCKVERFOLGBARKEIT", "TRACCIABILITÀ"),
  "Horário mais recente": steelL("Most recent time", "Hora más reciente", "Heure la plus récente", "Neueste Uhrzeit", "Orario più recente"),
  "Login": steelL("Sign in", "Inicio de sesión", "Connexion", "Anmeldung", "Accesso"),
  "Controlador industrial": steelL("Industrial controller", "Controlador industrial", "Contrôleur industriel", "Industriesteuerung", "Controller industriale"),
  "TELEMETRIA COMPATÍVEL": steelL("COMPATIBLE TELEMETRY", "TELEMETRÍA COMPATIBLE", "TÉLÉMÉTRIE COMPATIBLE", "KOMPATIBLE TELEMETRIE", "TELEMETRIA COMPATIBILE"),
  "COMUNICAÇÃO": steelL("COMMUNICATION", "COMUNICACIÓN", "COMMUNICATION", "KOMMUNIKATION", "COMUNICAZIONE"),
  "RECURSOS DO CONTROLADOR": steelL("CONTROLLER FEATURES", "RECURSOS DEL CONTROLADOR", "FONCTIONS DU CONTRÔLEUR", "CONTROLLER-FUNKTIONEN", "FUNZIONI DEL CONTROLLER"),
  "QUALIDADE DOS DADOS": steelL("DATA QUALITY", "CALIDAD DE LOS DATOS", "QUALITÉ DES DONNÉES", "DATENQUALITÄT", "QUALITÀ DEI DATI"),
  "Gateway Python • USB/Serial • Telemetria e comandos pela fila segura do SteelControl": steelL("Python Gateway • USB/Serial • Telemetry and commands through SteelControl's secure queue", "Gateway Python • USB/Serial • Telemetría y comandos mediante la cola segura de SteelControl", "Passerelle Python • USB/Série • Télémétrie et commandes via la file sécurisée de SteelControl", "Python-Gateway • USB/Seriell • Telemetrie und Befehle über die sichere SteelControl-Warteschlange", "Gateway Python • USB/Seriale • Telemetria e comandi tramite la coda sicura di SteelControl"),
  "POSE CARTESIANA": steelL("CARTESIAN POSE", "POSE CARTESIANA", "POSE CARTÉSIENNE", "KARTESISCHE POSE", "POSA CARTESIANA"),
  "ARTICULAÇÕES": steelL("JOINTS", "ARTICULACIONES", "ARTICULATIONS", "GELENKE", "GIUNTI"),
  "INSTRUMENTAÇÃO": steelL("INSTRUMENTATION", "INSTRUMENTACIÓN", "INSTRUMENTATION", "INSTRUMENTIERUNG", "STRUMENTAZIONE"),
  "O SteelControl não inventa temperatura interna do Dobot. Esses dados entram quando sensores externos/ESP32 estiverem instalados.": steelL("SteelControl does not fabricate Dobot internal temperature data. These values become available when external sensors or an ESP32 are installed.", "SteelControl no inventa la temperatura interna del Dobot. Estos datos estarán disponibles cuando se instalen sensores externos o un ESP32.", "SteelControl n'invente pas la température interne du Dobot. Ces données seront disponibles lorsque des capteurs externes ou un ESP32 seront installés.", "SteelControl erfindet keine internen Dobot-Temperaturdaten. Diese Werte stehen zur Verfügung, sobald externe Sensoren oder ein ESP32 installiert sind.", "SteelControl non inventa la temperatura interna del Dobot. Questi dati saranno disponibili quando verranno installati sensori esterni o un ESP32."),
  "EFETOR": steelL("END EFFECTOR", "EFECTOR", "EFFECTEUR", "ENDEFFEKTOR", "EFFETTORE"),
  "Ventosa": steelL("Suction cup", "Ventosa", "Ventouse", "Sauger", "Ventosa"),
  "Garra": steelL("Gripper", "Pinza", "Pince", "Greifer", "Pinza"),
  "Fila": steelL("Queue", "Cola", "File", "Warteschlange", "Coda"),
  "Modo": steelL("Mode", "Modo", "Mode", "Modus", "Modalità"),
  "CONTROLE SUPERVISIONADO": steelL("SUPERVISED CONTROL", "CONTROL SUPERVISADO", "CONTRÔLE SUPERVISÉ", "ÜBERWACHTE STEUERUNG", "CONTROLLO SUPERVISIONATO"),
  "HOME": steelL("HOME", "INICIO", "ACCUEIL", "START", "HOME"),
  "No equipamento real, o gateway inicia com": steelL("On real equipment, the gateway starts with", "En el equipo real, el gateway se inicia con", "Sur l'équipement réel, la passerelle démarre avec", "Am realen Gerät startet das Gateway mit", "Sull'apparecchiatura reale, il gateway si avvia con"),
  ". STOP permanece disponível; movimentos só são executados após liberação consciente no computador do robô.": steelL(". STOP remains available; movements are executed only after explicit authorization on the robot computer.", ". STOP permanece disponible; los movimientos solo se ejecutan después de una autorización explícita en el ordenador del robot.", ". STOP reste disponible ; les mouvements ne sont exécutés qu'après une autorisation explicite sur l'ordinateur du robot.", ". STOP bleibt verfügbar; Bewegungen werden erst nach ausdrücklicher Freigabe am Robotercomputer ausgeführt.", ". STOP rimane disponibile; i movimenti vengono eseguiti solo dopo un'autorizzazione esplicita sul computer del robot."),
  "Baud rate": steelL("Baud rate", "Velocidad en baudios", "Débit en bauds", "Baudrate", "Velocità in baud")
});

Object.assign(STEEL_LITERAL_I18N, {
  "Informe um CNPJ válido.": steelL("Enter a valid company ID.", "Ingrese un CNPJ válido.", "Saisissez un identifiant d'entreprise valide.", "Geben Sie eine gültige Unternehmens-ID ein.", "Inserisci un CNPJ valido."),
  "Informe um e-mail real e válido para receber o código de confirmação.": steelL("Enter a real, valid email to receive the confirmation code.", "Ingrese un correo real y válido para recibir el código de confirmación.", "Saisissez une adresse e-mail réelle et valide pour recevoir le code de confirmation.", "Geben Sie eine echte, gültige E-Mail-Adresse ein, um den Bestätigungscode zu erhalten.", "Inserisci un'e-mail reale e valida per ricevere il codice di conferma."),
  "A senha deve possuir pelo menos 8 caracteres.": steelL("The password must be at least 8 characters long.", "La contraseña debe tener al menos 8 caracteres.", "Le mot de passe doit comporter au moins 8 caractères.", "Das Passwort muss mindestens 8 Zeichen lang sein.", "La password deve contenere almeno 8 caratteri."),
  "Muitas solicitações de código para este e-mail. Tente novamente mais tarde.": steelL("Too many code requests for this email. Try again later.", "Demasiadas solicitudes de código para este correo. Inténtelo más tarde.", "Trop de demandes de code pour cette adresse. Réessayez plus tard.", "Zu viele Code-Anfragen für diese E-Mail. Versuchen Sie es später erneut.", "Troppe richieste di codice per questa e-mail. Riprova più tardi."),
  "Enviamos um código de 6 dígitos para o e-mail informado. A conta ainda não foi criada.": steelL("We sent a 6-digit code to the provided email. The account has not been created yet.", "Enviamos un código de 6 dígitos al correo indicado. La cuenta aún no fue creada.", "Nous avons envoyé un code à 6 chiffres à l'adresse indiquée. Le compte n'a pas encore été créé.", "Wir haben einen 6-stelligen Code an die angegebene E-Mail gesendet. Das Konto wurde noch nicht erstellt.", "Abbiamo inviato un codice di 6 cifre all'e-mail indicata. L'account non è ancora stato creato."),
  "Novo código enviado com sucesso.": steelL("New code sent successfully.", "Nuevo código enviado correctamente.", "Nouveau code envoyé avec succès.", "Neuer Code erfolgreich gesendet.", "Nuovo codice inviato correttamente."),
  "Informe o código de 6 dígitos enviado para seu e-mail.": steelL("Enter the 6-digit code sent to your email.", "Ingrese el código de 6 dígitos enviado a su correo.", "Saisissez le code à 6 chiffres envoyé à votre adresse e-mail.", "Geben Sie den 6-stelligen Code aus Ihrer E-Mail ein.", "Inserisci il codice di 6 cifre inviato alla tua e-mail."),
  "O código expirou. Volte ao cadastro e solicite um novo código.": steelL("The code has expired. Return to registration and request a new code.", "El código expiró. Vuelva al registro y solicite uno nuevo.", "Le code a expiré. Revenez à l'inscription et demandez un nouveau code.", "Der Code ist abgelaufen. Kehren Sie zur Registrierung zurück und fordern Sie einen neuen Code an.", "Il codice è scaduto. Torna alla registrazione e richiedi un nuovo codice."),
  "E-mail ou senha inválidos.": steelL("Invalid email or password.", "Correo o contraseña no válidos.", "E-mail ou mot de passe invalide.", "Ungültige E-Mail oder ungültiges Passwort.", "E-mail o password non validi."),
  "E-mail e senha são obrigatórios.": steelL("Email and password are required.", "El correo y la contraseña son obligatorios.", "L'e-mail et le mot de passe sont obligatoires.", "E-Mail und Passwort sind erforderlich.", "E-mail e password sono obbligatori."),
  "A prova de vida é obrigatória para o login facial.": steelL("A liveness check is required for facial sign-in.", "La prueba de vida es obligatoria para el acceso facial.", "Un test de présence est obligatoire pour la connexion faciale.", "Für die Gesichtsanmeldung ist eine Lebenderkennung erforderlich.", "La prova di vitalità è obbligatoria per l'accesso facciale."),
  "Olhe para a câmera, mova levemente a cabeça e retorne para a posição frontal.": steelL("Look at the camera, move your head slightly and return to the front position.", "Mire a la cámara, mueva ligeramente la cabeza y vuelva a la posición frontal.", "Regardez la caméra, bougez légèrement la tête puis revenez en position frontale.", "Schauen Sie in die Kamera, bewegen Sie den Kopf leicht und kehren Sie in die Frontalposition zurück.", "Guarda la fotocamera, muovi leggermente la testa e torna in posizione frontale."),
  "A prova de vida não foi confirmada.": steelL("The liveness check was not confirmed.", "La prueba de vida no fue confirmada.", "Le test de présence n'a pas été confirmé.", "Die Lebenderkennung wurde nicht bestätigt.", "La prova di vitalità non è stata confermata."),
  "Vire levemente a cabeça para um dos lados e retorne para a câmera.": steelL("Turn your head slightly to one side and return to the camera.", "Gire ligeramente la cabeza hacia un lado y vuelva a mirar la cámara.", "Tournez légèrement la tête d'un côté puis revenez vers la caméra.", "Drehen Sie den Kopf leicht zu einer Seite und schauen Sie wieder in die Kamera.", "Gira leggermente la testa da un lato e torna verso la fotocamera."),
  "Rosto não cadastrado ou não reconhecido.": steelL("Face not registered or not recognized.", "Rostro no registrado o no reconocido.", "Visage non enregistré ou non reconnu.", "Gesicht nicht registriert oder nicht erkannt.", "Volto non registrato o non riconosciuto."),
  "Entre com seu e-mail e senha ou cadastre seu rosto.": steelL("Sign in with your email and password or register your face.", "Ingrese con su correo y contraseña o registre su rostro.", "Connectez-vous avec votre e-mail et votre mot de passe ou enregistrez votre visage.", "Melden Sie sich mit E-Mail und Passwort an oder registrieren Sie Ihr Gesicht.", "Accedi con e-mail e password oppure registra il tuo volto."),
  "Não foi possível confirmar sua identidade com segurança.": steelL("We could not confirm your identity securely.", "No fue posible confirmar su identidad de forma segura.", "Nous n'avons pas pu confirmer votre identité de manière sûre.", "Ihre Identität konnte nicht sicher bestätigt werden.", "Non è stato possibile confermare la tua identità in modo sicuro."),
  "Olhe diretamente para a câmera e tente novamente.": steelL("Look directly at the camera and try again.", "Mire directamente a la cámara e inténtelo nuevamente.", "Regardez directement la caméra et réessayez.", "Schauen Sie direkt in die Kamera und versuchen Sie es erneut.", "Guarda direttamente la fotocamera e riprova.")
});

Object.assign(STEEL_LITERAL_I18N, {
  "IHM • CONTROLE SUPERVISIONADO": steelL("HMI • SUPERVISED CONTROL", "HMI • CONTROL SUPERVISADO", "IHM • CONTRÔLE SUPERVISÉ", "HMI • ÜBERWACHTE STEUERUNG", "HMI • CONTROLLO SUPERVISIONATO"),
  "Processo da máquina": steelL("Machine process", "Proceso de la máquina", "Processus de la machine", "Maschinenprozess", "Processo macchina"),
  "Visualização do processo, sensores, intertravamentos e comandos operacionais.": steelL("Process, sensor, interlock and operational command view.", "Vista del proceso, sensores, enclavamientos y comandos operativos.", "Vue du processus, des capteurs, des interverrouillages et des commandes opérationnelles.", "Ansicht von Prozess, Sensoren, Verriegelungen und Betriebsbefehlen.", "Vista di processo, sensori, interblocchi e comandi operativi."),
  "LINHA / CÉLULA": steelL("LINE / CELL", "LÍNEA / CÉLULA", "LIGNE / CELLULE", "LINIE / ZELLE", "LINEA / CELLA"),
  "Processo principal": steelL("Main process", "Proceso principal", "Processus principal", "Hauptprozess", "Processo principale"),
  "Processo parado": steelL("Process stopped", "Proceso detenido", "Processus arrêté", "Prozess gestoppt", "Processo arrestato"),
  "Entrada": steelL("Input", "Entrada", "Entrée", "Eingang", "Ingresso"),
  "Alimentação": steelL("Feed", "Alimentación", "Alimentation", "Zuführung", "Alimentazione"),
  "Esteira A": steelL("Conveyor A", "Cinta A", "Convoyeur A", "Förderband A", "Nastro A"),
  "Estação de processo": steelL("Process station", "Estación de proceso", "Station de processus", "Prozessstation", "Stazione di processo"),
  "Esteira B": steelL("Conveyor B", "Cinta B", "Convoyeur B", "Förderband B", "Nastro B"),
  "Saída": steelL("Output", "Salida", "Sortie", "Ausgang", "Uscita"),
  "Produto": steelL("Product", "Producto", "Produit", "Produkt", "Prodotto"),
  "CADEIA DE OPERAÇÃO": steelL("OPERATION CHAIN", "CADENA DE OPERACIÓN", "CHAÎNE D'OPÉRATION", "BETRIEBSKETTE", "CATENA OPERATIVA"),
  "Intertravamentos": steelL("Interlocks", "Enclavamientos", "Interverrouillages", "Verriegelungen", "Interblocchi"),
  "Permissão de START": steelL("START permission", "Permiso de START", "Autorisation START", "START-Freigabe", "Permesso START"),
  "Circuito E-stop": steelL("E-stop circuit", "Circuito E-stop", "Circuit d'arrêt d'urgence", "Not-Halt-Kreis", "Circuito E-stop"),
  "Porta / proteção": steelL("Door / guard", "Puerta / protección", "Porte / protection", "Tür / Schutz", "Porta / protezione"),
  "Alarme de processo": steelL("Process alarm", "Alarma de proceso", "Alarme de processus", "Prozessalarm", "Allarme di processo"),
  "COMANDOS": steelL("COMMANDS", "COMANDOS", "COMMANDES", "BEFEHLE", "COMANDI"),
  "Operação supervisionada": steelL("Supervised operation", "Operación supervisada", "Opération supervisée", "Überwachter Betrieb", "Operazione supervisionata"),
  "Modo operacional": steelL("Operating mode", "Modo operativo", "Mode opératoire", "Betriebsmodus", "Modalità operativa"),
  "Controle aguardando diagnóstico.": steelL("Control waiting for diagnostics.", "Control esperando diagnóstico.", "Contrôle en attente du diagnostic.", "Steuerung wartet auf Diagnose.", "Controllo in attesa della diagnostica."),
  "STOP da tela é uma parada operacional.": steelL("On-screen STOP is an operational stop.", "El STOP de pantalla es una parada operativa.", "Le STOP à l'écran est un arrêt opérationnel.", "Der Bildschirm-STOP ist ein Betriebsstopp.", "Lo STOP a schermo è un arresto operativo."),
  "Não substitui botão de emergência, relé de segurança, Safety PLC, cortina de luz ou outros dispositivos físicos certificados. START real só é liberado após telemetria recente e confirmação positiva dos intertravamentos pelo equipamento.": steelL("It does not replace an emergency button, safety relay, Safety PLC, light curtain or other certified physical devices. Real START is released only after recent telemetry and positive interlock confirmation from the equipment.", "No reemplaza un botón de emergencia, relé de seguridad, Safety PLC, cortina de luz u otros dispositivos físicos certificados. El START real solo se libera tras telemetría reciente y confirmación positiva de los enclavamientos por el equipo.", "Il ne remplace pas un bouton d'urgence, un relais de sécurité, un Safety PLC, une barrière immatérielle ou d'autres dispositifs physiques certifiés. Le START réel n'est autorisé qu'après une télémétrie récente et une confirmation positive des interverrouillages par l'équipement.", "Er ersetzt keinen Not-Aus-Taster, kein Sicherheitsrelais, keine Safety-PLC, keinen Lichtvorhang oder andere zertifizierte physische Geräte. Ein realer START wird erst nach aktueller Telemetrie und positiver Verriegelungsbestätigung durch das Gerät freigegeben.", "Non sostituisce pulsante di emergenza, relè di sicurezza, Safety PLC, barriera fotoelettrica o altri dispositivi fisici certificati. Lo START reale viene abilitato solo dopo telemetria recente e conferma positiva degli interblocchi dall'apparecchiatura."),
  "IHM STEELCONTROL": steelL("STEELCONTROL HMI", "HMI STEELCONTROL", "IHM STEELCONTROL", "STEELCONTROL HMI", "HMI STEELCONTROL"),
  "Controle industrial supervisionado": steelL("Supervised industrial control", "Control industrial supervisado", "Contrôle industriel supervisé", "Überwachte Industriesteuerung", "Controllo industriale supervisionato"),
  "O painel IHM será criado para este controlador. Na simulação, os comandos funcionam imediatamente. Em equipamento real, o controle remoto fica bloqueado por padrão.": steelL("The HMI panel will be created for this controller. In simulation, commands work immediately. On real equipment, remote control is blocked by default.", "El panel HMI se creará para este controlador. En simulación, los comandos funcionan inmediatamente. En equipo real, el control remoto está bloqueado por defecto.", "Le panneau IHM sera créé pour ce contrôleur. En simulation, les commandes fonctionnent immédiatement. Sur un équipement réel, le contrôle à distance est bloqué par défaut.", "Das HMI-Panel wird für diesen Controller erstellt. In der Simulation funktionieren Befehle sofort. Bei realen Geräten ist die Fernsteuerung standardmäßig gesperrt.", "Il pannello HMI verrà creato per questo controller. In simulazione, i comandi funzionano immediatamente. Sull'apparecchiatura reale, il controllo remoto è bloccato per impostazione predefinita."),
  "Habilitar comandos remotos no equipamento real": steelL("Enable remote commands on real equipment", "Habilitar comandos remotos en el equipo real", "Activer les commandes à distance sur l'équipement réel", "Fernbefehle am realen Gerät aktivieren", "Abilita comandi remoti sull'apparecchiatura reale"),
  "START real exige telemetria recente e confirmação positiva dos intertravamentos pelo controlador. STOP possui prazo curto e não substitui emergência física.": steelL("Real START requires recent telemetry and positive interlock confirmation from the controller. STOP has a short validity period and does not replace physical emergency stopping.", "El START real requiere telemetría reciente y confirmación positiva de los enclavamientos por el controlador. STOP tiene una validez corta y no reemplaza la parada de emergencia física.", "Le START réel exige une télémétrie récente et une confirmation positive des interverrouillages par le contrôleur. STOP a une validité courte et ne remplace pas l'arrêt d'urgence physique.", "Ein realer START erfordert aktuelle Telemetrie und eine positive Verriegelungsbestätigung vom Controller. STOP hat eine kurze Gültigkeit und ersetzt keinen physischen Not-Halt.", "Lo START reale richiede telemetria recente e conferma positiva degli interblocchi dal controller. STOP ha validità breve e non sostituisce l'arresto di emergenza fisico."),
  "IHM supervisionada": steelL("Supervised HMI", "HMI supervisada", "IHM supervisée", "Überwachte HMI", "HMI supervisionata"),
  "Simulação ativa": steelL("Simulation active", "Simulación activa", "Simulation active", "Simulation aktiv", "Simulazione attiva"),
  "Processo em operação": steelL("Process running", "Proceso en operación", "Processus en fonctionnement", "Prozess läuft", "Processo in funzione"),
  "Processo bloqueado": steelL("Process blocked", "Proceso bloqueado", "Processus bloqué", "Prozess gesperrt", "Processo bloccato"),
  "Controle remoto real desativado no cadastro desta máquina.": steelL("Real remote control is disabled in this machine's registration.", "El control remoto real está desactivado en el registro de esta máquina.", "Le contrôle à distance réel est désactivé dans l'enregistrement de cette machine.", "Die reale Fernsteuerung ist in der Registrierung dieser Maschine deaktiviert.", "Il controllo remoto reale è disabilitato nella registrazione di questa macchina."),
  "IHM em simulação funcional. Os comandos alteram o processo demonstrado.": steelL("HMI in functional simulation. Commands change the demonstrated process.", "HMI en simulación funcional. Los comandos cambian el proceso demostrado.", "IHM en simulation fonctionnelle. Les commandes modifient le processus démontré.", "HMI in funktionaler Simulation. Befehle ändern den dargestellten Prozess.", "HMI in simulazione funzionale. I comandi modificano il processo dimostrato."),
  "IHM real habilitada. Comandos passam pela fila autenticada com ACK e prazo de validade.": steelL("Real HMI enabled. Commands pass through the authenticated queue with ACK and expiry.", "HMI real habilitada. Los comandos pasan por la cola autenticada con ACK y vencimiento.", "IHM réelle activée. Les commandes passent par la file authentifiée avec ACK et expiration.", "Reale HMI aktiviert. Befehle laufen über die authentifizierte Warteschlange mit ACK und Ablaufzeit.", "HMI reale abilitata. I comandi passano attraverso la coda autenticata con ACK e scadenza.")
});

// Experiência completa da empresa e do credenciamento biométrico. Estes
// textos são criados tanto pelo HTML quanto por estados assíncronos da câmera.
Object.assign(STEEL_LITERAL_I18N, {
  "Credenciamento biométrico": steelL("Biometric enrollment", "Registro biométrico", "Enrôlement biométrique", "Biometrische Registrierung", "Registrazione biometrica"),
  "Funcionário • cadastro facial único": steelL("Employee • single facial enrollment", "Empleado • registro facial único", "Employé • enrôlement facial unique", "Mitarbeiter • einmalige Gesichtserfassung", "Dipendente • registrazione facciale unica"),
  "NOVA IDENTIDADE": steelL("NEW IDENTITY", "NUEVA IDENTIDAD", "NOUVELLE IDENTITÉ", "NEUE IDENTITÄT", "NUOVA IDENTITÀ"),
  "Vincule o rosto ao perfil do funcionário.": steelL("Link the face to the employee profile.", "Vincule el rostro al perfil del empleado.", "Associez le visage au profil de l'employé.", "Verknüpfen Sie das Gesicht mit dem Mitarbeiterprofil.", "Collega il volto al profilo del dipendente."),
  "A captura será validada antes de criar a credencial biométrica.": steelL("The capture will be validated before the biometric credential is created.", "La captura se validará antes de crear la credencial biométrica.", "La capture sera validée avant la création de l'identifiant biométrique.", "Die Aufnahme wird vor Erstellung der biometrischen Berechtigung geprüft.", "L'acquisizione sarà convalidata prima di creare la credenziale biometrica."),
  "Identificação da facial": steelL("Facial credential name", "Nombre de la credencial facial", "Nom de l'identifiant facial", "Name der Gesichtserkennung", "Nome della credenziale facciale"),
  "Nome interno usado para reconhecer esta credencial.": steelL("Internal name used to identify this credential.", "Nombre interno utilizado para identificar esta credencial.", "Nom interne utilisé pour identifier cet identifiant.", "Interner Name zur Identifizierung dieser Berechtigung.", "Nome interno usato per identificare questa credenziale."),
  "Enquadramento": steelL("Positioning", "Encuadre", "Cadrage", "Positionierung", "Inquadratura"),
  "Um único rosto centralizado na imagem.": steelL("One face centered in the image.", "Un solo rostro centrado en la imagen.", "Un seul visage centré dans l'image.", "Ein einzelnes Gesicht mittig im Bild.", "Un solo volto centrato nell'immagine."),
  "Prova de vida": steelL("Liveness check", "Prueba de vida", "Test de présence", "Lebenderkennung", "Prova di vitalità"),
  "Vire levemente a cabeça quando solicitado.": steelL("Turn your head slightly when prompted.", "Gire ligeramente la cabeza cuando se le solicite.", "Tournez légèrement la tête lorsque demandé.", "Drehen Sie den Kopf leicht, wenn Sie dazu aufgefordert werden.", "Gira leggermente la testa quando richiesto."),
  "Retorno frontal": steelL("Return to front", "Retorno frontal", "Retour de face", "Zurück zur Frontansicht", "Ritorno frontale"),
  "Olhe novamente para a câmera para confirmar.": steelL("Look at the camera again to confirm.", "Mire nuevamente a la cámara para confirmar.", "Regardez à nouveau la caméra pour confirmer.", "Schauen Sie zur Bestätigung erneut in die Kamera.", "Guarda nuovamente la fotocamera per confermare."),
  "Credencial criada": steelL("Credential created", "Credencial creada", "Identifiant créé", "Berechtigung erstellt", "Credenziale creata"),
  "Biometria protegida e vinculada ao perfil.": steelL("Biometrics protected and linked to the profile.", "Biometría protegida y vinculada al perfil.", "Biométrie protégée et associée au profil.", "Biometrie geschützt und mit dem Profil verknüpft.", "Biometria protetta e collegata al profilo."),
  "Confirmo que o funcionário autorizou o uso dos dados biométricos para autenticação.": steelL("I confirm that the employee authorized the use of biometric data for authentication.", "Confirmo que el empleado autorizó el uso de datos biométricos para autenticación.", "Je confirme que l'employé a autorisé l'utilisation des données biométriques pour l'authentification.", "Ich bestätige, dass der Mitarbeiter die Nutzung biometrischer Daten zur Authentifizierung genehmigt hat.", "Confermo che il dipendente ha autorizzato l'uso dei dati biometrici per l'autenticazione."),
  "Sem boné, óculos escuros ou luz diretamente atrás do rosto.": steelL("No cap, sunglasses or direct backlight behind the face.", "Sin gorra, gafas oscuras ni luz directa detrás del rostro.", "Sans casquette, lunettes noires ni lumière directe derrière le visage.", "Keine Kappe, Sonnenbrille oder direkte Hintergrundbeleuchtung.", "Senza cappello, occhiali scuri o luce diretta dietro il volto."),
  "CAPTURA AO VIVO": steelL("LIVE CAPTURE", "CAPTURA EN VIVO", "CAPTURE EN DIRECT", "LIVE-AUFNAHME", "ACQUISIZIONE DAL VIVO"),
  "Posicione o funcionário": steelL("Position the employee", "Posicione al empleado", "Positionnez l'employé", "Mitarbeiter positionieren", "Posiziona il dipendente"),
  "CÂMERA ATIVA": steelL("CAMERA ACTIVE", "CÁMARA ACTIVA", "CAMÉRA ACTIVE", "KAMERA AKTIV", "FOTOCAMERA ATTIVA"),
  "Qualidade da captura": steelL("Capture quality", "Calidad de captura", "Qualité de capture", "Aufnahmequalität", "Qualità dell'acquisizione"),
  "Aguardando autorização": steelL("Waiting for authorization", "Esperando autorización", "En attente d'autorisation", "Warten auf Zustimmung", "In attesa di autorizzazione"),
  "Confirme o consentimento biométrico acima.": steelL("Confirm biometric consent above.", "Confirme el consentimiento biométrico anterior.", "Confirmez le consentement biométrique ci-dessus.", "Bestätigen Sie oben die biometrische Einwilligung.", "Conferma il consenso biometrico qui sopra."),
  "Movimento confirmado": steelL("Movement confirmed", "Movimiento confirmado", "Mouvement confirmé", "Bewegung bestätigt", "Movimento confermato"),
  "Volte a olhar diretamente para a câmera.": steelL("Look directly at the camera again.", "Vuelva a mirar directamente a la cámara.", "Regardez de nouveau directement la caméra.", "Schauen Sie wieder direkt in die Kamera.", "Torna a guardare direttamente la fotocamera."),
  "Registrando biometria...": steelL("Registering biometrics...", "Registrando biometría...", "Enregistrement biométrique...", "Biometrie wird registriert...", "Registrazione biometrica..."),
  "Não se mova.": steelL("Do not move.", "No se mueva.", "Ne bougez pas.", "Nicht bewegen.", "Non muoverti."),
  "Biometria cadastrada": steelL("Registered biometrics", "Biometría registrada", "Biométrie enregistrée", "Registrierte Biometrie", "Biometria registrata"),
  "Este perfil pode possuir apenas uma biometria. Remova-a somente quando precisar cadastrar outro rosto.": steelL("This profile can have only one biometric credential. Remove it only when another face must be registered.", "Este perfil solo puede tener una credencial biométrica. Elimínela solo cuando necesite registrar otro rostro.", "Ce profil ne peut avoir qu'un seul identifiant biométrique. Supprimez-le uniquement pour enregistrer un autre visage.", "Dieses Profil kann nur eine biometrische Berechtigung haben. Entfernen Sie sie nur, um ein anderes Gesicht zu registrieren.", "Questo profilo può avere una sola credenziale biometrica. Rimuovila solo per registrare un altro volto.")
});

// Painéis especializados e cadastro de equipamento: evita trechos em
// português quando outro idioma está ativo no desktop.
Object.assign(STEEL_LITERAL_I18N, {
  "Painel inteligente da máquina": steelL("Smart machine dashboard", "Panel inteligente de la máquina", "Tableau intelligent de la machine", "Intelligentes Maschinen-Dashboard", "Dashboard intelligente della macchina"),
  "O tipo escolhido define quais grupos de indicadores entram no dashboard": steelL("The selected type defines which indicator groups appear on the dashboard", "El tipo seleccionado define qué grupos de indicadores aparecen en el panel", "Le type choisi définit les groupes d'indicateurs du tableau", "Der gewählte Typ bestimmt die Anzeigegruppen im Dashboard", "Il tipo scelto definisce i gruppi di indicatori nel dashboard"),
  "Configurar tipo": steelL("Configure type", "Configurar tipo", "Configurer le type", "Typ konfigurieren", "Configura tipo"),
  "Painel sob medida": steelL("Tailored dashboard", "Panel a medida", "Tableau sur mesure", "Individuelles Dashboard", "Dashboard su misura"),
  "Escolha o tipo de equipamento acima. O SteelControl recomendará somente os indicadores úteis para ele.": steelL("Choose the equipment type above. SteelControl will recommend only relevant indicators.", "Elija el tipo de equipo arriba. SteelControl recomendará solo indicadores relevantes.", "Choisissez le type d'équipement ci-dessus. SteelControl recommandera uniquement les indicateurs utiles.", "Wählen Sie oben den Gerätetyp. SteelControl empfiehlt nur relevante Anzeigen.", "Scegli il tipo di apparecchiatura. SteelControl consiglierà solo gli indicatori utili."),
  "Ativar painel": steelL("Enable dashboard", "Activar panel", "Activer le tableau", "Dashboard aktivieren", "Attiva dashboard"),
  "Produção e qualidade": steelL("Production and quality", "Producción y calidad", "Production et qualité", "Produktion und Qualität", "Produzione e qualità"),
  "Segurança e processo": steelL("Safety and process", "Seguridad y proceso", "Sécurité et processus", "Sicherheit und Prozess", "Sicurezza e processo"),
  "Manutenção e confiabilidade": steelL("Maintenance and reliability", "Mantenimiento y confiabilidad", "Maintenance et fiabilité", "Wartung und Zuverlässigkeit", "Manutenzione e affidabilità"),
  "Energia e utilidades": steelL("Energy and utilities", "Energía y servicios", "Énergie et utilités", "Energie und Medien", "Energia e utenze"),
  "O painel só exibirá valores realmente publicados pelo Edge ou controlador. Você pode ajustar os módulos recomendados.": steelL("The dashboard only displays values actually published by Edge or the controller. You can adjust the recommended modules.", "El panel solo muestra valores publicados por Edge o el controlador. Puede ajustar los módulos recomendados.", "Le tableau n'affiche que les valeurs publiées par Edge ou le contrôleur. Vous pouvez ajuster les modules recommandés.", "Das Dashboard zeigt nur von Edge oder der Steuerung veröffentlichte Werte. Empfohlene Module können angepasst werden.", "Il dashboard mostra solo valori pubblicati da Edge o dal controller. Puoi modificare i moduli consigliati."),
  "Operação do robô": steelL("Robot operation", "Operación del robot", "Fonctionnement du robot", "Roboterbetrieb", "Funzionamento del robot"),
  "Escolha operação manual ou ciclo automático de pick-and-place.": steelL("Choose manual operation or an automatic pick-and-place cycle.", "Elija operación manual o ciclo automático de pick-and-place.", "Choisissez le fonctionnement manuel ou un cycle pick-and-place automatique.", "Wählen Sie manuellen Betrieb oder einen automatischen Pick-and-Place-Zyklus.", "Scegli il funzionamento manuale o un ciclo pick-and-place automatico."),
  "MANUAL": steelL("MANUAL", "MANUAL", "MANUEL", "MANUELL", "MANUALE"),
  "AUTOMÁTICO": steelL("AUTOMATIC", "AUTOMÁTICO", "AUTOMATIQUE", "AUTOMATISCH", "AUTOMATICO"),
  "Controle jog industrial": steelL("Industrial jog control", "Control jog industrial", "Commande jog industrielle", "Industrielle Tippsteuerung", "Controllo jog industriale"),
  "Ciclo industrial pick-and-place": steelL("Industrial pick-and-place cycle", "Ciclo industrial pick-and-place", "Cycle industriel pick-and-place", "Industrieller Pick-and-Place-Zyklus", "Ciclo industriale pick-and-place"),
  "Manual liberado": steelL("Manual enabled", "Manual habilitado", "Mode manuel autorisé", "Manuell freigegeben", "Manuale abilitato"),
  "Movimento cartesiano assistido": steelL("Assisted Cartesian motion", "Movimiento cartesiano asistido", "Mouvement cartésien assisté", "Unterstützte kartesische Bewegung", "Movimento cartesiano assistito"),
  "Cada toque desloca o robô a partir da posição real atual.": steelL("Each press moves the robot from its current real position.", "Cada toque mueve el robot desde su posición real actual.", "Chaque pression déplace le robot depuis sa position réelle actuelle.", "Jeder Tastendruck bewegt den Roboter von seiner aktuellen realen Position.", "Ogni pressione sposta il robot dalla posizione reale attuale."),
  "Passo do movimento": steelL("Movement step", "Paso de movimiento", "Pas de déplacement", "Bewegungsschritt", "Passo di movimento"),
  "Velocidade automática (%)": steelL("Automatic speed (%)", "Velocidad automática (%)", "Vitesse automatique (%)", "Automatikgeschwindigkeit (%)", "Velocità automatica (%)"),
  "Pick-and-place com 5 pontos ensinados": steelL("Pick-and-place with 5 taught points", "Pick-and-place con 5 puntos enseñados", "Pick-and-place avec 5 points appris", "Pick-and-Place mit 5 eingelernten Punkten", "Pick-and-place con 5 punti appresi"),
  "Posicione o Dobot manualmente e capture P0 a P4. O ciclo usa as posições reais da célula.": steelL("Position the Dobot manually and capture P0 through P4. The cycle uses the cell's real positions.", "Posicione el Dobot manualmente y capture P0 a P4. El ciclo utiliza las posiciones reales de la celda.", "Positionnez le Dobot manuellement et capturez P0 à P4. Le cycle utilise les positions réelles de la cellule.", "Positionieren Sie den Dobot manuell und erfassen Sie P0 bis P4. Der Zyklus verwendet die realen Zellenpositionen.", "Posiziona manualmente il Dobot e acquisisci da P0 a P4. Il ciclo usa le posizioni reali della cella."),
  "Não ensinado": steelL("Not taught", "No enseñado", "Non appris", "Nicht eingelernt", "Non appreso"),
  "Capturar atual": steelL("Capture current", "Capturar actual", "Capturer la position", "Aktuelle Position erfassen", "Acquisisci posizione"),
  "Acima da peça": steelL("Above part", "Sobre la pieza", "Au-dessus de la pièce", "Über dem Teil", "Sopra il pezzo"),
  "Coleta": steelL("Pick", "Recogida", "Prise", "Aufnahme", "Presa"),
  "Acima do destino": steelL("Above destination", "Sobre el destino", "Au-dessus de la destination", "Über dem Ziel", "Sopra la destinazione"),
  "Entrega": steelL("Place", "Entrega", "Dépose", "Ablage", "Deposito"),
  "INICIAR CICLO": steelL("START CYCLE", "INICIAR CICLO", "DÉMARRER LE CYCLE", "ZYKLUS STARTEN", "AVVIA CICLO"),
  "REDEFINIR PONTOS": steelL("RESET POINTS", "REDEFINIR PUNTOS", "RÉINITIALISER LES POINTS", "PUNKTE ZURÜCKSETZEN", "REIMPOSTA PUNTI"),
  "Identificação do operador": steelL("Operator identification", "Identificación del operador", "Identification de l'opérateur", "Bedieneridentifikation", "Identificazione operatore"),
  "AUTENTICAÇÃO BIOMÉTRICA": steelL("BIOMETRIC AUTHENTICATION", "AUTENTICACIÓN BIOMÉTRICA", "AUTHENTIFICATION BIOMÉTRIQUE", "BIOMETRISCHE AUTHENTIFIZIERUNG", "AUTENTICAZIONE BIOMETRICA"),
  "Confirme sua identidade para continuar.": steelL("Confirm your identity to continue.", "Confirme su identidad para continuar.", "Confirmez votre identité pour continuer.", "Bestätigen Sie Ihre Identität, um fortzufahren.", "Conferma la tua identità per continuare."),
  "Uma verificação rápida protege o acesso às máquinas e registra o operador responsável.": steelL("A quick check protects machine access and records the responsible operator.", "Una verificación rápida protege el acceso a las máquinas y registra al operador responsable.", "Une vérification rapide protège l'accès aux machines et enregistre l'opérateur responsable.", "Eine schnelle Prüfung schützt den Maschinenzugriff und protokolliert den verantwortlichen Bediener.", "Una verifica rapida protegge l'accesso alle macchine e registra l'operatore responsabile."),
  "Mantenha o rosto dentro da área indicada.": steelL("Keep your face inside the indicated area.", "Mantenga el rostro dentro del área indicada.", "Gardez le visage dans la zone indiquée.", "Halten Sie Ihr Gesicht im markierten Bereich.", "Mantieni il volto nell'area indicata."),
  "Siga o movimento solicitado na tela.": steelL("Follow the movement requested on screen.", "Siga el movimiento solicitado en pantalla.", "Suivez le mouvement demandé à l'écran.", "Folgen Sie der auf dem Bildschirm angeforderten Bewegung.", "Segui il movimento richiesto sullo schermo."),
  "Retorne ao centro para concluir a leitura.": steelL("Return to the center to complete the scan.", "Vuelva al centro para completar la lectura.", "Revenez au centre pour terminer la lecture.", "Kehren Sie zur Mitte zurück, um den Scan abzuschließen.", "Torna al centro per completare la lettura."),
  "A câmera é ativada somente durante esta validação.": steelL("The camera is active only during this validation.", "La cámara se activa solo durante esta validación.", "La caméra n'est activée que pendant cette validation.", "Die Kamera ist nur während dieser Prüfung aktiv.", "La fotocamera si attiva solo durante questa verifica.")
});

// Landing page atual. Mantém a apresentação comercial no mesmo idioma
// selecionado no restante do Desktop, sem duplicar uma segunda camada de i18n.
Object.assign(STEEL_LITERAL_I18N, {
  "Sistema": steelL("System", "Sistema", "Système", "System", "Sistema"),
  "Máquinas": steelL("Machines", "Máquinas", "Machines", "Maschinen", "Macchine"),
  "Benefícios": steelL("Benefits", "Beneficios", "Avantages", "Vorteile", "Vantaggi"),
  "Como funciona": steelL("How it works", "Cómo funciona", "Fonctionnement", "So funktioniert es", "Come funziona"),
  "Segurança": steelL("Security", "Seguridad", "Sécurité", "Sicherheit", "Sicurezza"),
  "Entrar": steelL("Sign in", "Entrar", "Se connecter", "Anmelden", "Accedi"),
  "Toda a sua fábrica num só painel.": steelL("Your entire factory in one dashboard.", "Toda su fábrica en un solo panel.", "Toute votre usine sur un seul tableau de bord.", "Ihre gesamte Fabrik in einem Dashboard.", "Tutta la fabbrica in un'unica dashboard."),
  "O SteelControl conecta robôs, CNCs, esteiras, impressoras 3D, CLPs e sensores num só lugar. Acompanhe a produção em tempo real, comande equipamentos com segurança e aja antes da parada.": steelL("SteelControl connects robots, CNCs, conveyors, 3D printers, PLCs and sensors in one place. Monitor production in real time, control equipment safely and act before downtime.", "SteelControl conecta robots, CNC, cintas, impresoras 3D, PLC y sensores en un solo lugar. Supervise la producción en tiempo real, controle equipos con seguridad y actúe antes de una parada.", "SteelControl connecte robots, CNC, convoyeurs, imprimantes 3D, automates et capteurs en un seul endroit. Suivez la production en temps réel, commandez les équipements en sécurité et intervenez avant l'arrêt.", "SteelControl verbindet Roboter, CNC-Anlagen, Förderbänder, 3D-Drucker, SPS und Sensoren an einem Ort. Überwachen Sie die Produktion in Echtzeit, steuern Sie Anlagen sicher und handeln Sie vor einem Stillstand.", "SteelControl collega robot, CNC, nastri, stampanti 3D, PLC e sensori in un unico ambiente. Monitora la produzione in tempo reale, controlla le macchine in sicurezza e intervieni prima del fermo."),
  "Ver o sistema": steelL("See the system", "Ver el sistema", "Voir le système", "System ansehen", "Vedi il sistema"),
  "Desktop, mobile e Edge conectados à mesma operação industrial.": steelL("Desktop, mobile and Edge connected to the same industrial operation.", "Desktop, móvil y Edge conectados a la misma operación industrial.", "Desktop, mobile et Edge connectés à la même exploitation industrielle.", "Desktop, Mobile und Edge mit demselben Industriebetrieb verbunden.", "Desktop, mobile ed Edge collegati alla stessa operazione industriale."),
  "Robô articulado": steelL("Articulated robot", "Robot articulado", "Robot articulé", "Knickarmroboter", "Robot articolato"),
  "Fresadora CNC": steelL("CNC milling machine", "Fresadora CNC", "Fraiseuse CNC", "CNC-Fräsmaschine", "Fresatrice CNC"),
  "Tanque de processo": steelL("Process tank", "Tanque de proceso", "Cuve de procédé", "Prozesstank", "Serbatoio di processo"),
  "Impressora 3D": steelL("3D printer", "Impresora 3D", "Imprimante 3D", "3D-Drucker", "Stampante 3D"),
  "Esteira": steelL("Conveyor", "Cinta transportadora", "Convoyeur", "Förderband", "Nastro trasportatore"),
  "Painel de CLP": steelL("PLC panel", "Panel PLC", "Armoire automate", "SPS-Schaltschrank", "Pannello PLC"),
  "Conectada": steelL("Connected", "Conectada", "Connectée", "Verbunden", "Connessa"),
  "Ilustração 3D": steelL("3D illustration", "Ilustración 3D", "Illustration 3D", "3D-Illustration", "Illustrazione 3D"),
  "Robôs": steelL("Robots", "Robots", "Robots", "Roboter", "Robot"),
  "Esteiras": steelL("Conveyors", "Cintas", "Convoyeurs", "Förderbänder", "Nastri"),
  "Impressoras 3D": steelL("3D printers", "Impresoras 3D", "Imprimantes 3D", "3D-Drucker", "Stampanti 3D"),
  "CLP e IHM": steelL("PLC and HMI", "PLC y HMI", "Automate et IHM", "SPS und HMI", "PLC e HMI"),
  "Tanques e sensores": steelL("Tanks and sensors", "Tanques y sensores", "Cuves et capteurs", "Tanks und Sensoren", "Serbatoi e sensori"),
  "Veja o sistema funcionando.": steelL("See the system in action.", "Vea el sistema en funcionamiento.", "Découvrez le système en action.", "Erleben Sie das System im Einsatz.", "Guarda il sistema in azione."),
  "Telas reais do SteelControl para acompanhar máquinas, comandos, produção e segurança. Aqui, um Dobot Magician.": steelL("Real SteelControl screens for monitoring machines, commands, production and safety. Shown here with a Dobot Magician.", "Pantallas reales de SteelControl para supervisar máquinas, comandos, producción y seguridad. Aquí, un Dobot Magician.", "Écrans réels de SteelControl pour suivre machines, commandes, production et sécurité. Ici, un Dobot Magician.", "Echte SteelControl-Ansichten zur Überwachung von Maschinen, Befehlen, Produktion und Sicherheit. Hier mit einem Dobot Magician.", "Schermate reali di SteelControl per monitorare macchine, comandi, produzione e sicurezza. Qui, un Dobot Magician."),
  "Painel do Dobot": steelL("Dobot dashboard", "Panel del Dobot", "Tableau du Dobot", "Dobot-Dashboard", "Dashboard Dobot"),
  "Posição do efetuador, ângulos das juntas, ventosa e garra. O que o equipamento não envia aparece como \"Não instalado\", sem leitura inventada.": steelL("End-effector position, joint angles, suction cup and gripper. Data not sent by the equipment appears as \"Not installed\", with no fabricated readings.", "Posición del efector, ángulos de las articulaciones, ventosa y pinza. Lo que el equipo no envía aparece como \"No instalado\", sin lecturas inventadas.", "Position de l'effecteur, angles des articulations, ventouse et pince. Les données non transmises apparaissent comme \"Non installé\", sans valeur inventée.", "Endeffektorposition, Gelenkwinkel, Sauger und Greifer. Nicht gelieferte Daten erscheinen als \"Nicht installiert\", ohne erfundene Messwerte.", "Posizione dell'effettore, angoli dei giunti, ventosa e pinza. I dati non inviati appaiono come \"Non installato\", senza valori inventati."),
  "Controle do robô": steelL("Robot control", "Control del robot", "Commande du robot", "Robotersteuerung", "Controllo robot"),
  "Movimento cartesiano assistido e ciclo de pick-and-place por pontos ensinados. O botão PARAR fica disponível durante toda a operação.": steelL("Assisted Cartesian movement and a taught-point pick-and-place cycle. The STOP button remains available throughout operation.", "Movimiento cartesiano asistido y ciclo pick-and-place con puntos enseñados. El botón PARAR permanece disponible durante toda la operación.", "Mouvement cartésien assisté et cycle pick-and-place par points appris. Le bouton ARRÊTER reste disponible pendant toute l'opération.", "Unterstützte kartesische Bewegung und Pick-and-Place-Zyklus mit eingelernten Punkten. STOP bleibt während des gesamten Betriebs verfügbar.", "Movimento cartesiano assistito e ciclo pick-and-place con punti appresi. Il pulsante ARRESTA resta disponibile durante tutta l'operazione."),
  "Equipamentos": steelL("Equipment", "Equipos", "Équipements", "Anlagen", "Apparecchiature"),
  "Cadastre máquinas e deixe o SteelControl Edge encontrar equipamentos na rede ou por USB/Serial. O administrador aprova cada cadastro.": steelL("Register machines and let SteelControl Edge discover equipment over the network or USB/Serial. An administrator approves each registration.", "Registre máquinas y permita que SteelControl Edge encuentre equipos en la red o por USB/Serial. Un administrador aprueba cada registro.", "Enregistrez les machines et laissez SteelControl Edge détecter les équipements sur le réseau ou en USB/Série. Un administrateur valide chaque ajout.", "Registrieren Sie Maschinen und lassen Sie SteelControl Edge Anlagen im Netzwerk oder über USB/Seriell finden. Jede Registrierung wird administrativ freigegeben.", "Registra le macchine e lascia che SteelControl Edge trovi i dispositivi in rete o via USB/Seriale. Un amministratore approva ogni registrazione."),
  "Um painel que se adapta a cada máquina.": steelL("A dashboard that adapts to every machine.", "Un panel que se adapta a cada máquina.", "Un tableau qui s'adapte à chaque machine.", "Ein Dashboard, das sich jeder Maschine anpasst.", "Una dashboard che si adatta a ogni macchina."),
  "Você não precisa de uma tela nova para cada fabricante. Cada equipamento mostra os indicadores que importam para ele, e o que não envia aparece como \"Não informado\".": steelL("You do not need a new screen for every manufacturer. Each machine shows the indicators that matter to it, and missing signals appear as \"Not provided\".", "No necesita una pantalla nueva para cada fabricante. Cada equipo muestra los indicadores relevantes y lo que no envía aparece como \"No informado\".", "Vous n'avez pas besoin d'un écran par fabricant. Chaque équipement affiche ses indicateurs utiles et les signaux absents apparaissent comme \"Non renseigné\".", "Sie benötigen nicht für jeden Hersteller eine neue Ansicht. Jede Maschine zeigt relevante Kennzahlen; fehlende Signale erscheinen als \"Nicht angegeben\".", "Non serve una schermata diversa per ogni produttore. Ogni macchina mostra gli indicatori rilevanti e i segnali assenti appaiono come \"Non indicato\"."),
  "Em toda máquina": steelL("On every machine", "En cada máquina", "Sur chaque machine", "Bei jeder Maschine", "Su ogni macchina"),
  "Específico do equipamento": steelL("Equipment-specific", "Específico del equipo", "Spécifique à l'équipement", "Anlagenspezifisch", "Specifico dell'apparecchiatura"),
  "Exemplos. Cada máquina define as seções do próprio painel.": steelL("Examples. Each machine defines its own dashboard sections.", "Ejemplos. Cada máquina define las secciones de su propio panel.", "Exemples. Chaque machine définit les sections de son tableau.", "Beispiele. Jede Maschine definiert ihre eigenen Dashboard-Bereiche.", "Esempi. Ogni macchina definisce le sezioni della propria dashboard."),
  "Menos paradas. Mais controle.": steelL("Less downtime. More control.", "Menos paradas. Más control.", "Moins d'arrêts. Plus de contrôle.", "Weniger Stillstand. Mehr Kontrolle.", "Meno fermi. Più controllo."),
  "Tudo o que a operação precisa enxergar, num lugar só, sem trocar de equipamento.": steelL("Everything operations need to see, in one place, without replacing equipment.", "Todo lo que la operación necesita ver, en un solo lugar, sin cambiar equipos.", "Tout ce que l'exploitation doit voir, en un seul endroit, sans remplacer les équipements.", "Alles, was der Betrieb sehen muss, an einem Ort, ohne Anlagen auszutauschen.", "Tutto ciò che serve alla produzione, in un unico posto, senza sostituire le macchine."),
  "Veja a operação inteira": steelL("See the entire operation", "Vea toda la operación", "Visualisez toute l'exploitation", "Den gesamten Betrieb sehen", "Visualizza l'intera operazione"),
  "Status, temperatura, vibração, corrente, produção, ciclos e energia em tempo real, no desktop e no mobile.": steelL("Status, temperature, vibration, current, production, cycles and energy in real time on desktop and mobile.", "Estado, temperatura, vibración, corriente, producción, ciclos y energía en tiempo real, en desktop y móvil.", "État, température, vibration, courant, production, cycles et énergie en temps réel sur desktop et mobile.", "Status, Temperatur, Vibration, Strom, Produktion, Zyklen und Energie in Echtzeit auf Desktop und Mobilgerät.", "Stato, temperatura, vibrazioni, corrente, produzione, cicli ed energia in tempo reale su desktop e mobile."),
  "Aja antes da parada": steelL("Act before downtime", "Actúe antes de la parada", "Agissez avant l'arrêt", "Vor dem Stillstand handeln", "Intervieni prima del fermo"),
  "Conecte o que você já tem": steelL("Connect what you already have", "Conecte lo que ya tiene", "Connectez vos équipements existants", "Vorhandene Anlagen verbinden", "Collega ciò che hai già"),
  "Ficha técnica": steelL("Technical specifications", "Ficha técnica", "Fiche technique", "Technische Daten", "Scheda tecnica"),
  "Protocolos": steelL("Protocols", "Protocolos", "Protocoles", "Protokolle", "Protocolli"),
  "Plataformas": steelL("Platforms", "Plataformas", "Plateformes", "Plattformen", "Piattaforme"),
  "Acesso": steelL("Access", "Acceso", "Accès", "Zugriff", "Accesso"),
  "Atualização": steelL("Updates", "Actualización", "Actualisation", "Aktualisierung", "Aggiornamento"),
  "Dados": steelL("Data", "Datos", "Données", "Daten", "Dati"),
  "Auditoria": steelL("Audit", "Auditoría", "Audit", "Audit", "Audit"),
  "Operação": steelL("Operation", "Operación", "Exploitation", "Betrieb", "Operazione"),
  "Da máquina ao painel, tudo sincronizado.": steelL("From machine to dashboard, everything synchronized.", "De la máquina al panel, todo sincronizado.", "De la machine au tableau, tout est synchronisé.", "Von der Maschine zum Dashboard – alles synchronisiert.", "Dalla macchina alla dashboard, tutto sincronizzato."),
  "Máquina": steelL("Machine", "Máquina", "Machine", "Maschine", "Macchina"),
  "Chão de fábrica": steelL("Shop floor", "Planta industrial", "Atelier", "Fertigungsebene", "Reparto produttivo"),
  "Chave exclusiva por máquina": steelL("Unique key per machine", "Clave exclusiva por máquina", "Clé unique par machine", "Eindeutiger Schlüssel je Maschine", "Chiave univoca per macchina"),
  "API e dados": steelL("API and data", "API y datos", "API et données", "API und Daten", "API e dati"),
  "Banco de dados central": steelL("Central database", "Base de datos central", "Base de données centrale", "Zentrale Datenbank", "Database centrale"),
  "Desktop e mobile": steelL("Desktop and mobile", "Desktop y móvil", "Desktop et mobile", "Desktop und Mobile", "Desktop e mobile"),
  "Tempo real": steelL("Real time", "Tiempo real", "Temps réel", "Echtzeit", "Tempo reale"),
  "Controle também é saber quem agiu.": steelL("Control also means knowing who acted.", "Control también significa saber quién actuó.", "Le contrôle, c'est aussi savoir qui a agi.", "Kontrolle bedeutet auch zu wissen, wer gehandelt hat.", "Controllo significa anche sapere chi ha agito."),
  "Do login ao comando do robô, a operação é protegida por identidade, permissão e rastreabilidade.": steelL("From login to robot commands, operations are protected by identity, permissions and traceability.", "Desde el inicio de sesión hasta los comandos del robot, la operación está protegida por identidad, permisos y trazabilidad.", "De la connexion aux commandes du robot, l'exploitation est protégée par l'identité, les autorisations et la traçabilité.", "Von der Anmeldung bis zum Roboterbefehl wird der Betrieb durch Identität, Berechtigungen und Nachverfolgbarkeit geschützt.", "Dal login ai comandi del robot, le operazioni sono protette da identità, autorizzazioni e tracciabilità."),
  "Comandos físicos começam bloqueados": steelL("Physical commands start locked", "Los comandos físicos comienzan bloqueados", "Les commandes physiques sont verrouillées par défaut", "Physische Befehle sind zunächst gesperrt", "I comandi fisici partono bloccati"),
  "O operador libera digitando:": steelL("The operator unlocks by typing:", "El operador desbloquea escribiendo:", "L'opérateur déverrouille en saisissant :", "Der Bediener entsperrt durch Eingabe von:", "L'operatore sblocca digitando:"),
  "Identidade verificada": steelL("Verified identity", "Identidad verificada", "Identité vérifiée", "Verifizierte Identität", "Identità verificata"),
  "Comandos autenticados": steelL("Authenticated commands", "Comandos autenticados", "Commandes authentifiées", "Authentifizierte Befehle", "Comandi autenticati"),
  "Segurança física continua obrigatória": steelL("Physical safety remains mandatory", "La seguridad física sigue siendo obligatoria", "La sécurité physique reste obligatoire", "Physische Sicherheit bleibt verpflichtend", "La sicurezza fisica resta obbligatoria"),
  "Entre no SteelControl.": steelL("Sign in to SteelControl.", "Entre en SteelControl.", "Connectez-vous à SteelControl.", "Bei SteelControl anmelden.", "Accedi a SteelControl."),
  "Acesse sua empresa para monitorar equipamentos, controlar operações e acompanhar os dados da fábrica em uma única plataforma.": steelL("Access your company to monitor equipment, control operations and follow factory data in one platform.", "Acceda a su empresa para supervisar equipos, controlar operaciones y seguir los datos de fábrica en una sola plataforma.", "Accédez à votre entreprise pour superviser les équipements, piloter les opérations et suivre les données de l'usine sur une seule plateforme.", "Greifen Sie auf Ihr Unternehmen zu, um Anlagen zu überwachen, Abläufe zu steuern und Fabrikdaten auf einer Plattform zu verfolgen.", "Accedi alla tua azienda per monitorare le macchine, controllare le operazioni e seguire i dati di fabbrica in un'unica piattaforma."),
  "Sua operação em um só lugar": steelL("Your operation in one place", "Su operación en un solo lugar", "Votre exploitation en un seul endroit", "Ihr Betrieb an einem Ort", "La tua operazione in un unico posto"),
  "OEE e disponibilidade": steelL("OEE and availability", "OEE y disponibilidad", "OEE et disponibilité", "OEE und Verfügbarkeit", "OEE e disponibilità"),
  "Tempo de ciclo": steelL("Cycle time", "Tiempo de ciclo", "Temps de cycle", "Zykluszeit", "Tempo ciclo"),
  "Produção e refugo": steelL("Production and scrap", "Producción y rechazos", "Production et rebuts", "Produktion und Ausschuss", "Produzione e scarti"),
  "Ordem de produção e lote": steelL("Work order and batch", "Orden de producción y lote", "Ordre de fabrication et lot", "Fertigungsauftrag und Charge", "Ordine di produzione e lotto"),
  "Segurança: E-stop e porta": steelL("Safety: E-stop and door", "Seguridad: E-stop y puerta", "Sécurité : arrêt d'urgence et porte", "Sicherheit: Not-Halt und Tür", "Sicurezza: E-stop e porta"),
  "Manutenção e horas de operação": steelL("Maintenance and operating hours", "Mantenimiento y horas de operación", "Maintenance et heures de fonctionnement", "Wartung und Betriebsstunden", "Manutenzione e ore operative"),
  "Energia": steelL("Energy", "Energía", "Énergie", "Energie", "Energia"),
  "Pressão de ar": steelL("Air pressure", "Presión de aire", "Pression d'air", "Luftdruck", "Pressione aria"),
  "Robô": steelL("Robot", "Robot", "Robot", "Roboter", "Robot"),
  "CLP": steelL("PLC", "PLC", "Automate", "SPS", "PLC"),
  "Ventosa e garra": steelL("Suction cup and gripper", "Ventosa y pinza", "Ventouse et pince", "Sauger und Greifer", "Ventosa e pinza"),
  "Fila de comandos": steelL("Command queue", "Cola de comandos", "File de commandes", "Befehlswarteschlange", "Coda comandi"),
  "Rotação do fuso": steelL("Spindle speed", "Velocidad del husillo", "Vitesse de broche", "Spindeldrehzahl", "Velocità mandrino"),
  "Vida da ferramenta": steelL("Tool life", "Vida de la herramienta", "Durée de vie de l'outil", "Werkzeugstandzeit", "Vita utensile"),
  "Carga dos eixos": steelL("Axis load", "Carga de ejes", "Charge des axes", "Achslast", "Carico assi"),
  "Programa em execução": steelL("Running program", "Programa en ejecución", "Programme en cours", "Laufendes Programm", "Programma in esecuzione"),
  "Temperatura do bico": steelL("Nozzle temperature", "Temperatura de la boquilla", "Température de la buse", "Düsentemperatur", "Temperatura ugello"),
  "Temperatura da mesa": steelL("Bed temperature", "Temperatura de la cama", "Température du plateau", "Druckbetttemperatur", "Temperatura piano"),
  "Progresso da peça": steelL("Part progress", "Progreso de la pieza", "Progression de la pièce", "Bauteilfortschritt", "Avanzamento pezzo"),
  "Tempo restante": steelL("Time remaining", "Tiempo restante", "Temps restant", "Restzeit", "Tempo rimanente"),
  "Velocidade da correia": steelL("Belt speed", "Velocidad de la cinta", "Vitesse du convoyeur", "Bandgeschwindigkeit", "Velocità nastro"),
  "Corrente do motor": steelL("Motor current", "Corriente del motor", "Courant moteur", "Motorstrom", "Corrente motore"),
  "Contagem de peças": steelL("Part count", "Conteo de piezas", "Comptage des pièces", "Teilezählung", "Conteggio pezzi"),
  "Sensor de presença": steelL("Presence sensor", "Sensor de presencia", "Capteur de présence", "Präsenzsensor", "Sensore di presenza"),
  "Nível": steelL("Level", "Nivel", "Niveau", "Füllstand", "Livello"),
  "Pressão": steelL("Pressure", "Presión", "Pression", "Druck", "Pressione"),
  "Temperatura do fluido": steelL("Fluid temperature", "Temperatura del fluido", "Température du fluide", "Fluidtemperatur", "Temperatura fluido"),
  "Estado das válvulas": steelL("Valve status", "Estado de las válvulas", "État des vannes", "Ventilstatus", "Stato valvole"),
  "Entradas e saídas": steelL("Inputs and outputs", "Entradas y salidas", "Entrées et sorties", "Ein- und Ausgänge", "Ingressi e uscite"),
  "Alarmes ativos": steelL("Active alarms", "Alarmas activas", "Alarmes actives", "Aktive Alarme", "Allarmi attivi"),
  "Estado do programa": steelL("Program status", "Estado del programa", "État du programme", "Programmstatus", "Stato programma"),
  "Tempo de ciclo do CLP": steelL("PLC cycle time", "Tiempo de ciclo del PLC", "Temps de cycle de l'automate", "SPS-Zykluszeit", "Tempo ciclo PLC"),
  "Limites de atenção e críticos por máquina, alertas, parada de segurança automática e manutenção preventiva por ciclos.": steelL("Warning and critical limits per machine, alerts, automatic safety stops and cycle-based preventive maintenance.", "Límites de advertencia y críticos por máquina, alertas, parada de seguridad automática y mantenimiento preventivo por ciclos.", "Seuils d'alerte et critiques par machine, alertes, arrêt de sécurité automatique et maintenance préventive par cycles.", "Warn- und kritische Grenzwerte je Maschine, Alarme, automatischer Sicherheitsstopp und zyklusbasierte vorbeugende Wartung.", "Limiti di attenzione e critici per macchina, allarmi, arresto automatico di sicurezza e manutenzione preventiva a cicli."),
  "Robôs, CNC, CLP, ESP32 e gateways, por HTTP, MQTT, Modbus, OPC UA, TCP/IP ou USB/Serial.": steelL("Robots, CNC, PLC, ESP32 and gateways via HTTP, MQTT, Modbus, OPC UA, TCP/IP or USB/Serial.", "Robots, CNC, PLC, ESP32 y gateways por HTTP, MQTT, Modbus, OPC UA, TCP/IP o USB/Serial.", "Robots, CNC, automates, ESP32 et passerelles via HTTP, MQTT, Modbus, OPC UA, TCP/IP ou USB/Série.", "Roboter, CNC, SPS, ESP32 und Gateways über HTTP, MQTT, Modbus, OPC UA, TCP/IP oder USB/Seriell.", "Robot, CNC, PLC, ESP32 e gateway via HTTP, MQTT, Modbus, OPC UA, TCP/IP o USB/Seriale."),
  "Robôs, CNC, impressoras 3D, esteiras, CLP, ESP32 e gateways": steelL("Robots, CNC, 3D printers, conveyors, PLC, ESP32 and gateways", "Robots, CNC, impresoras 3D, cintas, PLC, ESP32 y gateways", "Robots, CNC, imprimantes 3D, convoyeurs, automates, ESP32 et passerelles", "Roboter, CNC, 3D-Drucker, Förderbänder, SPS, ESP32 und Gateways", "Robot, CNC, stampanti 3D, nastri, PLC, ESP32 e gateway"),
  "HTTP, MQTT, Modbus TCP/RTU, OPC UA, TCP/IP e USB/Serial": steelL("HTTP, MQTT, Modbus TCP/RTU, OPC UA, TCP/IP and USB/Serial", "HTTP, MQTT, Modbus TCP/RTU, OPC UA, TCP/IP y USB/Serial", "HTTP, MQTT, Modbus TCP/RTU, OPC UA, TCP/IP et USB/Série", "HTTP, MQTT, Modbus TCP/RTU, OPC UA, TCP/IP und USB/Seriell", "HTTP, MQTT, Modbus TCP/RTU, OPC UA, TCP/IP e USB/Seriale"),
  "Desktop web e aplicativo mobile": steelL("Web desktop and mobile app", "Desktop web y aplicación móvil", "Application web desktop et mobile", "Web-Desktop und mobile App", "Desktop web e app mobile"),
  "Senha, MFA e reconhecimento facial, com cargos e permissões por empresa": steelL("Password, MFA and facial recognition, with company roles and permissions", "Contraseña, MFA y reconocimiento facial, con cargos y permisos por empresa", "Mot de passe, MFA et reconnaissance faciale, avec rôles et autorisations par entreprise", "Passwort, MFA und Gesichtserkennung mit Rollen und Berechtigungen je Unternehmen", "Password, MFA e riconoscimento facciale, con ruoli e permessi per azienda"),
  "Ao vivo, com estado de cada máquina: Conectada, Instável ou Offline": steelL("Live, with each machine shown as Connected, Unstable or Offline", "En vivo, con cada máquina como Conectada, Inestable u Offline", "En direct, avec chaque machine Connectée, Instable ou Hors ligne", "Live, mit Maschinenstatus Verbunden, Instabil oder Offline", "In tempo reale, con ogni macchina Connessa, Instabile o Offline"),
  "Sinal que a máquina não envia aparece como \"Não informado\"": steelL("Signals not sent by the machine appear as \"Not provided\"", "Las señales no enviadas por la máquina aparecen como \"No informado\"", "Les signaux non transmis apparaissent comme \"Non renseigné\"", "Nicht gelieferte Signale erscheinen als \"Nicht angegeben\"", "I segnali non inviati appaiono come \"Non indicato\""),
  "Registro de quem executou cada comando e quando": steelL("Record of who executed each command and when", "Registro de quién ejecutó cada comando y cuándo", "Journal de l'auteur et de l'heure de chaque commande", "Protokoll, wer welchen Befehl wann ausgeführt hat", "Registro di chi ha eseguito ogni comando e quando"),
  "Modo simulação ou equipamento real": steelL("Simulation mode or real equipment", "Modo simulación o equipo real", "Mode simulation ou équipement réel", "Simulationsmodus oder reale Anlage", "Modalità simulazione o macchina reale"),
  "Robô, impressora 3D, CNC, esteira, CLP, ESP32 ou qualquer equipamento com sensores.": steelL("Robot, 3D printer, CNC, conveyor, PLC, ESP32 or any sensor-equipped machine.", "Robot, impresora 3D, CNC, cinta, PLC, ESP32 o cualquier equipo con sensores.", "Robot, imprimante 3D, CNC, convoyeur, automate, ESP32 ou tout équipement doté de capteurs.", "Roboter, 3D-Drucker, CNC, Förderband, SPS, ESP32 oder jede Maschine mit Sensoren.", "Robot, stampante 3D, CNC, nastro, PLC, ESP32 o qualsiasi macchina con sensori."),
  "Coleta, valida limites e mantém o equipamento conectado. Um Edge cuida de várias máquinas.": steelL("Collects data, validates limits and keeps equipment connected. One Edge serves multiple machines.", "Recopila datos, valida límites y mantiene el equipo conectado. Un Edge gestiona varias máquinas.", "Collecte les données, valide les limites et maintient les équipements connectés. Un Edge gère plusieurs machines.", "Erfasst Daten, prüft Grenzwerte und hält Anlagen verbunden. Ein Edge betreut mehrere Maschinen.", "Raccoglie dati, convalida i limiti e mantiene le macchine connesse. Un Edge gestisce più macchine."),
  "Telemetria, alertas, comandos, permissões e auditoria organizados num só lugar.": steelL("Telemetry, alerts, commands, permissions and audit organized in one place.", "Telemetría, alertas, comandos, permisos y auditoría organizados en un solo lugar.", "Télémétrie, alertes, commandes, autorisations et audit réunis en un seul endroit.", "Telemetrie, Alarme, Befehle, Berechtigungen und Audit an einem Ort.", "Telemetria, allarmi, comandi, permessi e audit organizzati in un unico posto."),
  "A mesma informação em todas as telas, atualizada ao vivo.": steelL("The same information on every screen, updated live.", "La misma información en todas las pantallas, actualizada en vivo.", "Les mêmes informations sur tous les écrans, mises à jour en direct.", "Dieselben Informationen auf allen Bildschirmen, live aktualisiert.", "Le stesse informazioni su ogni schermo, aggiornate in tempo reale."),
  "Senha, MFA e reconhecimento facial, com cargos e permissões por empresa.": steelL("Password, MFA and facial recognition, with company roles and permissions.", "Contraseña, MFA y reconocimiento facial, con cargos y permisos por empresa.", "Mot de passe, MFA et reconnaissance faciale, avec rôles et autorisations par entreprise.", "Passwort, MFA und Gesichtserkennung mit Rollen und Berechtigungen je Unternehmen.", "Password, MFA e riconoscimento facciale, con ruoli e permessi per azienda."),
  "O movimento físico só é liberado pelo operador e fica registrado na auditoria.": steelL("Physical movement is released only by the operator and recorded in the audit trail.", "El movimiento físico solo lo libera el operador y queda registrado en la auditoría.", "Le mouvement physique n'est autorisé que par l'opérateur et reste enregistré dans l'audit.", "Physische Bewegung wird nur durch den Bediener freigegeben und im Audit protokolliert.", "Il movimento fisico viene abilitato solo dall'operatore e registrato nell'audit."),
  "E-stop, Safety PLC e intertravamentos seguem necessários. O SteelControl não os substitui.": steelL("E-stop, Safety PLC and interlocks remain required. SteelControl does not replace them.", "E-stop, Safety PLC y enclavamientos siguen siendo necesarios. SteelControl no los sustituye.", "L'arrêt d'urgence, l'automate de sécurité et les interverrouillages restent obligatoires. SteelControl ne les remplace pas.", "Not-Halt, Safety-SPS und Verriegelungen bleiben erforderlich. SteelControl ersetzt sie nicht.", "E-stop, Safety PLC e interblocchi restano necessari. SteelControl non li sostituisce."),
  "© 2026 SteelControl. Desktop, mobile e Edge.": steelL("© 2026 SteelControl. Desktop, mobile and Edge.", "© 2026 SteelControl. Desktop, móvil y Edge.", "© 2026 SteelControl. Desktop, mobile et Edge.", "© 2026 SteelControl. Desktop, Mobile und Edge.", "© 2026 SteelControl. Desktop, mobile ed Edge.")
});

// Cobertura integral dos painéis Desktop. Estes textos aparecem em módulos
// especializados, estados assíncronos e formulários criados depois que a
// página carrega; por isso ficam no dicionário literal observado globalmente.
Object.assign(STEEL_LITERAL_I18N, {
  "Aguardando status da máquina": steelL("Waiting for machine status", "Esperando el estado de la máquina", "En attente de l'état de la machine", "Warten auf Maschinenstatus", "In attesa dello stato della macchina"),
  "IHM • PRODUÇÃO ADITIVA": steelL("HMI • ADDITIVE MANUFACTURING", "HMI • FABRICACIÓN ADITIVA", "IHM • FABRICATION ADDITIVE", "HMI • ADDITIVE FERTIGUNG", "HMI • PRODUZIONE ADDITIVA"),
  "Painel dedicado • aguardando telemetria da impressora.": steelL("Dedicated dashboard • waiting for printer telemetry.", "Panel dedicado • esperando telemetría de la impresora.", "Tableau dédié • en attente de la télémétrie de l'imprimante.", "Spezial-Dashboard • Druckertelemetrie wird erwartet.", "Dashboard dedicata • in attesa della telemetria della stampante."),
  "IHM EXCLUSIVA 3D": steelL("DEDICATED 3D HMI", "HMI EXCLUSIVA 3D", "IHM 3D DÉDIÉE", "EXKLUSIVE 3D-HMI", "HMI 3D DEDICATA"),
  "IHM REMOTA": steelL("REMOTE HMI", "HMI REMOTA", "IHM DISTANTE", "REMOTE-HMI", "HMI REMOTA"),
  "TRABALHO ATUAL": steelL("CURRENT JOB", "TRABAJO ACTUAL", "TRAVAIL ACTUEL", "AKTUELLER AUFTRAG", "LAVORO CORRENTE"),
  "Sem arquivo": steelL("No file", "Sin archivo", "Aucun fichier", "Keine Datei", "Nessun file"),
  "Camada": steelL("Layer", "Capa", "Couche", "Schicht", "Strato"),
  "de --": steelL("of --", "de --", "sur --", "von --", "di --"),
  "Decorrido": steelL("Elapsed", "Transcurrido", "Écoulé", "Verstrichen", "Trascorso"),
  "Restante": steelL("Remaining", "Restante", "Restant", "Verbleibend", "Rimanente"),
  "Conclusão": steelL("Completion", "Finalización", "Achèvement", "Abschluss", "Completamento"),
  "VISÃO REMOTA": steelL("REMOTE VIEW", "VISTA REMOTA", "VUE DISTANTE", "FERNANSICHT", "VISTA REMOTA"),
  "Câmera da impressão": steelL("Print camera", "Cámara de impresión", "Caméra d'impression", "Druckkamera", "Fotocamera di stampa"),
  "Sem câmera": steelL("No camera", "Sin cámara", "Aucune caméra", "Keine Kamera", "Nessuna fotocamera"),
  "Câmera não informada": steelL("Camera not provided", "Cámara no informada", "Caméra non renseignée", "Kamera nicht angegeben", "Fotocamera non indicata"),
  "Quando o Edge receber streamUrl ou snapshotUrl, a imagem aparecerá aqui.": steelL("When Edge receives streamUrl or snapshotUrl, the image will appear here.", "Cuando Edge reciba streamUrl o snapshotUrl, la imagen aparecerá aquí.", "Lorsque Edge recevra streamUrl ou snapshotUrl, l'image apparaîtra ici.", "Sobald Edge streamUrl oder snapshotUrl erhält, erscheint das Bild hier.", "Quando Edge riceverà streamUrl o snapshotUrl, l'immagine apparirà qui."),
  "Atualizar imagem": steelL("Refresh image", "Actualizar imagen", "Actualiser l'image", "Bild aktualisieren", "Aggiorna immagine"),
  "Abrir câmera": steelL("Open camera", "Abrir cámara", "Ouvrir la caméra", "Kamera öffnen", "Apri fotocamera"),
  "PROCESSO TÉRMICO": steelL("THERMAL PROCESS", "PROCESO TÉRMICO", "PROCESSUS THERMIQUE", "THERMISCHER PROZESS", "PROCESSO TERMICO"),
  "Temperaturas da máquina": steelL("Machine temperatures", "Temperaturas de la máquina", "Températures de la machine", "Maschinentemperaturen", "Temperature della macchina"),
  "Tecnologia: --": steelL("Technology: --", "Tecnología: --", "Technologie : --", "Technologie: --", "Tecnologia: --"),
  "Bico / extrusor": steelL("Nozzle / extruder", "Boquilla / extrusor", "Buse / extrudeuse", "Düse / Extruder", "Ugello / estrusore"),
  "Alvo: --": steelL("Target: --", "Objetivo: --", "Cible : --", "Sollwert: --", "Obiettivo: --"),
  "Mesa": steelL("Bed", "Cama", "Plateau", "Druckbett", "Piatto"),
  "Câmara / resina": steelL("Chamber / resin", "Cámara / resina", "Chambre / résine", "Kammer / Harz", "Camera / resina"),
  "PARÂMETROS DE IMPRESSÃO": steelL("PRINT PARAMETERS", "PARÁMETROS DE IMPRESIÓN", "PARAMÈTRES D'IMPRESSION", "DRUCKPARAMETER", "PARAMETRI DI STAMPA"),
  "Processo em tempo real": steelL("Real-time process", "Proceso en tiempo real", "Processus en temps réel", "Prozess in Echtzeit", "Processo in tempo reale"),
  "Ventoinha": steelL("Fan", "Ventilador", "Ventilateur", "Lüfter", "Ventola"),
  "Potência / exposição": steelL("Power / exposure", "Potencia / exposición", "Puissance / exposition", "Leistung / Belichtung", "Potenza / esposizione"),
  "Material": steelL("Material", "Material", "Matériau", "Material", "Materiale"),
  "Consumo: --": steelL("Consumption: --", "Consumo: --", "Consommation : --", "Verbrauch: --", "Consumo: --"),
  "Material restante": steelL("Remaining material", "Material restante", "Matériau restant", "Restmaterial", "Materiale rimanente"),
  "HISTÓRICO LOCAL": steelL("LOCAL HISTORY", "HISTORIAL LOCAL", "HISTORIQUE LOCAL", "LOKALER VERLAUF", "STORICO LOCALE"),
  "Tendência térmica": steelL("Thermal trend", "Tendencia térmica", "Tendance thermique", "Temperaturtrend", "Tendenza termica"),
  "Bico/Processo": steelL("Nozzle/Process", "Boquilla/Proceso", "Buse/Processus", "Düse/Prozess", "Ugello/Processo"),
  "Mesa/Plataforma": steelL("Bed/Platform", "Cama/Plataforma", "Plateau/Plateforme", "Druckbett/Plattform", "Piatto/Piattaforma"),
  "Câmara": steelL("Chamber", "Cámara", "Chambre", "Kammer", "Camera"),
  "IHM DA MÁQUINA": steelL("MACHINE HMI", "HMI DE LA MÁQUINA", "IHM DE LA MACHINE", "MASCHINEN-HMI", "HMI DELLA MACCHINA"),
  "Estado físico": steelL("Physical status", "Estado físico", "État physique", "Physischer Zustand", "Stato fisico"),
  "Modo universal": steelL("Universal mode", "Modo universal", "Mode universel", "Universalmodus", "Modalità universale"),
  "MOVIMENTO": steelL("MOTION", "MOVIMIENTO", "MOUVEMENT", "BEWEGUNG", "MOVIMENTO"),
  "Posição dos eixos": steelL("Axis position", "Posición de los ejes", "Position des axes", "Achsenposition", "Posizione degli assi"),
  "CONTROLE DO TRABALHO": steelL("JOB CONTROL", "CONTROL DEL TRABAJO", "CONTRÔLE DU TRAVAIL", "AUFTRAGSSTEUERUNG", "CONTROLLO DEL LAVORO"),
  "Operação remota": steelL("Remote operation", "Operación remota", "Opération distante", "Fernbetrieb", "Operazione remota"),
  "Somente monitoramento": steelL("Monitoring only", "Solo monitoreo", "Surveillance uniquement", "Nur Überwachung", "Solo monitoraggio"),
  "Pausar": steelL("Pause", "Pausar", "Pause", "Pausieren", "Pausa"),
  "Luz ON": steelL("Light ON", "Luz ON", "Lumière ON", "Licht EIN", "Luce ON"),
  "Luz OFF": steelL("Light OFF", "Luz OFF", "Lumière OFF", "Licht AUS", "Luce OFF"),
  "Os comandos só são liberados quando o cadastro habilita controle remoto e o bridge da impressora declara suporte.": steelL("Commands are enabled only when remote control is allowed in registration and the printer bridge reports support.", "Los comandos solo se habilitan cuando el registro permite el control remoto y el bridge de la impresora declara compatibilidad.", "Les commandes ne sont activées que si le contrôle distant est autorisé et si le bridge de l'imprimante le prend en charge.", "Befehle werden nur freigegeben, wenn die Fernsteuerung registriert ist und die Drucker-Bridge Unterstützung meldet.", "I comandi vengono abilitati solo quando il controllo remoto è consentito e il bridge della stampante dichiara il supporto."),
  "CONEXÃO": steelL("CONNECTION", "CONEXIÓN", "CONNEXION", "VERBINDUNG", "CONNESSIONE"),
  "Integração da impressora": steelL("Printer integration", "Integración de la impresora", "Intégration de l'imprimante", "Druckerintegration", "Integrazione della stampante"),
  "Ecossistema": steelL("Ecosystem", "Ecosistema", "Écosystème", "Ökosystem", "Ecosistema"),
  "Fonte": steelL("Source", "Fuente", "Source", "Quelle", "Fonte"),
  "Firmware": steelL("Firmware", "Firmware", "Micrologiciel", "Firmware", "Firmware"),
  "Host / IP": steelL("Host / IP", "Host / IP", "Hôte / IP", "Host / IP", "Host / IP"),
  "Material usado": steelL("Material used", "Material usado", "Matériau utilisé", "Verwendetes Material", "Materiale usato"),
  "SEGURANÇA / INTERTRAVAMENTO": steelL("SAFETY / INTERLOCK", "SEGURIDAD / ENCLAVAMIENTO", "SÉCURITÉ / INTERVERROUILLAGE", "SICHERHEIT / VERRIEGELUNG", "SICUREZZA / INTERBLOCCO"),
  "Monitoramento remoto": steelL("Remote monitoring", "Monitoreo remoto", "Surveillance distante", "Fernüberwachung", "Monitoraggio remoto"),
  "Nenhum alarme informado pela impressora.": steelL("No alarms reported by the printer.", "La impresora no informó alarmas.", "Aucune alarme signalée par l'imprimante.", "Keine Alarme vom Drucker gemeldet.", "Nessun allarme segnalato dalla stampante."),
  "Esta IHM é exclusiva para impressoras 3D. Ela se adapta a FDM/FFF, SLA/MSLA/DLP, SLS e equipamentos proprietários, exibindo somente sinais realmente recebidos.": steelL("This HMI is dedicated to 3D printers. It adapts to FDM/FFF, SLA/MSLA/DLP, SLS and proprietary equipment, displaying only signals actually received.", "Esta HMI es exclusiva para impresoras 3D. Se adapta a FDM/FFF, SLA/MSLA/DLP, SLS y equipos propietarios, mostrando solo señales realmente recibidas.", "Cette IHM est dédiée aux imprimantes 3D. Elle s'adapte aux technologies FDM/FFF, SLA/MSLA/DLP, SLS et propriétaires, en n'affichant que les signaux réellement reçus.", "Diese HMI ist für 3D-Drucker ausgelegt. Sie passt sich FDM/FFF, SLA/MSLA/DLP, SLS und proprietären Geräten an und zeigt nur tatsächlich empfangene Signale.", "Questa HMI è dedicata alle stampanti 3D. Si adatta a FDM/FFF, SLA/MSLA/DLP, SLS e sistemi proprietari, mostrando solo i segnali realmente ricevuti."),
  "Administrador: exclusão de registros habilitada": steelL("Administrator: record deletion enabled", "Administrador: eliminación de registros habilitada", "Administrateur : suppression des enregistrements activée", "Administrator: Löschen von Einträgen aktiviert", "Amministratore: eliminazione dei record abilitata"),
  "Usuário autenticado": steelL("Authenticated user", "Usuario autenticado", "Utilisateur authentifié", "Authentifizierter Benutzer", "Utente autenticato"),
  "Buscar eventos de auditoria": steelL("Search audit events", "Buscar eventos de auditoría", "Rechercher des événements d'audit", "Audit-Ereignisse suchen", "Cerca eventi di audit"),
  "Buscar por usuário, ação ou entidade...": steelL("Search by user, action or entity...", "Buscar por usuario, acción o entidad...", "Rechercher par utilisateur, action ou entité...", "Nach Benutzer, Aktion oder Entität suchen...", "Cerca per utente, azione o entità..."),
  "Filtrar auditoria por ação": steelL("Filter audit by action", "Filtrar auditoría por acción", "Filtrer l'audit par action", "Audit nach Aktion filtern", "Filtra audit per azione"),
  "Painel adaptativo do controlador": steelL("Adaptive controller dashboard", "Panel adaptativo del controlador", "Tableau adaptatif du contrôleur", "Adaptives Controller-Dashboard", "Dashboard adattiva del controller"),
  "PARADA": steelL("STOPPED", "DETENIDA", "ARRÊT", "GESTOPPT", "ARRESTO"),
  "Representação do processo industrial": steelL("Industrial process representation", "Representación del proceso industrial", "Représentation du processus industriel", "Darstellung des Industrieprozesses", "Rappresentazione del processo industriale"),
  "AGUARDANDO": steelL("WAITING", "ESPERANDO", "EN ATTENTE", "WARTEN", "IN ATTESA"),
  "Modo de operação do Dobot": steelL("Dobot operating mode", "Modo de operación del Dobot", "Mode de fonctionnement du Dobot", "Dobot-Betriebsmodus", "Modalità operativa del Dobot"),
  "Controle manual incremental do Dobot": steelL("Incremental manual Dobot control", "Control manual incremental del Dobot", "Commande manuelle incrémentale du Dobot", "Inkrementelle manuelle Dobot-Steuerung", "Controllo manuale incrementale del Dobot"),
  "CONTROLE JOG": steelL("JOG CONTROL", "CONTROL JOG", "COMMANDE JOG", "TIPPSTEUERUNG", "CONTROLLO JOG"),
  "Pronto para movimentar": steelL("Ready to move", "Listo para mover", "Prêt à déplacer", "Bewegungsbereit", "Pronto al movimento"),
  "Plano X / Y": steelL("X / Y plane", "Plano X / Y", "Plan X / Y", "X-/Y-Ebene", "Piano X / Y"),
  "Avançar no eixo Y": steelL("Move forward on Y axis", "Avanzar en el eje Y", "Avancer sur l'axe Y", "Auf der Y-Achse vorwärts", "Avanza sull'asse Y"),
  "Mover no eixo X negativo": steelL("Move on negative X axis", "Mover en el eje X negativo", "Déplacer sur l'axe X négatif", "Auf der negativen X-Achse bewegen", "Muovi sull'asse X negativo"),
  "Parar imediatamente": steelL("Stop immediately", "Detener inmediatamente", "Arrêter immédiatement", "Sofort stoppen", "Arresta immediatamente"),
  "Mover no eixo X positivo": steelL("Move on positive X axis", "Mover en el eje X positivo", "Déplacer sur l'axe X positif", "Auf der positiven X-Achse bewegen", "Muovi sull'asse X positivo"),
  "Recuar no eixo Y": steelL("Move backward on Y axis", "Retroceder en el eje Y", "Reculer sur l'axe Y", "Auf der Y-Achse zurück", "Indietreggia sull'asse Y"),
  "Altura / Rotação": steelL("Height / Rotation", "Altura / Rotación", "Hauteur / Rotation", "Höhe / Drehung", "Altezza / Rotazione"),
  "SUBIR": steelL("UP", "SUBIR", "MONTER", "HOCH", "SALI"),
  "DESCER": steelL("DOWN", "BAJAR", "DESCENDRE", "RUNTER", "SCENDI"),
  "GIRAR": steelL("ROTATE", "GIRAR", "TOURNER", "DREHEN", "RUOTA"),
  "Movimentos curtos, limites validados e confirmação da posição real.": steelL("Short moves, validated limits and real-position confirmation.", "Movimientos cortos, límites validados y confirmación de la posición real.", "Mouvements courts, limites validées et confirmation de la position réelle.", "Kurze Bewegungen, geprüfte Grenzen und Bestätigung der Istposition.", "Movimenti brevi, limiti convalidati e conferma della posizione reale."),
  "Modo manual: use movimentos curtos e mantenha a área do robô livre. PARAR continua disponível durante toda a operação.": steelL("Manual mode: use short moves and keep the robot area clear. STOP remains available throughout the operation.", "Modo manual: use movimientos cortos y mantenga libre el área del robot. DETENER permanece disponible durante toda la operación.", "Mode manuel : effectuez de petits mouvements et gardez la zone du robot dégagée. ARRÊTER reste disponible pendant toute l'opération.", "Manueller Modus: kurze Bewegungen verwenden und Roboterbereich freihalten. STOPP bleibt während des gesamten Betriebs verfügbar.", "Modalità manuale: usa movimenti brevi e mantieni libera l'area del robot. ARRESTA resta disponibile durante tutta l'operazione."),
  "AUTOMAÇÃO INDUSTRIAL": steelL("INDUSTRIAL AUTOMATION", "AUTOMATIZACIÓN INDUSTRIAL", "AUTOMATISATION INDUSTRIELLE", "INDUSTRIELLE AUTOMATISIERUNG", "AUTOMAZIONE INDUSTRIALE"),
  "Pronto para ensinar": steelL("Ready to teach", "Listo para enseñar", "Prêt pour l'apprentissage", "Bereit zum Einlernen", "Pronto per l'apprendimento"),
  "Repetições": steelL("Repetitions", "Repeticiones", "Répétitions", "Wiederholungen", "Ripetizioni"),
  "Aguardando início": steelL("Waiting to start", "Esperando inicio", "En attente du démarrage", "Warten auf Start", "In attesa dell'avvio"),
  "PAUSAR": steelL("PAUSE", "PAUSAR", "PAUSE", "PAUSIEREN", "PAUSA"),
  "O modo automático bloqueia os comandos manuais enquanto o ciclo está ativo. PAUSAR atua entre etapas; PARAR envia DOBOT_STOP imediatamente. Use somente após ensinar pontos sem colisão.": steelL("Automatic mode blocks manual commands while the cycle is active. PAUSE acts between steps; STOP sends DOBOT_STOP immediately. Use only after teaching collision-free points.", "El modo automático bloquea los comandos manuales mientras el ciclo está activo. PAUSAR actúa entre etapas; DETENER envía DOBOT_STOP inmediatamente. Úselo solo después de enseñar puntos sin colisión.", "Le mode automatique bloque les commandes manuelles pendant le cycle. PAUSE agit entre les étapes ; ARRÊTER envoie immédiatement DOBOT_STOP. Utilisez-le uniquement après avoir appris des points sans collision.", "Der Automatikmodus sperrt manuelle Befehle während des Zyklus. PAUSIEREN wirkt zwischen den Schritten; STOPP sendet DOBOT_STOP sofort. Nur nach Einlernen kollisionsfreier Punkte verwenden.", "La modalità automatica blocca i comandi manuali durante il ciclo. PAUSA agisce tra le fasi; ARRESTA invia subito DOBOT_STOP. Usare solo dopo aver appreso punti senza collisioni."),
  "Idioma do sistema": steelL("System language", "Idioma del sistema", "Langue du système", "Systemsprache", "Lingua del sistema"),
  "Tema do sistema": steelL("System theme", "Tema del sistema", "Thème du système", "Systemdesign", "Tema del sistema"),

  "Gerenciar empresa e funcionários": steelL("Manage company and employees", "Gestionar empresa y empleados", "Gérer l'entreprise et les employés", "Unternehmen und Mitarbeiter verwalten", "Gestisci azienda e dipendenti"),
  "Ex: Responsável pela movimentação e pelo posicionamento de peças na linha de automação.": steelL("Example: Responsible for moving and positioning parts on the automation line.", "Ej.: Responsable del movimiento y posicionamiento de piezas en la línea de automatización.", "Ex. : Responsable du déplacement et du positionnement des pièces sur la ligne automatisée.", "Beispiel: Verantwortlich für Bewegung und Positionierung von Teilen in der Automatisierungslinie.", "Es.: Responsabile della movimentazione e del posizionamento dei pezzi sulla linea automatizzata."),
  "Eficiência e OEE": steelL("Efficiency and OEE", "Eficiencia y OEE", "Efficacité et OEE", "Effizienz und OEE", "Efficienza e OEE"),
  "Disponibilidade, desempenho, qualidade e ciclo": steelL("Availability, performance, quality and cycle", "Disponibilidad, rendimiento, calidad y ciclo", "Disponibilité, performance, qualité et cycle", "Verfügbarkeit, Leistung, Qualität und Zyklus", "Disponibilità, prestazioni, qualità e ciclo"),
  "Ordem, lote, peças boas e refugos": steelL("Order, batch, good parts and rejects", "Orden, lote, piezas buenas y rechazos", "Ordre, lot, bonnes pièces et rebuts", "Auftrag, Charge, Gutteile und Ausschuss", "Ordine, lotto, pezzi buoni e scarti"),
  "Intertravamentos, modo e alarmes": steelL("Interlocks, mode and alarms", "Enclavamientos, modo y alarmas", "Interverrouillages, mode et alarmes", "Verriegelungen, Modus und Alarme", "Interblocchi, modalità e allarmi"),
  "Horas, MTBF, MTTR e vida da ferramenta": steelL("Hours, MTBF, MTTR and tool life", "Horas, MTBF, MTTR y vida de herramienta", "Heures, MTBF, MTTR et durée de vie de l'outil", "Stunden, MTBF, MTTR und Werkzeugstandzeit", "Ore, MTBF, MTTR e vita utensile"),
  "Potência, consumo e ar comprimido": steelL("Power, consumption and compressed air", "Potencia, consumo y aire comprimido", "Puissance, consommation et air comprimé", "Leistung, Verbrauch und Druckluft", "Potenza, consumo e aria compressa"),
  "Impressora 3D universal": steelL("Universal 3D printer", "Impresora 3D universal", "Imprimante 3D universelle", "Universeller 3D-Drucker", "Stampante 3D universale"),
  "Serial genérica / JSON": steelL("Generic serial / JSON", "Serial genérica / JSON", "Série générique / JSON", "Generische serielle Schnittstelle / JSON", "Seriale generica / JSON"),
  "DESCOBERTA AUTOMÁTICA": steelL("AUTOMATIC DISCOVERY", "DESCUBRIMIENTO AUTOMÁTICO", "DÉCOUVERTE AUTOMATIQUE", "AUTOMATISCHE ERKENNUNG", "RILEVAMENTO AUTOMATICO"),
  "Equipamentos encontrados na rede e no Edge": steelL("Equipment found on the network and Edge", "Equipos encontrados en la red y Edge", "Équipements trouvés sur le réseau et Edge", "Im Netzwerk und auf Edge gefundene Geräte", "Apparecchiature trovate in rete e su Edge"),
  "Descubra equipamentos na rede local e hardware USB/Serial detectado pelo SteelControl Edge. Revise a origem e aprove o cadastro com segurança.": steelL("Discover equipment on the local network and USB/Serial hardware detected by SteelControl Edge. Review the source and securely approve registration.", "Descubra equipos en la red local y hardware USB/Serial detectado por SteelControl Edge. Revise el origen y apruebe el registro de forma segura.", "Découvrez les équipements du réseau local et le matériel USB/Série détecté par SteelControl Edge. Vérifiez la source et approuvez l'enregistrement en toute sécurité.", "Erkennen Sie Geräte im lokalen Netzwerk und von SteelControl Edge gefundene USB-/Seriell-Hardware. Quelle prüfen und Registrierung sicher freigeben.", "Rileva apparecchiature sulla rete locale e hardware USB/Seriale individuato da SteelControl Edge. Verifica l'origine e approva la registrazione in sicurezza."),
  "Procurar novamente": steelL("Search again", "Buscar de nuevo", "Rechercher à nouveau", "Erneut suchen", "Cerca di nuovo"),
  "Provisionamento seguro: identificação → aprovação do administrador → credencial exclusiva → monitoramento. START remoto não é habilitado automaticamente.": steelL("Secure provisioning: identification → administrator approval → unique credential → monitoring. Remote START is not enabled automatically.", "Aprovisionamiento seguro: identificación → aprobación del administrador → credencial exclusiva → monitoreo. START remoto no se habilita automáticamente.", "Provisionnement sécurisé : identification → approbation de l'administrateur → identifiant unique → surveillance. Le START distant n'est pas activé automatiquement.", "Sichere Bereitstellung: Identifikation → Administratorfreigabe → eindeutige Berechtigung → Überwachung. Remote-START wird nicht automatisch aktiviert.", "Provisioning sicuro: identificazione → approvazione dell'amministratore → credenziale esclusiva → monitoraggio. Lo START remoto non viene abilitato automaticamente."),
  "Conexão alternativa por IP": steelL("Alternative IP connection", "Conexión alternativa por IP", "Connexion alternative par IP", "Alternative IP-Verbindung", "Connessione alternativa tramite IP"),
  "Use o IPv4 local quando a descoberta automática estiver bloqueada pela rede. O equipamento seguirá pela mesma etapa de aprovação segura.": steelL("Use the local IPv4 address when automatic discovery is blocked by the network. The equipment will follow the same secure approval step.", "Use la dirección IPv4 local cuando la red bloquee el descubrimiento automático. El equipo seguirá la misma etapa de aprobación segura.", "Utilisez l'adresse IPv4 locale lorsque la découverte automatique est bloquée par le réseau. L'équipement suivra la même étape d'approbation sécurisée.", "Verwenden Sie die lokale IPv4-Adresse, wenn die automatische Erkennung vom Netzwerk blockiert wird. Das Gerät durchläuft dieselbe sichere Freigabe.", "Usa l'indirizzo IPv4 locale quando il rilevamento automatico è bloccato dalla rete. L'apparecchiatura seguirà la stessa approvazione sicura."),
  "IP do equipamento": steelL("Equipment IP", "IP del equipo", "IP de l'équipement", "Geräte-IP", "IP apparecchiatura"),
  "Detectar pelo IP": steelL("Detect by IP", "Detectar por IP", "Détecter par IP", "Über IP erkennen", "Rileva tramite IP"),
  "Diagnóstico da descoberta": steelL("Discovery diagnostics", "Diagnóstico del descubrimiento", "Diagnostic de découverte", "Erkennungsdiagnose", "Diagnostica del rilevamento"),
  "Mostra UDP, interfaces e possíveis motivos de falha": steelL("Shows UDP, interfaces and possible failure causes", "Muestra UDP, interfaces y posibles causas de falla", "Affiche UDP, les interfaces et les causes possibles d'échec", "Zeigt UDP, Schnittstellen und mögliche Fehlerursachen", "Mostra UDP, interfacce e possibili cause di errore"),
  "Carregando diagnóstico da rede...": steelL("Loading network diagnostics...", "Cargando diagnóstico de red...", "Chargement du diagnostic réseau...", "Netzwerkdiagnose wird geladen...", "Caricamento diagnostica di rete..."),
  "Nenhum equipamento respondeu ainda. Use": steelL("No equipment has responded yet. Use", "Ningún equipo ha respondido todavía. Use", "Aucun équipement n'a encore répondu. Utilisez", "Noch kein Gerät hat geantwortet. Verwenden Sie", "Nessuna apparecchiatura ha ancora risposto. Usa"),
  ", consulte o diagnóstico ou conecte pelo IP.": steelL(", check diagnostics or connect by IP.", ", consulte el diagnóstico o conéctese por IP.", ", consultez le diagnostic ou connectez-vous par IP.", ", prüfen Sie die Diagnose oder verbinden Sie per IP.", ", consulta la diagnostica o connettiti tramite IP."),
  "Filtrar equipamentos por tipo": steelL("Filter equipment by type", "Filtrar equipos por tipo", "Filtrer les équipements par type", "Geräte nach Typ filtern", "Filtra apparecchiature per tipo"),
  "Filtrar equipamentos por status": steelL("Filter equipment by status", "Filtrar equipos por estado", "Filtrer les équipements par état", "Geräte nach Status filtern", "Filtra apparecchiature per stato"),

  "Voltar para o início": steelL("Back to home", "Volver al inicio", "Retour à l'accueil", "Zur Startseite", "Torna alla home"),
  "OPERADOR": steelL("OPERATOR", "OPERADOR", "OPÉRATEUR", "BEDIENER", "OPERATORE"),
  "IDENTIDADE VALIDADA": steelL("IDENTITY VERIFIED", "IDENTIDAD VALIDADA", "IDENTITÉ VALIDÉE", "IDENTITÄT BESTÄTIGT", "IDENTITÀ CONVALIDATA"),
  "ONLINE": steelL("ONLINE", "EN LÍNEA", "EN LIGNE", "ONLINE", "ONLINE"),
  "SEGURANÇA": steelL("SECURITY", "SEGURIDAD", "SÉCURITÉ", "SICHERHEIT", "SICUREZZA"),
  "acesso protegido": steelL("protected access", "acceso protegido", "accès protégé", "geschützter Zugriff", "accesso protetto"),
  "sincronizada": steelL("synchronized", "sincronizada", "synchronisée", "synchronisiert", "sincronizzata"),
  "CENTRAL INDUSTRIAL CONECTADA": steelL("CONNECTED INDUSTRIAL CENTER", "CENTRAL INDUSTRIAL CONECTADA", "CENTRE INDUSTRIEL CONNECTÉ", "VERNETZTE INDUSTRIEZENTRALE", "CENTRALE INDUSTRIALE CONNESSA"),
  "Controle sua operação": steelL("Control your operation", "Controle su operación", "Pilotez votre activité", "Steuern Sie Ihren Betrieb", "Controlla la tua operazione"),
  "Desktop, mobile e Edge sincronizados em uma experiência industrial completa.": steelL("Desktop, mobile and Edge synchronized in one complete industrial experience.", "Desktop, móvil y Edge sincronizados en una experiencia industrial completa.", "Desktop, mobile et Edge synchronisés dans une expérience industrielle complète.", "Desktop, Mobile und Edge in einer vollständigen Industrieumgebung synchronisiert.", "Desktop, mobile ed Edge sincronizzati in un'esperienza industriale completa."),
  "STEELCONTROL • ACESSO INDUSTRIAL SEGURO": steelL("STEELCONTROL • SECURE INDUSTRIAL ACCESS", "STEELCONTROL • ACCESO INDUSTRIAL SEGURO", "STEELCONTROL • ACCÈS INDUSTRIEL SÉCURISÉ", "STEELCONTROL • SICHERER INDUSTRIEZUGRIFF", "STEELCONTROL • ACCESSO INDUSTRIALE SICURO"),
  "STEELCONTROL • ACESSO PROTEGIDO": steelL("STEELCONTROL • PROTECTED ACCESS", "STEELCONTROL • ACCESO PROTEGIDO", "STEELCONTROL • ACCÈS PROTÉGÉ", "STEELCONTROL • GESCHÜTZTER ZUGRIFF", "STEELCONTROL • ACCESSO PROTETTO"),
  "Acesso autorizado": steelL("Access authorized", "Acceso autorizado", "Accès autorisé", "Zugriff autorisiert", "Accesso autorizzato"),
  "Identidade validada com segurança.": steelL("Identity securely verified.", "Identidad validada de forma segura.", "Identité validée en toute sécurité.", "Identität sicher bestätigt.", "Identità convalidata in sicurezza."),
  "LEITURA AO VIVO": steelL("LIVE READING", "LECTURA EN VIVO", "LECTURE EN DIRECT", "LIVE-ANZEIGE", "LETTURA IN TEMPO REALE"),

  "Localização da empresa": steelL("Company location", "Ubicación de la empresa", "Localisation de l'entreprise", "Unternehmensstandort", "Posizione dell'azienda"),
  "Nome do funcionário": steelL("Employee name", "Nombre del empleado", "Nom de l'employé", "Mitarbeitername", "Nome del dipendente"),
  "Mínimo 8 caracteres": steelL("At least 8 characters", "Mínimo 8 caracteres", "8 caractères minimum", "Mindestens 8 Zeichen", "Minimo 8 caratteri"),
  "Deixe em branco para manter a senha atual": steelL("Leave blank to keep the current password", "Deje en blanco para mantener la contraseña actual", "Laissez vide pour conserver le mot de passe actuel", "Leer lassen, um das aktuelle Passwort beizubehalten", "Lascia vuoto per mantenere la password attuale"),
  "Código de verificação do novo e-mail": steelL("New email verification code", "Código de verificación del nuevo correo", "Code de vérification du nouvel e-mail", "Bestätigungscode für die neue E-Mail", "Codice di verifica della nuova e-mail"),
  "Fechar cadastro facial": steelL("Close facial enrollment", "Cerrar registro facial", "Fermer l'enrôlement facial", "Gesichtserfassung schließen", "Chiudi registrazione facciale"),
  "Ex.: Principal, Sem óculos, Turno A": steelL("Example: Primary, No glasses, Shift A", "Ej.: Principal, Sin gafas, Turno A", "Ex. : Principal, Sans lunettes, Équipe A", "Beispiel: Primär, Ohne Brille, Schicht A", "Es.: Principale, Senza occhiali, Turno A"),
  "Consentimento para cadastro facial": steelL("Consent for facial enrollment", "Consentimiento para registro facial", "Consentement à l'enrôlement facial", "Einwilligung zur Gesichtserfassung", "Consenso alla registrazione facciale"),
  "Fechar gerenciador de faciais": steelL("Close facial manager", "Cerrar gestor facial", "Fermer le gestionnaire facial", "Gesichtsverwaltung schließen", "Chiudi gestione facciale")
});

Object.assign(STEEL_LITERAL_I18N, {
  "Sensores, conectividade Wi-Fi, sinal, latência e telemetria do dispositivo embarcado.": steelL("Sensors, Wi-Fi connectivity, signal, latency and embedded-device telemetry.", "Sensores, conectividad Wi-Fi, señal, latencia y telemetría del dispositivo integrado.", "Capteurs, connectivité Wi-Fi, signal, latence et télémétrie du dispositif embarqué.", "Sensoren, WLAN-Verbindung, Signal, Latenz und Telemetrie des eingebetteten Geräts.", "Sensori, connettività Wi-Fi, segnale, latenza e telemetria del dispositivo integrato."),
  "AGUARDANDO CONEXÃO REAL": steelL("WAITING FOR REAL CONNECTION", "ESPERANDO CONEXIÓN REAL", "EN ATTENTE DE CONNEXION RÉELLE", "WARTEN AUF REALE VERBINDUNG", "IN ATTESA DELLA CONNESSIONE REALE"),
  "EM CICLO": steelL("RUNNING CYCLE", "EN CICLO", "CYCLE EN COURS", "ZYKLUS LÄUFT", "CICLO IN CORSO"),
  "AGUARDANDO CONEXÃO": steelL("WAITING FOR CONNECTION", "ESPERANDO CONEXIÓN", "EN ATTENTE DE CONNEXION", "WARTEN AUF VERBINDUNG", "IN ATTESA DELLA CONNESSIONE"),
  "Aguardando conexão real. Todos os comandos permanecem bloqueados até chegar telemetria recente.": steelL("Waiting for a real connection. All commands remain blocked until recent telemetry arrives.", "Esperando una conexión real. Todos los comandos permanecen bloqueados hasta recibir telemetría reciente.", "En attente d'une connexion réelle. Toutes les commandes restent bloquées jusqu'à réception d'une télémétrie récente.", "Warten auf eine reale Verbindung. Alle Befehle bleiben gesperrt, bis aktuelle Telemetrie eintrifft.", "In attesa di una connessione reale. Tutti i comandi restano bloccati finché non arriva una telemetria recente."),
  "START bloqueado por condição de segurança. RESET não libera a parada de segurança.": steelL("START blocked by a safety condition. RESET does not release the safety stop.", "START bloqueado por una condición de seguridad. RESET no libera la parada de seguridad.", "START bloqué par une condition de sécurité. RESET ne libère pas l'arrêt de sécurité.", "START durch Sicherheitsbedingung gesperrt. RESET hebt den Sicherheitsstopp nicht auf.", "START bloccato da una condizione di sicurezza. RESET non libera l'arresto di sicurezza."),
  "Aguardando confirmação dos intertravamentos físicos.": steelL("Waiting for physical interlock confirmation.", "Esperando confirmación de los enclavamientos físicos.", "En attente de confirmation des interverrouillages physiques.", "Warten auf Bestätigung der physischen Verriegelungen.", "In attesa della conferma degli interblocchi fisici."),
  "Não foi possível carregar o controlador.": steelL("The controller could not be loaded.", "No se pudo cargar el controlador.", "Impossible de charger le contrôleur.", "Der Controller konnte nicht geladen werden.", "Impossibile caricare il controller."),
  "Painel do controlador": steelL("Controller dashboard", "Panel del controlador", "Tableau du contrôleur", "Controller-Dashboard", "Dashboard del controller"),
  "Comando não autorizado pela IHM.": steelL("Command not authorized by the HMI.", "Comando no autorizado por la HMI.", "Commande non autorisée par l'IHM.", "Befehl von der HMI nicht autorisiert.", "Comando non autorizzato dalla HMI."),
  "Comando processado.": steelL("Command processed.", "Comando procesado.", "Commande traitée.", "Befehl verarbeitet.", "Comando elaborato."),
  "Comando bloqueado": steelL("Command blocked", "Comando bloqueado", "Commande bloquée", "Befehl gesperrt", "Comando bloccato"),

  "Sessão expirada.": steelL("Session expired.", "Sesión caducada.", "Session expirée.", "Sitzung abgelaufen.", "Sessione scaduta."),
  "Operação e telemetria do ESP32": steelL("ESP32 operation and telemetry", "Operación y telemetría del ESP32", "Fonctionnement et télémétrie de l'ESP32", "ESP32-Betrieb und Telemetrie", "Funzionamento e telemetria ESP32"),
  "Erro na resposta da API.": steelL("API response error.", "Error en la respuesta de la API.", "Erreur dans la réponse de l'API.", "Fehler in der API-Antwort.", "Errore nella risposta API."),
  "Máquina online": steelL("Machine online", "Máquina en línea", "Machine en ligne", "Maschine online", "Macchina online"),
  "Parada de segurança ativa. Normalize a condição antes de liberar o equipamento.": steelL("Safety stop active. Normalize the condition before releasing the equipment.", "Parada de seguridad activa. Normalice la condición antes de liberar el equipo.", "Arrêt de sécurité actif. Normalisez la condition avant de libérer l'équipement.", "Sicherheitsstopp aktiv. Zustand vor Freigabe des Geräts normalisieren.", "Arresto di sicurezza attivo. Normalizza la condizione prima di liberare l'apparecchiatura."),
  "Erro ao carregar manutenções.": steelL("Failed to load maintenance records.", "Error al cargar los mantenimientos.", "Erreur lors du chargement des maintenances.", "Wartungsdaten konnten nicht geladen werden.", "Errore durante il caricamento delle manutenzioni."),
  "Erro ao carregar histórico.": steelL("Failed to load history.", "Error al cargar el historial.", "Erreur lors du chargement de l'historique.", "Verlauf konnte nicht geladen werden.", "Errore durante il caricamento dello storico."),
  "SteelUI.confirm não está disponível. Exclusão bloqueada por segurança.": steelL("SteelUI.confirm is unavailable. Deletion was blocked for safety.", "SteelUI.confirm no está disponible. La eliminación fue bloqueada por seguridad.", "SteelUI.confirm est indisponible. La suppression a été bloquée par sécurité.", "SteelUI.confirm ist nicht verfügbar. Löschen wurde aus Sicherheitsgründen blockiert.", "SteelUI.confirm non è disponibile. Eliminazione bloccata per sicurezza."),
  "Não foi possível arquivar o registro.": steelL("The record could not be archived.", "No se pudo archivar el registro.", "Impossible d'archiver l'enregistrement.", "Der Eintrag konnte nicht archiviert werden.", "Impossibile archiviare il record."),
  "Registro arquivado com sucesso.": steelL("Record archived successfully.", "Registro archivado correctamente.", "Enregistrement archivé avec succès.", "Eintrag erfolgreich archiviert.", "Record archiviato correttamente."),
  "O registro saiu da lista ativa e continua preservado no histórico de auditoria.": steelL("The record left the active list and remains preserved in the audit history.", "El registro salió de la lista activa y permanece conservado en el historial de auditoría.", "L'enregistrement a quitté la liste active et reste conservé dans l'historique d'audit.", "Der Eintrag wurde aus der aktiven Liste entfernt und bleibt im Audit-Verlauf erhalten.", "Il record è uscito dall'elenco attivo e rimane conservato nello storico di audit."),
  "Seu perfil possui acesso somente à consulta do histórico de manutenção.": steelL("Your profile has read-only access to maintenance history.", "Su perfil solo tiene acceso de consulta al historial de mantenimiento.", "Votre profil dispose uniquement d'un accès en lecture à l'historique de maintenance.", "Ihr Profil hat nur Lesezugriff auf den Wartungsverlauf.", "Il tuo profilo ha accesso in sola lettura allo storico della manutenzione."),
  "Não foi possível carregar a empresa.": steelL("The company could not be loaded.", "No se pudo cargar la empresa.", "Impossible de charger l'entreprise.", "Das Unternehmen konnte nicht geladen werden.", "Impossibile caricare l'azienda."),
  "CNPJ não informado": steelL("Company ID not provided", "ID de empresa no informado", "Identifiant d'entreprise non renseigné", "Unternehmens-ID nicht angegeben", "ID azienda non indicato"),
  "Não foi possível carregar os funcionários.": steelL("Employees could not be loaded.", "No se pudieron cargar los empleados.", "Impossible de charger les employés.", "Mitarbeiter konnten nicht geladen werden.", "Impossibile caricare i dipendenti."),
  "Não foi possível carregar as máquinas.": steelL("Machines could not be loaded.", "No se pudieron cargar las máquinas.", "Impossible de charger les machines.", "Maschinen konnten nicht geladen werden.", "Impossibile caricare le macchine."),
  "Nenhum equipamento cadastrado.": steelL("No equipment registered.", "Ningún equipo registrado.", "Aucun équipement enregistré.", "Keine Geräte registriert.", "Nessuna apparecchiatura registrata."),
  "Operação excelente. Equipamentos funcionando normalmente.": steelL("Excellent operation. Equipment is running normally.", "Operación excelente. Los equipos funcionan normalmente.", "Excellente opération. Les équipements fonctionnent normalement.", "Ausgezeichneter Betrieb. Die Geräte laufen normal.", "Funzionamento eccellente. Le apparecchiature operano normalmente."),
  "Operação estável. Continue acompanhando os equipamentos.": steelL("Stable operation. Keep monitoring the equipment.", "Operación estable. Continúe monitoreando los equipos.", "Opération stable. Continuez à surveiller les équipements.", "Stabiler Betrieb. Geräte weiter überwachen.", "Funzionamento stabile. Continua a monitorare le apparecchiature."),
  "Atenção recomendada. Existem equipamentos que precisam ser verificados.": steelL("Attention recommended. Some equipment needs to be checked.", "Atención recomendada. Hay equipos que deben verificarse.", "Attention recommandée. Certains équipements doivent être vérifiés.", "Aufmerksamkeit empfohlen. Einige Geräte müssen geprüft werden.", "Attenzione consigliata. Alcune apparecchiature devono essere controllate."),
  "Situação crítica. A operação precisa de atenção imediata.": steelL("Critical condition. The operation requires immediate attention.", "Situación crítica. La operación requiere atención inmediata.", "Situation critique. L'opération nécessite une attention immédiate.", "Kritischer Zustand. Der Betrieb erfordert sofortige Aufmerksamkeit.", "Situazione critica. L'operazione richiede attenzione immediata."),
  "Não foi possível carregar a auditoria.": steelL("Audit data could not be loaded.", "No se pudo cargar la auditoría.", "Impossible de charger l'audit.", "Audit-Daten konnten nicht geladen werden.", "Impossibile caricare l'audit."),

  "Painel exclusivo do Dobot": steelL("Dedicated Dobot dashboard", "Panel exclusivo del Dobot", "Tableau dédié au Dobot", "Exklusives Dobot-Dashboard", "Dashboard dedicata al Dobot"),
  "Cadastre ou selecione uma máquina com o controlador Dobot Magician.": steelL("Register or select a machine with the Dobot Magician controller.", "Registre o seleccione una máquina con el controlador Dobot Magician.", "Enregistrez ou sélectionnez une machine avec le contrôleur Dobot Magician.", "Registrieren oder wählen Sie eine Maschine mit Dobot-Magician-Controller.", "Registra o seleziona una macchina con controller Dobot Magician."),
  "A máquina selecionada não é um Dobot Magician.": steelL("The selected machine is not a Dobot Magician.", "La máquina seleccionada no es un Dobot Magician.", "La machine sélectionnée n'est pas un Dobot Magician.", "Die ausgewählte Maschine ist kein Dobot Magician.", "La macchina selezionata non è un Dobot Magician."),
  "Dobot offline. Aguarde uma conexão real e telemetria recente antes de enviar comandos.": steelL("Dobot offline. Wait for a real connection and recent telemetry before sending commands.", "Dobot sin conexión. Espere una conexión real y telemetría reciente antes de enviar comandos.", "Dobot hors ligne. Attendez une connexion réelle et une télémétrie récente avant d'envoyer des commandes.", "Dobot offline. Vor dem Senden von Befehlen auf reale Verbindung und aktuelle Telemetrie warten.", "Dobot offline. Attendi una connessione reale e telemetria recente prima di inviare comandi."),
  "Comando não aceito.": steelL("Command not accepted.", "Comando no aceptado.", "Commande non acceptée.", "Befehl nicht akzeptiert.", "Comando non accettato."),
  "Comando na fila": steelL("Command queued", "Comando en cola", "Commande en file", "Befehl in Warteschlange", "Comando in coda"),
  "O backend não retornou o identificador do comando.": steelL("The backend did not return the command identifier.", "El backend no devolvió el identificador del comando.", "Le backend n'a pas renvoyé l'identifiant de la commande.", "Das Backend hat keine Befehlskennung zurückgegeben.", "Il backend non ha restituito l'identificativo del comando."),
  "Ciclo interrompido pelo operador.": steelL("Cycle interrupted by the operator.", "Ciclo interrumpido por el operador.", "Cycle interrompu par l'opérateur.", "Zyklus vom Bediener unterbrochen.", "Ciclo interrotto dall'operatore."),
  "Não foi possível acompanhar o comando do Dobot.": steelL("The Dobot command could not be tracked.", "No se pudo seguir el comando del Dobot.", "Impossible de suivre la commande du Dobot.", "Der Dobot-Befehl konnte nicht verfolgt werden.", "Impossibile monitorare il comando del Dobot."),
  "Manual intertravado": steelL("Manual mode interlocked", "Manual enclavado", "Mode manuel verrouillé", "Manueller Modus verriegelt", "Modalità manuale interbloccata"),
  "O ciclo automático ainda está parando.": steelL("The automatic cycle is still stopping.", "El ciclo automático todavía se está deteniendo.", "Le cycle automatique est encore en cours d'arrêt.", "Der Automatikzyklus wird noch gestoppt.", "Il ciclo automatico si sta ancora arrestando."),
  "Rotação confirmada": steelL("Rotation confirmed", "Rotación confirmada", "Rotation confirmée", "Drehung bestätigt", "Rotazione confermata"),
  "Rotação não executada": steelL("Rotation not executed", "Rotación no ejecutada", "Rotation non exécutée", "Drehung nicht ausgeführt", "Rotazione non eseguita"),
  "A posição real do Dobot não está disponível.": steelL("The Dobot's real position is unavailable.", "La posición real del Dobot no está disponible.", "La position réelle du Dobot n'est pas disponible.", "Die reale Dobot-Position ist nicht verfügbar.", "La posizione reale del Dobot non è disponibile."),
  "Movimento não executado": steelL("Movement not executed", "Movimiento no ejecutado", "Mouvement non exécuté", "Bewegung nicht ausgeführt", "Movimento non eseguito"),
  "O Dobot não confirmou a posição de destino dentro do tempo esperado.": steelL("The Dobot did not confirm the target position within the expected time.", "El Dobot no confirmó la posición de destino en el tiempo esperado.", "Le Dobot n'a pas confirmé la position cible dans le délai prévu.", "Der Dobot hat die Zielposition nicht rechtzeitig bestätigt.", "Il Dobot non ha confermato la posizione di destinazione entro il tempo previsto."),
  "Pare o ciclo antes de ensinar posições.": steelL("Stop the cycle before teaching positions.", "Detenga el ciclo antes de enseñar posiciones.", "Arrêtez le cycle avant d'apprendre les positions.", "Zyklus vor dem Einlernen von Positionen stoppen.", "Arresta il ciclo prima di apprendere le posizioni."),
  "A posição atual do Dobot ainda não está disponível.": steelL("The Dobot's current position is not available yet.", "La posición actual del Dobot aún no está disponible.", "La position actuelle du Dobot n'est pas encore disponible.", "Die aktuelle Dobot-Position ist noch nicht verfügbar.", "La posizione attuale del Dobot non è ancora disponibile."),
  "Ensino do ciclo": steelL("Cycle teaching", "Enseñanza del ciclo", "Apprentissage du cycle", "Zyklus einlernen", "Apprendimento del ciclo"),
  "Aguardar na posição segura": steelL("Wait at safe position", "Esperar en la posición segura", "Attendre en position sûre", "In sicherer Position warten", "Attendi nella posizione sicura"),
  "Aproximar da matéria-prima": steelL("Approach raw material", "Acercarse a la materia prima", "Approcher la matière première", "Rohmaterial anfahren", "Avvicinati alla materia prima"),
  "Recuar da estação": steelL("Move away from station", "Alejarse de la estación", "S'éloigner de la station", "Von der Station zurückfahren", "Allontanati dalla stazione"),
  "Retornar à espera": steelL("Return to waiting position", "Volver a la posición de espera", "Revenir en position d'attente", "Zur Warteposition zurückkehren", "Ritorna alla posizione di attesa"),
  "Ciclo em execução": steelL("Cycle running", "Ciclo en ejecución", "Cycle en cours", "Zyklus läuft", "Ciclo in esecuzione"),
  "Preparando sequência": steelL("Preparing sequence", "Preparando secuencia", "Préparation de la séquence", "Sequenz wird vorbereitet", "Preparazione sequenza"),
  "Peça posicionada": steelL("Part positioned", "Pieza posicionada", "Pièce positionnée", "Teil positioniert", "Pezzo posizionato"),
  "Automático concluído": steelL("Automatic cycle completed", "Automático completado", "Cycle automatique terminé", "Automatik abgeschlossen", "Automatico completato"),
  "Sequência concluída": steelL("Sequence completed", "Secuencia completada", "Séquence terminée", "Sequenz abgeschlossen", "Sequenza completata"),
  "Pronto para novo ciclo": steelL("Ready for a new cycle", "Listo para un nuevo ciclo", "Prêt pour un nouveau cycle", "Bereit für einen neuen Zyklus", "Pronto per un nuovo ciclo"),
  "Ciclo automático interrompido": steelL("Automatic cycle interrupted", "Ciclo automático interrumpido", "Cycle automatique interrompu", "Automatikzyklus unterbrochen", "Ciclo automatico interrotto"),
  "Ciclo interrompido": steelL("Cycle interrupted", "Ciclo interrumpido", "Cycle interrompu", "Zyklus unterbrochen", "Ciclo interrotto"),
  "Pausado após a etapa atual": steelL("Paused after current step", "Pausado después de la etapa actual", "En pause après l'étape actuelle", "Nach aktuellem Schritt pausiert", "In pausa dopo la fase corrente"),
  "Ciclo retomado": steelL("Cycle resumed", "Ciclo reanudado", "Cycle repris", "Zyklus fortgesetzt", "Ciclo ripreso"),
  "Aguardando operador": steelL("Waiting for operator", "Esperando operador", "En attente de l'opérateur", "Warten auf Bediener", "In attesa dell'operatore"),
  "Retomando sequência": steelL("Resuming sequence", "Reanudando secuencia", "Reprise de la séquence", "Sequenz wird fortgesetzt", "Ripresa della sequenza"),
  "Pare o ciclo automático antes de enviar comandos manuais.": steelL("Stop the automatic cycle before sending manual commands.", "Detenga el ciclo automático antes de enviar comandos manuales.", "Arrêtez le cycle automatique avant d'envoyer des commandes manuelles.", "Automatikzyklus vor manuellen Befehlen stoppen.", "Arresta il ciclo automatico prima di inviare comandi manuali."),
  "Capture P0 a P4 em posições reais diferentes": steelL("Capture P0 through P4 at different real positions", "Capture P0 a P4 en posiciones reales diferentes", "Capturez P0 à P4 à différentes positions réelles", "P0 bis P4 an unterschiedlichen realen Positionen erfassen", "Acquisisci da P0 a P4 in posizioni reali differenti"),

  "Não definido": steelL("Not defined", "No definido", "Non défini", "Nicht definiert", "Non definito"),
  "Nenhum sinal recebido": steelL("No signal received", "Ninguna señal recibida", "Aucun signal reçu", "Kein Signal empfangen", "Nessun segnale ricevuto"),
  "Não gerada": steelL("Not generated", "No generada", "Non générée", "Nicht erzeugt", "Non generata"),
  "Parada de segurança ativa": steelL("Safety stop active", "Parada de seguridad activa", "Arrêt de sécurité actif", "Sicherheitsstopp aktiv", "Arresto di sicurezza attivo"),
  "Condição crítica detectada.": steelL("Critical condition detected.", "Condición crítica detectada.", "Condition critique détectée.", "Kritischer Zustand erkannt.", "Condizione critica rilevata."),
  "stream indisponível": steelL("stream unavailable", "stream no disponible", "flux indisponible", "Stream nicht verfügbar", "stream non disponibile"),
  "Liberação não realizada": steelL("Release not completed", "Liberación no realizada", "Libération non effectuée", "Freigabe nicht durchgeführt", "Abilitazione non eseguita"),
  "Não foi possível liberar o equipamento.": steelL("The equipment could not be released.", "No se pudo liberar el equipo.", "Impossible de libérer l'équipement.", "Das Gerät konnte nicht freigegeben werden.", "Impossibile abilitare l'apparecchiatura."),
  "Cenário indisponível": steelL("Scenario unavailable", "Escenario no disponible", "Scénario indisponible", "Szenario nicht verfügbar", "Scenario non disponibile"),
  "Não foi possível executar o cenário.": steelL("The scenario could not be executed.", "No se pudo ejecutar el escenario.", "Impossible d'exécuter le scénario.", "Das Szenario konnte nicht ausgeführt werden.", "Impossibile eseguire lo scenario."),

  "Robótica e manipulação": steelL("Robotics and handling", "Robótica y manipulación", "Robotique et manutention", "Robotik und Handhabung", "Robotica e movimentazione"),
  "Produção, segurança, manutenção e consumo do braço.": steelL("Arm production, safety, maintenance and consumption.", "Producción, seguridad, mantenimiento y consumo del brazo.", "Production, sécurité, maintenance et consommation du bras.", "Produktion, Sicherheit, Wartung und Verbrauch des Arms.", "Produzione, sicurezza, manutenzione e consumo del braccio."),
  "Robótica industrial": steelL("Industrial robotics", "Robótica industrial", "Robotique industrielle", "Industrierobotik", "Robotica industriale"),
  "Eficiência, produção, intertravamentos, manutenção e energia.": steelL("Efficiency, production, interlocks, maintenance and energy.", "Eficiencia, producción, enclavamientos, mantenimiento y energía.", "Efficacité, production, interverrouillages, maintenance et énergie.", "Effizienz, Produktion, Verriegelungen, Wartung und Energie.", "Efficienza, produzione, interblocchi, manutenzione ed energia."),
  "Movimentação e fluxo": steelL("Movement and flow", "Movimiento y flujo", "Mouvement et flux", "Bewegung und Materialfluss", "Movimentazione e flusso"),
  "Ritmo de produção, segurança, manutenção e consumo.": steelL("Production rate, safety, maintenance and consumption.", "Ritmo de producción, seguridad, mantenimiento y consumo.", "Cadence de production, sécurité, maintenance et consommation.", "Produktionsrate, Sicherheit, Wartung und Verbrauch.", "Ritmo di produzione, sicurezza, manutenzione e consumo."),
  "Célula de soldagem": steelL("Welding cell", "Celda de soldadura", "Cellule de soudage", "Schweißzelle", "Cella di saldatura"),
  "Máquina de corte": steelL("Cutting machine", "Máquina de corte", "Machine de découpe", "Schneidmaschine", "Macchina da taglio"),
  "Equipamento personalizado": steelL("Custom equipment", "Equipo personalizado", "Équipement personnalisé", "Benutzerdefiniertes Gerät", "Apparecchiatura personalizzata"),
  "Escolha manualmente somente os grupos de indicadores necessários.": steelL("Manually choose only the required indicator groups.", "Elija manualmente solo los grupos de indicadores necesarios.", "Choisissez manuellement uniquement les groupes d'indicateurs nécessaires.", "Wählen Sie manuell nur die benötigten Anzeigegruppen.", "Scegli manualmente solo i gruppi di indicatori necessari."),
  "Não foi possível consultar a descoberta automática.": steelL("Automatic discovery could not be queried.", "No se pudo consultar el descubrimiento automático.", "Impossible d'interroger la découverte automatique.", "Die automatische Erkennung konnte nicht abgefragt werden.", "Impossibile interrogare il rilevamento automatico."),
  "Erro ao consultar equipamentos da rede.": steelL("Failed to query network equipment.", "Error al consultar los equipos de red.", "Erreur lors de la recherche des équipements réseau.", "Netzwerkgeräte konnten nicht abgefragt werden.", "Errore durante la ricerca delle apparecchiature di rete."),
  "Não foi possível iniciar a busca.": steelL("The search could not be started.", "No se pudo iniciar la búsqueda.", "Impossible de démarrer la recherche.", "Die Suche konnte nicht gestartet werden.", "Impossibile avviare la ricerca."),
  "Busca enviada. Aguardando respostas...": steelL("Search sent. Waiting for responses...", "Búsqueda enviada. Esperando respuestas...", "Recherche envoyée. En attente de réponses...", "Suche gesendet. Warten auf Antworten...", "Ricerca inviata. In attesa di risposte..."),
  "O monitoramento será provisionado automaticamente quando o dispositivo suportar. O controle remoto continuará DESATIVADO por segurança.": steelL("Monitoring will be provisioned automatically when supported by the device. Remote control will remain DISABLED for safety.", "El monitoreo se aprovisionará automáticamente cuando el dispositivo sea compatible. El control remoto permanecerá DESACTIVADO por seguridad.", "La surveillance sera configurée automatiquement si l'appareil la prend en charge. Le contrôle distant restera DÉSACTIVÉ par sécurité.", "Die Überwachung wird bei Geräteunterstützung automatisch bereitgestellt. Die Fernsteuerung bleibt aus Sicherheitsgründen DEAKTIVIERT.", "Il monitoraggio verrà configurato automaticamente quando supportato dal dispositivo. Il controllo remoto resterà DISATTIVATO per sicurezza."),
  "Não foi possível adicionar o equipamento.": steelL("The equipment could not be added.", "No se pudo añadir el equipo.", "Impossible d'ajouter l'équipement.", "Das Gerät konnte nicht hinzugefügt werden.", "Impossibile aggiungere l'apparecchiatura."),
  "Equipamento adicionado.": steelL("Equipment added.", "Equipo añadido.", "Équipement ajouté.", "Gerät hinzugefügt.", "Apparecchiatura aggiunta."),
  "Chave do equipamento — configuração manual necessária": steelL("Equipment key — manual setup required", "Clave del equipo — configuración manual necesaria", "Clé de l'équipement — configuration manuelle requise", "Geräteschlüssel — manuelle Einrichtung erforderlich", "Chiave apparecchiatura — configurazione manuale necessaria"),
  "Não foi possível comunicar com a API.": steelL("Could not communicate with the API.", "No se pudo comunicar con la API.", "Impossible de communiquer avec l'API.", "Kommunikation mit der API nicht möglich.", "Impossibile comunicare con l'API."),
  "Sem status": steelL("No status", "Sin estado", "Sans état", "Kein Status", "Senza stato"),
  "Painel IoT para sensores, conectividade Wi-Fi, sinal, latência e telemetria HTTP ou MQTT.": steelL("IoT dashboard for sensors, Wi-Fi connectivity, signal, latency and HTTP or MQTT telemetry.", "Panel IoT para sensores, conectividad Wi-Fi, señal, latencia y telemetría HTTP o MQTT.", "Tableau IoT pour capteurs, connectivité Wi-Fi, signal, latence et télémétrie HTTP ou MQTT.", "IoT-Dashboard für Sensoren, WLAN, Signal, Latenz und HTTP- oder MQTT-Telemetrie.", "Dashboard IoT per sensori, Wi-Fi, segnale, latenza e telemetria HTTP o MQTT."),
  "Painel robótico dedicado para pose cartesiana, juntas, efetuador, fila de comandos e USB serial.": steelL("Dedicated robotic dashboard for Cartesian pose, joints, end effector, command queue and USB serial.", "Panel robótico dedicado para pose cartesiana, articulaciones, efector, cola de comandos y USB serial.", "Tableau robotique dédié à la pose cartésienne, aux articulations, à l'effecteur, à la file de commandes et à l'USB série.", "Robotik-Dashboard für kartesische Pose, Gelenke, Endeffektor, Befehlswarteschlange und USB-Seriell.", "Dashboard robotica per posa cartesiana, giunti, effettore, coda comandi e USB seriale."),
  "Painel de automação para entradas, saídas, registradores, ciclo de varredura, processo e alarmes.": steelL("Automation dashboard for inputs, outputs, registers, scan cycle, process and alarms.", "Panel de automatización para entradas, salidas, registros, ciclo de escaneo, proceso y alarmas.", "Tableau d'automatisation pour entrées, sorties, registres, cycle de balayage, processus et alarmes.", "Automatisierungs-Dashboard für Ein-/Ausgänge, Register, Scanzyklus, Prozess und Alarme.", "Dashboard di automazione per ingressi, uscite, registri, ciclo di scansione, processo e allarmi."),
  "Painel de célula robótica para eixos, ferramenta, ciclos, modo de operação e segurança.": steelL("Robotic-cell dashboard for axes, tool, cycles, operating mode and safety.", "Panel de celda robótica para ejes, herramienta, ciclos, modo de operación y seguridad.", "Tableau de cellule robotique pour axes, outil, cycles, mode de fonctionnement et sécurité.", "Roboterzellen-Dashboard für Achsen, Werkzeug, Zyklen, Betriebsmodus und Sicherheit.", "Dashboard della cella robotica per assi, utensile, cicli, modalità operativa e sicurezza."),
  "Painel de usinagem para spindle, avanço, ferramenta, programa, peças e tempo de ciclo.": steelL("Machining dashboard for spindle, feed, tool, program, parts and cycle time.", "Panel de mecanizado para husillo, avance, herramienta, programa, piezas y tiempo de ciclo.", "Tableau d'usinage pour broche, avance, outil, programme, pièces et temps de cycle.", "Bearbeitungs-Dashboard für Spindel, Vorschub, Werkzeug, Programm, Teile und Zykluszeit.", "Dashboard di lavorazione per mandrino, avanzamento, utensile, programma, pezzi e tempo ciclo."),
  "IHM Impressora 3D": steelL("3D Printer HMI", "HMI de impresora 3D", "IHM d'imprimante 3D", "3D-Drucker-HMI", "HMI stampante 3D"),
  "IHM dedicada para FDM/FFF, SLA/MSLA/DLP, SLS e impressoras proprietárias. Exibe apenas os dados realmente enviados pelo equipamento.": steelL("Dedicated HMI for FDM/FFF, SLA/MSLA/DLP, SLS and proprietary printers. It displays only data actually sent by the equipment.", "HMI dedicada para FDM/FFF, SLA/MSLA/DLP, SLS e impresoras propietarias. Muestra solo los datos enviados realmente por el equipo.", "IHM dédiée aux imprimantes FDM/FFF, SLA/MSLA/DLP, SLS et propriétaires. Elle n'affiche que les données réellement envoyées.", "HMI für FDM/FFF-, SLA/MSLA/DLP-, SLS- und proprietäre Drucker. Angezeigt werden nur tatsächlich gesendete Daten.", "HMI dedicata a stampanti FDM/FFF, SLA/MSLA/DLP, SLS e proprietarie. Mostra solo i dati realmente inviati."),
  "Painel de conectividade para dispositivos, protocolos, tráfego, latência e integridade do gateway.": steelL("Connectivity dashboard for devices, protocols, traffic, latency and gateway integrity.", "Panel de conectividad para dispositivos, protocolos, tráfico, latencia e integridad del gateway.", "Tableau de connectivité pour appareils, protocoles, trafic, latence et intégrité de la passerelle.", "Konnektivitäts-Dashboard für Geräte, Protokolle, Verkehr, Latenz und Gateway-Integrität.", "Dashboard di connettività per dispositivi, protocolli, traffico, latenza e integrità del gateway."),
  "Equipamento genérico": steelL("Generic equipment", "Equipo genérico", "Équipement générique", "Generisches Gerät", "Apparecchiatura generica"),
  "Painel industrial flexível para telemetria, comunicação e campos adicionais enviados pelo equipamento.": steelL("Flexible industrial dashboard for telemetry, communication and additional fields sent by the equipment.", "Panel industrial flexible para telemetría, comunicación y campos adicionales enviados por el equipo.", "Tableau industriel flexible pour télémétrie, communication et champs supplémentaires envoyés par l'équipement.", "Flexibles Industrie-Dashboard für Telemetrie, Kommunikation und zusätzliche Gerätefelder.", "Dashboard industriale flessibile per telemetria, comunicazione e campi aggiuntivi inviati dall'apparecchiatura."),
  "Dados extras": steelL("Additional data", "Datos adicionales", "Données supplémentaires", "Zusätzliche Daten", "Dati aggiuntivi"),
  "Desativar equipamento": steelL("Disable equipment", "Desactivar equipo", "Désactiver l'équipement", "Gerät deaktivieren", "Disattiva apparecchiatura"),
  "Equipamento desativado": steelL("Equipment disabled", "Equipo desactivado", "Équipement désactivé", "Gerät deaktiviert", "Apparecchiatura disattivata"),
  "Erro ao remover equipamento.": steelL("Failed to remove equipment.", "Error al eliminar el equipo.", "Erreur lors de la suppression de l'équipement.", "Gerät konnte nicht entfernt werden.", "Errore durante la rimozione dell'apparecchiatura."),
  "Preencha nome, setor, modelo e código do equipamento.": steelL("Fill in the equipment name, sector, model and code.", "Complete el nombre, sector, modelo y código del equipo.", "Renseignez le nom, le secteur, le modèle et le code de l'équipement.", "Name, Bereich, Modell und Code des Geräts ausfüllen.", "Compila nome, settore, modello e codice dell'apparecchiatura."),
  "Selecione o controlador ou gateway do equipamento real.": steelL("Select the controller or gateway for the real equipment.", "Seleccione el controlador o gateway del equipo real.", "Sélectionnez le contrôleur ou la passerelle de l'équipement réel.", "Controller oder Gateway des realen Geräts auswählen.", "Seleziona il controller o gateway dell'apparecchiatura reale."),
  "Selecione ao menos um módulo para o painel inteligente ou desative o painel.": steelL("Select at least one module for the smart dashboard or disable the dashboard.", "Seleccione al menos un módulo para el panel inteligente o desactive el panel.", "Sélectionnez au moins un module pour le tableau intelligent ou désactivez-le.", "Mindestens ein Modul für das Smart-Dashboard auswählen oder Dashboard deaktivieren.", "Seleziona almeno un modulo per la dashboard intelligente oppure disattivala."),
  "Os limites críticos devem ser maiores que os limites de atenção e a carga elétrica deve permanecer entre 0 e 100%.": steelL("Critical limits must be higher than warning limits and electrical load must remain between 0 and 100%.", "Los límites críticos deben ser mayores que los límites de advertencia y la carga eléctrica debe permanecer entre 0 y 100%.", "Les seuils critiques doivent être supérieurs aux seuils d'alerte et la charge électrique doit rester entre 0 et 100 %.", "Kritische Grenzwerte müssen über Warnwerten liegen und die elektrische Last zwischen 0 und 100 % bleiben.", "I limiti critici devono superare quelli di attenzione e il carico elettrico deve restare tra 0 e 100%."),
  "Salvando alterações...": steelL("Saving changes...", "Guardando cambios...", "Enregistrement des modifications...", "Änderungen werden gespeichert...", "Salvataggio modifiche..."),
  "Equipamento atualizado com sucesso!": steelL("Equipment updated successfully!", "¡Equipo actualizado correctamente!", "Équipement mis à jour avec succès !", "Gerät erfolgreich aktualisiert!", "Apparecchiatura aggiornata correttamente!"),
  "Chave gerada para o equipamento": steelL("Key generated for the equipment", "Clave generada para el equipo", "Clé générée pour l'équipement", "Schlüssel für das Gerät erzeugt", "Chiave generata per l'apparecchiatura"),
  "Chave do novo equipamento": steelL("New equipment key", "Clave del nuevo equipo", "Clé du nouvel équipement", "Schlüssel des neuen Geräts", "Chiave della nuova apparecchiatura"),

  "Controle remoto desativado ou impressora offline.": steelL("Remote control disabled or printer offline.", "Control remoto desactivado o impresora sin conexión.", "Contrôle distant désactivé ou imprimante hors ligne.", "Fernsteuerung deaktiviert oder Drucker offline.", "Controllo remoto disattivato o stampante offline."),
  "Recurso não suportado pelo bridge desta impressora.": steelL("Feature not supported by this printer's bridge.", "Función no compatible con el bridge de esta impresora.", "Fonction non prise en charge par le bridge de cette imprimante.", "Funktion wird von der Bridge dieses Druckers nicht unterstützt.", "Funzione non supportata dal bridge di questa stampante."),
  "Comando enviado.": steelL("Command sent.", "Comando enviado.", "Commande envoyée.", "Befehl gesendet.", "Comando inviato."),
  "Emergência ativa": steelL("Emergency active", "Emergencia activa", "Urgence active", "Not-Halt aktiv", "Emergenza attiva")
});

// Textos institucionais da landing page, mensagens de conta e estados de
// biometria. A tradução global também observa nós inseridos dinamicamente,
// portanto estes rótulos permanecem corretos depois de abrir modais/toasts.
Object.assign(STEEL_LITERAL_I18N, {
  "SteelControl, início": steelL("SteelControl, home", "SteelControl, inicio", "SteelControl, accueil", "SteelControl, Startseite", "SteelControl, home"),
  "Seções": steelL("Sections", "Secciones", "Sections", "Bereiche", "Sezioni"),
  "Ilustração 3D de uma célula industrial com robô, fresadora CNC, esteira, impressora 3D, tanque e painel de CLP conectados ao SteelControl": steelL("3D illustration of an industrial cell with a robot, CNC mill, conveyor, 3D printer, tank and PLC panel connected to SteelControl", "Ilustración 3D de una célula industrial con robot, fresadora CNC, cinta, impresora 3D, tanque y panel PLC conectados a SteelControl", "Illustration 3D d'une cellule industrielle avec robot, fraiseuse CNC, convoyeur, imprimante 3D, réservoir et automate connectés à SteelControl", "3D-Darstellung einer Industriezelle mit Roboter, CNC-Fräse, Förderband, 3D-Drucker, Tank und SPS-Panel, verbunden mit SteelControl", "Illustrazione 3D di una cella industriale con robot, fresa CNC, nastro, stampante 3D, serbatoio e pannello PLC collegati a SteelControl"),
  "Tipos de máquina atendidos": steelL("Supported machine types", "Tipos de máquina compatibles", "Types de machines pris en charge", "Unterstützte Maschinentypen", "Tipi di macchina supportati"),
  "Telas do sistema": steelL("System screens", "Pantallas del sistema", "Écrans du système", "Systemansichten", "Schermate del sistema"),
  "Posição do efetuador, ângulos das juntas, ventosa e garra. O que o equipamento não envia aparece como \"Não instalado\", sem leitura inventada.": steelL("End-effector position, joint angles, suction cup and gripper. Data not sent by the equipment appears as \"Not installed\", with no fabricated readings.", "Posición del efector, ángulos de las articulaciones, ventosa y pinza. Lo que el equipo no envía aparece como \"No instalado\", sin lecturas inventadas.", "Position de l'effecteur, angles des articulations, ventouse et pince. Les données non transmises apparaissent comme \"Non installé\", sans mesure inventée.", "Endeffektorposition, Gelenkwinkel, Sauger und Greifer. Nicht übermittelte Daten erscheinen als \"Nicht installiert\", ohne erfundene Messwerte.", "Posizione dell'effettore, angoli dei giunti, ventosa e pinza. I dati non inviati appaiono come \"Non installato\", senza letture inventate."),
  "Você não precisa de uma tela nova para cada fabricante. Cada equipamento mostra os indicadores que importam para ele, e o que não envia aparece como \"Não informado\".": steelL("You do not need a new screen for every manufacturer. Each machine shows the indicators that matter to it, and missing signals appear as \"Not provided\".", "No necesita una pantalla nueva para cada fabricante. Cada equipo muestra los indicadores relevantes y lo que no envía aparece como \"No informado\".", "Vous n'avez pas besoin d'un nouvel écran pour chaque fabricant. Chaque équipement affiche ses indicateurs utiles et les signaux absents apparaissent comme \"Non renseigné\".", "Sie benötigen nicht für jeden Hersteller eine neue Ansicht. Jede Maschine zeigt ihre relevanten Kennzahlen; fehlende Signale erscheinen als \"Nicht angegeben\".", "Non serve una nuova schermata per ogni produttore. Ogni macchina mostra gli indicatori rilevanti e i segnali mancanti appaiono come \"Non indicato\"."),
  "Tipo de máquina": steelL("Machine type", "Tipo de máquina", "Type de machine", "Maschinentyp", "Tipo di macchina"),
  "Sinal que a máquina não envia aparece como \"Não informado\"": steelL("Signals not sent by the machine appear as \"Not provided\"", "Las señales no enviadas por la máquina aparecen como \"No informado\"", "Les signaux non transmis apparaissent comme \"Non renseigné\"", "Nicht gelieferte Signale erscheinen als \"Nicht angegeben\"", "I segnali non inviati appaiono come \"Non indicato\""),
  "LIBERAR": steelL("ENABLE", "HABILITAR", "AUTORISER", "FREIGEBEN", "ABILITA"),
  "Rodapé": steelL("Footer", "Pie de página", "Pied de page", "Fußzeile", "Piè di pagina"),
  "Painel do SteelControl com os dados de uma máquina": steelL("SteelControl dashboard with machine data", "Panel de SteelControl con los datos de una máquina", "Tableau SteelControl avec les données d'une machine", "SteelControl-Dashboard mit Maschinendaten", "Dashboard SteelControl con i dati di una macchina"),
  "Painel do Dobot Magician no SteelControl, com pose do efetuador, ângulos das juntas, ventosa e garra": steelL("Dobot Magician dashboard in SteelControl, with end-effector pose, joint angles, suction cup and gripper", "Panel de Dobot Magician en SteelControl, con pose del efector, ángulos de articulaciones, ventosa y pinza", "Tableau Dobot Magician dans SteelControl, avec pose de l'effecteur, angles des articulations, ventouse et pince", "Dobot-Magician-Dashboard in SteelControl mit Endeffektorpose, Gelenkwinkeln, Sauger und Greifer", "Dashboard Dobot Magician in SteelControl con posa dell'effettore, angoli dei giunti, ventosa e pinza"),
  "Controle do robô no SteelControl, com modo manual, ciclo automático de pick-and-place e controle jog": steelL("Robot control in SteelControl, with manual mode, automatic pick-and-place cycle and jog control", "Control del robot en SteelControl, con modo manual, ciclo automático de pick-and-place y control jog", "Commande du robot dans SteelControl, avec mode manuel, cycle automatique de pick-and-place et commande jog", "Robotersteuerung in SteelControl mit manuellem Modus, automatischem Pick-and-Place-Zyklus und Jog-Steuerung", "Controllo robot in SteelControl con modalità manuale, ciclo automatico pick-and-place e controllo jog"),
  "Lista de equipamentos e descoberta automática no SteelControl": steelL("Equipment list and automatic discovery in SteelControl", "Lista de equipos y detección automática en SteelControl", "Liste des équipements et découverte automatique dans SteelControl", "Geräteliste und automatische Erkennung in SteelControl", "Elenco apparecchiature e rilevamento automatico in SteelControl"),
  "Câmera ao vivo da impressora 3D": steelL("Live 3D-printer camera", "Cámara en vivo de la impresora 3D", "Caméra en direct de l'imprimante 3D", "Live-Kamera des 3D-Druckers", "Fotocamera live della stampante 3D"),
  "Tendência das temperaturas": steelL("Temperature trend", "Tendencia de temperaturas", "Tendance des températures", "Temperaturtrend", "Andamento delle temperature"),
  "Logo da empresa": steelL("Company logo", "Logo de la empresa", "Logo de l'entreprise", "Unternehmenslogo", "Logo aziendale"),
  "Avenida Industrial": steelL("Industrial Avenue", "Avenida Industrial", "Avenue Industrielle", "Industriestraße", "Viale Industriale"),
  "Galpão 2": steelL("Warehouse 2", "Nave 2", "Entrepôt 2", "Halle 2", "Capannone 2"),
  "Distrito Industrial": steelL("Industrial District", "Distrito Industrial", "Zone Industrielle", "Industriegebiet", "Zona Industriale"),

  "Painel da máquina": steelL("Machine dashboard", "Panel de la máquina", "Tableau de la machine", "Maschinen-Dashboard", "Dashboard macchina"),
  "Resposta inválida:": steelL("Invalid response:", "Respuesta no válida:", "Réponse invalide :", "Ungültige Antwort:", "Risposta non valida:"),
  "O servidor retornou uma resposta inválida.": steelL("The server returned an invalid response.", "El servidor devolvió una respuesta no válida.", "Le serveur a renvoyé une réponse invalide.", "Der Server hat eine ungültige Antwort zurückgegeben.", "Il server ha restituito una risposta non valida."),
  "Erro na operação.": steelL("Operation failed.", "Error en la operación.", "Échec de l'opération.", "Vorgang fehlgeschlagen.", "Operazione non riuscita."),
  "Acesso restrito": steelL("Restricted access", "Acceso restringido", "Accès restreint", "Eingeschränkter Zugriff", "Accesso limitato"),
  "A nova identidade visual foi aplicada com sucesso.": steelL("The new visual identity was applied successfully.", "La nueva identidad visual se aplicó correctamente.", "La nouvelle identité visuelle a été appliquée.", "Die neue visuelle Identität wurde erfolgreich übernommen.", "La nuova identità visiva è stata applicata correttamente."),
  "Dados da empresa atualizados com sucesso.": steelL("Company information updated successfully.", "Datos de la empresa actualizados correctamente.", "Informations de l'entreprise mises à jour.", "Unternehmensdaten erfolgreich aktualisiert.", "Dati aziendali aggiornati correttamente."),
  "Endereço copiado": steelL("Address copied", "Dirección copiada", "Adresse copiée", "Adresse kopiert", "Indirizzo copiato"),
  "O endereço foi copiado. O SteelControl não precisa de internet para exibir os dados da empresa.": steelL("The address was copied. SteelControl does not need internet access to display company information.", "La dirección fue copiada. SteelControl no necesita internet para mostrar los datos de la empresa.", "L'adresse a été copiée. SteelControl n'a pas besoin d'Internet pour afficher les informations de l'entreprise.", "Die Adresse wurde kopiert. SteelControl benötigt kein Internet, um Unternehmensdaten anzuzeigen.", "L'indirizzo è stato copiato. SteelControl non richiede Internet per mostrare i dati aziendali."),
  "Somente administradores podem editar usuários.": steelL("Only administrators can edit users.", "Solo los administradores pueden editar usuarios.", "Seuls les administrateurs peuvent modifier les utilisateurs.", "Nur Administratoren können Benutzer bearbeiten.", "Solo gli amministratori possono modificare gli utenti."),
  "Código enviado. Confirme o novo e-mail.": steelL("Code sent. Confirm the new email address.", "Código enviado. Confirme el nuevo correo.", "Code envoyé. Confirmez la nouvelle adresse e-mail.", "Code gesendet. Bestätigen Sie die neue E-Mail-Adresse.", "Codice inviato. Conferma il nuovo indirizzo e-mail."),
  "Dados de acesso atualizados com sucesso.": steelL("Access details updated successfully.", "Datos de acceso actualizados correctamente.", "Données d'accès mises à jour.", "Zugangsdaten erfolgreich aktualisiert.", "Dati di accesso aggiornati correttamente."),
  "Não foi possível atualizar o usuário.": steelL("The user could not be updated.", "No se pudo actualizar el usuario.", "Impossible de mettre à jour l'utilisateur.", "Der Benutzer konnte nicht aktualisiert werden.", "Impossibile aggiornare l'utente."),
  "Não foi possível confirmar o novo e-mail.": steelL("The new email address could not be confirmed.", "No se pudo confirmar el nuevo correo.", "Impossible de confirmer la nouvelle adresse e-mail.", "Die neue E-Mail-Adresse konnte nicht bestätigt werden.", "Impossibile confermare il nuovo indirizzo e-mail."),
  "Somente administradores podem desativar funcionários.": steelL("Only administrators can disable employees.", "Solo los administradores pueden desactivar empleados.", "Seuls les administrateurs peuvent désactiver des employés.", "Nur Administratoren können Mitarbeiter deaktivieren.", "Solo gli amministratori possono disattivare i dipendenti."),
  "este funcionário": steelL("this employee", "este empleado", "cet employé", "diesen Mitarbeiter", "questo dipendente"),
  "A conta deixará de aparecer como funcionário ativo, perderá o acesso ao sistema e as credenciais faciais serão revogadas. O histórico continuará preservado.": steelL("The account will no longer appear as an active employee, will lose system access and its facial credentials will be revoked. The history will be preserved.", "La cuenta dejará de aparecer como empleado activo, perderá el acceso al sistema y se revocarán sus credenciales faciales. El historial se conservará.", "Le compte ne sera plus affiché comme employé actif, perdra l'accès au système et ses identifiants faciaux seront révoqués. L'historique sera conservé.", "Das Konto wird nicht mehr als aktiver Mitarbeiter angezeigt, verliert den Systemzugriff und die Gesichtsdaten werden widerrufen. Der Verlauf bleibt erhalten.", "L'account non apparirà più come dipendente attivo, perderà l'accesso al sistema e le credenziali facciali saranno revocate. La cronologia verrà conservata."),
  "Desativar funcionário": steelL("Disable employee", "Desactivar empleado", "Désactiver l'employé", "Mitarbeiter deaktivieren", "Disattiva dipendente"),
  "Funcionário desativado": steelL("Employee disabled", "Empleado desactivado", "Employé désactivé", "Mitarbeiter deaktiviert", "Dipendente disattivato"),
  "Não foi possível desativar o funcionário.": steelL("The employee could not be disabled.", "No se pudo desactivar al empleado.", "Impossible de désactiver l'employé.", "Der Mitarbeiter konnte nicht deaktiviert werden.", "Impossibile disattivare il dipendente."),
  "Erro ao desativar": steelL("Disable failed", "Error al desactivar", "Échec de la désactivation", "Deaktivierung fehlgeschlagen", "Errore durante la disattivazione"),

  "Prova de vida não detectada. O funcionário não movimentou a cabeça a tempo. Faça o cadastro facial novamente.": steelL("Liveness was not detected. The employee did not move their head in time. Register the face again.", "No se detectó prueba de vida. El empleado no movió la cabeza a tiempo. Registre el rostro nuevamente.", "La preuve de vie n'a pas été détectée. L'employé n'a pas bougé la tête à temps. Recommencez l'enregistrement facial.", "Die Lebenderkennung ist fehlgeschlagen. Der Mitarbeiter hat den Kopf nicht rechtzeitig bewegt. Gesicht erneut registrieren.", "La prova di vitalità non è stata rilevata. Il dipendente non ha mosso la testa in tempo. Registra nuovamente il volto."),
  "Refaça a biometria": steelL("Repeat biometrics", "Repetir biometría", "Refaire la biométrie", "Biometrie wiederholen", "Ripeti biometria"),
  "Este perfil já possui uma biometria facial. Remova a facial atual antes de cadastrar outra.": steelL("This profile already has facial biometrics. Remove the current face before registering another.", "Este perfil ya tiene biometría facial. Elimine el rostro actual antes de registrar otro.", "Ce profil possède déjà une biométrie faciale. Supprimez-la avant d'en enregistrer une autre.", "Dieses Profil besitzt bereits Gesichtsdaten. Entfernen Sie diese vor einer neuen Registrierung.", "Questo profilo dispone già di biometria facciale. Rimuovila prima di registrarne un'altra."),
  "Posicione o rosto no centro da câmera.": steelL("Center your face in the camera.", "Coloque el rostro en el centro de la cámara.", "Placez votre visage au centre de la caméra.", "Positionieren Sie Ihr Gesicht in der Kameramitte.", "Posiziona il viso al centro della fotocamera."),
  "Não foi possível acessar a câmera": steelL("Could not access the camera", "No se pudo acceder a la cámara", "Impossible d'accéder à la caméra", "Kamerazugriff nicht möglich", "Impossibile accedere alla fotocamera"),
  "Permita o acesso à câmera no navegador.": steelL("Allow camera access in the browser.", "Permita el acceso a la cámara en el navegador.", "Autorisez l'accès à la caméra dans le navigateur.", "Erlauben Sie den Kamerazugriff im Browser.", "Consenti l'accesso alla fotocamera nel browser."),
  "Erro na análise.": steelL("Analysis failed.", "Error en el análisis.", "Échec de l'analyse.", "Analyse fehlgeschlagen.", "Errore durante l'analisi."),
  "Erro na análise facial": steelL("Facial analysis failed", "Error en el análisis facial", "Échec de l'analyse faciale", "Gesichtsanalyse fehlgeschlagen", "Errore nell'analisi facciale"),
  "Apenas o funcionário deve aparecer.": steelL("Only the employee should be visible.", "Solo debe aparecer el empleado.", "Seul l'employé doit apparaître.", "Nur der Mitarbeiter darf sichtbar sein.", "Deve essere visibile solo il dipendente."),
  "Vire levemente a cabeça. Você tem até 8 segundos.": steelL("Turn your head slightly. You have up to 8 seconds.", "Gire ligeramente la cabeza. Tiene hasta 8 segundos.", "Tournez légèrement la tête. Vous avez jusqu'à 8 secondes.", "Drehen Sie den Kopf leicht. Sie haben bis zu 8 Sekunden.", "Ruota leggermente la testa. Hai fino a 8 secondi."),
  "Ajuste o rosto": steelL("Adjust your face", "Ajuste el rostro", "Ajustez votre visage", "Gesicht ausrichten", "Regola il viso"),
  "Posicione o rosto corretamente.": steelL("Position your face correctly.", "Coloque el rostro correctamente.", "Positionnez correctement votre visage.", "Positionieren Sie Ihr Gesicht korrekt.", "Posiziona correttamente il viso."),
  "A prova de vida é obrigatória. Refaça o cadastro facial.": steelL("Liveness verification is required. Register the face again.", "La prueba de vida es obligatoria. Registre el rostro nuevamente.", "La preuve de vie est obligatoire. Recommencez l'enregistrement facial.", "Lebenderkennung ist erforderlich. Gesicht erneut registrieren.", "La prova di vitalità è obbligatoria. Registra nuovamente il volto."),
  "Cadastro não concluído": steelL("Registration not completed", "Registro no completado", "Inscription non terminée", "Registrierung nicht abgeschlossen", "Registrazione non completata"),
  "Data não informada": steelL("Date not provided", "Fecha no informada", "Date non renseignée", "Datum nicht angegeben", "Data non indicata"),
  "Cadastro cancelado porque a biometria facial não foi concluída.": steelL("Registration was cancelled because facial biometrics were not completed.", "El registro se canceló porque no se completó la biometría facial.", "L'inscription a été annulée car la biométrie faciale n'a pas été terminée.", "Die Registrierung wurde abgebrochen, da die Gesichtsbiometrie nicht abgeschlossen wurde.", "La registrazione è stata annullata perché la biometria facciale non è stata completata."),
  "Funcionário não ativado": steelL("Employee not activated", "Empleado no activado", "Employé non activé", "Mitarbeiter nicht aktiviert", "Dipendente non attivato"),
  "A facial não foi concluída e não foi possível reverter a conta automaticamente. Revise o funcionário antes de continuar.": steelL("Facial registration was not completed and the account could not be reverted automatically. Review the employee before continuing.", "El registro facial no se completó y no fue posible revertir la cuenta automáticamente. Revise al empleado antes de continuar.", "L'enregistrement facial n'a pas été terminé et le compte n'a pas pu être rétabli automatiquement. Vérifiez l'employé avant de continuer.", "Die Gesichtserfassung wurde nicht abgeschlossen und das Konto konnte nicht automatisch zurückgesetzt werden. Prüfen Sie den Mitarbeiter, bevor Sie fortfahren.", "La registrazione facciale non è stata completata e non è stato possibile ripristinare automaticamente l'account. Verifica il dipendente prima di continuare."),
  "Não foi possível confirmar o código.": steelL("The code could not be confirmed.", "No se pudo confirmar el código.", "Impossible de confirmer le code.", "Der Code konnte nicht bestätigt werden.", "Impossibile confermare il codice."),
  "Não foi possível reenviar o código.": steelL("The code could not be resent.", "No se pudo reenviar el código.", "Impossible de renvoyer le code.", "Der Code konnte nicht erneut gesendet werden.", "Impossibile inviare nuovamente il codice."),
  "A verificação do cadastro expirou. Confirme o e-mail novamente.": steelL("Registration verification expired. Confirm the email again.", "La verificación del registro expiró. Confirme el correo nuevamente.", "La vérification de l'inscription a expiré. Confirmez à nouveau l'e-mail.", "Die Registrierungsprüfung ist abgelaufen. Bestätigen Sie die E-Mail erneut.", "La verifica della registrazione è scaduta. Conferma nuovamente l'e-mail."),
  "A biometria não foi concluída. A conta ainda não foi criada; faça a facial novamente.": steelL("Biometrics were not completed. The account has not been created yet; repeat facial registration.", "La biometría no se completó. La cuenta aún no fue creada; repita el registro facial.", "La biométrie n'a pas été terminée. Le compte n'a pas encore été créé ; recommencez l'enregistrement facial.", "Die Biometrie wurde nicht abgeschlossen. Das Konto wurde noch nicht erstellt; Gesicht erneut registrieren.", "La biometria non è stata completata. L'account non è ancora stato creato; ripeti la registrazione facciale."),
  "Código de 6 dígitos": steelL("6-digit code", "Código de 6 dígitos", "Code à 6 chiffres", "6-stelliger Code", "Codice di 6 cifre"),
  "Confirmação adicional necessária.": steelL("Additional confirmation required.", "Se requiere confirmación adicional.", "Confirmation supplémentaire requise.", "Zusätzliche Bestätigung erforderlich.", "È richiesta una conferma aggiuntiva.")
});

// Estados produzidos pelos runtimes dos dashboards e pelos formulários.
Object.assign(STEEL_LITERAL_I18N, {
  "Tempo de scan": steelL("Scan time", "Tiempo de escaneo", "Temps de balayage", "Scanzeit", "Tempo di scansione"),
  "Modo automático": steelL("Automatic mode", "Modo automático", "Mode automatique", "Automatikmodus", "Modalità automatica"),
  "Conversão de dados": steelL("Data conversion", "Conversión de datos", "Conversion des données", "Datenkonvertierung", "Conversione dati"),
  "Dados adicionais": steelL("Additional data", "Datos adicionales", "Données supplémentaires", "Zusätzliche Daten", "Dati aggiuntivi"),
  "Alarme ativo": steelL("Active alarm", "Alarma activa", "Alarme active", "Aktiver Alarm", "Allarme attivo"),
  "Produção controlada pelo PLC": steelL("Production controlled by the PLC", "Producción controlada por el PLC", "Production contrôlée par l'automate", "SPS-gesteuerte Produktion", "Produzione controllata dal PLC"),
  "Produção, ciclos de processo e dados de automação da máquina selecionada.": steelL("Production, process cycles and automation data for the selected machine.", "Producción, ciclos de proceso y datos de automatización de la máquina seleccionada.", "Production, cycles de processus et données d'automatisation de la machine sélectionnée.", "Produktion, Prozesszyklen und Automatisierungsdaten der ausgewählten Maschine.", "Produzione, cicli di processo e dati di automazione della macchina selezionata."),
  "Produção do PLC": steelL("PLC production", "Producción del PLC", "Production de l'automate", "SPS-Produktion", "Produzione PLC"),
  "Produção e ciclos executados exclusivamente pela célula selecionada.": steelL("Production and cycles executed exclusively by the selected cell.", "Producción y ciclos ejecutados exclusivamente por la celda seleccionada.", "Production et cycles exécutés exclusivement par la cellule sélectionnée.", "Produktion und Zyklen ausschließlich der ausgewählten Zelle.", "Produzione e cicli eseguiti esclusivamente dalla cella selezionata."),
  "Produção da máquina CNC": steelL("CNC machine production", "Producción de la máquina CNC", "Production de la machine CNC", "Produktion der CNC-Maschine", "Produzione della macchina CNC"),
  "Peças, ciclos e parâmetros de usinagem da máquina selecionada.": steelL("Parts, cycles and machining parameters for the selected machine.", "Piezas, ciclos y parámetros de mecanizado de la máquina seleccionada.", "Pièces, cycles et paramètres d'usinage de la machine sélectionnée.", "Teile, Zyklen und Bearbeitungsparameter der ausgewählten Maschine.", "Pezzi, cicli e parametri di lavorazione della macchina selezionata."),
  "Produção aditiva em tempo real": steelL("Real-time additive manufacturing", "Fabricación aditiva en tiempo real", "Fabrication additive en temps réel", "Additive Fertigung in Echtzeit", "Produzione additiva in tempo reale"),
  "Fluxo de dados e atividade dos equipamentos integrados por este gateway.": steelL("Data flow and activity of equipment integrated through this gateway.", "Flujo de datos y actividad de los equipos integrados por este gateway.", "Flux de données et activité des équipements intégrés via cette passerelle.", "Datenfluss und Aktivität der über dieses Gateway integrierten Geräte.", "Flusso dati e attività delle apparecchiature integrate tramite questo gateway."),
  "Indicadores operacionais exclusivos do equipamento selecionado.": steelL("Operational indicators specific to the selected equipment.", "Indicadores operativos específicos del equipo seleccionado.", "Indicateurs opérationnels propres à l'équipement sélectionné.", "Betriebskennzahlen speziell für das ausgewählte Gerät.", "Indicatori operativi specifici dell'apparecchiatura selezionata."),
  "Erro ao carregar manutenções:": steelL("Failed to load maintenance records:", "Error al cargar los mantenimientos:", "Échec du chargement des maintenances :", "Wartungen konnten nicht geladen werden:", "Errore nel caricamento delle manutenzioni:"),
  "Erro ao arquivar manutenção:": steelL("Failed to archive maintenance:", "Error al archivar el mantenimiento:", "Échec de l'archivage de la maintenance :", "Wartung konnte nicht archiviert werden:", "Errore nell'archiviazione della manutenzione:"),
  "Erro ao arquivar manutenção.": steelL("Failed to archive maintenance.", "Error al archivar el mantenimiento.", "Échec de l'archivage de la maintenance.", "Wartung konnte nicht archiviert werden.", "Errore nell'archiviazione della manutenzione."),
  "Erro ao carregar resumo da empresa:": steelL("Failed to load company summary:", "Error al cargar el resumen de la empresa:", "Échec du chargement du résumé de l'entreprise :", "Unternehmensübersicht konnte nicht geladen werden:", "Errore nel caricamento del riepilogo aziendale:"),
  "Erro na visão geral:": steelL("Overview failed:", "Error en la vista general:", "Échec de la vue générale :", "Übersicht fehlgeschlagen:", "Errore nella panoramica:"),

  "O Edge não confirmou a execução do comando dentro do tempo esperado.": steelL("Edge did not confirm command execution within the expected time.", "Edge no confirmó la ejecución del comando dentro del tiempo esperado.", "Edge n'a pas confirmé l'exécution de la commande dans le délai prévu.", "Edge hat die Ausführung des Befehls nicht innerhalb der erwarteten Zeit bestätigt.", "Edge non ha confermato l'esecuzione del comando entro il tempo previsto."),
  "Comando executado": steelL("Command executed", "Comando ejecutado", "Commande exécutée", "Befehl ausgeführt", "Comando eseguito"),
  "Comando Dobot": steelL("Dobot command", "Comando Dobot", "Commande Dobot", "Dobot-Befehl", "Comando Dobot"),
  "Sem telemetria do Dobot durante o ciclo.": steelL("No Dobot telemetry was received during the cycle.", "No se recibió telemetría del Dobot durante el ciclo.", "Aucune télémétrie Dobot reçue pendant le cycle.", "Während des Zyklus wurde keine Dobot-Telemetrie empfangen.", "Nessuna telemetria Dobot ricevuta durante il ciclo."),
  "Falha no movimento": steelL("Movement failed", "Fallo de movimiento", "Échec du mouvement", "Bewegung fehlgeschlagen", "Movimento non riuscito"),
  "Parado pelo operador": steelL("Stopped by the operator", "Detenido por el operador", "Arrêté par l'opérateur", "Vom Bediener gestoppt", "Fermato dall'operatore"),
  "Movimento interrompido": steelL("Movement interrupted", "Movimiento interrumpido", "Mouvement interrompu", "Bewegung unterbrochen", "Movimento interrotto"),

  "Somente administradores podem alterar a logo.": steelL("Only administrators can change the logo.", "Solo los administradores pueden cambiar el logo.", "Seuls les administrateurs peuvent modifier le logo.", "Nur Administratoren können das Logo ändern.", "Solo gli amministratori possono modificare il logo."),
  "Não foi possível alterar a logo.": steelL("The logo could not be changed.", "No se pudo cambiar el logo.", "Impossible de modifier le logo.", "Das Logo konnte nicht geändert werden.", "Impossibile modificare il logo."),
  "O PostgreSQL não confirmou o salvamento da logo.": steelL("PostgreSQL did not confirm that the logo was saved.", "PostgreSQL no confirmó que el logo se guardó.", "PostgreSQL n'a pas confirmé l'enregistrement du logo.", "PostgreSQL hat das Speichern des Logos nicht bestätigt.", "PostgreSQL non ha confermato il salvataggio del logo."),
  "Não foi possível remover a logo.": steelL("The logo could not be removed.", "No se pudo eliminar el logo.", "Impossible de supprimer le logo.", "Das Logo konnte nicht entfernt werden.", "Impossibile rimuovere il logo."),
  "Não foi possível remover a logo": steelL("The logo could not be removed", "No se pudo eliminar el logo", "Impossible de supprimer le logo", "Das Logo konnte nicht entfernt werden", "Impossibile rimuovere il logo"),
  "Somente administradores podem alterar os dados da empresa.": steelL("Only administrators can change company information.", "Solo los administradores pueden cambiar los datos de la empresa.", "Seuls les administrateurs peuvent modifier les informations de l'entreprise.", "Nur Administratoren können Unternehmensdaten ändern.", "Solo gli amministratori possono modificare i dati aziendali."),
  "Informe o nome da empresa.": steelL("Enter the company name.", "Ingrese el nombre de la empresa.", "Saisissez le nom de l'entreprise.", "Geben Sie den Unternehmensnamen ein.", "Inserisci il nome dell'azienda."),
  "Nenhuma amostra facial cadastrada.": steelL("No facial sample registered.", "No hay ninguna muestra facial registrada.", "Aucun échantillon facial enregistré.", "Keine Gesichtsprobe registriert.", "Nessun campione facciale registrato."),
  "Funcionário reativado com sucesso.": steelL("Employee reactivated successfully.", "Empleado reactivado correctamente.", "Employé réactivé avec succès.", "Mitarbeiter erfolgreich reaktiviert.", "Dipendente riattivato correttamente."),
  "Funcionário cadastrado.": steelL("Employee registered.", "Empleado registrado.", "Employé enregistré.", "Mitarbeiter registriert.", "Dipendente registrato."),
  "Funcionário recontratado": steelL("Employee rehired", "Empleado recontratado", "Employé réembauché", "Mitarbeiter wiedereingestellt", "Dipendente riassunto"),
  "Funcionário cadastrado": steelL("Employee registered", "Empleado registrado", "Employé enregistré", "Mitarbeiter registriert", "Dipendente registrato"),
  "A conta foi reativada. Por segurança, cadastre novamente o reconhecimento facial.": steelL("The account was reactivated. For security, register facial recognition again.", "La cuenta fue reactivada. Por seguridad, registre de nuevo el reconocimiento facial.", "Le compte a été réactivé. Pour des raisons de sécurité, enregistrez à nouveau la reconnaissance faciale.", "Das Konto wurde reaktiviert. Registrieren Sie aus Sicherheitsgründen die Gesichtserkennung erneut.", "L'account è stato riattivato. Per sicurezza, registra nuovamente il riconoscimento facciale."),
  "O novo acesso foi criado com sucesso.": steelL("The new access account was created successfully.", "El nuevo acceso se creó correctamente.", "Le nouvel accès a été créé avec succès.", "Der neue Zugang wurde erfolgreich erstellt.", "Il nuovo accesso è stato creato correttamente."),
  "Excluir esta facial": steelL("Delete this facial profile", "Eliminar este perfil facial", "Supprimer ce profil facial", "Dieses Gesichtsprofil löschen", "Elimina questo profilo facciale"),
  "Não foi possível enviar o código.": steelL("The code could not be sent.", "No se pudo enviar el código.", "Impossible d'envoyer le code.", "Der Code konnte nicht gesendet werden.", "Impossibile inviare il codice."),
  "Código inválido.": steelL("Invalid code.", "Código no válido.", "Code invalide.", "Ungültiger Code.", "Codice non valido."),

  "OEE, produção, proteções, manutenção e energia.": steelL("OEE, production, safeguards, maintenance and energy.", "OEE, producción, protecciones, mantenimiento y energía.", "OEE, production, protections, maintenance et énergie.", "OEE, Produktion, Schutzfunktionen, Wartung und Energie.", "OEE, produzione, protezioni, manutenzione ed energia."),
  "OEE, programa, qualidade, ferramenta e segurança.": steelL("OEE, program, quality, tooling and safety.", "OEE, programa, calidad, herramienta y seguridad.", "OEE, programme, qualité, outillage et sécurité.", "OEE, Programm, Qualität, Werkzeug und Sicherheit.", "OEE, programma, qualità, utensile e sicurezza."),
  "OEE, programa, peças, ferramenta, alarmes e energia.": steelL("OEE, program, parts, tooling, alarms and energy.", "OEE, programa, piezas, herramienta, alarmas y energía.", "OEE, programme, pièces, outillage, alarmes et énergie.", "OEE, Programm, Teile, Werkzeug, Alarme und Energie.", "OEE, programma, pezzi, utensile, allarmi ed energia."),
  "Produção, proteções, manutenção e utilidades.": steelL("Production, safeguards, maintenance and utilities.", "Producción, protecciones, mantenimiento y servicios.", "Production, protections, maintenance et utilités.", "Produktion, Schutzfunktionen, Wartung und Medien.", "Produzione, protezioni, manutenzione e utenze."),
  "Eficiência, produção, segurança, ferramenta e energia.": steelL("Efficiency, production, safety, tooling and energy.", "Eficiencia, producción, seguridad, herramienta y energía.", "Efficacité, production, sécurité, outillage et énergie.", "Effizienz, Produktion, Sicherheit, Werkzeug und Energie.", "Efficienza, produzione, sicurezza, utensile ed energia."),
  "OEE, contagem, qualidade, segurança e manutenção.": steelL("OEE, count, quality, safety and maintenance.", "OEE, conteo, calidad, seguridad y mantenimiento.", "OEE, comptage, qualité, sécurité et maintenance.", "OEE, Zählung, Qualität, Sicherheit und Wartung.", "OEE, conteggio, qualità, sicurezza e manutenzione."),
  "Trabalho, progresso, condição, manutenção e energia.": steelL("Job, progress, condition, maintenance and energy.", "Trabajo, progreso, condición, mantenimiento y energía.", "Travail, progression, état, maintenance et énergie.", "Auftrag, Fortschritt, Zustand, Wartung und Energie.", "Lavoro, avanzamento, condizione, manutenzione ed energia."),
  "Desativado": steelL("Disabled", "Desactivado", "Désactivé", "Deaktiviert", "Disattivato"),
  "Escolha o tipo do equipamento para receber uma recomendação de indicadores.": steelL("Choose the equipment type to receive recommended indicators.", "Elija el tipo de equipo para recibir indicadores recomendados.", "Choisissez le type d'équipement pour obtenir des indicateurs recommandés.", "Wählen Sie den Gerätetyp, um empfohlene Kennzahlen zu erhalten.", "Scegli il tipo di apparecchiatura per ricevere gli indicatori consigliati."),
  "Modo real: o simulador fica desativado. Configure o controlador e o protocolo de comunicação. A máquina permanecerá offline até receber telemetria real.": steelL("Real mode: the simulator is disabled. Configure the controller and communication protocol. The machine will remain offline until real telemetry is received.", "Modo real: el simulador está desactivado. Configure el controlador y el protocolo de comunicación. La máquina permanecerá sin conexión hasta recibir telemetría real.", "Mode réel : le simulateur est désactivé. Configurez le contrôleur et le protocole de communication. La machine restera hors ligne jusqu'à réception d'une télémétrie réelle.", "Realbetrieb: Der Simulator ist deaktiviert. Konfigurieren Sie Controller und Kommunikationsprotokoll. Die Maschine bleibt offline, bis reale Telemetrie empfangen wird.", "Modalità reale: il simulatore è disattivato. Configura controller e protocollo di comunicazione. La macchina resterà offline finché non riceverà telemetria reale."),
  "Nenhum equipamento SteelControl foi identificado nesse IP.": steelL("No SteelControl equipment was identified at this IP address.", "No se identificó ningún equipo SteelControl en esta IP.", "Aucun équipement SteelControl n'a été identifié à cette adresse IP.", "Unter dieser IP-Adresse wurde kein SteelControl-Gerät erkannt.", "Nessuna apparecchiatura SteelControl è stata identificata a questo indirizzo IP."),
  "Equipamento identificado pelo IP.": steelL("Equipment identified by IP address.", "Equipo identificado por IP.", "Équipement identifié par adresse IP.", "Gerät über IP-Adresse identifiziert.", "Apparecchiatura identificata tramite IP."),
  "Falha ao detectar o equipamento pelo IP.": steelL("Failed to detect equipment by IP address.", "Error al detectar el equipo por IP.", "Échec de la détection de l'équipement par adresse IP.", "Gerät konnte über die IP-Adresse nicht erkannt werden.", "Rilevamento dell'apparecchiatura tramite IP non riuscito."),
  "Erro ao buscar equipamentos.": steelL("Failed to search for equipment.", "Error al buscar equipos.", "Échec de la recherche des équipements.", "Gerätesuche fehlgeschlagen.", "Errore nella ricerca delle apparecchiature."),
  "Falha no provisionamento.": steelL("Provisioning failed.", "Error de aprovisionamiento.", "Échec du provisionnement.", "Bereitstellung fehlgeschlagen.", "Provisioning non riuscito."),
  "Erro:": steelL("Error:", "Error:", "Erreur :", "Fehler:", "Errore:"),
  "Gerar nova chave do equipamento": steelL("Generate new equipment key", "Generar nueva clave del equipo", "Générer une nouvelle clé d'équipement", "Neuen Geräteschlüssel erzeugen", "Genera una nuova chiave apparecchiatura"),
  "O equipamento foi desativado e seu histórico foi preservado.": steelL("The equipment was disabled and its history was preserved.", "El equipo fue desactivado y su historial se conservó.", "L'équipement a été désactivé et son historique a été conservé.", "Das Gerät wurde deaktiviert und sein Verlauf beibehalten.", "L'apparecchiatura è stata disattivata e la cronologia è stata conservata.")
});

// Descoberta e provisionamento: inclui mensagens criadas no navegador e
// respostas textuais enviadas pelo backend/Edge.
Object.assign(STEEL_LITERAL_I18N, {
  "Nenhum equipamento respondeu ainda. Abra o SteelControl Edge para detectar USB/Serial ou use “Procurar novamente” para equipamentos de rede.": steelL("No equipment has responded yet. Open SteelControl Edge to detect USB/Serial devices, or use “Search again” for network equipment.", "Ningún equipo ha respondido todavía. Abra SteelControl Edge para detectar dispositivos USB/Serial o use “Buscar de nuevo” para equipos de red.", "Aucun équipement n'a encore répondu. Ouvrez SteelControl Edge pour détecter les appareils USB/Série ou utilisez « Rechercher à nouveau » pour les équipements réseau.", "Noch kein Gerät hat geantwortet. Öffnen Sie SteelControl Edge, um USB-/Seriell-Geräte zu erkennen, oder verwenden Sie „Erneut suchen“ für Netzwerkgeräte.", "Nessuna apparecchiatura ha ancora risposto. Apri SteelControl Edge per rilevare dispositivi USB/Seriale oppure usa “Cerca di nuovo” per le apparecchiature di rete."),
  "Varredura solicitada. O SteelControl enviou a busca para os broadcasts locais detectados; aguarde alguns segundos pelas respostas.": steelL("Scan requested. SteelControl sent the search to the detected local broadcast addresses; wait a few seconds for responses.", "Escaneo solicitado. SteelControl envió la búsqueda a las direcciones de broadcast locales detectadas; espere unos segundos por las respuestas.", "Analyse demandée. SteelControl a envoyé la recherche aux adresses de diffusion locales détectées ; attendez quelques secondes les réponses.", "Suche angefordert. SteelControl hat die Anfrage an die erkannten lokalen Broadcast-Adressen gesendet; warten Sie einige Sekunden auf Antworten.", "Scansione richiesta. SteelControl ha inviato la ricerca agli indirizzi broadcast locali rilevati; attendi alcuni secondi per le risposte."),
  "Descoberta local ainda não está disponível neste processo.": steelL("Local discovery is not available in this process yet.", "La detección local aún no está disponible en este proceso.", "La découverte locale n'est pas encore disponible dans ce processus.", "Die lokale Erkennung ist in diesem Prozess noch nicht verfügbar.", "Il rilevamento locale non è ancora disponibile in questo processo."),
  "Não foi possível copiar": steelL("Could not copy", "No se pudo copiar", "Impossible de copier", "Kopieren nicht möglich", "Impossibile copiare"),
  "Abra o SteelControl Edge e clique em Importar do clipboard.": steelL("Open SteelControl Edge and click Import from clipboard.", "Abra SteelControl Edge y haga clic en Importar desde el portapapeles.", "Ouvrez SteelControl Edge et cliquez sur Importer depuis le presse-papiers.", "Öffnen Sie SteelControl Edge und klicken Sie auf Aus Zwischenablage importieren.", "Apri SteelControl Edge e fai clic su Importa dagli appunti."),
  "Copie a Device Key e o ID da máquina manualmente.": steelL("Copy the Device Key and machine ID manually.", "Copie manualmente la Device Key y el ID de la máquina.", "Copiez manuellement la Device Key et l'identifiant de la machine.", "Kopieren Sie Device Key und Maschinen-ID manuell.", "Copia manualmente Device Key e ID macchina."),
  "Chave copiada": steelL("Key copied", "Clave copiada", "Clé copiée", "Schlüssel kopiert", "Chiave copiata"),
  "Cole a chave na configuração do equipamento.": steelL("Paste the key into the equipment configuration.", "Pegue la clave en la configuración del equipo.", "Collez la clé dans la configuration de l'équipement.", "Fügen Sie den Schlüssel in die Gerätekonfiguration ein.", "Incolla la chiave nella configurazione dell'apparecchiatura."),
  "Selecione a chave manualmente.": steelL("Select the key manually.", "Seleccione la clave manualmente.", "Sélectionnez la clé manuellement.", "Wählen Sie den Schlüssel manuell aus.", "Seleziona manualmente la chiave."),
  "Gerar nova chave de acesso": steelL("Generate new access key", "Generar nueva clave de acceso", "Générer une nouvelle clé d'accès", "Neuen Zugangsschlüssel erzeugen", "Genera nuova chiave di accesso"),
  "A chave atual será invalidada imediatamente. O controlador do equipamento precisará usar a nova credencial para continuar enviando telemetria.": steelL("The current key will be invalidated immediately. The equipment controller must use the new credential to continue sending telemetry.", "La clave actual se invalidará inmediatamente. El controlador del equipo deberá usar la nueva credencial para seguir enviando telemetría.", "La clé actuelle sera immédiatement invalidée. Le contrôleur de l'équipement devra utiliser le nouvel identifiant pour continuer à envoyer la télémétrie.", "Der aktuelle Schlüssel wird sofort ungültig. Der Gerätecontroller muss die neue Berechtigung verwenden, um weiterhin Telemetrie zu senden.", "La chiave attuale verrà invalidata immediatamente. Il controller dovrà usare la nuova credenziale per continuare a inviare telemetria."),
  "Não foi possível gerar a nova chave.": steelL("The new key could not be generated.", "No se pudo generar la nueva clave.", "Impossible de générer la nouvelle clé.", "Der neue Schlüssel konnte nicht erzeugt werden.", "Impossibile generare la nuova chiave."),
  "Nova chave gerada": steelL("New key generated", "Nueva clave generada", "Nouvelle clé générée", "Neuer Schlüssel erzeugt", "Nuova chiave generata"),
  "A chave anterior foi invalidada. Copie a nova Device Key para o controlador do equipamento.": steelL("The previous key was invalidated. Copy the new Device Key to the equipment controller.", "La clave anterior fue invalidada. Copie la nueva Device Key al controlador del equipo.", "La clé précédente a été invalidée. Copiez la nouvelle Device Key vers le contrôleur de l'équipement.", "Der vorherige Schlüssel wurde ungültig. Kopieren Sie den neuen Device Key in den Gerätecontroller.", "La chiave precedente è stata invalidata. Copia la nuova Device Key nel controller dell'apparecchiatura."),
  "Não foi possível gerar a chave": steelL("The key could not be generated", "No se pudo generar la clave", "Impossible de générer la clé", "Der Schlüssel konnte nicht erzeugt werden", "Impossibile generare la chiave"),
  "Ocorreu um erro ao gerar a nova credencial.": steelL("An error occurred while generating the new credential.", "Ocurrió un error al generar la nueva credencial.", "Une erreur s'est produite lors de la génération du nouvel identifiant.", "Beim Erzeugen der neuen Berechtigung ist ein Fehler aufgetreten.", "Si è verificato un errore durante la generazione della nuova credenziale."),
  "Erro ao renovar a chave.": steelL("Failed to renew the key.", "Error al renovar la clave.", "Échec du renouvellement de la clé.", "Schlüsselerneuerung fehlgeschlagen.", "Errore nel rinnovo della chiave."),
  "Ainda não recebido": steelL("Not received yet", "Aún no recibido", "Pas encore reçu", "Noch nicht empfangen", "Non ancora ricevuto"),
  "Rede": steelL("Network", "Red", "Réseau", "Netzwerk", "Rete"),
  "Nenhuma interface IPv4 privada detectada": steelL("No private IPv4 interface detected", "No se detectó ninguna interfaz IPv4 privada", "Aucune interface IPv4 privée détectée", "Keine private IPv4-Schnittstelle erkannt", "Nessuna interfaccia IPv4 privata rilevata"),
  "Diagnóstico de rede": steelL("Network diagnostics", "Diagnóstico de red", "Diagnostic réseau", "Netzwerkdiagnose", "Diagnostica di rete"),
  "Nenhum problema de descoberta foi identificado pelo backend.": steelL("The backend identified no discovery issues.", "El backend no identificó problemas de detección.", "Le backend n'a identifié aucun problème de découverte.", "Das Backend hat keine Erkennungsprobleme festgestellt.", "Il backend non ha rilevato problemi di individuazione."),
  "Não foi possível obter o diagnóstico da rede.": steelL("Network diagnostics could not be retrieved.", "No se pudo obtener el diagnóstico de red.", "Impossible d'obtenir le diagnostic réseau.", "Die Netzwerkdiagnose konnte nicht abgerufen werden.", "Impossibile ottenere la diagnostica di rete."),
  "Diagnóstico de descoberta indisponível.": steelL("Discovery diagnostics unavailable.", "Diagnóstico de detección no disponible.", "Diagnostic de découverte indisponible.", "Erkennungsdiagnose nicht verfügbar.", "Diagnostica di rilevamento non disponibile."),
  "Informe o IPv4 do equipamento, por exemplo 192.168.0.87.": steelL("Enter the equipment IPv4 address, for example 192.168.0.87.", "Ingrese el IPv4 del equipo, por ejemplo 192.168.0.87.", "Saisissez l'adresse IPv4 de l'équipement, par exemple 192.168.0.87.", "Geben Sie die IPv4-Adresse des Geräts ein, zum Beispiel 192.168.0.87.", "Inserisci l'indirizzo IPv4 dell'apparecchiatura, ad esempio 192.168.0.87."),
  "Informe uma porta válida entre 1 e 65535.": steelL("Enter a valid port between 1 and 65535.", "Ingrese un puerto válido entre 1 y 65535.", "Saisissez un port valide compris entre 1 et 65535.", "Geben Sie einen gültigen Port zwischen 1 und 65535 ein.", "Inserisci una porta valida tra 1 e 65535."),
  "Já adicionado": steelL("Already added", "Ya agregado", "Déjà ajouté", "Bereits hinzugefügt", "Già aggiunto"),
  "Indisponível": steelL("Unavailable", "No disponible", "Indisponible", "Nicht verfügbar", "Non disponibile"),
  "Adicionar ao SteelControl": steelL("Add to SteelControl", "Agregar a SteelControl", "Ajouter à SteelControl", "Zu SteelControl hinzufügen", "Aggiungi a SteelControl"),
  "Equipamento encontrado": steelL("Equipment found", "Equipo encontrado", "Équipement trouvé", "Gerät gefunden", "Apparecchiatura trovata"),
  "Fabricante não informado": steelL("Manufacturer not provided", "Fabricante no informado", "Fabricant non renseigné", "Hersteller nicht angegeben", "Produttore non indicato"),
  "Modelo não informado": steelL("Model not provided", "Modelo no informado", "Modèle non renseigné", "Modell nicht angegeben", "Modello non indicato"),
  "Procurando equipamentos SteelControl na rede local...": steelL("Searching for SteelControl equipment on the local network...", "Buscando equipos SteelControl en la red local...", "Recherche d'équipements SteelControl sur le réseau local...", "SteelControl-Geräte werden im lokalen Netzwerk gesucht...", "Ricerca di apparecchiature SteelControl nella rete locale..."),
  "Procurando...": steelL("Searching...", "Buscando...", "Recherche...", "Suche...", "Ricerca..."),
  "Erro ao renovar Device Key:": steelL("Failed to renew Device Key:", "Error al renovar la Device Key:", "Échec du renouvellement de la Device Key :", "Device Key konnte nicht erneuert werden:", "Errore nel rinnovo della Device Key:"),
  "Equipamento industrial": steelL("Industrial equipment", "Equipo industrial", "Équipement industriel", "Industrieanlage", "Apparecchiatura industriale"),
  "Nenhuma descrição cadastrada.": steelL("No description registered.", "No hay ninguna descripción registrada.", "Aucune description enregistrée.", "Keine Beschreibung hinterlegt.", "Nessuna descrizione registrata."),
  "Configurar quando integrar o equipamento": steelL("Configure when integrating the equipment", "Configurar al integrar el equipo", "Configurer lors de l'intégration de l'équipement", "Bei der Geräteintegration konfigurieren", "Configura durante l'integrazione dell'apparecchiatura"),
  "Editar equipamento e conexão": steelL("Edit equipment and connection", "Editar equipo y conexión", "Modifier l'équipement et la connexion", "Gerät und Verbindung bearbeiten", "Modifica apparecchiatura e connessione"),
  "A descoberta está desativada no backend. Verifique DISCOVERY_ENABLED.": steelL("Discovery is disabled in the backend. Check DISCOVERY_ENABLED.", "La detección está desactivada en el backend. Verifique DISCOVERY_ENABLED.", "La découverte est désactivée dans le backend. Vérifiez DISCOVERY_ENABLED.", "Die Erkennung ist im Backend deaktiviert. Prüfen Sie DISCOVERY_ENABLED.", "Il rilevamento è disattivato nel backend. Verifica DISCOVERY_ENABLED."),
  "O listener UDP ainda não está pronto. Reinicie o backend e confira se a porta de descoberta está disponível.": steelL("The UDP listener is not ready yet. Restart the backend and check that the discovery port is available.", "El listener UDP aún no está listo. Reinicie el backend y verifique que el puerto de detección esté disponible.", "L'écouteur UDP n'est pas encore prêt. Redémarrez le backend et vérifiez que le port de découverte est disponible.", "Der UDP-Listener ist noch nicht bereit. Starten Sie das Backend neu und prüfen Sie den Erkennungsport.", "Il listener UDP non è ancora pronto. Riavvia il backend e verifica che la porta di rilevamento sia disponibile."),
  "O backend não encontrou uma interface IPv4 privada ativa. Confirme Wi-Fi/Ethernet e evite executar apenas em loopback.": steelL("The backend found no active private IPv4 interface. Check Wi-Fi/Ethernet and avoid running only on loopback.", "El backend no encontró una interfaz IPv4 privada activa. Verifique Wi-Fi/Ethernet y evite ejecutar solo en loopback.", "Le backend n'a trouvé aucune interface IPv4 privée active. Vérifiez le Wi-Fi/Ethernet et évitez une exécution uniquement en loopback.", "Das Backend hat keine aktive private IPv4-Schnittstelle gefunden. Prüfen Sie WLAN/Ethernet und vermeiden Sie reinen Loopback-Betrieb.", "Il backend non ha trovato un'interfaccia IPv4 privata attiva. Verifica Wi-Fi/Ethernet ed evita l'esecuzione solo su loopback."),
  "Nenhum dispositivo SteelControl respondeu à última busca. Possíveis causas: firewall UDP, isolamento de clientes Wi-Fi, VLAN/sub-rede diferente ou firmware sem descoberta habilitada.": steelL("No SteelControl device responded to the last search. Possible causes: UDP firewall, Wi-Fi client isolation, a different VLAN/subnet, or firmware without discovery enabled.", "Ningún dispositivo SteelControl respondió a la última búsqueda. Posibles causas: firewall UDP, aislamiento de clientes Wi-Fi, VLAN/subred diferente o firmware sin detección habilitada.", "Aucun appareil SteelControl n'a répondu à la dernière recherche. Causes possibles : pare-feu UDP, isolation des clients Wi-Fi, VLAN/sous-réseau différent ou découverte désactivée dans le firmware.", "Kein SteelControl-Gerät hat auf die letzte Suche geantwortet. Mögliche Ursachen: UDP-Firewall, WLAN-Client-Isolation, anderes VLAN/Subnetz oder Firmware ohne aktivierte Erkennung.", "Nessun dispositivo SteelControl ha risposto all'ultima ricerca. Possibili cause: firewall UDP, isolamento client Wi-Fi, VLAN/sottorete diversa o firmware senza rilevamento abilitato."),
  "Há várias interfaces de rede ativas. VPN, adaptador virtual ou Docker podem fazer o broadcast sair pela rede errada; o SteelControl tenta todos os broadcasts locais detectados.": steelL("Several network interfaces are active. A VPN, virtual adapter or Docker may send the broadcast through the wrong network; SteelControl tries every detected local broadcast address.", "Hay varias interfaces de red activas. Una VPN, un adaptador virtual o Docker pueden enviar el broadcast por la red equivocada; SteelControl prueba todas las direcciones de broadcast locales detectadas.", "Plusieurs interfaces réseau sont actives. Un VPN, un adaptateur virtuel ou Docker peut envoyer la diffusion sur le mauvais réseau ; SteelControl essaie toutes les adresses de diffusion locales détectées.", "Mehrere Netzwerkschnittstellen sind aktiv. VPN, virtueller Adapter oder Docker können den Broadcast über das falsche Netzwerk senden; SteelControl versucht alle erkannten lokalen Broadcast-Adressen.", "Sono attive più interfacce di rete. VPN, adattatore virtuale o Docker possono inviare il broadcast sulla rete errata; SteelControl prova tutti gli indirizzi broadcast locali rilevati.")
});



/* =========================================================
   AJUSTES FINAIS - AÇÕES DE EQUIPAMENTO
========================================================= */

const TRADUCOES_ACOES_EQUIPAMENTO = {
  pt: {
    remover: "Remover",
    removerEquipamento: "Remover equipamento",
    somenteAdminRemoverEquipamento: "Somente administradores podem remover equipamentos.",
    confirmarRemoverEquipamento: "Remover equipamento",
    removerEquipamentoAviso: "Esta ação também remove os dados vinculados à máquina.",
    erroRemoverEquipamento: "Não foi possível remover o equipamento.",
    salvarAlteracoes: "Salvar alterações",
    editandoEquipamento: "Editando"
  },
  en: {
    remover: "Remove",
    removerEquipamento: "Remove equipment",
    somenteAdminRemoverEquipamento: "Only administrators can remove equipment.",
    confirmarRemoverEquipamento: "Remove equipment",
    removerEquipamentoAviso: "This action also removes data linked to the machine.",
    erroRemoverEquipamento: "The equipment could not be removed.",
    salvarAlteracoes: "Save changes",
    editandoEquipamento: "Editing"
  },
  es: {
    remover: "Eliminar",
    removerEquipamento: "Eliminar equipo",
    somenteAdminRemoverEquipamento: "Solo los administradores pueden eliminar equipos.",
    confirmarRemoverEquipamento: "Eliminar equipo",
    removerEquipamentoAviso: "Esta acción también elimina los datos vinculados a la máquina.",
    erroRemoverEquipamento: "No se pudo eliminar el equipo.",
    salvarAlteracoes: "Guardar cambios",
    editandoEquipamento: "Editando"
  },
  fr: {
    remover: "Supprimer",
    removerEquipamento: "Supprimer l'équipement",
    somenteAdminRemoverEquipamento: "Seuls les administrateurs peuvent supprimer des équipements.",
    confirmarRemoverEquipamento: "Supprimer l'équipement",
    removerEquipamentoAviso: "Cette action supprime également les données liées à la machine.",
    erroRemoverEquipamento: "Impossible de supprimer l'équipement.",
    salvarAlteracoes: "Enregistrer les modifications",
    editandoEquipamento: "Modification de"
  },
  de: {
    remover: "Entfernen",
    removerEquipamento: "Gerät entfernen",
    somenteAdminRemoverEquipamento: "Nur Administratoren können Geräte entfernen.",
    confirmarRemoverEquipamento: "Gerät entfernen",
    removerEquipamentoAviso: "Dabei werden auch die mit der Maschine verknüpften Daten entfernt.",
    erroRemoverEquipamento: "Das Gerät konnte nicht entfernt werden.",
    salvarAlteracoes: "Änderungen speichern",
    editandoEquipamento: "Bearbeitung von"
  },
  it: {
    remover: "Rimuovi",
    removerEquipamento: "Rimuovi attrezzatura",
    somenteAdminRemoverEquipamento: "Solo gli amministratori possono rimuovere le attrezzature.",
    confirmarRemoverEquipamento: "Rimuovi attrezzatura",
    removerEquipamentoAviso: "Questa azione rimuove anche i dati collegati alla macchina.",
    erroRemoverEquipamento: "Impossibile rimuovere l'attrezzatura.",
    salvarAlteracoes: "Salva modifiche",
    editandoEquipamento: "Modifica di"
  }
};

Object.entries(
  TRADUCOES_ACOES_EQUIPAMENTO
).forEach(
  ([idioma, tabela]) => {
    Object.assign(
      traducoes[idioma],
      tabela
    );
  }
);


// Textos emitidos em tempo de execução pelos painéis industriais. Eles ficam
// aqui (antes da criação dos mapas reversos) para que uma troca de idioma
// também alcance valores inseridos depois do carregamento da página.
Object.assign(STEEL_LITERAL_I18N, {
  "Célula robótica": steelL("Robotic cell", "Celda robótica", "Cellule robotique", "Roboterzelle", "Cella robotica"),
  "PAINEL CÉLULA ROBÓTICA": steelL("ROBOTIC CELL DASHBOARD", "PANEL DE CELDA ROBÓTICA", "TABLEAU DE CELLULE ROBOTIQUE", "ROBOTERZELLEN-DASHBOARD", "DASHBOARD CELLA ROBOTICA"),
  "CONTROLADOR ROBÓTICO": steelL("ROBOT CONTROLLER", "CONTROLADOR ROBÓTICO", "CONTRÔLEUR ROBOTIQUE", "ROBOTERSTEUERUNG", "CONTROLLER ROBOTICO"),
  "Eixos, ferramenta, ciclos, modo de operação e informações de segurança da célula robótica.": steelL("Axes, tooling, cycles, operating mode and robotic-cell safety information.", "Ejes, herramienta, ciclos, modo de operación e información de seguridad de la celda robótica.", "Axes, outil, cycles, mode de fonctionnement et informations de sécurité de la cellule robotique.", "Achsen, Werkzeug, Zyklen, Betriebsmodus und Sicherheitsinformationen der Roboterzelle.", "Assi, utensile, cicli, modalità operativa e informazioni di sicurezza della cella robotica."),
  "Operação da célula robótica": steelL("Robotic cell operation", "Operación de la celda robótica", "Fonctionnement de la cellule robotique", "Betrieb der Roboterzelle", "Funzionamento della cella robotica"),
  "Operações concluídas:": steelL("Completed operations:", "Operaciones completadas:", "Opérations terminées :", "Abgeschlossene Vorgänge:", "Operazioni completate:"),
  "Ciclos robóticos:": steelL("Robotic cycles:", "Ciclos robóticos:", "Cycles robotiques :", "Roboterzyklen:", "Cicli robotici:"),
  "Ciclos robóticos": steelL("Robotic cycles", "Ciclos robóticos", "Cycles robotiques", "Roboterzyklen", "Cicli robotici"),
  "Quantidade de eixos": steelL("Number of axes", "Cantidad de ejes", "Nombre d'axes", "Anzahl der Achsen", "Numero di assi"),
  "Aguardando o controlador": steelL("Waiting for the controller", "Esperando al controlador", "En attente du contrôleur", "Warten auf die Steuerung", "In attesa del controller"),
  "Dado recebido/configurado": steelL("Data received/configured", "Dato recibido/configurado", "Donnée reçue/configurée", "Daten empfangen/konfiguriert", "Dato ricevuto/configurato"),
  "Controlador conectado": steelL("Controller connected", "Controlador conectado", "Contrôleur connecté", "Steuerung verbunden", "Controller connesso"),
  "Simulação ativa": steelL("Simulation active", "Simulación activa", "Simulation active", "Simulation aktiv", "Simulazione attiva"),
  "Simulação local": steelL("Local simulation", "Simulación local", "Simulation locale", "Lokale Simulation", "Simulazione locale"),
  "Proprietário": steelL("Proprietary", "Propietario", "Propriétaire", "Proprietär", "Proprietario"),
  "Sem leitura": steelL("No reading", "Sin lectura", "Aucune lecture", "Keine Messung", "Nessuna lettura"),
  "Não configurada": steelL("Not configured", "No configurada", "Non configurée", "Nicht konfiguriert", "Non configurata"),
  "Origem da leitura": steelL("Reading source", "Origen de la lectura", "Source de la lecture", "Datenquelle", "Origine della lettura"),
  "Comandos pendentes": steelL("Pending commands", "Comandos pendientes", "Commandes en attente", "Ausstehende Befehle", "Comandi in attesa"),
  "Disponível": steelL("Available", "Disponible", "Disponible", "Verfügbar", "Disponibile"),
  "SIMULADOR": steelL("SIMULATOR", "SIMULADOR", "SIMULATEUR", "SIMULATOR", "SIMULATORE"),
  "Aguardando conexão real": steelL("Waiting for a real connection", "Esperando una conexión real", "En attente d'une connexion réelle", "Warten auf eine reale Verbindung", "In attesa di una connessione reale"),
  "AGUARDANDO CONEXÃO REAL": steelL("WAITING FOR A REAL CONNECTION", "ESPERANDO UNA CONEXIÓN REAL", "EN ATTENTE D'UNE CONNEXION RÉELLE", "WARTEN AUF EINE REALE VERBINDUNG", "IN ATTESA DI UNA CONNESSIONE REALE"),
  "AGUARDANDO CONEXÃO": steelL("WAITING FOR CONNECTION", "ESPERANDO CONEXIÓN", "EN ATTENTE DE CONNEXION", "WARTEN AUF VERBINDUNG", "IN ATTESA DI CONNESSIONE"),
  "BLOQUEADA": steelL("BLOCKED", "BLOQUEADA", "BLOQUÉE", "GESPERRT", "BLOCCATA"),
  "EM CICLO": steelL("IN CYCLE", "EN CICLO", "EN CYCLE", "IM ZYKLUS", "IN CICLO"),
  "PARADA": steelL("STOPPED", "DETENIDA", "ARRÊTÉE", "GESTOPPT", "ARRESTATA"),
  "OPERANDO": steelL("RUNNING", "OPERANDO", "EN FONCTIONNEMENT", "IN BETRIEB", "IN FUNZIONE"),
  "AGUARDANDO": steelL("WAITING", "ESPERANDO", "EN ATTENTE", "WARTEND", "IN ATTESA"),
  "Processo bloqueado": steelL("Process blocked", "Proceso bloqueado", "Processus bloqué", "Prozess gesperrt", "Processo bloccato"),
  "Processo em operação": steelL("Process running", "Proceso en operación", "Processus en fonctionnement", "Prozess läuft", "Processo in funzione"),
  "Aguardando conexão real. Todos os comandos permanecem bloqueados até chegar telemetria recente.": steelL("Waiting for a real connection. All commands remain blocked until recent telemetry arrives.", "Esperando una conexión real. Todos los comandos permanecen bloqueados hasta recibir telemetría reciente.", "En attente d'une connexion réelle. Toutes les commandes restent bloquées jusqu'à réception d'une télémétrie récente.", "Warten auf eine reale Verbindung. Alle Befehle bleiben gesperrt, bis aktuelle Telemetrie eintrifft.", "In attesa di una connessione reale. Tutti i comandi restano bloccati finché non arriva telemetria recente."),
  "Controle remoto real desativado no cadastro desta máquina.": steelL("Real remote control is disabled in this machine's settings.", "El control remoto real está desactivado en la configuración de esta máquina.", "Le contrôle à distance réel est désactivé dans la configuration de cette machine.", "Die reale Fernsteuerung ist in den Einstellungen dieser Maschine deaktiviert.", "Il controllo remoto reale è disattivato nelle impostazioni di questa macchina."),
  "START bloqueado por condição de segurança. RESET não libera a parada de segurança.": steelL("START is blocked by a safety condition. RESET does not release the safety stop.", "START está bloqueado por una condición de seguridad. RESET no libera la parada de seguridad.", "START est bloqué par une condition de sécurité. RESET ne libère pas l'arrêt de sécurité.", "START ist durch eine Sicherheitsbedingung gesperrt. RESET hebt den Sicherheitsstopp nicht auf.", "START è bloccato da una condizione di sicurezza. RESET non rilascia l'arresto di sicurezza."),
  "Aguardando confirmação dos intertravamentos físicos.": steelL("Waiting for confirmation of the physical interlocks.", "Esperando la confirmación de los enclavamientos físicos.", "En attente de la confirmation des interverrouillages physiques.", "Warten auf die Bestätigung der physischen Verriegelungen.", "In attesa della conferma degli interblocchi fisici."),
  "IHM em simulação funcional. Os comandos alteram o processo demonstrado.": steelL("HMI in functional simulation. Commands change the demonstrated process.", "HMI en simulación funcional. Los comandos cambian el proceso mostrado.", "IHM en simulation fonctionnelle. Les commandes modifient le processus présenté.", "HMI in funktionaler Simulation. Befehle ändern den dargestellten Prozess.", "HMI in simulazione funzionale. I comandi modificano il processo mostrato."),
  "IHM real habilitada. Comandos passam pela fila autenticada com ACK e prazo de validade.": steelL("Real HMI enabled. Commands pass through the authenticated queue with ACK and an expiration time.", "HMI real habilitada. Los comandos pasan por la cola autenticada con ACK y vencimiento.", "IHM réelle activée. Les commandes passent par la file authentifiée avec ACK et délai d'expiration.", "Reale HMI aktiviert. Befehle laufen über die authentifizierte Warteschlange mit ACK und Ablaufzeit.", "HMI reale abilitata. I comandi passano dalla coda autenticata con ACK e scadenza."),
  "Sem detalhes adicionais": steelL("No additional details", "Sin detalles adicionales", "Aucun détail supplémentaire", "Keine weiteren Details", "Nessun dettaglio aggiuntivo"),
  "Nenhum evento encontrado.": steelL("No events found.", "No se encontraron eventos.", "Aucun événement trouvé.", "Keine Ereignisse gefunden.", "Nessun evento trovato."),
  "Detalhes técnicos": steelL("Technical details", "Detalles técnicos", "Détails techniques", "Technische Details", "Dettagli tecnici"),
  "executou uma ação no sistema": steelL("performed an action in the system", "realizó una acción en el sistema", "a effectué une action dans le système", "hat eine Aktion im System ausgeführt", "ha eseguito un'azione nel sistema"),
  "Sistema": steelL("System", "Sistema", "Système", "System", "Sistema")
});

Object.assign(STEEL_LITERAL_I18N, {
  "Leituras, conectividade e atividade enviadas pelo dispositivo selecionado.": steelL("Readings, connectivity and activity sent by the selected device.", "Lecturas, conectividad y actividad enviadas por el dispositivo seleccionado.", "Mesures, connectivité et activité envoyées par l'appareil sélectionné.", "Messwerte, Konnektivität und Aktivität des ausgewählten Geräts.", "Letture, connettività e attività inviate dal dispositivo selezionato."),
  "Processos contabilizados:": steelL("Processes counted:", "Procesos contabilizados:", "Processus comptabilisés :", "Erfasste Prozesse:", "Processi conteggiati:"),
  "Ciclos informados:": steelL("Reported cycles:", "Ciclos informados:", "Cycles déclarés :", "Gemeldete Zyklen:", "Cicli segnalati:"),
  "Sensores": steelL("Sensors", "Sensores", "Capteurs", "Sensoren", "Sensori"),
  "Atividade do ESP32": steelL("ESP32 activity", "Actividad del ESP32", "Activité de l'ESP32", "ESP32-Aktivität", "Attività ESP32"),
  "Operação do braço robótico": steelL("Robotic arm operation", "Operación del brazo robótico", "Fonctionnement du bras robotique", "Betrieb des Roboterarms", "Funzionamento del braccio robotico"),
  "Ciclos, manipulações e atividade operacional do Dobot selecionado.": steelL("Cycles, handling and operational activity of the selected Dobot.", "Ciclos, manipulaciones y actividad operativa del Dobot seleccionado.", "Cycles, manipulations et activité opérationnelle du Dobot sélectionné.", "Zyklen, Handhabungen und Betriebsaktivität des ausgewählten Dobot.", "Cicli, movimentazioni e attività operativa del Dobot selezionato."),
  "Ciclos do braço:": steelL("Arm cycles:", "Ciclos del brazo:", "Cycles du bras :", "Armzyklen:", "Cicli del braccio:"),
  "Movimentos": steelL("Movements", "Movimientos", "Mouvements", "Bewegungen", "Movimenti"),
  "Ferramenta": steelL("Tool", "Herramienta", "Outil", "Werkzeug", "Utensile"),
  "Tempo": steelL("Time", "Tiempo", "Temps", "Zeit", "Tempo"),
  "Comunicação": steelL("Communication", "Comunicación", "Communication", "Kommunikation", "Comunicazione"),
  "Tópico MQTT": steelL("MQTT topic", "Tema MQTT", "Sujet MQTT", "MQTT-Thema", "Topic MQTT"),
  "Efetuador": steelL("End effector", "Efector", "Effecteur", "Endeffektor", "Effettore"),
  "Fila segura": steelL("Secure queue", "Cola segura", "File sécurisée", "Sichere Warteschlange", "Coda sicura"),
  "Operações do Dobot": steelL("Dobot operations", "Operaciones del Dobot", "Opérations Dobot", "Dobot-Vorgänge", "Operazioni Dobot"),
  "Unidades produzidas:": steelL("Units produced:", "Unidades producidas:", "Unités produites :", "Produzierte Einheiten:", "Unità prodotte:"),
  "Ciclos do processo:": steelL("Process cycles:", "Ciclos del proceso:", "Cycles du processus :", "Prozesszyklen:", "Cicli di processo:"),
  "Processo": steelL("Process", "Proceso", "Processus", "Prozess", "Processo"),
  "Registradores": steelL("Registers", "Registros", "Registres", "Register", "Registri"),
  "Peças produzidas:": steelL("Parts produced:", "Piezas producidas:", "Pièces produites :", "Produzierte Teile:", "Pezzi prodotti:"),
  "Ciclos de usinagem:": steelL("Machining cycles:", "Ciclos de mecanizado:", "Cycles d'usinage :", "Bearbeitungszyklen:", "Cicli di lavorazione:"),
  "Rotação do spindle": steelL("Spindle speed", "Velocidad del husillo", "Vitesse de broche", "Spindeldrehzahl", "Velocità del mandrino"),
  "Avanço": steelL("Feed", "Avance", "Avance", "Vorschub", "Avanzamento"),
  "Programa": steelL("Program", "Programa", "Programme", "Programm", "Programma"),
  "Peças usinadas": steelL("Machined parts", "Piezas mecanizadas", "Pièces usinées", "Bearbeitete Teile", "Pezzi lavorati"),
  "Temperaturas, progresso, camadas e estado da impressora 3D selecionada.": steelL("Temperatures, progress, layers and status of the selected 3D printer.", "Temperaturas, progreso, capas y estado de la impresora 3D seleccionada.", "Températures, progression, couches et état de l'imprimante 3D sélectionnée.", "Temperaturen, Fortschritt, Schichten und Status des ausgewählten 3D-Druckers.", "Temperature, avanzamento, strati e stato della stampante 3D selezionata."),
  "Impressões concluídas:": steelL("Completed prints:", "Impresiones completadas:", "Impressions terminées :", "Abgeschlossene Drucke:", "Stampe completate:"),
  "Trabalhos/ciclos:": steelL("Jobs/cycles:", "Trabajos/ciclos:", "Travaux/cycles :", "Aufträge/Zyklen:", "Lavori/cicli:"),
  "Progresso": steelL("Progress", "Progreso", "Progression", "Fortschritt", "Avanzamento"),
  "Temperaturas": steelL("Temperatures", "Temperaturas", "Températures", "Temperaturen", "Temperature"),
  "Camadas": steelL("Layers", "Capas", "Couches", "Schichten", "Strati"),
  "Progresso da impressão": steelL("Print progress", "Progreso de impresión", "Progression de l'impression", "Druckfortschritt", "Avanzamento di stampa"),
  "Operação do gateway industrial": steelL("Industrial gateway operation", "Operación del gateway industrial", "Fonctionnement de la passerelle industrielle", "Betrieb des Industrie-Gateways", "Funzionamento del gateway industriale"),
  "Mensagens/processos:": steelL("Messages/processes:", "Mensajes/procesos:", "Messages/processus :", "Nachrichten/Prozesse:", "Messaggi/processi:"),
  "Ciclos de comunicação:": steelL("Communication cycles:", "Ciclos de comunicación:", "Cycles de communication :", "Kommunikationszyklen:", "Cicli di comunicazione:"),
  "Dispositivos online": steelL("Online devices", "Dispositivos en línea", "Appareils en ligne", "Online-Geräte", "Dispositivi online"),
  "Dispositivos": steelL("Devices", "Dispositivos", "Appareils", "Geräte", "Dispositivi"),
  "Tráfego": steelL("Traffic", "Tráfico", "Trafic", "Datenverkehr", "Traffico"),
  "Atividade do gateway": steelL("Gateway activity", "Actividad del gateway", "Activité de la passerelle", "Gateway-Aktivität", "Attività del gateway"),
  "Controlador genérico": steelL("Generic controller", "Controlador genérico", "Contrôleur générique", "Generische Steuerung", "Controller generico"),
  "Total produzido:": steelL("Total produced:", "Total producido:", "Total produit :", "Gesamtproduktion:", "Totale prodotto:"),
  "Ciclos executados:": steelL("Cycles completed:", "Ciclos ejecutados:", "Cycles exécutés :", "Ausgeführte Zyklen:", "Cicli eseguiti:"),
  "Telemetria": steelL("Telemetry", "Telemetría", "Télémétrie", "Telemetrie", "Telemetria"),
  "Alertas": steelL("Alerts", "Alertas", "Alertes", "Alarme", "Avvisi"),
  "Processo industrial, entradas e saídas, registradores, ciclo de varredura e alarmes do CLP.": steelL("Industrial process, inputs and outputs, registers, scan cycle and PLC alarms.", "Proceso industrial, entradas y salidas, registros, ciclo de escaneo y alarmas del PLC.", "Processus industriel, entrées et sorties, registres, cycle de balayage et alarmes de l'automate.", "Industrieprozess, Ein- und Ausgänge, Register, Scanzyklus und SPS-Alarme.", "Processo industriale, ingressi e uscite, registri, ciclo di scansione e allarmi PLC."),
  "Entradas digitais": steelL("Digital inputs", "Entradas digitales", "Entrées numériques", "Digitale Eingänge", "Ingressi digitali"),
  "Saídas digitais": steelL("Digital outputs", "Salidas digitales", "Sorties numériques", "Digitale Ausgänge", "Uscite digitali"),
  "Entradas ativas": steelL("Active inputs", "Entradas activas", "Entrées actives", "Aktive Eingänge", "Ingressi attivi"),
  "Spindle, avanço, ferramenta, programa, peças produzidas e desempenho do ciclo de usinagem.": steelL("Spindle, feed, tooling, program, produced parts and machining-cycle performance.", "Husillo, avance, herramienta, programa, piezas producidas y rendimiento del ciclo de mecanizado.", "Broche, avance, outil, programme, pièces produites et performance du cycle d'usinage.", "Spindel, Vorschub, Werkzeug, Programm, produzierte Teile und Leistung des Bearbeitungszyklus.", "Mandrino, avanzamento, utensile, programma, pezzi prodotti e prestazioni del ciclo di lavorazione."),
  "Programa CNC": steelL("CNC program", "Programa CNC", "Programme CNC", "CNC-Programm", "Programma CNC"),
  "IHM dedicada de produção aditiva para FDM/FFF, resina, SLS e outras tecnologias.": steelL("Dedicated additive-manufacturing HMI for FDM/FFF, resin, SLS and other technologies.", "HMI dedicada de fabricación aditiva para FDM/FFF, resina, SLS y otras tecnologías.", "IHM dédiée à la fabrication additive FDM/FFF, résine, SLS et autres technologies.", "Spezielle HMI für additive Fertigung mit FDM/FFF, Harz, SLS und weiteren Technologien.", "HMI dedicata alla produzione additiva FDM/FFF, resina, SLS e altre tecnologie."),
  "Bico / mesa / câmara": steelL("Nozzle / bed / chamber", "Boquilla / cama / cámara", "Buse / plateau / chambre", "Düse / Bett / Kammer", "Ugello / piano / camera"),
  "Monitoramento remoto": steelL("Remote monitoring", "Monitoreo remoto", "Surveillance à distance", "Fernüberwachung", "Monitoraggio remoto"),
  "Dispositivos conectados, protocolos, tráfego, latência e integridade do gateway de integração.": steelL("Connected devices, protocols, traffic, latency and integration-gateway integrity.", "Dispositivos conectados, protocolos, tráfico, latencia e integridad del gateway de integración.", "Appareils connectés, protocoles, trafic, latence et intégrité de la passerelle d'intégration.", "Verbundene Geräte, Protokolle, Datenverkehr, Latenz und Integrität des Integrations-Gateways.", "Dispositivi connessi, protocolli, traffico, latenza e integrità del gateway di integrazione."),
  "Integridade": steelL("Integrity", "Integridad", "Intégrité", "Integrität", "Integrità"),
  "Mensagens/min": steelL("Messages/min", "Mensajes/min", "Messages/min", "Nachrichten/min", "Messaggi/min"),
  "Telemetria e comunicação configuráveis para equipamentos que utilizam controladores proprietários.": steelL("Configurable telemetry and communication for equipment that uses proprietary controllers.", "Telemetría y comunicación configurables para equipos que utilizan controladores propietarios.", "Télémétrie et communication configurables pour les équipements utilisant des contrôleurs propriétaires.", "Konfigurierbare Telemetrie und Kommunikation für Geräte mit proprietären Steuerungen.", "Telemetria e comunicazione configurabili per apparecchiature con controller proprietari."),
  "Bloqueado": steelL("Blocked", "Bloqueado", "Bloqué", "Gesperrt", "Bloccato"),
  "Liberado": steelL("Released", "Liberado", "Libéré", "Freigegeben", "Abilitato"),
  "Acionado / aberto": steelL("Triggered / open", "Accionado / abierto", "Déclenché / ouvert", "Ausgelöst / offen", "Attivato / aperto"),
  "Fechada": steelL("Closed", "Cerrada", "Fermée", "Geschlossen", "Chiusa"),
  "Aberta": steelL("Open", "Abierta", "Ouverte", "Offen", "Aperta")
});


// =========================================================
// TRADUÇÃO AUTOMÁTICA DOS TEXTOS ESTÁTICOS
// =========================================================

const CHAVE_POR_TEXTO_PT = new Map(
  Object.entries(traducoes.pt)
    .filter(([, valor]) => typeof valor === "string" && valor.trim())
    .map(([chave, valor]) => [valor.replace(/\s+/g, " ").trim(), chave])
);

// Mapa reverso global: reconhece o texto independentemente do idioma
// que estava aplicado antes. Isso evita páginas "meio inglês / meio português"
// quando o usuário troca EN -> FR -> ES, por exemplo.
const CHAVE_POR_TEXTO_GLOBAL = new Map();

Object.values(traducoes).forEach(tabela => {
  Object.entries(tabela).forEach(([chave, valor]) => {
    if (typeof valor !== "string" || !valor.trim()) {
      return;
    }

    CHAVE_POR_TEXTO_GLOBAL.set(
      valor.replace(/\s+/g, " ").trim(),
      chave
    );
  });
});

function traduzirTextosEstaticos(root = document.body) {
  if (!root) return;

  const idioma = pegarIdiomaAtual();

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT
  );

  const nodes = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach(node => {
    const parent = node.parentElement;

    if (!parent) return;

    if (
      ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(
        parent.tagName
      )
    ) {
      return;
    }

    const atual =
      String(node.nodeValue || "")
        .replace(/\s+/g, " ")
        .trim();

    if (!atual) return;

    // Guarda uma chave ou o texto-base uma única vez.
    // Assim trocar EN -> FR -> DE nunca depende do idioma anterior.
    let chave = node.__steelI18nKey;
    let literalBase = node.__steelLiteralBase;
    let padraoBase = node.__steelPatternBase;

    if (!chave && !literalBase && !padraoBase) {
      chave =
        CHAVE_POR_TEXTO_GLOBAL.get(atual) ||
        CHAVE_POR_TEXTO_PT.get(atual);

      if (chave) {
        node.__steelI18nKey = chave;
      } else if (STEEL_LITERAL_I18N[atual]) {
        literalBase = atual;
        node.__steelLiteralBase = atual;
      } else {
        // Talvez o DOM tenha sido criado já traduzido por outro idioma.
        for (const [base, tabela] of Object.entries(STEEL_LITERAL_I18N)) {
          if (
            base === atual ||
            Object.values(tabela).includes(atual)
          ) {
            literalBase = base;
            node.__steelLiteralBase = base;
            break;
          }
        }
      }
    }

    let traduzido = null;

    if (chave) {
      traduzido = pegarTexto(chave);
    } else if (literalBase) {
      traduzido =
        idioma === "pt"
          ? literalBase
          : (
              STEEL_LITERAL_I18N[literalBase]?.[idioma] ||
              STEEL_LITERAL_I18N[literalBase]?.en ||
              literalBase
            );
    }

    if (traduzido == null) {
      const origemLivre =
        padraoBase ||
        atual;
      const traducaoLivre =
        traduzirTextoLivre(origemLivre);

      if (traducaoLivre !== atual) {
        traduzido = traducaoLivre;

        if (!padraoBase) {
          node.__steelPatternBase =
            origemLivre;
          padraoBase =
            origemLivre;
        }
      }
    }

    if (traduzido == null) return;

    const original = node.nodeValue || "";
    const prefixo = original.match(/^\s*/)?.[0] || "";
    const sufixo = original.match(/\s*$/)?.[0] || "";

    const novoValor =
      `${prefixo}${traduzido}${sufixo}`;

    // Evita um ciclo infinito do MutationObserver. Escrever o mesmo
    // nodeValue também gera uma mutação em alguns navegadores; como o
    // observador acompanha characterData, a página podia ficar presa
    // traduzindo o mesmo texto sem parar e parecer "carregando".
    if (node.nodeValue !== novoValor) {
      node.nodeValue = novoValor;
    }
  });

  root
    .querySelectorAll("[placeholder], [title], [aria-label]")
    .forEach(elemento => {
      ["placeholder", "title", "aria-label"]
        .forEach(atributo => {
          const atual =
            String(
              elemento.getAttribute(atributo) || ""
            )
              .replace(/\s+/g, " ")
              .trim();

          if (!atual) return;

          const cacheKey =
            `steelI18nOriginal_${atributo}`;

          let original =
            elemento.dataset?.[cacheKey];

          if (!original) {
            // tenta descobrir a forma portuguesa/base por qualquer idioma
            const key =
              CHAVE_POR_TEXTO_GLOBAL.get(atual) ||
              CHAVE_POR_TEXTO_PT.get(atual);

            if (key) {
              elemento.setAttribute(
                atributo,
                pegarTexto(key)
              );
              return;
            }

            let baseEncontrado = null;

            if (STEEL_LITERAL_I18N[atual]) {
              baseEncontrado = atual;
            } else {
              for (const [base, tabela] of Object.entries(STEEL_LITERAL_I18N)) {
                if (Object.values(tabela).includes(atual)) {
                  baseEncontrado = base;
                  break;
                }
              }
            }

            if (!baseEncontrado) return;

            original = baseEncontrado;
            elemento.setAttribute(
              `data-steel-i18n-original-${atributo}`,
              original
            );
          }

          const base =
            elemento.getAttribute(
              `data-steel-i18n-original-${atributo}`
            ) || original;

          if (!base) return;

          const traduzido =
            idioma === "pt"
              ? base
              : (
                  STEEL_LITERAL_I18N[base]?.[idioma] ||
                  STEEL_LITERAL_I18N[base]?.en ||
                  base
                );

          elemento.setAttribute(
            atributo,
            traduzido
          );
        });
    });
}


// =========================================================
// SELETOR GLOBAL DE IDIOMA
// =========================================================

function criarSeletorGlobalIdioma() {
  if (document.getElementById("steelLanguageSwitcher")) {
    return;
  }

  // A tela de login já possui seletor próprio.
  if (document.querySelector(".language-box")) {
    return;
  }

  const container = document.createElement("div");
  container.id = "steelLanguageSwitcher";
  container.className = "steel-language-switcher";
  container.setAttribute("aria-label", "Language");

  container.innerHTML = `
    <span class="steel-language-icon" aria-hidden="true"><i class="fa-solid fa-globe"></i></span>
    <strong id="steelLanguageCurrent" class="steel-language-current" aria-hidden="true">PT</strong>
    <span class="steel-language-chevron" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
    <select id="steelLanguageSelect" aria-label="Language">
      <option value="pt">PT</option>
      <option value="en">EN</option>
      <option value="es">ES</option>
      <option value="fr">FR</option>
      <option value="de">DE</option>
      <option value="it">IT</option>
    </select>
  `;

  // Na Home, integra o seletor ao cabeçalho para manter a interface limpa.
  const homeHeaderActions = document.querySelector(".home-page .header-actions");
  const homeLoginButton = homeHeaderActions?.querySelector(".login-btn");
  const homeNavigation = document.querySelector(".home-page .nav-in");
  const homeNavigationLogin = homeNavigation?.querySelector('a[href="/app/login"]');

  if (homeHeaderActions && homeLoginButton) {
    homeHeaderActions.insertBefore(container, homeLoginButton);
  } else if (homeNavigation && homeNavigationLogin) {
    homeNavigation.insertBefore(container, homeNavigationLogin);
  } else {
    document.body.appendChild(container);
  }

  const select = container.querySelector("#steelLanguageSelect");
  const current = container.querySelector("#steelLanguageCurrent");

  select.value = pegarIdiomaAtual();
  current.textContent = pegarIdiomaAtual().toUpperCase();

  select.addEventListener("change", () => {
    trocarIdioma(select.value);
  });
}

function atualizarSeletorGlobalIdioma() {
  const select = document.getElementById("steelLanguageSelect");
  const current = document.getElementById("steelLanguageCurrent");
  const idioma = pegarIdiomaAtual();

  if (select) {
    select.value = idioma;
    select.setAttribute(
      "aria-label",
      `${pegarTexto("idioma")}: ${idioma.toUpperCase()}`
    );
  }

  if (current) {
    current.textContent = idioma.toUpperCase();
  }
}


// =========================================================
// IDIOMA ATUAL
// =========================================================

function pegarIdiomaAtual() {

  const idiomaSalvo =
    localStorage.getItem(
      "idiomaSistema"
    );


  if (
    IDIOMAS_SUPORTADOS.includes(
      idiomaSalvo
    )
  ) {

    return idiomaSalvo;

  }


  return "pt";
}


// =========================================================
// PEGAR TEXTO
// =========================================================

function pegarTexto(
  chave,
  parametros = {}
) {

  const idioma =
    pegarIdiomaAtual();


  const tabela =
    traducoes[idioma] ||
    traducoes.pt;


  let texto =
    tabela[chave];


  /*
    Se a tradução do idioma selecionado ainda estiver herdando
    exatamente o português, preferimos a versão inglesa.
    Assim nunca aparece português misturado no meio de EN/ES/FR/DE/IT.
  */
  if (
    idioma !== "pt" &&
    texto !== undefined &&
    traducoes.pt[chave] !== undefined &&
    texto === traducoes.pt[chave] &&
    traducoes.en[chave] !== undefined &&
    traducoes.en[chave] !== traducoes.pt[chave]
  ) {
    texto = traducoes.en[chave];
  }


  /*
    Se faltar uma chave em outro idioma,
    usamos inglês antes de português.
  */

  if (
    texto === undefined &&
    idioma !== "pt"
  ) {

    texto =
      traducoes.en[chave];
  }


  if (
    texto === undefined
  ) {

    texto =
      traducoes.pt[chave];
  }


  if (
    texto === undefined
  ) {

    console.warn(
      `[SteelControl i18n] Tradução não encontrada: ${chave}`
    );


    return chave;
  }


  texto =
    String(texto);


  Object.entries(
    parametros
  )
    .forEach(
      ([nome, valor]) => {

        texto =
          texto.replaceAll(
            `{${nome}}`,
            String(valor)
          );

      }
    );


  return texto;
}


// =========================================================
// ALIAS
// =========================================================

function t(
  chave,
  parametros = {}
) {

  return pegarTexto(
    chave,
    parametros
  );
}


function traduzirParteLivre(
  valor,
  idioma
) {
  const texto =
    String(valor || "")
      .replace(/\s+/g, " ")
      .trim();

  const chave =
    CHAVE_POR_TEXTO_GLOBAL.get(texto) ||
    CHAVE_POR_TEXTO_PT.get(texto);

  if (chave) {
    return pegarTexto(chave);
  }

  let base =
    STEEL_LITERAL_I18N[texto]
      ? texto
      : null;

  if (!base) {
    const comparacao =
      texto.toLocaleLowerCase("pt-BR");

    for (const [textoBase, tabela] of Object.entries(STEEL_LITERAL_I18N)) {
      if (
        textoBase.toLocaleLowerCase("pt-BR") === comparacao ||
        Object.values(tabela).some(
          traducao =>
            String(traducao)
              .toLocaleLowerCase("pt-BR") ===
            comparacao
        )
      ) {
        base = textoBase;
        break;
      }
    }
  }

  if (!base || idioma === "pt") {
    return texto;
  }

  return (
    STEEL_LITERAL_I18N[base]?.[idioma] ||
    STEEL_LITERAL_I18N[base]?.en ||
    texto
  );
}


// Frases que carregam nomes, números ou códigos não podem ser resolvidas por
// igualdade exata. Estes padrões mantêm o conteúdo variável e traduzem a
// estrutura ao redor dele.
function traduzirPadraoLivre(
  valor,
  idioma
) {
  if (idioma === "pt") {
    return null;
  }

  const escolher = tabela =>
    tabela[idioma] ||
    tabela.en;

  const parte = texto =>
    traduzirParteLivre(
      texto,
      idioma
    );

  let encontrado =
    valor.match(
      /^Manutenção\s+—\s+(.+)$/
    );

  if (!encontrado) {
    const painel =
      valor.match(
        /^PAINEL\s+(.+)$/
      );

    if (painel) {
      const nome =
        parte(painel[1])
          .toLocaleUpperCase(idioma);
      const prefixo = escolher({
        en: "DASHBOARD",
        es: "PANEL",
        fr: "TABLEAU",
        de: "DASHBOARD",
        it: "DASHBOARD"
      });

      return `${prefixo} ${nome}`;
    }
  }

  if (encontrado) {
    const prefixo = escolher({
      en: "Maintenance",
      es: "Mantenimiento",
      fr: "Maintenance",
      de: "Wartung",
      it: "Manutenzione"
    });

    return `${prefixo} — ${encontrado[1]}`;
  }

  encontrado = valor.match(
    /^No ciclo\s+(\d+)$/
  );

  if (encontrado) {
    return escolher({
      en: `At cycle ${encontrado[1]}`,
      es: `En el ciclo ${encontrado[1]}`,
      fr: `Au cycle ${encontrado[1]}`,
      de: `Bei Zyklus ${encontrado[1]}`,
      it: `Al ciclo ${encontrado[1]}`
    });
  }

  encontrado = valor.match(
    /^Módulos operacionais compatíveis com (.+)\. Dados ausentes permanecem identificados como não configurados\.$/
  );

  if (encontrado) {
    const nome = parte(encontrado[1]);

    return escolher({
      en: `Operational modules compatible with ${nome}. Missing data remains identified as not configured.`,
      es: `Módulos operativos compatibles con ${nome}. Los datos ausentes permanecen identificados como no configurados.`,
      fr: `Modules opérationnels compatibles avec ${nome}. Les données absentes restent indiquées comme non configurées.`,
      de: `Mit ${nome} kompatible Betriebsmodule. Fehlende Daten bleiben als nicht konfiguriert gekennzeichnet.`,
      it: `Moduli operativi compatibili con ${nome}. I dati mancanti restano indicati come non configurati.`
    });
  }

  encontrado = valor.match(
    /^Plano preventivo, intervenções e histórico técnico exclusivos do (.+)\.$/
  );

  if (encontrado) {
    const nome = parte(encontrado[1]);

    return escolher({
      en: `Preventive plan, interventions and technical history exclusively for ${nome}.`,
      es: `Plan preventivo, intervenciones e historial técnico exclusivos de ${nome}.`,
      fr: `Plan préventif, interventions et historique technique exclusivement pour ${nome}.`,
      de: `Präventivplan, Eingriffe und technischer Verlauf ausschließlich für ${nome}.`,
      it: `Piano preventivo, interventi e storico tecnico esclusivi per ${nome}.`
    });
  }

  encontrado = valor.match(
    /^Eventos do (.+) vinculados somente à máquina selecionada\.$/
  );

  if (encontrado) {
    const nome = parte(encontrado[1]);

    return escolher({
      en: `${nome} events linked only to the selected machine.`,
      es: `Eventos de ${nome} vinculados únicamente a la máquina seleccionada.`,
      fr: `Événements de ${nome} liés uniquement à la machine sélectionnée.`,
      de: `${nome}-Ereignisse, die nur mit der ausgewählten Maschine verknüpft sind.`,
      it: `Eventi di ${nome} collegati solo alla macchina selezionata.`
    });
  }

  encontrado = valor.match(
    /^(.+) afetou o registro #(\d+)\.$/
  );

  if (encontrado) {
    return escolher({
      en: `${encontrado[1]} affected record #${encontrado[2]}.`,
      es: `${encontrado[1]} modificó el registro #${encontrado[2]}.`,
      fr: `${encontrado[1]} a modifié l'enregistrement #${encontrado[2]}.`,
      de: `${encontrado[1]} hat Datensatz #${encontrado[2]} geändert.`,
      it: `${encontrado[1]} ha modificato il record #${encontrado[2]}.`
    });
  }

  encontrado = valor.match(
    /^afetou o registro #(\d+)\s*\.$/
  );

  if (encontrado) {
    return escolher({
      en: `affected record #${encontrado[1]}.`,
      es: `modificó el registro #${encontrado[1]}.`,
      fr: `a modifié l'enregistrement #${encontrado[1]}.`,
      de: `hat Datensatz #${encontrado[1]} geändert.`,
      it: `ha modificato il record #${encontrado[1]}.`
    });
  }

  encontrado = valor.match(
    /^(.+) executou uma ação no sistema\.$/
  );

  if (encontrado) {
    return escolher({
      en: `${encontrado[1]} performed an action in the system.`,
      es: `${encontrado[1]} realizó una acción en el sistema.`,
      fr: `${encontrado[1]} a effectué une action dans le système.`,
      de: `${encontrado[1]} hat eine Aktion im System ausgeführt.`,
      it: `${encontrado[1]} ha eseguito un'azione nel sistema.`
    });
  }

  encontrado = valor.match(
    /^Equipamento confirmou comando ([A-Z0-9_]+): (FALHOU|CONCLUÍDO)\.$/
  );

  if (encontrado) {
    const sucesso =
      encontrado[2] === "CONCLUÍDO";

    return escolher({
      en: `Equipment confirmed command ${encontrado[1]}: ${sucesso ? "COMPLETED" : "FAILED"}.`,
      es: `El equipo confirmó el comando ${encontrado[1]}: ${sucesso ? "COMPLETADO" : "FALLÓ"}.`,
      fr: `L'équipement a confirmé la commande ${encontrado[1]} : ${sucesso ? "TERMINÉE" : "ÉCHEC"}.`,
      de: `Das Gerät bestätigte den Befehl ${encontrado[1]}: ${sucesso ? "ABGESCHLOSSEN" : "FEHLGESCHLAGEN"}.`,
      it: `L'apparecchiatura ha confermato il comando ${encontrado[1]}: ${sucesso ? "COMPLETATO" : "NON RIUSCITO"}.`
    });
  }

  encontrado = valor.match(
    /^Comando ([A-Z0-9_]+) solicitado por (.+)\.$/
  );

  if (encontrado) {
    return escolher({
      en: `Command ${encontrado[1]} requested by ${encontrado[2]}.`,
      es: `Comando ${encontrado[1]} solicitado por ${encontrado[2]}.`,
      fr: `Commande ${encontrado[1]} demandée par ${encontrado[2]}.`,
      de: `Befehl ${encontrado[1]} angefordert von ${encontrado[2]}.`,
      it: `Comando ${encontrado[1]} richiesto da ${encontrado[2]}.`
    });
  }

  const tokensAuditoria = {
    en: { REMOVER_LOGO: "REMOVE LOGO", ALTERAR_LOGO: "CHANGE LOGO", ATUALIZAR: "UPDATE", CRIAR: "CREATE", EMPRESA: "COMPANY", MAQUINA: "MACHINE", USUARIO: "USER", MANUTENCAO: "MAINTENANCE", SISTEMA: "SYSTEM" },
    es: { REMOVER_LOGO: "ELIMINAR LOGO", ALTERAR_LOGO: "CAMBIAR LOGO", ATUALIZAR: "ACTUALIZAR", CRIAR: "CREAR", EMPRESA: "EMPRESA", MAQUINA: "MÁQUINA", USUARIO: "USUARIO", MANUTENCAO: "MANTENIMIENTO", SISTEMA: "SISTEMA" },
    fr: { REMOVER_LOGO: "SUPPRIMER LE LOGO", ALTERAR_LOGO: "MODIFIER LE LOGO", ATUALIZAR: "METTRE À JOUR", CRIAR: "CRÉER", EMPRESA: "ENTREPRISE", MAQUINA: "MACHINE", USUARIO: "UTILISATEUR", MANUTENCAO: "MAINTENANCE", SISTEMA: "SYSTÈME" },
    de: { REMOVER_LOGO: "LOGO ENTFERNEN", ALTERAR_LOGO: "LOGO ÄNDERN", ATUALIZAR: "AKTUALISIEREN", CRIAR: "ERSTELLEN", EMPRESA: "UNTERNEHMEN", MAQUINA: "MASCHINE", USUARIO: "BENUTZER", MANUTENCAO: "WARTUNG", SISTEMA: "SYSTEM" },
    it: { REMOVER_LOGO: "RIMUOVI LOGO", ALTERAR_LOGO: "MODIFICA LOGO", ATUALIZAR: "AGGIORNA", CRIAR: "CREA", EMPRESA: "AZIENDA", MAQUINA: "MACCHINA", USUARIO: "UTENTE", MANUTENCAO: "MANUTENZIONE", SISTEMA: "SISTEMA" }
  };

  if (/^[A-Z_]+(?:\s*·\s*[A-Z_]+)+$/.test(valor)) {
    const tabela =
      tokensAuditoria[idioma] ||
      tokensAuditoria.en;
    const tokens =
      valor.split(/\s*·\s*/);
    const traduzidos =
      tokens.map(token => tabela[token] || token);

    if (traduzidos.some((token, indice) => token !== tokens[indice])) {
      return traduzidos.join(" · ");
    }
  }

  return null;
}


// Traduz mensagens vindas de APIs ou criadas dinamicamente quando elas
// correspondem a um texto conhecido pelo dicionário global.
function traduzirTextoLivre(texto) {
  const valor =
    String(texto ?? "")
      .replace(/\s+/g, " ")
      .trim();

  if (!valor) return "";

  const chave =
    CHAVE_POR_TEXTO_GLOBAL.get(valor) ||
    CHAVE_POR_TEXTO_PT.get(valor);

  if (chave) {
    return pegarTexto(chave);
  }

  let base =
    STEEL_LITERAL_I18N[valor]
      ? valor
      : null;

  if (!base) {
    for (const [textoBase, tabela] of Object.entries(STEEL_LITERAL_I18N)) {
      if (Object.values(tabela).includes(valor)) {
        base = textoBase;
        break;
      }
    }
  }

  const idioma = pegarIdiomaAtual();

  if (!base) {
    return (
      traduzirPadraoLivre(
        valor,
        idioma
      ) ||
      valor
    );
  }

  return idioma === "pt"
    ? base
    : (
        STEEL_LITERAL_I18N[base]?.[idioma] ||
        STEEL_LITERAL_I18N[base]?.en ||
        base
      );
}


// =========================================================
// TRADUZIR ELEMENTO
// =========================================================

function traduzirElemento(
  elemento
) {

  if (
    !elemento ||
    elemento.nodeType !== 1
  ) {

    return;
  }


  // =======================================================
  // TEXTO
  // =======================================================

  const chave =
    elemento.getAttribute(
      "data-i18n"
    );


  if (
    chave
  ) {

    elemento.innerHTML =
      pegarTexto(
        chave
      );
  }


  // =======================================================
  // PLACEHOLDER
  // =======================================================

  const placeholder =
    elemento.getAttribute(
      "data-i18n-placeholder"
    ) ||
    elemento.getAttribute(
      "data-placeholder"
    );


  if (
    placeholder
  ) {

    elemento.setAttribute(
      "placeholder",
      pegarTexto(
        placeholder
      )
    );
  }


  // =======================================================
  // TITLE
  // =======================================================

  const title =
    elemento.getAttribute(
      "data-i18n-title"
    );


  if (
    title
  ) {

    elemento.setAttribute(
      "title",
      pegarTexto(
        title
      )
    );
  }


  // =======================================================
  // ARIA LABEL
  // =======================================================

  const aria =
    elemento.getAttribute(
      "data-i18n-aria"
    );


  if (
    aria
  ) {

    elemento.setAttribute(
      "aria-label",
      pegarTexto(
        aria
      )
    );
  }


  // =======================================================
  // VALUE
  // =======================================================

  const value =
    elemento.getAttribute(
      "data-i18n-value"
    );


  if (
    value
  ) {

    elemento.value =
      pegarTexto(
        value
      );
  }
}


// =========================================================
// APLICAR IDIOMA
// =========================================================

function aplicarIdioma() {

  const idioma =
    pegarIdiomaAtual();


  document.documentElement.lang =
    idioma;


  document
    .querySelectorAll(
      `
        [data-i18n],
        [data-i18n-placeholder],
        [data-placeholder],
        [data-i18n-title],
        [data-i18n-aria],
        [data-i18n-value]
      `
    )
    .forEach(
      traduzirElemento
    );


  // =======================================================
  // BOTÃO DE IDIOMA
  // =======================================================

  const idiomaAtual =
    document.getElementById(
      "idiomaAtual"
    );


  if (
    idiomaAtual
  ) {

    idiomaAtual.textContent =
      idioma.toUpperCase();
  }


  // =======================================================
  // SELECT CONFIGURAÇÕES
  // =======================================================

  const idiomaConfig =
    document.getElementById(
      "idiomaConfig"
    );


  if (
    idiomaConfig
  ) {

    idiomaConfig.value =
      idioma;
  }


  // =======================================================
  // TITLE DA PÁGINA
  // =======================================================

  const chaveTitulo =
    document.body
      ?.getAttribute(
        "data-i18n-page-title"
      );


  if (
    chaveTitulo
  ) {

    document.title =
      pegarTexto(
        chaveTitulo
      );
  }


  // =======================================================
  // META DESCRIPTION
  // =======================================================

  const meta =
    document.querySelector(
      'meta[name="description"][data-i18n-content]'
    );


  if (
    meta
  ) {

    const chaveMeta =
      meta.getAttribute(
        "data-i18n-content"
      );


    meta.setAttribute(
      "content",
      pegarTexto(
        chaveMeta
      )
    );
  }


  traduzirTextosEstaticos(document.body);

  atualizarSeletorGlobalIdioma();


  window.dispatchEvent(
    new CustomEvent(
      "idiomaAplicado",
      {
        detail: {
          idioma
        }
      }
    )
  );
}


// =========================================================
// TROCAR IDIOMA
// =========================================================

function trocarIdioma(
  idioma
) {

  if (
    !IDIOMAS_SUPORTADOS.includes(
      idioma
    )
  ) {

    return;
  }


  localStorage.setItem(
    "idiomaSistema",
    idioma
  );


  aplicarIdioma();


  const menu =
    document.getElementById(
      "languageMenu"
    );


  menu?.classList.remove(
    "ativo"
  );


  window.dispatchEvent(
    new CustomEvent(
      "idiomaAlterado",
      {
        detail: {
          idioma
        }
      }
    )
  );


  window.dispatchEvent(
    new CustomEvent(
      "configAtualizada",
      {
        detail: {
          idioma
        }
      }
    )
  );
}


// =========================================================
// MENU IDIOMA
// =========================================================

function abrirIdiomas() {

  document
    .getElementById(
      "languageMenu"
    )
    ?.classList.toggle(
      "ativo"
    );
}


// =========================================================
// TEMA
// =========================================================


function aplicarContrasteLogoEmpresa() {
  // A placa e o SVG da marca padrão são estilizados em elementos separados
  // pelo CSS. Não aplicar filtro nem fundo inline aqui: o filtro também afeta
  // o fundo do <img> e transformava a marca em um quadrado sólido.
  const logoSidebar =
    document.getElementById("empresaLogoSidebar");

  if (logoSidebar) {
    logoSidebar.classList.remove("logo-monocromatica-escura");
    logoSidebar.classList.add("default-company-logo");
    logoSidebar.src = "assets/img/steel-icon.svg?v=20261013_THEME_LOGO_3";
    ["filter", "opacity", "background-color", "border-color"]
      .forEach(propriedade =>
        logoSidebar.style.removeProperty(propriedade)
      );
  }

  // A logo institucional fica sobre uma placa clara no conteúdo.
  // Preservar a imagem original evita apagar cores de marcas como SENAI.
  [
    document.getElementById("configEmpresaLogo"),
    document.getElementById("empresaLogo")
  ]
    .filter(Boolean)
    .forEach(img => {
      img.classList.remove("logo-monocromatica-escura");

      if (img.classList.contains("default-company-logo")) {
        img.style.removeProperty("filter");
        img.style.removeProperty("opacity");
        img.style.removeProperty("background-color");
        img.style.removeProperty("border-color");
        return;
      }

      // Logos realmente enviadas pela empresa preservam suas cores.
      img.style.setProperty("filter", "none", "important");
      img.style.setProperty("opacity", "1", "important");
    });
}

function aplicarTemaGlobal() {

  const tema =
    localStorage.getItem(
      "temaSistema"
    ) ||
    "claro";


  document.documentElement.setAttribute(
    "data-theme",
    tema
  );


  document.documentElement.style.colorScheme =
    tema === "escuro"
      ? "dark"
      : "light";

  setTimeout(aplicarContrasteLogoEmpresa, 0);


  const temaConfig =
    document.getElementById(
      "temaConfig"
    );


  if (
    temaConfig
  ) {

    temaConfig.value =
      tema;
  }
}


// =========================================================
// TROCAR TEMA
// =========================================================

function trocarTema(
  tema
) {

  if (
    ![
      "claro",
      "escuro"
    ].includes(
      tema
    )
  ) {

    return;
  }


  localStorage.setItem(
    "temaSistema",
    tema
  );


  aplicarTemaGlobal();


  window.dispatchEvent(
    new CustomEvent(
      "configAtualizada",
      {
        detail: {
          tema
        }
      }
    )
  );
}


// =========================================================
// SELECTS
// =========================================================

document.addEventListener(
  "change",
  event => {

    if (
      event.target?.id ===
      "idiomaConfig"
    ) {

      trocarIdioma(
        event.target.value
      );
    }


    if (
      event.target?.id ===
      "temaConfig"
    ) {

      trocarTema(
        event.target.value
      );
    }

  }
);


// =========================================================
// FECHAR MENU DE IDIOMA
// =========================================================

document.addEventListener(
  "click",
  event => {

    const box =
      document.querySelector(
        ".language-box"
      );


    const menu =
      document.getElementById(
        "languageMenu"
      );


    if (
      box &&
      menu &&
      !box.contains(
        event.target
      )
    ) {

      menu.classList.remove(
        "ativo"
      );
    }

  }
);


// =========================================================
// OBSERVADOR
//
// Traduz elementos adicionados depois pelo JavaScript.
// Exemplo: cards de máquinas e funcionários.
// =========================================================

const observadorIdioma =
  new MutationObserver(
    mutacoes => {

      mutacoes.forEach(
        mutacao => {

          if (mutacao.type === "characterData") {
            const parent = mutacao.target?.parentElement;
            if (parent) {
              traduzirTextosEstaticos(parent);
            }
            return;
          }

          mutacao.addedNodes.forEach(
            node => {

              // textContent substitui o texto antigo por um novo Text node e
              // gera uma mutação childList (não characterData). Sem tratar
              // esse caso, títulos e valores atualizados pelos runtimes do
              // dashboard permaneciam em português.
              if (
                node.nodeType ===
                Node.TEXT_NODE
              ) {
                const parent =
                  node.parentElement ||
                  mutacao.target;

                if (
                  parent?.nodeType === 1
                ) {
                  traduzirTextosEstaticos(
                    parent
                  );
                }

                return;
              }

              if (
                node.nodeType !== 1
              ) {

                return;
              }


              if (
                node.matches?.(
                  `
                    [data-i18n],
                    [data-i18n-placeholder],
                    [data-placeholder],
                    [data-i18n-title],
                    [data-i18n-aria],
                    [data-i18n-value]
                  `
                )
              ) {

                traduzirElemento(
                  node
                );
              }


              node
                .querySelectorAll?.(
                  `
                    [data-i18n],
                    [data-i18n-placeholder],
                    [data-placeholder],
                    [data-i18n-title],
                    [data-i18n-aria],
                    [data-i18n-value]
                  `
                )
                .forEach(
                  traduzirElemento
                );

              traduzirTextosEstaticos(node);

            }
          );

        }
      );

    }
  );


// =========================================================
// ALTERAÇÃO EM OUTRA ABA
// =========================================================

window.addEventListener(
  "storage",
  event => {

    if (
      event.key ===
      "idiomaSistema"
    ) {

      aplicarIdioma();
    }


    if (
      event.key ===
      "temaSistema"
    ) {

      aplicarTemaGlobal();
    }

  }
);


// =========================================================
// VOLTAR PARA PÁGINA PELO NAVEGADOR
// =========================================================

window.addEventListener(
  "pageshow",
  () => {

    criarSeletorGlobalIdioma();

    aplicarTemaGlobal();

    aplicarIdioma();

  }
);


// =========================================================
// INICIALIZAÇÃO
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    criarSeletorGlobalIdioma();

    aplicarTemaGlobal();

    aplicarIdioma();


    if (
      document.body
    ) {

      observadorIdioma.observe(
        document.body,
        {
          childList: true,
          characterData: true,
          subtree: true
        }
      );
    }

  }
);

// =========================================================
// STEELCONTROL UI — DOM seguro (sem interpolar conteúdo em innerHTML)
// =========================================================

function scElemento(tag, { classe = "", texto = "", atributos = {} } = {}) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined && texto !== null) el.textContent = String(texto);
  Object.entries(atributos).forEach(([nome, valor]) => {
    if (valor !== undefined && valor !== null) el.setAttribute(nome, String(valor));
  });
  return el;
}

function scIcone(nome) {
  const i = scElemento("i", { classe: `fa-solid ${nome}` });
  i.setAttribute("aria-hidden", "true");
  return i;
}

window.SteelUI = {
  toast({ titulo = "SteelControl", mensagem = "", tipo = "info", duracao = 4200 } = {}) {
    let regiao = document.querySelector(".sc-toast-region");
    if (!regiao) {
      regiao = scElemento("div", {
        classe: "sc-toast-region",
        atributos: { "aria-live": "polite", "aria-atomic": "false" }
      });
      document.body.appendChild(regiao);
    }

    const icones = {
      success: "fa-circle-check",
      error: "fa-circle-xmark",
      warning: "fa-triangle-exclamation",
      info: "fa-circle-info"
    };

    const toast = scElemento("div", { classe: `sc-toast ${tipo}` });
    const iconWrap = scElemento("span", { classe: "sc-toast-icon" });
    iconWrap.appendChild(scIcone(icones[tipo] || icones.info));

    const copy = scElemento("div");
    copy.appendChild(scElemento("strong", { texto: titulo }));
    copy.appendChild(scElemento("p", { texto: mensagem }));

    const fechar = scElemento("button", {
      classe: "sc-toast-close",
      atributos: { type: "button", "aria-label": "Fechar" }
    });
    fechar.appendChild(scIcone("fa-xmark"));

    toast.append(iconWrap, copy, fechar);
    const remover = () => toast.remove();
    fechar.addEventListener("click", remover);
    regiao.appendChild(toast);
    setTimeout(remover, Math.max(800, Number(duracao) || 4200));
  },

  confirm({
    titulo = "Confirmar ação",
    mensagem = "Deseja continuar?",
    confirmar = "Confirmar",
    cancelar = "Cancelar",
    perigoso = true
  } = {}) {
    return new Promise(resolve => {
      const fundo = scElemento("div", { classe: "sc-confirm-backdrop" });
      const card = scElemento("div", {
        classe: `sc-confirm-card ${perigoso ? "is-danger" : "is-info"}`,
        atributos: { role: "dialog", "aria-modal": "true", "aria-labelledby": "sc-confirm-title" }
      });

      const iconWrap = scElemento("div", { classe: "sc-confirm-icon" });
      iconWrap.appendChild(scIcone(perigoso ? "fa-triangle-exclamation" : "fa-circle-info"));

      const h3 = scElemento("h3", { texto: titulo, atributos: { id: "sc-confirm-title" } });
      const p = scElemento("p", { texto: mensagem });
      // Preserva quebras de linha do texto, sem interpretar HTML.
      p.style.whiteSpace = "pre-line";

      const actions = scElemento("div", { classe: "sc-confirm-actions" });
      const cancelarBtn = scElemento("button", {
        classe: "sc-confirm-cancel",
        texto: cancelar,
        atributos: { type: "button" }
      });
      const confirmarBtn = scElemento("button", {
        classe: "sc-confirm-ok",
        texto: confirmar,
        atributos: { type: "button", "data-confirmar": "true" }
      });
      actions.append(cancelarBtn, confirmarBtn);
      card.append(iconWrap, h3, p, actions);
      fundo.appendChild(card);

      let finalizado = false;
      const finalizar = valor => {
        if (finalizado) return;
        finalizado = true;
        fundo.remove();
        document.removeEventListener("keydown", teclaEscape);
        resolve(valor);
      };
      const teclaEscape = event => {
        if (event.key === "Escape") finalizar(false);
      };

      cancelarBtn.addEventListener("click", () => finalizar(false));
      confirmarBtn.addEventListener("click", () => finalizar(true));
      fundo.addEventListener("click", event => {
        if (event.target === fundo) finalizar(false);
      });
      document.addEventListener("keydown", teclaEscape);
      document.body.appendChild(fundo);
      setTimeout(() => confirmarBtn.focus(), 0);
    });
  }
};

// Confirmação global de encerramento de sessão. Mantém o mesmo diálogo
// profissional em todas as telas e respeita idioma e tema ativos.
window.confirmarSaidaDaConta = async function confirmarSaidaDaConta() {
  if (!window.SteelUI?.confirm) return false;

  return window.SteelUI.confirm({
    titulo: t("confirmarSaidaTitulo"),
    mensagem: t("confirmarSaidaMensagem"),
    confirmar: t("confirmarSaidaAcao"),
    cancelar: t("confirmarSaidaCancelar"),
    perigoso: true
  });
};

window.encerrarSessaoServidor = async function encerrarSessaoServidor() {
  try {
    await fetch(`${window.STEELCONTROL_API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
  } catch (_) {
    // A limpeza local continua mesmo se o servidor estiver indisponível.
  }
};

// =========================================================
// REALTIME DA EMPRESA — DESKTOP / MULTI-DISPOSITIVO
// =========================================================
// Usa o mesmo padrão SSE autenticado já utilizado pelas máquinas, mas em
// escopo de empresa. Alterações feitas no tablet/PC chegam aos outros clientes
// sem F5. O stream é apenas de eventos; os dados continuam vindo das rotas
// autenticadas normais para manter a fonte de verdade no backend.
(() => {
  if (window.__steelCompanyRealtimeStarted) return;

  const autenticadoRealtime = localStorage.getItem("autenticado") === "true";
  const apiRealtime = String(window.STEELCONTROL_API_URL || "").replace(/\/$/, "");

  if (!autenticadoRealtime || !apiRealtime) return;

  window.__steelCompanyRealtimeStarted = true;

  let encerrando = false;
  let controller = null;
  let espera = 1000;

  const pausa = ms => new Promise(resolve => setTimeout(resolve, ms));

  function publicar(evento) {
    if (!evento || !evento.tipo) return;

    window.dispatchEvent(
      new CustomEvent("steelcontrol:empresa-evento", {
        detail: evento
      })
    );

    window.dispatchEvent(
      new CustomEvent(`steelcontrol:${evento.tipo}`, {
        detail: evento
      })
    );
  }

  async function conectar() {
    while (!encerrando) {
      try {
        controller = new AbortController();

        const resposta = await fetch(`${apiRealtime}/empresa/stream`, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache"
          },
          cache: "no-store",
          signal: controller.signal
        });

        if (resposta.status === 401) {
          publicar({
            tipo: "sessao.invalida",
            dados: {},
            em: new Date().toISOString()
          });
          return;
        }

        if (!resposta.ok || !resposta.body) {
          throw new Error("Stream da empresa indisponível.");
        }

        espera = 1000;
        const reader = resposta.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!encerrando) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocos = buffer.split("\n\n");
          buffer = blocos.pop() || "";

          for (const bloco of blocos) {
            const linhaData = bloco
              .split("\n")
              .find(linha => linha.startsWith("data:"));

            if (!linhaData) continue;

            try {
              publicar(JSON.parse(linhaData.slice(5).trim()));
            } catch (_) {}
          }
        }
      } catch (erro) {
        if (encerrando || erro?.name === "AbortError") return;
      }

      await pausa(espera);
      espera = Math.min(10000, Math.round(espera * 1.7));
    }
  }

  window.addEventListener("beforeunload", () => {
    encerrando = true;
    controller?.abort();
  });

  conectar();
})();


// =========================================================
// SESSION REVOCATION — MULTI-DISPOSITIVO
// =========================================================
// Mantém Desktop e Mobile coerentes: quando a conta é desativada ou a senha
// revoga a versão do token, o backend encerra o stream e a UI limpa a sessão.
(() => {
  if (window.__steelSessionRealtimeStarted) return;

  const autenticado = localStorage.getItem("autenticado") === "true";
  const api = String(window.STEELCONTROL_API_URL || "").replace(/\/$/, "");
  if (!autenticado || !api) return;

  window.__steelSessionRealtimeStarted = true;
  let encerrando = false;
  let controller = null;
  let espera = 1000;

  const limparSessao = motivo => {
    [
      "autenticado",
      "token",
      "usuarioId",
      "usuarioLogado",
      "nomeUsuario",
      "cargoUsuario",
      "empresa",
      "maquinaId",
      "maquinaSelecionada",
      "setorSelecionado"
    ].forEach(chave => localStorage.removeItem(chave));

    try {
      sessionStorage.setItem(
        "steelcontrol_session_notice",
        motivo || "Sua sessão foi encerrada. Entre novamente."
      );
    } catch (_) {}

    window.location.replace("/app/login?session=revoked");
  };

  const pausa = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function conectar() {
    while (!encerrando) {
      try {
        controller = new AbortController();
        const resposta = await fetch(`${api}/auth/session-events`, {
          method: "GET",
          headers: {
            Accept: "text/event-stream",
            "Cache-Control": "no-cache"
          },
          cache: "no-store",
          signal: controller.signal
        });

        if (resposta.status === 401) {
          limparSessao("Sua sessão foi revogada. Entre novamente.");
          return;
        }
        if (!resposta.ok || !resposta.body) {
          throw new Error("Stream de sessão indisponível.");
        }

        espera = 1000;
        const reader = resposta.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let eventoAtual = "";

        while (!encerrando) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const blocos = buffer.split("\n\n");
          buffer = blocos.pop() || "";

          for (const bloco of blocos) {
            eventoAtual = "";
            let dados = null;
            for (const linha of bloco.split("\n")) {
              if (linha.startsWith("event:")) eventoAtual = linha.slice(6).trim();
              if (linha.startsWith("data:")) {
                try { dados = JSON.parse(linha.slice(5).trim()); } catch (_) {}
              }
            }

            if (eventoAtual === "revoked") {
              limparSessao(dados?.motivo || "Sua sessão foi encerrada pelo administrador.");
              return;
            }

            if (eventoAtual === "ready" || eventoAtual === "profile") {
              const usuario = dados?.usuario;
              if (usuario && Number(usuario.id) > 0) {
                const cargoAnterior = String(localStorage.getItem("cargoUsuario") || "").toUpperCase();
                const cargoNovo = String(usuario.cargo || "").toUpperCase();

                localStorage.setItem("usuarioId", String(usuario.id));
                localStorage.setItem("nomeUsuario", usuario.nome || "");
                localStorage.setItem("cargoUsuario", usuario.cargo || "");
                localStorage.setItem("cargo", usuario.cargo || "");

                try {
                  const atual = JSON.parse(localStorage.getItem("usuarioLogado") || "{}");
                  localStorage.setItem("usuarioLogado", JSON.stringify({
                    ...atual,
                    id: usuario.id,
                    nome: usuario.nome || atual.nome || "",
                    email: usuario.email || atual.email || "",
                    cargo: usuario.cargo || atual.cargo || ""
                  }));
                } catch (_) {}

                // Se o cargo mudou, recarrega apenas a tela atual. A sessão permanece aberta.
                // Assim menus/botões passam a refletir a nova permissão imediatamente.
                if (eventoAtual === "profile" && cargoNovo && cargoNovo !== cargoAnterior) {
                  window.location.reload();
                  return;
                }
              }
            }
          }
        }
      } catch (erro) {
        if (encerrando || erro?.name === "AbortError") return;
      }

      await pausa(espera);
      espera = Math.min(10000, Math.round(espera * 1.7));
    }
  }

  window.addEventListener("beforeunload", () => {
    encerrando = true;
    controller?.abort();
  });

  conectar();
})();
