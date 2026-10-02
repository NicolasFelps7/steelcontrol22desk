(() => {
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const present = value => value !== null && value !== undefined && String(value).trim() !== "";
  const number = value => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
  const readPath = (source, path) => String(path || "").split(".").filter(Boolean).reduce((current, key) => current && typeof current === "object" ? current[key] : undefined, source);

  function context(machine, diagnostic) {
    const telemetry = object(diagnostic?.dadosExtras || machine?.dadosExtrasAtuais || machine?.dadosExtras);
    const meta = object(machine?.integracaoMeta || diagnostic?.integracaoMeta);
    return {
      machine: object(machine), diagnostic: object(diagnostic), telemetry, meta,
      first(paths, fallback = null) {
        for (const path of paths) {
          const live = readPath(telemetry, path);
          if (present(live)) return live;
        }
        return fallback;
      },
      numeric(paths, fallback = null) {
        return number(this.first(paths, fallback));
      }
    };
  }

  function percent(value) {
    const parsed = number(value);
    if (parsed === null) return null;
    return parsed >= 0 && parsed <= 1 ? parsed * 100 : parsed;
  }

  function oee(ctx) {
    const direct = percent(ctx.first(["kpi.oee", "oee.value", "oee"]));
    if (direct !== null) return direct;
    const availability = percent(ctx.first(["kpi.availability", "oee.availability", "availability"]));
    const performance = percent(ctx.first(["kpi.performance", "oee.performance", "performance"]));
    const quality = percent(ctx.first(["kpi.quality", "oee.quality", "quality"]));
    return availability === null || performance === null || quality === null ? null : availability * performance * quality / 10000;
  }

  const metric = (label, value, unit, icon, tone = "neutral", caption = "", boolLabels = null) => ({ label, value, unit, icon, tone, caption, boolLabels });

  function defaultSections(ctx) {
    const machine = ctx.machine;
    const diagnostic = ctx.diagnostic;
    const availability = percent(ctx.first(["kpi.availability", "oee.availability", "availability"]));
    const performance = percent(ctx.first(["kpi.performance", "oee.performance", "performance"]));
    const quality = percent(ctx.first(["kpi.quality", "oee.quality", "quality"]));
    return [
      {
        title: "Eficiência e OEE", caption: "Disponibilidade, desempenho, qualidade e ciclo.", icon: "fa-gauge-high", tone: "accent",
        metrics: [
          metric("OEE", oee(ctx), "%", "fa-chart-pie", "accent", "Eficiência global"),
          metric("Disponibilidade", availability, "%", "fa-clock", "success"),
          metric("Desempenho", performance, "%", "fa-arrow-trend-up", "neutral"),
          metric("Qualidade", quality, "%", "fa-circle-check", "success"),
          metric("Ciclo real", ctx.first(["kpi.cycleTimeSec", "cycleTimeSec", "cycle.timeSec", "hmi.cycleTimeSec"]), "s", "fa-stopwatch", "neutral"),
          metric("Ciclo planejado", ctx.first(["kpi.targetCycleTimeSec", "targetCycleTimeSec", "cycle.targetSec"]), "s", "fa-flag-checkered", "warning")
        ]
      },
      {
        title: "Produção e qualidade", caption: "Ordem, lote, receita, peças boas e refugos.", icon: "fa-industry", tone: "success",
        metrics: [
          metric("Peças boas", ctx.first(["quality.goodCount", "production.good", "goodParts"]), "un.", "fa-circle-check", "success"),
          metric("Refugos", ctx.first(["quality.rejectCount", "production.rejects", "rejects", "scrapCount"]), "un.", "fa-circle-xmark", "danger"),
          metric("Ordem de produção", ctx.first(["production.workOrder", "workOrder", "order.id"]), "", "fa-clipboard-list"),
          metric("Lote", ctx.first(["production.batch", "batch", "lot"]), "", "fa-qrcode"),
          metric("Receita / programa", ctx.first(["production.recipe", "recipe", "program", "cnc.program"]), "", "fa-file-lines")
        ]
      },
      {
        title: "Segurança e processo", caption: "Estados informados pela máquina e intertravamentos.", icon: "fa-shield-halved", tone: "danger",
        metrics: [
          metric("Circuito E-stop", ctx.first(["safety.estopOk", "hmi.interlocks.estopOk"]), "", "fa-hand", "danger", "", ["OK", "BLOQUEADO"]),
          metric("Portas / proteções", ctx.first(["safety.doorClosed", "hmi.interlocks.doorClosed"]), "", "fa-door-closed", "warning", "", ["FECHADAS", "ABERTAS"]),
          metric("Permissão de START", ctx.first(["safety.startPermit", "hmi.interlocks.startAllowed"]), "", "fa-circle-play", "success", "", ["LIBERADA", "BLOQUEADA"]),
          metric("Modo operacional", ctx.first(["operation.mode", "mode", "hmi.mode", "robot.mode", "dobot.mode"]), "", "fa-sliders"),
          metric("Alarmes do processo", ctx.first(["alarms.activeCount", "alarmCount", "alarmsActive"]), "", "fa-triangle-exclamation", "warning")
        ]
      },
      {
        title: "Manutenção e confiabilidade", caption: "Horas, MTBF, MTTR, ferramenta e preventivas.", icon: "fa-screwdriver-wrench", tone: "warning",
        metrics: [
          metric("Horas de operação", ctx.first(["maintenance.runtimeHours", "runtimeHours", "operatingHours"]), "h", "fa-clock-rotate-left"),
          metric("MTBF", ctx.first(["maintenance.mtbfHours", "mtbfHours", "mtbf"]), "h", "fa-wave-square", "success"),
          metric("MTTR", ctx.first(["maintenance.mttrMinutes", "mttrMinutes", "mttr"]), "min", "fa-wrench", "warning"),
          metric("Vida da ferramenta", ctx.first(["maintenance.toolLifePercent", "tool.lifePercent", "toolLife"]), "%", "fa-gears", "warning"),
        ]
      },
      {
        title: "Energia e conectividade", caption: "Utilidades, consumo e qualidade da comunicação.", icon: "fa-bolt", tone: "neutral",
        metrics: [
          metric("Potência instantânea", ctx.first(["energy.powerKw", "powerKw", "utilities.powerKw"]), "kW", "fa-plug", "accent"),
          metric("Energia acumulada", ctx.first(["energy.totalKwh", "totalKwh", "utilities.energyKwh"]), "kWh", "fa-chart-line"),
          metric("Ar comprimido", ctx.first(["utilities.airPressureBar", "air.pressureBar", "airPressure"]), "bar", "fa-wind")
        ]
      }
    ];
  }

  function customSections(ctx) {
    const sections = object(ctx.meta.dashboard).sections;
    if (!Array.isArray(sections)) return [];
    return sections.map(section => {
      const metrics = Array.isArray(section?.metrics) ? section.metrics.map(item => {
        const paths = Array.isArray(item?.paths) ? item.paths : [item?.path].filter(Boolean);
        return metric(item?.label || "Indicador", ctx.first(paths), item?.unit || "", iconName(item?.icon), "accent", item?.caption || "");
      }) : [];
      return { title: section?.title || "Indicadores personalizados", caption: section?.caption || "Dados específicos do equipamento.", icon: iconName(section?.icon), tone: "accent", metrics };
    }).filter(section => section.metrics.length);
  }

  function iconName(name) {
    const map = { temperature: "fa-temperature-half", thermostat: "fa-temperature-half", vibration: "fa-wave-square", energy: "fa-bolt", bolt: "fa-bolt", production: "fa-boxes-stacked", inventory: "fa-boxes-stacked", safety: "fa-shield-halved", shield: "fa-shield-halved", maintenance: "fa-screwdriver-wrench", build: "fa-screwdriver-wrench", network: "fa-signal", wifi: "fa-wifi", speed: "fa-gauge-high", gauge: "fa-gauge-high" };
    return map[String(name || "").toLowerCase()] || "fa-chart-line";
  }

  function format(metric) {
    if (!present(metric.value)) return "Não informado";
    if (typeof metric.value === "boolean") return metric.value ? metric.boolLabels?.[0] || "ATIVO" : metric.boolLabels?.[1] || "NORMAL";
    const parsed = number(metric.value);
    const value = parsed === null ? String(metric.value) : parsed.toLocaleString("pt-BR", { maximumFractionDigits: parsed % 1 === 0 ? 0 : 1 });
    return `${value}${metric.unit ? ` ${metric.unit}` : ""}`;
  }

  function renderMetric(item) {
    const available = present(item.value);
    return `<article class="industrial-kpi ${available ? "available" : "missing"} tone-${escapeHtml(item.tone)}">
      <span class="industrial-kpi-icon"><i class="fa-solid ${escapeHtml(item.icon)}"></i></span>
      <span class="industrial-kpi-copy"><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(format(item))}</strong>${item.caption ? `<em>${escapeHtml(item.caption)}</em>` : ""}</span>
    </article>`;
  }

  function render(container, machine, diagnostic = {}) {
    if (!container || !machine) return;
    const currentDashboard = container.querySelector(".industrial-dynamic-dashboard");
    const dashboardWasOpen = currentDashboard?.open === true;
    const openSections = new Set(
      [...(currentDashboard?.querySelectorAll(".industrial-section[open]") || [])]
        .map(section => section.dataset.section)
        .filter(Boolean)
    );
    const ctx = context(machine, diagnostic);
    const sections = [...defaultSections(ctx), ...customSections(ctx)]
      .map(section => ({ ...section, metrics: section.metrics.filter(item => present(item.value)) }))
      .filter(section => section.metrics.length);
    const all = sections.flatMap(section => section.metrics);
    if (!all.length) {
      container.replaceChildren();
      return;
    }
    container.innerHTML = `<details class="industrial-dynamic-dashboard" ${dashboardWasOpen ? "open" : ""}>
      <summary class="industrial-dynamic-head">
        <span class="industrial-dynamic-icon"><i class="fa-solid fa-table-cells-large"></i></span>
        <div><span>TELEMETRIA COMPLEMENTAR</span><h3>Indicadores avançados</h3><p>${all.length} sinais reais recebidos do Edge ou controlador.</p></div>
        <i class="fa-solid fa-chevron-down industrial-dynamic-chevron"></i>
      </summary>
      <div class="industrial-dynamic-guide"><i class="fa-solid fa-circle-info"></i><span>Este painel é somente de leitura. Ele organiza dados extras enviados pela máquina; não movimenta nem configura o equipamento.</span></div>
      <div class="industrial-sections">${sections.map((section, index) => `<details class="industrial-section tone-${escapeHtml(section.tone)}" data-section="${escapeHtml(section.title)}" ${openSections.has(section.title) || (!currentDashboard && index === 0) ? "open" : ""}>
        <summary><span class="industrial-section-icon"><i class="fa-solid ${escapeHtml(section.icon)}"></i></span><span><strong>${escapeHtml(section.title)}</strong><small>${escapeHtml(section.caption)}</small></span><i class="fa-solid fa-chevron-down"></i></summary>
        <div class="industrial-kpi-grid">${section.metrics.map(renderMetric).join("")}</div>
      </details>`).join("")}</div>
    </details>`;
  }

  window.SteelIndustrialDashboard = { render };
})();
