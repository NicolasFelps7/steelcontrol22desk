(() => {
  const copy = {
    pt: {
      signIn: "Entrar",
      accessPlatform: "Entrar",
      navSystem: "Sistema",
      navMachines: "Máquinas",
      navBenefits: "Benefícios",
      navHow: "Como funciona",
      navSecurity: "Segurança",
      heroTitle: "Toda a sua fábrica num só painel.",
      heroText: "O SteelControl conecta robôs, CNCs, esteiras, impressoras 3D, CLPs e sensores num só lugar. Acompanhe a produção em tempo real, comande equipamentos com segurança e aja antes da parada.",
      heroNote: "Desktop, mobile e Edge conectados à mesma operação industrial.",
      seeSystem: "Ver o sistema",
      productTitle: "Veja o SteelControl funcionando.",
      productText: "Telas reais do SteelControl para acompanhar máquinas, comandos, produção e segurança. Aqui, um Dobot Magician.",
      machinesTitle: "Um painel que se adapta a cada máquina.",
      machinesText: "Cada equipamento mostra os indicadores que importam para ele, e o que não envia aparece como ‘Não informado’.",
      benefitsTitle: "Menos paradas. Mais controle.",
      howTitle: "Da máquina ao painel, tudo sincronizado.",
      securityTitle: "Controle também é saber quem agiu.",
      securityText: "Do login ao comando do robô, a operação é protegida por identidade, permissão e rastreabilidade.",
      nextTitle: "Entre no SteelControl.",
      nextText: "Acesse sua empresa para monitorar equipamentos, controlar operações e acompanhar os dados da fábrica em uma única plataforma.",
      projectTitle: "Sua operação em um só lugar",
      projectButton: "Entrar"
    },
    en: {
      signIn: "Sign in",
      accessPlatform: "Enter",
      navSystem: "System",
      navMachines: "Machines",
      navBenefits: "Benefits",
      navHow: "How it works",
      navSecurity: "Security",
      heroTitle: "Your entire factory on one dashboard.",
      heroText: "SteelControl connects robots, CNCs, conveyors, 3D printers, PLCs and sensors in one place. Track production in real time, command equipment securely and act before downtime.",
      heroNote: "Desktop, mobile and Edge connected to the same industrial operation.",
      seeSystem: "See the system",
      productTitle: "See SteelControl in action.",
      productText: "Real SteelControl screens for monitoring machines, commands, production and safety. Here, a Dobot Magician.",
      machinesTitle: "A dashboard that adapts to every machine.",
      machinesText: "Each device shows the indicators that matter, while unavailable signals appear as ‘Not reported’.",
      benefitsTitle: "Less downtime. More control.",
      howTitle: "From machine to dashboard, fully synchronized.",
      securityTitle: "Control also means knowing who acted.",
      securityText: "From sign-in to robot commands, operations are protected by identity, permissions and traceability.",
      nextTitle: "Enter SteelControl.",
      nextText: "Access your company to monitor equipment, control operations and track factory data in a single platform.",
      projectTitle: "Your operation in one place",
      projectButton: "Enter"
    }
  };

  const targets = [
    [".nav .btn-s", "signIn"],
    ["#hero .cta-row .btn-p", "signIn"],
    [".links li:nth-child(1) a", "navSystem"],
    [".links li:nth-child(2) a", "navMachines"],
    [".links li:nth-child(3) a", "navBenefits"],
    [".links li:nth-child(4) a", "navHow"],
    [".links li:nth-child(5) a", "navSecurity"],
    ["#hero h1", "heroTitle"],
    ["#hero .lead", "heroText"],
    ["#hero .note", "heroNote"],
    ["#hero .btn-g", "seeSystem"],
    ["#produto h2", "productTitle"],
    ["#produto .sec-lead", "productText"],
    ["#maquinas h2", "machinesTitle"],
    ["#maquinas > .wrap > .sec-lead", "machinesText"],
    ["#valor h2", "benefitsTitle"],
    ["#fluxo h2", "howTitle"],
    ["#seguranca h2", "securityTitle"],
    ["#seguranca .sec-lead", "securityText"],
    ["#acesso h2", "nextTitle"],
    ["#acesso .ask-box > div > p", "nextText"],
    ["#cta-title", "projectTitle"],
    ["#acesso .ask-act .btn", "projectButton"]
  ];

  targets.forEach(([selector, key]) => {
    const element = document.querySelector(selector);
    if (element) element.dataset.landingKey = key;
  });

  function applyLanguage() {
    const selected = (localStorage.getItem("idiomaSistema") || document.documentElement.lang || "pt").slice(0, 2).toLowerCase();
    const language = selected === "pt" ? "pt" : "en";
    const table = copy[language];
    document.documentElement.lang = selected === "pt" ? "pt-BR" : selected;
    document.querySelectorAll("[data-landing-key]").forEach(element => {
      const value = table[element.dataset.landingKey];
      if (value) element.innerHTML = value;
    });
  }

  applyLanguage();
  document.addEventListener("change", event => {
    if (event.target?.id === "steelLanguageSelect") setTimeout(applyLanguage, 0);
  });
  window.addEventListener("storage", event => {
    if (event.key === "idiomaSistema") applyLanguage();
  });
})();
