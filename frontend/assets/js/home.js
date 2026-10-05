const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupNavigation() {
  const button = document.getElementById("mobileBtn");
  const menu = document.getElementById("navMenu");
  if (!button || !menu) return;
  const close = () => {
    menu.classList.remove("is-open");
    button.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
  };
  button.addEventListener("click", () => {
    const open = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", open);
    button.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
  window.addEventListener("resize", () => { if (window.innerWidth > 860) close(); }, { passive: true });
}

function setupHeader() {
  const header = document.querySelector(".world-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupReveal() {
  const elements = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5%" });
  elements.forEach(element => observer.observe(element));
}

function setupCursorLight() {
  if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
  const light = document.querySelector(".cursor-light");
  if (!light) return;
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;
  window.addEventListener("pointermove", event => {
    tx = event.clientX;
    ty = event.clientY;
    light.classList.add("is-active");
  }, { passive: true });
  const animate = () => {
    x += (tx - x) * 0.1;
    y += (ty - y) * 0.1;
    light.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(animate);
  };
  animate();
}

function setupTiltCards() {
  if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
  document.querySelectorAll("[data-tilt]").forEach(card => {
    card.addEventListener("pointermove", event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty("--rx", `${((0.5 - y) * 2.4).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${((x - 0.5) * 2.4).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    });
  });
}

function setupActiveNavigation() {
  const links = [...document.querySelectorAll(".world-nav a")];
  const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55%", threshold: 0 });
  sections.forEach(section => observer.observe(section));
}

function setupWorldCanvas() {
  const canvas = document.getElementById("worldCanvas");
  const hero = document.querySelector(".world-hero");
  const context = canvas?.getContext("2d");
  if (!canvas || !hero || !context) return;
  const compact = window.matchMedia("(max-width: 760px)").matches;
  const particleCount = compact ? 180 : 420;
  const particles = [];
  const links = [];
  let width = 1;
  let height = 1;
  let dpr = 1;
  let frame = 0;
  let mx = 0;
  let my = 0;
  let targetX = 0;
  let targetY = 0;
  let visible = true;

  for (let index = 0; index < particleCount; index += 1) {
    const offset = 2 / particleCount;
    const y = index * offset - 1 + offset / 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    particles.push({ x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius, size: 0.55 + Math.random() * 1.35, phase: Math.random() * Math.PI * 2 });
  }
  for (let index = 0; index < 42; index += 1) links.push([Math.floor(Math.random() * particleCount), Math.floor(Math.random() * particleCount)]);

  const resize = () => {
    const bounds = hero.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.7);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  hero.addEventListener("pointermove", event => {
    const bounds = hero.getBoundingClientRect();
    targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.85;
    targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.55;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; }, { passive: true });

  const draw = time => {
    if (!visible) return;
    context.clearRect(0, 0, width, height);
    mx += (targetX - mx) * 0.025;
    my += (targetY - my) * 0.025;
    const spin = reduceMotion ? 0.35 : time * 0.000085;
    const centerX = compact ? width * 0.56 : width * 0.73;
    const centerY = compact ? height * 0.34 : height * 0.46;
    const radius = Math.min(width, height) * (compact ? 0.27 : 0.31);
    const cy = Math.cos(spin + mx);
    const sy = Math.sin(spin + mx);
    const cx = Math.cos(my - 0.15);
    const sx = Math.sin(my - 0.15);
    const projected = [];

    particles.forEach((point, index) => {
      const pulse = 1 + Math.sin(time * 0.0013 + point.phase) * 0.022;
      const x1 = point.x * cy - point.z * sy;
      const z1 = point.x * sy + point.z * cy;
      const y1 = point.y * cx - z1 * sx;
      const z2 = point.y * sx + z1 * cx;
      const perspective = 1.55 / (2.08 - z2 * 0.48);
      projected[index] = { x: centerX + x1 * radius * perspective * pulse, y: centerY + y1 * radius * perspective * pulse, z: z2, size: point.size * perspective };
    });

    links.forEach(([a, b], index) => {
      const first = projected[a];
      const second = projected[b];
      if (!first || !second || first.z < -0.2 || second.z < -0.2) return;
      context.beginPath();
      context.strokeStyle = `rgba(255, 132, 0, ${0.045 + (index % 4) * 0.015})`;
      context.lineWidth = 0.7;
      context.moveTo(first.x, first.y);
      context.lineTo(second.x, second.y);
      context.stroke();
    });
    projected.sort((a, b) => a.z - b.z).forEach(point => {
      const depth = (point.z + 1) / 2;
      context.beginPath();
      context.fillStyle = depth > 0.72 ? `rgba(255, 148, 35, ${0.45 + depth * 0.5})` : `rgba(255, 255, 255, ${0.1 + depth * 0.42})`;
      context.shadowBlur = depth > 0.78 ? 11 : 0;
      context.shadowColor = "rgba(255, 119, 0, .8)";
      context.arc(point.x, point.y, Math.max(0.35, point.size * 1.15), 0, Math.PI * 2);
      context.fill();
    });
    context.shadowBlur = 0;
    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
    glow.addColorStop(0, "rgba(255, 105, 0, .12)");
    glow.addColorStop(0.5, "rgba(255, 105, 0, .035)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = glow;
    context.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3);
    if (!reduceMotion) frame = requestAnimationFrame(draw);
  };

  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting !== false;
    if (visible && !reduceMotion) { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); }
  }, { threshold: 0.02 });
  resize();
  draw(0);
  window.addEventListener("resize", resize, { passive: true });
  visibilityObserver.observe(hero);
}

function setupInteractiveRobot() {
  const workcell = document.getElementById("robotWorkcell");
  const consolePanel = workcell?.closest(".hero-console");
  if (!workcell || !consolePanel) return;

  let active = false;
  const setPose = (clientX, clientY) => {
    const bounds = consolePanel.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
    workcell.style.setProperty("--base-turn", `${(-8 + x * 16).toFixed(1)}deg`);
    workcell.style.setProperty("--shoulder-lift", `${(-20 + y * 36).toFixed(1)}deg`);
    workcell.style.setProperty("--elbow-fold", `${(-28 + x * 56).toFixed(1)}deg`);
    workcell.style.setProperty("--target-x", `${(18 + x * 64).toFixed(1)}%`);
    workcell.style.setProperty("--target-y", `${(35 + y * 34).toFixed(1)}%`);
    workcell.classList.add("is-operated");
  };

  consolePanel.addEventListener("pointerdown", event => {
    active = true;
    consolePanel.setPointerCapture?.(event.pointerId);
    setPose(event.clientX, event.clientY);
  });
  consolePanel.addEventListener("pointermove", event => {
    if (event.pointerType === "mouse" || active) setPose(event.clientX, event.clientY);
  }, { passive: true });
  const release = () => { active = false; };
  consolePanel.addEventListener("pointerup", release);
  consolePanel.addEventListener("pointercancel", release);
}

const HOME_I18N = {
  pt: {
    navPlatform:"Plataforma",navResources:"Recursos",navSecurity:"Segurança",navTechnology:"Tecnologia",operational:"Plataforma operacional",signIn:"Entrar",
    heroLabel:"STEELCONTROL / OPERAÇÃO INDUSTRIAL",heroTitle:"Controle que<br><span>move a indústria.</span>",heroText:"Uma plataforma para conectar máquinas, operadores e decisões em tempo real — do chão de fábrica ao painel.",accessPlatform:"Acessar plataforma",explore:"Explorar sistema",
    chapterEdgeTitle:"Da máquina<br><span>ao Edge.</span>",chapterEdgeText:"A camada local recebe sinais, valida limites e mantém o equipamento conectado com baixa latência.",chapterDataTitle:"Dados que<br><span>viram contexto.</span>",chapterDataText:"Produção, alarmes, estados e desempenho organizados em uma leitura operacional clara.",chapterControlTitle:"Decisões em<br><span>tempo real.</span>",chapterControlText:"Desktop e mobile sincronizados para acompanhar, autorizar e agir com rastreabilidade.",
    platformIndex:"01 / COMO FUNCIONA",platformTitle:"Da máquina ao painel.<br><em>Tudo sincronizado.</em>",platformText:"O SteelControl recebe os sinais do equipamento pelo Edge, organiza a telemetria e entrega a mesma informação no desktop e no mobile.",
    machineTitle:"Máquina industrial",machineText:"Dobot, impressora 3D, CNC ou outro equipamento.",edgeTitle:"Steel Edge",edgeText:"Coleta, validação e comando próximo à máquina.",coreTitle:"Núcleo SteelControl",coreText:"Regras, histórico, permissões e inteligência operacional.",experienceTitle:"Desktop e mobile",experienceText:"Os mesmos dados e comandos em todas as telas.",
    resourcesIndex:"02 / MÓDULOS STEELCONTROL",resourcesTitle:"Uma central.<br><em>Toda a operação.</em>",resourcesText:"Os módulos que você já usa no sistema aparecem aqui com a mesma identidade visual e propósito industrial.",dashboardTitle:"Dashboard dinâmico",dashboardText:"OEE, disponibilidade, desempenho e sinais exibidos conforme o perfil real do equipamento.",connectedTitle:"Máquina conectada",connectedText:"Status online, posição, produção e eventos.",identityTitle:"Identidade e permissão",identityText:"Validação biométrica, cargos e permissões por empresa.",decisionTitle:"Do sinal à decisão",decisionText:"Produção, manutenção, alertas e auditoria reunidos em um fluxo contínuo.",controlTitle:"Manual e automático",controlText:"Movimentos assistidos e ciclos ensinados com comandos autenticados.",
    securityIndex:"03 / SEGURANÇA STEELCONTROL",securityTitle:"Controle também é<br><em>saber quem agiu.</em>",securityText:"Do login até o comando do robô, o SteelControl protege a operação com identidade, permissão e rastreabilidade.",identityVerified:"Identidade verificada",identityVerifiedText:"Reconhecimento facial e autenticação segura",commandsAuth:"Comandos autenticados",commandsAuthText:"Controle remoto somente para usuários autorizados",auditTitle:"Auditoria industrial",auditText:"Registro de acessos, alterações e comandos",
    techIndex:"04 / ARQUITETURA STEELCONTROL",techTitle:"Desktop, mobile e Edge.<br><em>Uma única plataforma.</em>",finalTitle:"Sua indústria.<br><em>Seu controle.</em>",finalText:"Monitore, proteja e controle sua operação em um só lugar.",finalButton:"Entrar no SteelControl"
  },
  en: {
    navPlatform:"Platform",navResources:"Capabilities",navSecurity:"Security",navTechnology:"Technology",operational:"Platform operational",signIn:"Sign in",
    heroLabel:"STEELCONTROL / INDUSTRIAL OPERATIONS",heroTitle:"Control that<br><span>moves industry.</span>",heroText:"One platform connecting machines, operators and real-time decisions — from the factory floor to the dashboard.",accessPlatform:"Access platform",explore:"Explore the system",
    chapterEdgeTitle:"From machine<br><span>to the Edge.</span>",chapterEdgeText:"The local layer receives signals, validates limits and keeps equipment connected with low latency.",chapterDataTitle:"Data becomes<br><span>operational context.</span>",chapterDataText:"Production, alarms, states and performance organized into a clear operational view.",chapterControlTitle:"Decisions in<br><span>real time.</span>",chapterControlText:"Synchronized desktop and mobile experiences for monitoring, authorization and traceable action.",
    platformIndex:"01 / HOW IT WORKS",platformTitle:"From machine to dashboard.<br><em>Everything synchronized.</em>",platformText:"SteelControl receives equipment signals through Edge, organizes telemetry and delivers the same information on desktop and mobile.",machineTitle:"Industrial machine",machineText:"Dobot, 3D printer, CNC or other equipment.",edgeTitle:"Steel Edge",edgeText:"Collection, validation and commands close to the machine.",coreTitle:"SteelControl core",coreText:"Rules, history, permissions and operational intelligence.",experienceTitle:"Desktop and mobile",experienceText:"The same data and commands on every screen.",
    resourcesIndex:"02 / STEELCONTROL MODULES",resourcesTitle:"One control center.<br><em>The entire operation.</em>",resourcesText:"The modules used by your operation share one visual language and one industrial purpose.",dashboardTitle:"Dynamic dashboard",dashboardText:"OEE, availability, performance and signals shown according to the machine profile.",connectedTitle:"Connected machine",connectedText:"Online status, position, production and events.",identityTitle:"Identity and permission",identityText:"Biometric validation, roles and company permissions.",decisionTitle:"From signal to decision",decisionText:"Production, maintenance, alerts and audit in one continuous flow.",controlTitle:"Manual and automatic",controlText:"Assisted movements and taught cycles with authenticated commands.",
    securityIndex:"03 / STEELCONTROL SECURITY",securityTitle:"Control also means<br><em>knowing who acted.</em>",securityText:"From sign-in to robot command, SteelControl protects the operation with identity, permission and traceability.",identityVerified:"Verified identity",identityVerifiedText:"Facial recognition and secure authentication",commandsAuth:"Authenticated commands",commandsAuthText:"Remote control for authorized users only",auditTitle:"Industrial audit",auditText:"Access, changes and commands recorded",
    techIndex:"04 / STEELCONTROL ARCHITECTURE",techTitle:"Desktop, mobile and Edge.<br><em>One platform.</em>",finalTitle:"Your industry.<br><em>Your control.</em>",finalText:"Monitor, protect and control your operation in one place.",finalButton:"Enter SteelControl"
  },
  es: {navPlatform:"Plataforma",navResources:"Recursos",navSecurity:"Seguridad",navTechnology:"Tecnología",operational:"Plataforma operativa",signIn:"Entrar",heroLabel:"STEELCONTROL / OPERACIÓN INDUSTRIAL",heroTitle:"Control que<br><span>mueve la industria.</span>",heroText:"Una plataforma que conecta máquinas, operadores y decisiones en tiempo real.",accessPlatform:"Acceder a la plataforma",explore:"Explorar el sistema",chapterEdgeTitle:"De la máquina<br><span>al Edge.</span>",chapterDataTitle:"Datos que se vuelven<br><span>contexto.</span>",chapterControlTitle:"Decisiones en<br><span>tiempo real.</span>",platformIndex:"01 / CÓMO FUNCIONA",resourcesIndex:"02 / MÓDULOS STEELCONTROL",securityIndex:"03 / SEGURIDAD STEELCONTROL",techIndex:"04 / ARQUITECTURA STEELCONTROL",finalTitle:"Tu industria.<br><em>Tu control.</em>",finalText:"Supervisa, protege y controla tu operación en un solo lugar.",finalButton:"Entrar a SteelControl"},
  fr: {navPlatform:"Plateforme",navResources:"Fonctions",navSecurity:"Sécurité",navTechnology:"Technologie",operational:"Plateforme opérationnelle",signIn:"Connexion",heroLabel:"STEELCONTROL / OPÉRATIONS INDUSTRIELLES",heroTitle:"Le contrôle qui<br><span>fait avancer l’industrie.</span>",heroText:"Une plateforme reliant machines, opérateurs et décisions en temps réel.",accessPlatform:"Accéder à la plateforme",explore:"Explorer le système",chapterEdgeTitle:"De la machine<br><span>à l’Edge.</span>",chapterDataTitle:"Des données<br><span>mises en contexte.</span>",chapterControlTitle:"Décisions en<br><span>temps réel.</span>",platformIndex:"01 / FONCTIONNEMENT",resourcesIndex:"02 / MODULES STEELCONTROL",securityIndex:"03 / SÉCURITÉ STEELCONTROL",techIndex:"04 / ARCHITECTURE STEELCONTROL",finalTitle:"Votre industrie.<br><em>Votre contrôle.</em>",finalText:"Surveillez, protégez et contrôlez toute l’opération au même endroit.",finalButton:"Entrer dans SteelControl"},
  de: {navPlatform:"Plattform",navResources:"Funktionen",navSecurity:"Sicherheit",navTechnology:"Technologie",operational:"Plattform betriebsbereit",signIn:"Anmelden",heroLabel:"STEELCONTROL / INDUSTRIEBETRIEB",heroTitle:"Kontrolle, die<br><span>Industrie bewegt.</span>",heroText:"Eine Plattform verbindet Maschinen, Bediener und Entscheidungen in Echtzeit.",accessPlatform:"Plattform öffnen",explore:"System erkunden",chapterEdgeTitle:"Von der Maschine<br><span>zum Edge.</span>",chapterDataTitle:"Daten werden zu<br><span>Kontext.</span>",chapterControlTitle:"Entscheidungen in<br><span>Echtzeit.</span>",platformIndex:"01 / FUNKTIONSWEISE",resourcesIndex:"02 / STEELCONTROL MODULE",securityIndex:"03 / STEELCONTROL SICHERHEIT",techIndex:"04 / STEELCONTROL ARCHITEKTUR",finalTitle:"Ihre Industrie.<br><em>Ihre Kontrolle.</em>",finalText:"Überwachen, schützen und steuern Sie den Betrieb an einem Ort.",finalButton:"SteelControl öffnen"},
  it: {navPlatform:"Piattaforma",navResources:"Funzioni",navSecurity:"Sicurezza",navTechnology:"Tecnologia",operational:"Piattaforma operativa",signIn:"Accedi",heroLabel:"STEELCONTROL / OPERAZIONI INDUSTRIALI",heroTitle:"Il controllo che<br><span>muove l’industria.</span>",heroText:"Una piattaforma che collega macchine, operatori e decisioni in tempo reale.",accessPlatform:"Accedi alla piattaforma",explore:"Esplora il sistema",chapterEdgeTitle:"Dalla macchina<br><span>all’Edge.</span>",chapterDataTitle:"Dati che diventano<br><span>contesto.</span>",chapterControlTitle:"Decisioni in<br><span>tempo reale.</span>",platformIndex:"01 / COME FUNZIONA",resourcesIndex:"02 / MODULI STEELCONTROL",securityIndex:"03 / SICUREZZA STEELCONTROL",techIndex:"04 / ARCHITETTURA STEELCONTROL",finalTitle:"La tua industria.<br><em>Il tuo controllo.</em>",finalText:"Monitora, proteggi e controlla l’operazione in un unico posto.",finalButton:"Entra in SteelControl"}
};

Object.assign(HOME_I18N.pt,{operationView:"VISÃO DA OPERAÇÃO",goodMorning:"Bom dia, operador",selectedMachine:"MÁQUINA SELECIONADA",edgeConnected:"Steel Edge conectado · 12 ms",availability:"DISPONIBILIDADE",shiftGain:"+2,1% no turno",production:"PRODUÇÃO",piecesDone:"peças concluídas",alerts:"ALERTAS",noCriticality:"sem criticidade",shiftPerformance:"DESEMPENHO DO TURNO",recentEvents:"EVENTOS RECENTES",cycleDone:"Ciclo concluído",telemetryUpdated:"Telemetria atualizada",operatorAuth:"Operador autenticado"});
Object.assign(HOME_I18N.en,{operationView:"OPERATION OVERVIEW",goodMorning:"Good morning, operator",selectedMachine:"SELECTED MACHINE",edgeConnected:"Steel Edge connected · 12 ms",availability:"AVAILABILITY",shiftGain:"+2.1% this shift",production:"PRODUCTION",piecesDone:"parts completed",alerts:"ALERTS",noCriticality:"no critical events",shiftPerformance:"SHIFT PERFORMANCE",recentEvents:"RECENT EVENTS",cycleDone:"Cycle completed",telemetryUpdated:"Telemetry updated",operatorAuth:"Operator authenticated"});
Object.assign(HOME_I18N.es,{operationView:"VISIÓN DE LA OPERACIÓN",goodMorning:"Buenos días, operador",selectedMachine:"MÁQUINA SELECCIONADA",edgeConnected:"Steel Edge conectado · 12 ms",availability:"DISPONIBILIDAD",shiftGain:"+2,1% en el turno",production:"PRODUCCIÓN",piecesDone:"piezas completadas",alerts:"ALERTAS",noCriticality:"sin eventos críticos",shiftPerformance:"RENDIMIENTO DEL TURNO",recentEvents:"EVENTOS RECIENTES",cycleDone:"Ciclo completado",telemetryUpdated:"Telemetría actualizada",operatorAuth:"Operador autenticado"});
Object.assign(HOME_I18N.fr,{operationView:"VUE DE L’OPÉRATION",goodMorning:"Bonjour, opérateur",selectedMachine:"MACHINE SÉLECTIONNÉE",edgeConnected:"Steel Edge connecté · 12 ms",availability:"DISPONIBILITÉ",shiftGain:"+2,1% sur le poste",production:"PRODUCTION",piecesDone:"pièces terminées",alerts:"ALERTES",noCriticality:"aucun événement critique",shiftPerformance:"PERFORMANCE DU POSTE",recentEvents:"ÉVÉNEMENTS RÉCENTS",cycleDone:"Cycle terminé",telemetryUpdated:"Télémétrie mise à jour",operatorAuth:"Opérateur authentifié"});
Object.assign(HOME_I18N.de,{operationView:"BETRIEBSÜBERSICHT",goodMorning:"Guten Morgen, Bediener",selectedMachine:"AUSGEWÄHLTE MASCHINE",edgeConnected:"Steel Edge verbunden · 12 ms",availability:"VERFÜGBARKEIT",shiftGain:"+2,1% in der Schicht",production:"PRODUKTION",piecesDone:"Teile fertiggestellt",alerts:"ALARME",noCriticality:"keine kritischen Ereignisse",shiftPerformance:"SCHICHTLEISTUNG",recentEvents:"LETZTE EREIGNISSE",cycleDone:"Zyklus abgeschlossen",telemetryUpdated:"Telemetrie aktualisiert",operatorAuth:"Bediener authentifiziert"});
Object.assign(HOME_I18N.it,{operationView:"VISTA OPERATIVA",goodMorning:"Buongiorno, operatore",selectedMachine:"MACCHINA SELEZIONATA",edgeConnected:"Steel Edge connesso · 12 ms",availability:"DISPONIBILITÀ",shiftGain:"+2,1% nel turno",production:"PRODUZIONE",piecesDone:"pezzi completati",alerts:"AVVISI",noCriticality:"nessun evento critico",shiftPerformance:"PRESTAZIONI DEL TURNO",recentEvents:"EVENTI RECENTI",cycleDone:"Ciclo completato",telemetryUpdated:"Telemetria aggiornata",operatorAuth:"Operatore autenticato"});

Object.assign(HOME_I18N.es,{chapterEdgeText:"La capa local recibe señales, valida límites y mantiene el equipo conectado con baja latencia.",chapterDataText:"Producción, alarmas, estados y rendimiento organizados en una lectura clara.",chapterControlText:"Escritorio y móvil sincronizados para supervisar, autorizar y actuar con trazabilidad.",platformTitle:"De la máquina al panel.<br><em>Todo sincronizado.</em>",platformText:"SteelControl recibe las señales mediante Edge y entrega la misma información en escritorio y móvil.",machineTitle:"Máquina industrial",machineText:"Dobot, impresora 3D, CNC u otro equipo.",edgeTitle:"Steel Edge",edgeText:"Recopilación, validación y comandos cerca de la máquina.",coreTitle:"Núcleo SteelControl",coreText:"Reglas, historial, permisos e inteligencia operativa.",experienceTitle:"Escritorio y móvil",experienceText:"Los mismos datos y comandos en todas las pantallas.",resourcesTitle:"Una central.<br><em>Toda la operación.</em>",resourcesText:"Todos los módulos comparten una identidad visual y un propósito industrial.",dashboardTitle:"Panel dinámico",dashboardText:"OEE, disponibilidad, rendimiento y señales según el perfil de la máquina.",connectedTitle:"Máquina conectada",connectedText:"Estado en línea, posición, producción y eventos.",identityTitle:"Identidad y permiso",identityText:"Validación biométrica, cargos y permisos por empresa.",decisionTitle:"De la señal a la decisión",decisionText:"Producción, mantenimiento, alertas y auditoría en un flujo continuo.",controlTitle:"Manual y automático",controlText:"Movimientos asistidos y ciclos enseñados con comandos autenticados.",securityTitle:"Control también significa<br><em>saber quién actuó.</em>",securityText:"SteelControl protege la operación con identidad, permisos y trazabilidad.",identityVerified:"Identidad verificada",identityVerifiedText:"Reconocimiento facial y autenticación segura",commandsAuth:"Comandos autenticados",commandsAuthText:"Control remoto solo para usuarios autorizados",auditTitle:"Auditoría industrial",auditText:"Registro de accesos, cambios y comandos",techTitle:"Escritorio, móvil y Edge.<br><em>Una sola plataforma.</em>"});
Object.assign(HOME_I18N.fr,{chapterEdgeText:"La couche locale reçoit les signaux, valide les limites et maintient l’équipement connecté à faible latence.",chapterDataText:"Production, alarmes, états et performances organisés en une lecture claire.",chapterControlText:"Desktop et mobile synchronisés pour surveiller, autoriser et agir avec traçabilité.",platformTitle:"De la machine au tableau de bord.<br><em>Tout est synchronisé.</em>",platformText:"SteelControl reçoit les signaux via Edge et fournit les mêmes informations sur desktop et mobile.",machineTitle:"Machine industrielle",machineText:"Dobot, imprimante 3D, CNC ou autre équipement.",edgeTitle:"Steel Edge",edgeText:"Collecte, validation et commandes au plus près de la machine.",coreTitle:"Noyau SteelControl",coreText:"Règles, historique, autorisations et intelligence opérationnelle.",experienceTitle:"Desktop et mobile",experienceText:"Les mêmes données et commandes sur chaque écran.",resourcesTitle:"Un seul centre.<br><em>Toute l’opération.</em>",resourcesText:"Tous les modules partagent la même identité visuelle industrielle.",dashboardTitle:"Tableau de bord dynamique",dashboardText:"OEE, disponibilité, performance et signaux selon le profil machine.",connectedTitle:"Machine connectée",connectedText:"État en ligne, position, production et événements.",identityTitle:"Identité et autorisation",identityText:"Validation biométrique, rôles et autorisations par entreprise.",decisionTitle:"Du signal à la décision",decisionText:"Production, maintenance, alertes et audit dans un flux continu.",controlTitle:"Manuel et automatique",controlText:"Mouvements assistés et cycles appris avec commandes authentifiées.",securityTitle:"Contrôler, c’est aussi<br><em>savoir qui a agi.</em>",securityText:"SteelControl protège l’opération avec identité, autorisation et traçabilité.",identityVerified:"Identité vérifiée",identityVerifiedText:"Reconnaissance faciale et authentification sécurisée",commandsAuth:"Commandes authentifiées",commandsAuthText:"Contrôle à distance réservé aux utilisateurs autorisés",auditTitle:"Audit industriel",auditText:"Accès, modifications et commandes enregistrés",techTitle:"Desktop, mobile et Edge.<br><em>Une seule plateforme.</em>"});
Object.assign(HOME_I18N.de,{chapterEdgeText:"Die lokale Ebene empfängt Signale, prüft Grenzen und hält Geräte mit geringer Latenz verbunden.",chapterDataText:"Produktion, Alarme, Zustände und Leistung in einer klaren Betriebsansicht.",chapterControlText:"Synchronisierte Desktop- und Mobilansichten für nachvollziehbare Aktionen.",platformTitle:"Von der Maschine zum Dashboard.<br><em>Alles synchronisiert.</em>",platformText:"SteelControl empfängt Signale über Edge und liefert dieselben Informationen auf Desktop und Mobilgeräten.",machineTitle:"Industriemaschine",machineText:"Dobot, 3D-Drucker, CNC oder andere Geräte.",edgeTitle:"Steel Edge",edgeText:"Erfassung, Validierung und Befehle nahe an der Maschine.",coreTitle:"SteelControl Kern",coreText:"Regeln, Verlauf, Berechtigungen und Betriebsintelligenz.",experienceTitle:"Desktop und Mobil",experienceText:"Dieselben Daten und Befehle auf allen Bildschirmen.",resourcesTitle:"Eine Zentrale.<br><em>Der gesamte Betrieb.</em>",resourcesText:"Alle Module teilen eine visuelle Sprache und einen industriellen Zweck.",dashboardTitle:"Dynamisches Dashboard",dashboardText:"OEE, Verfügbarkeit, Leistung und Signale passend zum Maschinenprofil.",connectedTitle:"Vernetzte Maschine",connectedText:"Online-Status, Position, Produktion und Ereignisse.",identityTitle:"Identität und Berechtigung",identityText:"Biometrische Prüfung, Rollen und Unternehmensrechte.",decisionTitle:"Vom Signal zur Entscheidung",decisionText:"Produktion, Wartung, Alarme und Audit in einem durchgängigen Ablauf.",controlTitle:"Manuell und automatisch",controlText:"Unterstützte Bewegungen und eingelernte Zyklen mit authentifizierten Befehlen.",securityTitle:"Kontrolle heißt auch,<br><em>zu wissen, wer gehandelt hat.</em>",securityText:"SteelControl schützt den Betrieb mit Identität, Berechtigung und Nachvollziehbarkeit.",identityVerified:"Verifizierte Identität",identityVerifiedText:"Gesichtserkennung und sichere Authentifizierung",commandsAuth:"Authentifizierte Befehle",commandsAuthText:"Fernsteuerung nur für autorisierte Benutzer",auditTitle:"Industrie-Audit",auditText:"Zugriffe, Änderungen und Befehle werden protokolliert",techTitle:"Desktop, Mobil und Edge.<br><em>Eine Plattform.</em>"});
Object.assign(HOME_I18N.it,{chapterEdgeText:"Il livello locale riceve segnali, convalida i limiti e mantiene connessa la macchina a bassa latenza.",chapterDataText:"Produzione, allarmi, stati e prestazioni organizzati in una lettura chiara.",chapterControlText:"Desktop e mobile sincronizzati per monitorare, autorizzare e agire con tracciabilità.",platformTitle:"Dalla macchina al pannello.<br><em>Tutto sincronizzato.</em>",platformText:"SteelControl riceve i segnali tramite Edge e fornisce le stesse informazioni su desktop e mobile.",machineTitle:"Macchina industriale",machineText:"Dobot, stampante 3D, CNC o altra attrezzatura.",edgeTitle:"Steel Edge",edgeText:"Raccolta, convalida e comandi vicino alla macchina.",coreTitle:"Nucleo SteelControl",coreText:"Regole, cronologia, permessi e intelligenza operativa.",experienceTitle:"Desktop e mobile",experienceText:"Gli stessi dati e comandi su ogni schermo.",resourcesTitle:"Un solo centro.<br><em>L’intera operazione.</em>",resourcesText:"Tutti i moduli condividono identità visiva e finalità industriale.",dashboardTitle:"Dashboard dinamica",dashboardText:"OEE, disponibilità, prestazioni e segnali in base al profilo macchina.",connectedTitle:"Macchina connessa",connectedText:"Stato online, posizione, produzione ed eventi.",identityTitle:"Identità e permessi",identityText:"Convalida biometrica, ruoli e permessi aziendali.",decisionTitle:"Dal segnale alla decisione",decisionText:"Produzione, manutenzione, allarmi e audit in un flusso continuo.",controlTitle:"Manuale e automatico",controlText:"Movimenti assistiti e cicli appresi con comandi autenticati.",securityTitle:"Controllare significa anche<br><em>sapere chi ha agito.</em>",securityText:"SteelControl protegge l’operazione con identità, permessi e tracciabilità.",identityVerified:"Identità verificata",identityVerifiedText:"Riconoscimento facciale e autenticazione sicura",commandsAuth:"Comandi autenticati",commandsAuthText:"Controllo remoto solo per utenti autorizzati",auditTitle:"Audit industriale",auditText:"Accessi, modifiche e comandi registrati",techTitle:"Desktop, mobile ed Edge.<br><em>Un’unica piattaforma.</em>"});

function setupHomeI18n() {
  const assignments = [
    [".product-main>header small","operationView"],[".product-main>header strong","goodMorning"],[".product-machine small","selectedMachine"],[".product-machine div>span","edgeConnected"],
    [".product-kpis article:nth-child(1) small","availability"],[".product-kpis article:nth-child(1) span","shiftGain"],[".product-kpis article:nth-child(2) small","production"],[".product-kpis article:nth-child(2) span","piecesDone"],[".product-kpis article:nth-child(3) small","alerts"],[".product-kpis article:nth-child(3) span","noCriticality"],
    [".product-chart>header strong","shiftPerformance"],[".product-events>header strong","recentEvents"],[".product-events>div:nth-child(2) b","cycleDone"],[".product-events>div:nth-child(3) b","telemetryUpdated"],[".product-events>div:nth-child(4) b","operatorAuth"],
    [".platform-section .section-index","platformIndex"],[".platform-section .section-intro h2","platformTitle"],[".platform-section .section-intro>p","platformText"],
    [".node-machine h3","machineTitle"],[".node-machine p","machineText"],[".node-edge h3","edgeTitle"],[".node-edge p","edgeText"],[".node-core h3","coreTitle"],[".node-core p","coreText"],[".node-action h3","experienceTitle"],[".node-action p","experienceText"],
    [".resources-section .section-index","resourcesIndex"],[".resources-section .section-intro h2","resourcesTitle"],[".resources-section .section-intro>p","resourcesText"],
    [".bento-card:nth-child(1) h3","dashboardTitle"],[".bento-card:nth-child(1)>p","dashboardText"],[".bento-card:nth-child(2) h3","connectedTitle"],[".bento-card:nth-child(2)>p","connectedText"],[".bento-card:nth-child(3) h3","identityTitle"],[".bento-card:nth-child(3)>p","identityText"],[".bento-card:nth-child(4) h3","decisionTitle"],[".bento-card:nth-child(4) p","decisionText"],[".bento-card:nth-child(5) h3","controlTitle"],[".bento-card:nth-child(5)>p","controlText"],
    [".security-copy .section-index","securityIndex"],[".security-copy h2","securityTitle"],[".security-copy>p","securityText"],[".security-copy li:nth-child(1) strong","identityVerified"],[".security-copy li:nth-child(1) small","identityVerifiedText"],[".security-copy li:nth-child(2) strong","commandsAuth"],[".security-copy li:nth-child(2) small","commandsAuthText"],[".security-copy li:nth-child(3) strong","auditTitle"],[".security-copy li:nth-child(3) small","auditText"],
    [".tech-section .section-index","techIndex"],[".tech-section .section-intro h2","techTitle"],[".final-shell h2","finalTitle"],[".final-shell>p","finalText"],[".final-button span","finalButton"]
  ];
  assignments.forEach(([selector,key]) => document.querySelector(selector)?.setAttribute("data-home-key",key));

  const apply = () => {
    const lang = (localStorage.getItem("idiomaSistema") || document.documentElement.lang || "pt").slice(0,2);
    const table = HOME_I18N[lang] || HOME_I18N.pt;
    document.querySelectorAll("[data-home-key]").forEach(element => {
      const key = element.dataset.homeKey;
      const value = table[key] ?? HOME_I18N.en[key] ?? HOME_I18N.pt[key];
      if (value) element.innerHTML = value;
    });
  };
  apply();
  new MutationObserver(apply).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  document.addEventListener("change",event => { if (event.target?.id === "steelLanguageSelect") setTimeout(apply,0); });
  window.addEventListener("storage",event => { if (event.key === "idiomaSistema") apply(); });
}

function setupCinematicHero() {
  const hero = document.querySelector(".world-hero");
  const chapters = [...document.querySelectorAll(".hero-chapter")];
  const bars = [...document.querySelectorAll(".hero-story-progress span")];
  const robot = document.getElementById("robotWorkcell");
  if (!hero || !chapters.length) return;
  let queued = false;
  const update = () => {
    queued = false;
    const rect = hero.getBoundingClientRect();
    const distance = Math.max(1, hero.offsetHeight - innerHeight);
    const progress = Math.max(0,Math.min(1,-rect.top/distance));
    const active = Math.min(chapters.length-1,Math.floor(progress*chapters.length));
    hero.classList.toggle("is-cinematic-active",rect.top<=0 && rect.bottom>innerHeight*.15);
    chapters.forEach((chapter,index)=>chapter.classList.toggle("is-active",index===active));
    bars.forEach((bar,index)=>{
      const local = Math.max(0,Math.min(1,progress*chapters.length-index));
      bar.style.setProperty("--chapter-progress",local.toFixed(3));
    });
    if (robot) {
      robot.style.setProperty("--shoulder-lift",`${(-16+progress*28).toFixed(1)}deg`);
      robot.style.setProperty("--elbow-fold",`${(-24+progress*48).toFixed(1)}deg`);
      robot.style.setProperty("--target-x",`${(72-progress*34).toFixed(1)}%`);
      robot.style.setProperty("--target-y",`${(42+Math.sin(progress*Math.PI)*22).toFixed(1)}%`);
    }
  };
  const request=()=>{if(!queued){queued=true;requestAnimationFrame(update);}};
  addEventListener("scroll",request,{passive:true});addEventListener("resize",request,{passive:true});update();
}

setupNavigation();
setupHeader();
setupReveal();
setupCursorLight();
setupTiltCards();
setupActiveNavigation();
setupWorldCanvas();
setupInteractiveRobot();
setupHomeI18n();
setupCinematicHero();
