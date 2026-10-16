(() => {
  const API = window.STEELCONTROL_API_URL;
  const token = localStorage.getItem("token");
  const machineId = localStorage.getItem("maquinaId");
  if (localStorage.getItem("autenticado") !== "true" || !machineId) return;

  const $ = id => document.getElementById(id);
  const requestedView = new URLSearchParams(window.location.search).get("view");
  const dom = {
    name: $("dobotMachineName"), badge: $("dobotStateBadge"),
    gateway: $("dobotGatewayState"), port: $("dobotPort"),
    latency: $("dobotLatency"), alarms: $("dobotAlarmsCount"),
    x: $("dobotX"), y: $("dobotY"), z: $("dobotZ"), r: $("dobotR"),
    j1: $("dobotJ1"), j2: $("dobotJ2"), j3: $("dobotJ3"), j4: $("dobotJ4"),
    temp: $("dobotSensorTemp"), vib: $("dobotSensorVibration"),
    current: $("dobotSensorCurrent"), suction: $("dobotSuction"),
    gripper: $("dobotGripper"), queue: $("dobotQueue"), mode: $("dobotMode"),
    lock: $("dobotMotionLock"),
    jogStep: $("dobotJogStep"), jogSpeed: $("dobotJogSpeed"),
    jogSpeedValue: $("dobotJogSpeedValue"), jogTarget: $("dobotJogTarget"),
    manualMode: $("dobotManualMode"), automaticMode: $("dobotAutomaticMode"),
    manualPane: $("dobotManualControls"), automaticPane: $("dobotAutomaticControls"),
    interlock: $("dobotCycleInterlock"), autoStatus: $("dobotAutoStatus"),
    autoCycles: $("dobotAutoCycles"), autoSpeed: $("dobotAutoSpeed"),
    autoStep: $("dobotAutoStep"), autoCounter: $("dobotAutoCounter"),
    autoProgress: $("dobotAutoProgress"), autoStart: $("dobotAutoStart"),
    autoPause: $("dobotAutoPause"), autoStop: $("dobotAutoStop"),
    autoReset: $("dobotAutoReset")
  };

  const POINTS = ["P0", "P1", "P2", "P3", "P4"];
  const POINT_LABELS = { P0: "Espera", P1: "Acima da peça", P2: "Coleta", P3: "Acima do destino", P4: "Entrega" };
  const storageKey = `steelcontrol:dobot:auto-points:${machineId}`;

  let machine = null;
  let diagnostic = null;
  let lastExtras = null;
  let requestedViewHandled = false;
  let taughtPoints = loadTaughtPoints();
  let automatic = {
    running: false,
    paused: false,
    stopRequested: false,
    completed: 0,
    total: 1,
    executionId: null,
    localExecutor: false
  };
  let automaticVersion = 0;
  let automaticHydrated = false;
  let automaticSyncBusy = false;
  let jogBusy = false;
  let jogPose = null;
  let jogHoldDirection = null;
  let jogHoldGeneration = 0;
  let connectionOnline = false;

  async function fetchAuth(url, options = {}) {
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "no-cache");
    return fetch(url, { ...options, headers, cache: "no-store" });
  }

  const n = (value, decimals = 1) => Number.isFinite(Number(value)) ? Number(value).toFixed(decimals) : "--";
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const isDobot = () => String(machine?.controlador || diagnostic?.controlador || "").toUpperCase() === "DOBOT_MAGICIAN";

  function hasFreshRealConnection(data) {
    const connectionCode = String(
      diagnostic?.estadoConexao?.codigo || machine?.estadoConexao?.codigo || machine?.statusConexao || "OFFLINE"
    ).trim().toUpperCase();
    const realEquipment = diagnostic?.modoSimulacao === false || machine?.modoSimulacao === false;
    return realEquipment && connectionCode === "CONECTADA" && data?.connected === true;
  }

  function setControlsAvailability(online) {
    connectionOnline = online;
    document.querySelectorAll("[data-dobot-command], [data-dobot-jog], [data-dobot-capture]").forEach(button => {
      const manualLocked = automatic.running && !button.matches('[data-dobot-command="DOBOT_STOP"]');
      // O movimento em andamento continua protegido por jogBusy. Manter o
      // botão pressionado habilitado evita que o navegador dispare
      // pointercancel entre dois passos do movimento contínuo.
      button.disabled = !online || manualLocked;
    });
    if (dom.jogStep) dom.jogStep.disabled = !online || jogBusy;
    if (dom.jogSpeed) dom.jogSpeed.disabled = !online || jogBusy;
    if (dom.automaticMode) dom.automaticMode.disabled = !online;
    if (dom.autoStart) dom.autoStart.disabled = !online || automatic.running || POINTS.some(point => !taughtPoints[point]);
  }

  function sensor(state, value, unit) {
    if (state === "MOCK" && Number.isFinite(Number(value))) return `${n(value, 2)} ${unit} • MOCK`;
    if (state === "REAL" && Number.isFinite(Number(value))) return `${n(value, 2)} ${unit}`;
    return "Não instalado";
  }

  function openDedicatedView() {
    if (requestedView !== "dobot" || requestedViewHandled || !machine) return;
    requestedViewHandled = true;
    if (!isDobot()) {
      window.SteelUI?.toast?.({ tipo: "warning", titulo: "Painel exclusivo do Dobot", mensagem: "Cadastre ou selecione uma máquina com o controlador Dobot Magician." });
      window.setTimeout(() => window.location.replace("/app/maquinas"), 900);
      return;
    }
    window.mostrarTela?.("dobot", null);
  }

  function currentPose() {
    const pose = lastExtras?.dobot?.pose || lastExtras?.pose || {};
    const normalized = {};
    for (const key of ["x", "y", "z", "r"]) {
      const value = Number(pose?.[key] ?? pose?.[key.toUpperCase()]);
      if (!Number.isFinite(value)) return null;
      normalized[key] = value;
    }
    return normalized;
  }

  function poseDistance(a, b) {
    if (!a || !b) return Number.POSITIVE_INFINITY;
    return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z, (a.r - b.r) / 2);
  }

  function duplicatedPoint(point, pose) {
    return POINTS.find(other => other !== point && taughtPoints[other] && poseDistance(taughtPoints[other], pose) < 3);
  }

  function duplicatedPairs() {
    const pairs = [];
    for (let index = 0; index < POINTS.length; index += 1) {
      for (let next = index + 1; next < POINTS.length; next += 1) {
        const first = POINTS[index];
        const second = POINTS[next];
        if (taughtPoints[first] && taughtPoints[second] && poseDistance(taughtPoints[first], taughtPoints[second]) < 3) pairs.push(`${first}/${second}`);
      }
    }
    return pairs;
  }

  function loadTaughtPoints() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
      if (!value || typeof value !== "object") return {};
      const sanitized = {};
      for (const point of POINTS) {
        const pose = value[point];
        if (!pose || !["x", "y", "z", "r"].every(key => Number.isFinite(Number(pose[key])))) continue;
        const normalized = Object.fromEntries(["x", "y", "z", "r"].map(key => [key, Number(pose[key])]));
        if (Object.values(sanitized).some(saved => poseDistance(saved, normalized) < 3)) continue;
        sanitized[point] = normalized;
      }
      if (JSON.stringify(sanitized) !== JSON.stringify(value)) localStorage.setItem(storageKey, JSON.stringify(sanitized));
      return sanitized;
    } catch (_) { return {}; }
  }

  function saveTaughtPoints() {
    try { localStorage.setItem(storageKey, JSON.stringify(taughtPoints)); } catch (_) {}
    renderTaughtPoints();
  }

  function normalizedSharedPoints(raw) {
    const points = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return points;
    for (const point of POINTS) {
      const pose = raw[point];
      if (!pose || typeof pose !== "object" || !["x", "y", "z", "r"].every(key => Number.isFinite(Number(pose[key])))) continue;
      points[point] = Object.fromEntries(["x", "y", "z", "r"].map(key => [key, Number(pose[key])]));
    }
    return points;
  }

  function sharedAutomaticFrom(source) {
    if (!source || typeof source !== "object") return null;
    if (source.automatico && typeof source.automatico === "object") return source.automatico;
    const meta = source.integracaoMeta && typeof source.integracaoMeta === "object"
      ? source.integracaoMeta
      : source;
    const dobot = meta.dobot && typeof meta.dobot === "object" ? meta.dobot : null;
    if (dobot?.automatico && typeof dobot.automatico === "object") return dobot.automatico;
    if (dobot?.automaticPoints && typeof dobot.automaticPoints === "object") {
      return {
        pontos: dobot.automaticPoints,
        ciclos: 1,
        velocidade: 15,
        versao: 0,
        atualizadoEm: dobot.automaticPointsRevision || null
      };
    }
    if (source.points && typeof source.points === "object") {
      return { pontos: source.points, ciclos: 1, velocidade: 15, versao: 0, atualizadoEm: source.revision || null };
    }
    return null;
  }

  function applySharedAutomatic(source, { force = false } = {}) {
    const shared = sharedAutomaticFrom(source);
    if (!shared) return false;
    const versionValue = Number(shared.versao ?? 0);
    const version = Number.isInteger(versionValue) && versionValue >= 0 ? versionValue : 0;
    const cycles = Math.max(1, Math.min(20, Number(shared.ciclos) || 1));
    const speed = Math.max(1, Math.min(40, Number(shared.velocidade) || 15));
    const configChanged = force || !automaticHydrated || version > automaticVersion;
    if (configChanged && !automatic.localExecutor) {
      taughtPoints = normalizedSharedPoints(shared.pontos);
      automaticVersion = version;
      automaticHydrated = true;
      if (dom.autoCycles) dom.autoCycles.value = String(cycles);
      if (dom.autoSpeed) dom.autoSpeed.value = String(speed);
      saveTaughtPoints();
    }

    const state = String(shared.estado || "PARADO").toUpperCase();
    const sharedActive = state === "EXECUTANDO" || state === "PAUSADO";
    const sharedExecutionId = shared.execucaoId ? String(shared.execucaoId) : null;
    const sameLocalExecution = Boolean(
      automatic.localExecutor &&
      automatic.executionId &&
      sharedExecutionId === automatic.executionId
    );

    if (sameLocalExecution) {
      automatic.paused = state === "PAUSADO";
      if (!sharedActive) automatic.stopRequested = true;
    } else if (!automatic.localExecutor) {
      automatic.running = sharedActive;
      automatic.paused = state === "PAUSADO";
      automatic.stopRequested = false;
      automatic.executionId = sharedExecutionId;
      automatic.completed = Math.max(0, Math.min(cycles, Number(shared.cicloAtual) || 0));
    }
    automatic.total = cycles;

    const progress = Math.max(0, Math.min(100, Number(shared.progresso) || 0));
    if (sharedActive || ["CONCLUIDO", "FALHOU"].includes(state)) {
      if (sharedActive) setControlMode("automatic");
      const status = state === "PAUSADO"
        ? "Ciclo pausado"
        : state === "CONCLUIDO"
          ? "Sequência concluída"
          : state === "FALHOU"
            ? "Ciclo interrompido"
            : `Ciclo ${Math.max(1, Number(shared.cicloAtual) || 1)} de ${cycles}`;
      updateAutoUi({
        status,
        step: shared.erro || shared.etapa || (sharedActive ? "Execução sincronizada" : "Pronto para novo ciclo"),
        progress
      });
    } else if (configChanged) {
      updateAutoUi({
        status: Object.keys(taughtPoints).length ? "Ensino sincronizado" : "Pronto para ensinar",
        step: Object.keys(taughtPoints).length ? "P0–P4 compartilhados com desktop e mobile" : "Capture P0 a P4 em posições reais diferentes"
      });
    } else {
      updateAutoUi();
    }
    return configChanged || sharedActive || Boolean(shared.estadoAtualizadoEm);
  }

  async function controlAutomatic(action, data = {}) {
    const response = await fetchAuth(`${API}/maquinas/${machineId}/dobot/automatico/controle`, {
      method: "POST",
      body: JSON.stringify({ acao: action, origem: "DESKTOP", ...data })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.mensagem || "Não foi possível sincronizar o controle automático.");
    applySharedAutomatic(result, { force: false });
    if (result.integracaoMeta && machine) machine = { ...machine, integracaoMeta: result.integracaoMeta };
    return result;
  }

  async function persistSharedAutomatic() {
    if (automaticSyncBusy) throw new Error("A sincronização do automático ainda está em andamento.");
    automaticSyncBusy = true;
    const cycles = Math.max(1, Math.min(20, Number(dom.autoCycles?.value) || 1));
    const speed = Math.max(1, Math.min(40, Number(dom.autoSpeed?.value) || 15));
    try {
      const response = await fetchAuth(`${API}/maquinas/${machineId}/dobot/automatico`, {
        method: "PUT",
        body: JSON.stringify({ pontos: taughtPoints, ciclos: cycles, velocidade: speed, versao: automaticVersion })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.mensagem || "Não foi possível sincronizar o ciclo automático.");
        error.status = response.status;
        throw error;
      }
      applySharedAutomatic(data, { force: true });
      if (data.integracaoMeta && machine) machine = { ...machine, integracaoMeta: data.integracaoMeta };
      return data;
    } finally {
      automaticSyncBusy = false;
    }
  }

  function renderTaughtPoints() {
    for (const point of POINTS) {
      const value = taughtPoints[point];
      const article = document.querySelector(`[data-dobot-point="${point}"]`);
      const output = document.querySelector(`[data-dobot-point-value="${point}"]`);
      article?.classList.toggle("taught", Boolean(value));
      if (output) output.textContent = value ? `X ${n(value.x, 1)} • Y ${n(value.y, 1)} • Z ${n(value.z, 1)} • R ${n(value.r, 1)}` : "Não ensinado";
    }
    const missing = POINTS.filter(point => !taughtPoints[point]);
    const duplicates = duplicatedPairs();
    if (dom.autoStart) dom.autoStart.disabled = !connectionOnline || automatic.running || missing.length > 0 || duplicates.length > 0;
    if (!automatic.running && missing.length && dom.autoStatus) {
      dom.autoStatus.textContent = `Ensine ${missing.join(", ")}`;
    } else if (!automatic.running && duplicates.length && dom.autoStatus) {
      dom.autoStatus.textContent = `Recapture ${duplicates.join(", ")}`;
    } else if (!automatic.running && !missing.length && dom.autoStatus && /Pronto para ensinar|Ensine P|Recapture/.test(dom.autoStatus.textContent || "")) {
      dom.autoStatus.textContent = "Pronto para iniciar";
    }
  }

  function setControlMode(mode) {
    const automaticMode = mode === "automatic";
    dom.manualMode?.classList.toggle("active", !automaticMode);
    dom.automaticMode?.classList.toggle("active", automaticMode);
    if (dom.manualPane) dom.manualPane.hidden = automaticMode;
    if (dom.automaticPane) dom.automaticPane.hidden = !automaticMode;
  }

  function updateAutoUi({ status, step, progress } = {}) {
    if (status && dom.autoStatus) dom.autoStatus.textContent = status;
    if (step && dom.autoStep) dom.autoStep.textContent = step;
    if (Number.isFinite(progress) && dom.autoProgress) dom.autoProgress.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    if (dom.autoCounter) dom.autoCounter.textContent = `${automatic.completed} / ${automatic.total}`;
    if (dom.autoStart) dom.autoStart.disabled = !connectionOnline || automatic.running || POINTS.some(point => !taughtPoints[point]) || duplicatedPairs().length > 0;
    if (dom.autoPause) {
      dom.autoPause.disabled = !automatic.running;
      dom.autoPause.innerHTML = automatic.paused ? '<i class="fa-solid fa-play"></i> CONTINUAR' : '<i class="fa-solid fa-pause"></i> PAUSAR';
    }
    if (dom.autoStop) dom.autoStop.disabled = !automatic.running;
    if (dom.autoReset) dom.autoReset.disabled = automatic.running;
    document.querySelectorAll("[data-dobot-capture]").forEach(button => { button.disabled = automatic.running; });
    if (dom.autoCycles) dom.autoCycles.disabled = automatic.running;
    if (dom.autoSpeed) dom.autoSpeed.disabled = automatic.running;
    if (dom.interlock) {
      dom.interlock.classList.toggle("running", automatic.running && !automatic.paused);
      dom.interlock.classList.toggle("paused", automatic.running && automatic.paused);
      dom.interlock.innerHTML = automatic.running
        ? automatic.paused
          ? '<i class="fa-solid fa-pause"></i> Automático pausado'
          : '<i class="fa-solid fa-lock"></i> Manual intertravado'
        : '<i class="fa-solid fa-circle-check"></i> Manual liberado';
    }
  }

  function render(extras) {
    if (extras) lastExtras = extras;
    if (!isDobot()) return;
    const data = lastExtras?.dobot || {};
    const online = hasFreshRealConnection(data);
    if (!jogBusy && !jogHoldDirection) jogPose = currentPose();
    setControlsAvailability(online);
    if (dom.name) dom.name.textContent = machine?.nome || "Dobot Magician";
    if (dom.badge) {
      dom.badge.className = `dobot-state ${online ? "online" : "waiting"}`;
      dom.badge.querySelector("strong").textContent = online ? `Dobot ${data.mode || "REAL"} conectado` : "Aguardando conexão real";
    }
    if (dom.gateway) dom.gateway.textContent = online ? "Online" : "Offline";
    if (dom.port) dom.port.textContent = online ? data.port || diagnostic?.integracaoMeta?.dobot?.port || "AUTO" : "--";
    if (dom.latency) dom.latency.textContent = online && diagnostic?.latenciaMs != null ? `${diagnostic.latenciaMs} ms` : "--";
    if (dom.alarms) dom.alarms.textContent = online && Array.isArray(data.alarms) ? String(data.alarms.length) : "--";
    for (const [key, element] of [["x", dom.x], ["y", dom.y], ["z", dom.z], ["r", dom.r]]) if (element) element.textContent = online ? n(data.pose?.[key], 2) : "--";
    for (const [key, element] of [["j1", dom.j1], ["j2", dom.j2], ["j3", dom.j3], ["j4", dom.j4]]) if (element) element.textContent = online ? n(data.joints?.[key], 2) : "--";
    if (dom.mode) dom.mode.textContent = online ? data.mode || diagnostic?.integracaoMeta?.dobot?.mode || "--" : "--";
    if (dom.queue) dom.queue.textContent = online ? data.queue || "--" : "--";
    if (dom.suction) dom.suction.textContent = online && data.endEffector?.suction === true ? "Ligada" : online && data.endEffector?.suction === false ? "Desligada" : "--";
    if (dom.gripper) dom.gripper.textContent = online && data.endEffector?.gripper === true ? "Fechada" : online && data.endEffector?.gripper === false ? "Aberta" : "--";
    const sensors = data.sensors || {};
    if (dom.temp) dom.temp.textContent = sensor(sensors.temperature, machine?.temperatura, "°C");
    if (dom.vib) dom.vib.textContent = sensor(sensors.vibration, machine?.vibracao, "mm/s");
    if (dom.current) dom.current.textContent = sensor(sensors.current, machine?.corrente, "A");
    const prepared = online && isDobot();
    if (dom.lock) {
      dom.lock.classList.toggle("unlocked", prepared);
      dom.lock.innerHTML = prepared ? '<i class="fa-solid fa-shield"></i> Comandos autenticados' : '<i class="fa-solid fa-lock"></i> Aguardando Dobot';
    }
    window.SteelIndustrialDashboard?.render(
      document.getElementById("dobotIndustrialDynamic"),
      machine,
      diagnostic
    );
  }

  async function load() {
    try {
      const [machineResponse, diagnosticResponse] = await Promise.all([
        fetchAuth(`${API}/maquinas/${machineId}`), fetchAuth(`${API}/maquinas/${machineId}/diagnostico`)
      ]);
      if (machineResponse.ok) {
        machine = await machineResponse.json();
        applySharedAutomatic(machine);
      }
      if (diagnosticResponse.ok) {
        diagnostic = await diagnosticResponse.json();
        applySharedAutomatic(diagnostic);
      }
      openDedicatedView();
      render(diagnostic?.dadosExtras || machine?.dadosExtrasAtuais || machine?.telemetria?.at?.(-1)?.dadosExtras || null);
    } catch (_) {}
  }

  async function sendCommand(comando, payload = {}, { silent = false } = {}) {
    if (!isDobot()) throw new Error("A máquina selecionada não é um Dobot Magician.");
    if (!connectionOnline) throw new Error("Dobot offline. Aguarde uma conexão real e telemetria recente antes de enviar comandos.");
    const response = await fetchAuth(`${API}/maquinas/${machineId}/comandos`, { method: "POST", body: JSON.stringify({ comando, payload }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.mensagem || "Comando não aceito.");
    if (!silent) window.SteelUI?.toast?.({ tipo: "success", titulo: "Comando na fila", mensagem: data.mensagem || comando });
    return data;
  }

  async function waitCommandCompletion(commandId, timeoutMs = 35000) {
    if (!Number.isFinite(Number(commandId))) throw new Error("O backend não retornou o identificador do comando.");
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (automatic.stopRequested) throw new Error("Ciclo interrompido pelo operador.");
      const response = await fetchAuth(`${API}/maquinas/${machineId}/comandos/${commandId}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.mensagem || "Não foi possível acompanhar o comando do Dobot.");
      const status = String(data.status || "").toUpperCase();
      if (status === "CONCLUIDO") return data;
      if (["FALHOU", "CANCELADO", "EXPIRADO"].includes(status)) {
        throw new Error(`O Edge informou ${status.toLowerCase()} para ${data.comando || "o comando"}. Consulte Diagnóstico / logs.`);
      }
      await delay(70);
    }
    throw new Error("O Edge não confirmou a execução do comando dentro do tempo esperado.");
  }

  async function manualCommand(comando, payload = {}, { silent = false } = {}) {
    try {
      const queued = await sendCommand(comando, payload, { silent });
      await waitCommandCompletion(queued?.comando?.id, comando === "DOBOT_HOME" || comando === "DOBOT_PTP" ? 20000 : 12000);
      if (!silent) window.SteelUI?.toast?.({ tipo: "success", titulo: "Comando executado", mensagem: comando });
      return queued;
    }
    catch (error) {
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Comando Dobot", mensagem: error.message });
      return null;
    }
  }

  async function refreshDiagnosticPose() {
    const response = await fetchAuth(`${API}/maquinas/${machineId}/diagnostico`);
    if (!response.ok) throw new Error("Sem telemetria do Dobot durante o ciclo.");
    diagnostic = await response.json();
    if (diagnostic?.dadosExtras) {
      lastExtras = diagnostic.dadosExtras;
      render(lastExtras);
    }
    return currentPose();
  }

  function setJogBusy(busy, message) {
    jogBusy = busy;
    document.querySelectorAll("[data-dobot-jog]").forEach(button => { button.disabled = !connectionOnline || automatic.running; });
    if (dom.jogStep) dom.jogStep.disabled = !connectionOnline || busy;
    if (dom.jogSpeed) dom.jogSpeed.disabled = !connectionOnline || busy;
    if (dom.jogTarget && message) dom.jogTarget.textContent = message;
  }

  async function jog(direction) {
    if (automatic.running) {
      window.SteelUI?.toast?.({ tipo: "warning", titulo: "Manual intertravado", mensagem: "O ciclo automático ainda está parando." });
      return false;
    }
    if (jogBusy) return false;
    const step = Math.max(1, Math.min(20, Number(dom.jogStep?.value) || 5));
    const speed = Math.max(1, Math.min(40, Number(dom.jogSpeed?.value) || 20));
    const delta = {
      // O desenho usa a visão frontal do operador; o referencial nativo do
      // Dobot cresce no sentido oposto nos eixos horizontais.
      "x+": { x: -step }, "x-": { x: step },
      "y+": { y: -step }, "y-": { y: step },
      "z+": { z: step }, "z-": { z: -step },
      "r+": { r: step }, "r-": { r: -step }
    }[direction];
    if (!delta) return false;
    try {
      if (delta.r) {
        setJogBusy(true, `${direction.toUpperCase()} • ${step}°`);
        const executed = await manualCommand("DOBOT_ROTATE", {
          delta: delta.r,
          velocidade: speed
        }, { silent: true });
        if (executed) {
          const base = jogPose || currentPose();
          const confirmed = base ? { ...base, r: base.r + delta.r } : null;
          jogPose = confirmed;
          setJogBusy(false, confirmed
            ? `Rotação confirmada • X ${n(confirmed.x, 1)}  Y ${n(confirmed.y, 1)}  Z ${n(confirmed.z, 1)}  R ${n(confirmed.r, 1)}`
            : "Rotação confirmada");
          // Sincroniza a pose real sem segurar o próximo desenho da interface.
          refreshDiagnosticPose().then(pose => { if (pose && !jogBusy) jogPose = pose; }).catch(() => {});
          return true;
        }
        jogPose = null;
        setJogBusy(false, "Rotação não executada");
        return false;
      }
      setJogBusy(true, `${direction.toUpperCase()} • preparando movimento`);
      const pose = jogPose || currentPose() || await refreshDiagnosticPose();
      if (!pose) throw new Error("A posição real do Dobot não está disponível.");
      const target = {
        x: pose.x + (delta.x || 0), y: pose.y + (delta.y || 0),
        z: pose.z + (delta.z || 0), r: pose.r + (delta.r || 0), velocidade: speed
      };
      setJogBusy(true, `${direction.toUpperCase()} • ${step}${direction.startsWith("r") ? "°" : " mm"}`);
      const executed = await manualCommand("DOBOT_PTP", target, { silent: true });
      if (executed) {
        jogPose = { x: target.x, y: target.y, z: target.z, r: target.r };
        setJogBusy(false, `Posição confirmada • X ${n(target.x, 1)}  Y ${n(target.y, 1)}  Z ${n(target.z, 1)}  R ${n(target.r, 1)}`);
        return true;
      }
      jogPose = null;
      setJogBusy(false, "Movimento não executado");
      return false;
    } catch (error) {
      jogPose = null;
      setJogBusy(false, "Falha no movimento");
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Controle jog", mensagem: error.message });
      return false;
    }
  }

  async function startJogHold(direction) {
    if (jogHoldDirection || automatic.running || !connectionOnline) return;
    jogHoldDirection = direction;
    const generation = ++jogHoldGeneration;
    while (jogHoldDirection === direction && generation === jogHoldGeneration && connectionOnline && !automatic.running) {
      const moved = await jog(direction);
      if (!moved) break;
    }
    if (generation === jogHoldGeneration) jogHoldDirection = null;
  }

  function stopJogHold() {
    jogHoldDirection = null;
    jogHoldGeneration += 1;
  }

  function reachedTarget(actual, target) {
    if (!actual || !target) return false;
    return Math.abs(actual.x - target.x) <= 3 && Math.abs(actual.y - target.y) <= 3 && Math.abs(actual.z - target.z) <= 3 && Math.abs(actual.r - target.r) <= 4;
  }

  async function waitWhilePaused() {
    while (automatic.running && automatic.paused && !automatic.stopRequested) await delay(120);
    if (automatic.stopRequested) throw new Error("Ciclo interrompido pelo operador.");
  }

  async function waitMotion(target) {
    const deadline = Date.now() + 18000;
    while (Date.now() < deadline) {
      if (automatic.stopRequested) throw new Error("Ciclo interrompido pelo operador.");
      const actual = await refreshDiagnosticPose();
      if (reachedTarget(actual, target)) return;
      await delay(120);
    }
    throw new Error("O Dobot não confirmou a posição de destino dentro do tempo esperado.");
  }

  async function moveAutomatic(point, speed) {
    const target = taughtPoints[point];
    if (!target) throw new Error(`${point} ainda não foi ensinado.`);
    await waitWhilePaused();
    const queued = await sendCommand("DOBOT_PTP", { ...target, velocidade: speed }, { silent: true });
    await waitCommandCompletion(queued?.comando?.id, 40000);
    // O ACK pode chegar alguns milissegundos antes da telemetria com a nova pose.
    // Aguarda a pose real em vez de rejeitar o ciclo usando a leitura anterior.
    await waitMotion(target);
  }

  async function automaticCommand(command) {
    await waitWhilePaused();
    const queued = await sendCommand(command, {}, { silent: true });
    await waitCommandCompletion(queued?.comando?.id, 20000);
    // Tempo curto para a peça aderir/soltar antes do próximo deslocamento.
    await delay(250);
  }

  async function capturePoint(point) {
    try {
      if (automatic.running) throw new Error("Pare o ciclo antes de ensinar posições.");
      // Consulta o backend imediatamente para nunca salvar uma pose antiga.
      const pose = await refreshDiagnosticPose();
      if (!pose) throw new Error("A posição atual do Dobot ainda não está disponível.");
      const duplicate = duplicatedPoint(point, pose);
      if (duplicate) throw new Error(`${point} está praticamente igual a ${duplicate}. Mova fisicamente o braço e capture novamente.`);
      const previous = taughtPoints[point] ? { ...taughtPoints[point] } : null;
      taughtPoints[point] = { ...pose };
      saveTaughtPoints();
      updateAutoUi({ status: `${point} • ${POINT_LABELS[point]} sincronizando…` });
      try {
        await persistSharedAutomatic();
      } catch (error) {
        if (previous) taughtPoints[point] = previous;
        else delete taughtPoints[point];
        saveTaughtPoints();
        throw error;
      }
      updateAutoUi({ status: `${point} • ${POINT_LABELS[point]} ensinado e sincronizado` });
      window.SteelUI?.toast?.({ tipo: "success", titulo: `${point} capturado`, mensagem: `X ${n(pose.x, 1)} / Y ${n(pose.y, 1)} / Z ${n(pose.z, 1)} / R ${n(pose.r, 1)}` });
    } catch (error) {
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Ensino do ciclo", mensagem: error.message });
    }
  }

  const cycleSteps = [
    { label: "Aguardar na posição segura", action: (speed) => moveAutomatic("P0", speed) },
    { label: "Aproximar da matéria-prima", action: (speed) => moveAutomatic("P1", speed) },
    { label: "Coletar componente", action: (speed) => moveAutomatic("P2", speed) },
    { label: "Fixar componente • Ventosa ON", action: () => automaticCommand("DOBOT_SUCTION_ON") },
    { label: "Elevar componente", action: (speed) => moveAutomatic("P1", speed) },
    { label: "Transportar para montagem", action: (speed) => moveAutomatic("P3", speed) },
    { label: "Posicionar produto", action: (speed) => moveAutomatic("P4", speed) },
    { label: "Liberar produto • Ventosa OFF", action: () => automaticCommand("DOBOT_SUCTION_OFF") },
    { label: "Recuar da estação", action: (speed) => moveAutomatic("P3", speed) },
    { label: "Retornar à espera", action: (speed) => moveAutomatic("P0", speed) }
  ];

  async function startAutomatic() {
    if (automatic.running) return;
    const missing = POINTS.filter(point => !taughtPoints[point]);
    if (missing.length) {
      window.SteelUI?.toast?.({ tipo: "warning", titulo: "Ensine os pontos", mensagem: `Faltam: ${missing.join(", ")}. Posicione o robô e use Capturar atual.` });
      return;
    }
    const duplicates = duplicatedPairs();
    if (duplicates.length) {
      window.SteelUI?.toast?.({ tipo: "warning", titulo: "Pontos repetidos", mensagem: `${duplicates.join(", ")} possuem a mesma posição. Mova o braço e capture novamente antes de iniciar.` });
      return;
    }
    const total = Math.max(1, Math.min(20, Number(dom.autoCycles?.value) || 1));
    const speed = Math.max(1, Math.min(40, Number(dom.autoSpeed?.value) || 15));
    try {
      await persistSharedAutomatic();
    } catch (error) {
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Sincronização do automático", mensagem: error.message });
      return;
    }
    let started;
    try {
      started = await controlAutomatic("INICIAR");
    } catch (error) {
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Iniciar automático", mensagem: error.message });
      return;
    }
    automatic = {
      running: true,
      paused: false,
      stopRequested: false,
      completed: 0,
      total,
      executionId: started?.automatico?.execucaoId || null,
      localExecutor: true
    };
    setControlMode("automatic");
    updateAutoUi({ status: "Ciclo em execução", step: "Preparando sequência", progress: 0 });
    try {
      for (let cycle = 0; cycle < total; cycle += 1) {
        for (let index = 0; index < cycleSteps.length; index += 1) {
          if (automatic.stopRequested) throw new Error("Ciclo interrompido pelo operador.");
          await waitWhilePaused();
          const step = cycleSteps[index];
          const overallIndex = cycle * cycleSteps.length + index;
          const progress = (overallIndex / (total * cycleSteps.length)) * 100;
          updateAutoUi({ status: `Ciclo ${cycle + 1} de ${total}`, step: step.label, progress });
          await controlAutomatic("PROGRESSO", {
            execucaoId: automatic.executionId,
            cicloAtual: cycle + 1,
            etapaAtual: index + 1,
            etapa: step.label,
            progresso: progress
          });
          await step.action(speed);
        }
        automatic.completed = cycle + 1;
        updateAutoUi({ status: `Ciclo ${automatic.completed} concluído`, step: "Peça posicionada", progress: (automatic.completed / total) * 100 });
      }
      await controlAutomatic("CONCLUIR", { execucaoId: automatic.executionId });
      window.SteelUI?.toast?.({ tipo: "success", titulo: "Automático concluído", mensagem: `${automatic.completed} ciclo(s) executado(s) com sucesso.` });
      updateAutoUi({ status: "Sequência concluída", step: "Pronto para novo ciclo", progress: 100 });
    } catch (error) {
      if (!automatic.stopRequested) {
        try { await sendCommand("DOBOT_STOP", {}, { silent: true }); } catch (_) {}
        try {
          await controlAutomatic("FALHAR", {
            execucaoId: automatic.executionId,
            erro: error.message
          });
        } catch (_) {}
        window.SteelUI?.toast?.({ tipo: "error", titulo: "Ciclo automático interrompido", mensagem: error.message });
        updateAutoUi({ status: "Ciclo interrompido", step: error.message });
      } else {
        updateAutoUi({ status: "Parado pelo operador", step: "Movimento interrompido" });
      }
    } finally {
      automatic.running = false;
      automatic.paused = false;
      automatic.stopRequested = false;
      automatic.localExecutor = false;
      updateAutoUi();
    }
  }

  async function stopAutomatic() {
    if (!automatic.running) return;
    automatic.stopRequested = true;
    automatic.paused = false;
    updateAutoUi({ status: "Parando", step: "Enviando DOBOT_STOP" });
    try {
      await controlAutomatic("PARAR", { execucaoId: automatic.executionId });
    } catch (error) {
      try { await sendCommand("DOBOT_STOP", {}, { silent: true }); } catch (_) {}
      window.SteelUI?.toast?.({ tipo: "error", titulo: "PARAR", mensagem: error.message });
    }
  }

  async function togglePause() {
    if (!automatic.running) return;
    const nextPaused = !automatic.paused;
    try {
      await controlAutomatic(nextPaused ? "PAUSAR" : "CONTINUAR", {
        execucaoId: automatic.executionId
      });
      automatic.paused = nextPaused;
      updateAutoUi({ status: automatic.paused ? "Pausado após a etapa atual" : "Ciclo retomado", step: automatic.paused ? "Aguardando operador" : "Retomando sequência" });
    } catch (error) {
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Controle automático", mensagem: error.message });
    }
  }

  document.querySelectorAll("[data-dobot-command]").forEach(button => button.addEventListener("click", async () => {
    const commandName = button.dataset.dobotCommand;
    if (automatic.running && commandName !== "DOBOT_STOP") {
      window.SteelUI?.toast?.({ tipo: "warning", titulo: "Manual intertravado", mensagem: "Pare o ciclo automático antes de enviar comandos manuais." });
      return;
    }
    if (commandName === "DOBOT_STOP" && automatic.running) automatic.stopRequested = true;
    await manualCommand(commandName);
  }));

  document.querySelectorAll("[data-dobot-jog]").forEach(button => {
    let handledByPointer = false;
    button.addEventListener("pointerdown", event => {
      if (button.disabled) return;
      event.preventDefault();
      handledByPointer = true;
      button.setPointerCapture?.(event.pointerId);
      startJogHold(button.dataset.dobotJog);
    });
    button.addEventListener("pointerup", () => {
      stopJogHold();
      window.setTimeout(() => { handledByPointer = false; }, 0);
    });
    button.addEventListener("pointercancel", () => {
      stopJogHold();
      handledByPointer = false;
    });
    button.addEventListener("lostpointercapture", stopJogHold);
    button.addEventListener("click", event => {
      event.preventDefault();
      if (handledByPointer) {
        handledByPointer = false;
        return;
      }
      jog(button.dataset.dobotJog);
    });
  });
  window.addEventListener("blur", stopJogHold);
  dom.jogSpeed?.addEventListener("input", () => { if (dom.jogSpeedValue) dom.jogSpeedValue.textContent = `${dom.jogSpeed.value}%`; });

  dom.manualMode?.addEventListener("click", async () => {
    if (automatic.running) await stopAutomatic();
    setControlMode("manual");
  });
  dom.automaticMode?.addEventListener("click", () => setControlMode("automatic"));
  document.querySelectorAll("[data-dobot-capture]").forEach(button => button.addEventListener("click", () => capturePoint(button.dataset.dobotCapture)));
  dom.autoStart?.addEventListener("click", startAutomatic);
  dom.autoPause?.addEventListener("click", () => { togglePause(); });
  dom.autoStop?.addEventListener("click", stopAutomatic);
  dom.autoReset?.addEventListener("click", async () => {
    if (automatic.running) return;
    const previous = Object.fromEntries(Object.entries(taughtPoints).map(([point, pose]) => [point, { ...pose }]));
    taughtPoints = {};
    saveTaughtPoints();
    updateAutoUi({ status: "Sincronizando redefinição…", step: "Removendo P0 a P4 do desktop e do mobile", progress: 0 });
    try {
      await persistSharedAutomatic();
      updateAutoUi({ status: "Pronto para ensinar", step: "Capture P0 a P4 em posições reais diferentes", progress: 0 });
    } catch (error) {
      taughtPoints = previous;
      saveTaughtPoints();
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Redefinir pontos", mensagem: error.message });
    }
  });
  dom.autoCycles?.addEventListener("input", () => { automatic.total = Math.max(1, Math.min(20, Number(dom.autoCycles.value) || 1)); updateAutoUi(); });
  dom.autoCycles?.addEventListener("change", async () => {
    try { await persistSharedAutomatic(); } catch (error) {
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Sincronização do automático", mensagem: error.message });
    }
  });
  dom.autoSpeed?.addEventListener("change", async () => {
    try { await persistSharedAutomatic(); } catch (error) {
      window.SteelUI?.toast?.({ tipo: "error", titulo: "Sincronização do automático", mensagem: error.message });
    }
  });

  window.addEventListener("steelcontrol:machine-diagnostic", event => {
    diagnostic = { ...(diagnostic || {}), ...(event.detail || {}) };
    applySharedAutomatic(diagnostic);
    render(diagnostic?.dadosExtras);
  });
  window.addEventListener("steelcontrol:machine-snapshot", event => {
    machine = { ...(machine || {}), ...(event.detail || {}) };
    applySharedAutomatic(machine);
    openDedicatedView();
    render(event.detail?.dadosExtras);
  });
  window.addEventListener("steelcontrol:dobot-automatic", event => {
    const detail = event.detail || {};
    if (detail.integracaoMeta && machine) {
      machine = { ...machine, integracaoMeta: detail.integracaoMeta };
    }
    applySharedAutomatic(detail);
  });

  renderTaughtPoints();
  updateAutoUi();
  setControlMode("manual");
  load();
  setInterval(load, 2000);
})();
