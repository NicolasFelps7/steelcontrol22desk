(() => {
  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const object = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const present = value => value !== null && value !== undefined && String(value).trim() !== "";
  const number = value => { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; };
  const readPath = (source, path) => String(path || "").split(".").filter(Boolean).reduce((current, key) => current && typeof current === "object" ? current[key] : undefined, source);

  const translations = {
    en: {
      "Eficiência e OEE": "Efficiency and OEE", "Disponibilidade, desempenho, qualidade e ciclo.": "Availability, performance, quality and cycle.",
      "Eficiência global": "Overall efficiency", "Disponibilidade": "Availability", "Desempenho": "Performance", "Qualidade": "Quality",
      "Ciclo real": "Actual cycle", "Ciclo planejado": "Target cycle", "Produção e qualidade": "Production and quality",
      "Ordem, lote, receita, peças boas e refugos.": "Work order, batch, recipe, good parts and rejects.", "Peças boas": "Good parts", "Refugos": "Rejects",
      "Ordem de produção": "Work order", "Lote": "Batch", "Receita / programa": "Recipe / program", "Segurança e processo": "Safety and process",
      "Estados informados pela máquina e intertravamentos.": "Machine states and interlocks.", "Circuito E-stop": "E-stop circuit", "Portas / proteções": "Doors / guards",
      "Permissão de START": "START permission", "Modo operacional": "Operating mode", "Alarmes do processo": "Process alarms",
      "Manutenção e confiabilidade": "Maintenance and reliability", "Horas, MTBF, MTTR, ferramenta e preventivas.": "Hours, MTBF, MTTR, tool life and preventive maintenance.",
      "Horas de operação": "Operating hours", "Vida da ferramenta": "Tool life", "Energia e conectividade": "Energy and connectivity",
      "Utilidades, consumo e qualidade da comunicação.": "Utilities, consumption and communication quality.", "Potência instantânea": "Instant power",
      "Energia acumulada": "Accumulated energy", "Ar comprimido": "Compressed air", "Não informado": "Not reported", "ATIVO": "ACTIVE", "NORMAL": "NORMAL",
      "OK": "OK", "BLOQUEADO": "BLOCKED", "FECHADAS": "CLOSED", "ABERTAS": "OPEN", "LIBERADA": "ALLOWED",
      "Painel configurado para esta máquina": "Indicators configured for this machine", "TELEMETRIA INDUSTRIAL": "INDUSTRIAL TELEMETRY",
      "SINAIS ATIVOS": "LIVE SIGNALS", "Como este painel funciona": "How this dashboard works",
      "1. Você escolhe os módulos no cadastro da máquina.": "1. You choose the modules in the machine settings.",
      "2. O Edge publica a telemetria real.": "2. Edge publishes real telemetry.",
      "3. Os valores aparecem aqui automaticamente.": "3. Values appear here automatically.",
      "Sem valor significa que o Edge ainda não enviou esse sinal.": "A missing value means Edge has not sent that signal yet.",
      "Indicadores personalizados": "Custom indicators", "Dados específicos do equipamento.": "Equipment-specific data.", "Indicador": "Indicator"
    },
    es: {
      "Eficiência e OEE": "Eficiencia y OEE", "Disponibilidade, desempenho, qualidade e ciclo.": "Disponibilidad, rendimiento, calidad y ciclo.", "Eficiência global": "Eficiencia global",
      "Disponibilidade": "Disponibilidad", "Desempenho": "Rendimiento", "Qualidade": "Calidad", "Ciclo real": "Ciclo real", "Ciclo planejado": "Ciclo previsto",
      "Produção e qualidade": "Producción y calidad", "Ordem, lote, receita, peças boas e refugos.": "Orden, lote, receta, piezas buenas y rechazos.", "Peças boas": "Piezas buenas", "Refugos": "Rechazos",
      "Ordem de produção": "Orden de producción", "Lote": "Lote", "Receita / programa": "Receta / programa", "Segurança e processo": "Seguridad y proceso",
      "Estados informados pela máquina e intertravamentos.": "Estados de la máquina e interbloqueos.", "Circuito E-stop": "Circuito de parada de emergencia", "Portas / proteções": "Puertas / protecciones",
      "Permissão de START": "Permiso de INICIO", "Modo operacional": "Modo operativo", "Alarmes do processo": "Alarmas del proceso", "Manutenção e confiabilidade": "Mantenimiento y confiabilidad",
      "Horas, MTBF, MTTR, ferramenta e preventivas.": "Horas, MTBF, MTTR, herramienta y preventivos.", "Horas de operação": "Horas de operación", "Vida da ferramenta": "Vida de la herramienta",
      "Energia e conectividade": "Energía y conectividad", "Utilidades, consumo e qualidade da comunicação.": "Servicios, consumo y calidad de comunicación.", "Potência instantânea": "Potencia instantánea",
      "Energia acumulada": "Energía acumulada", "Ar comprimido": "Aire comprimido", "Não informado": "No informado", "ATIVO": "ACTIVO", "NORMAL": "NORMAL", "BLOQUEADO": "BLOQUEADO",
      "FECHADAS": "CERRADAS", "ABERTAS": "ABIERTAS", "LIBERADA": "PERMITIDO", "Painel configurado para esta máquina": "Indicadores configurados para esta máquina", "TELEMETRIA INDUSTRIAL": "TELEMETRÍA INDUSTRIAL",
      "SINAIS ATIVOS": "SEÑALES ACTIVAS", "Como este painel funciona": "Cómo funciona este panel", "1. Você escolhe os módulos no cadastro da máquina.": "1. Elija los módulos en la configuración de la máquina.",
      "2. O Edge publica a telemetria real.": "2. Edge publica la telemetría real.", "3. Os valores aparecem aqui automaticamente.": "3. Los valores aparecen aquí automáticamente.",
      "Sem valor significa que o Edge ainda não enviou esse sinal.": "Sin valor significa que Edge aún no envió esa señal.",
      "Indicadores personalizados": "Indicadores personalizados", "Dados específicos do equipamento.": "Datos específicos del equipo.", "Indicador": "Indicador"
    },
    fr: {
      "Eficiência e OEE": "Efficacité et OEE", "Disponibilidade, desempenho, qualidade e ciclo.": "Disponibilité, performance, qualité et cycle.", "Eficiência global": "Efficacité globale", "Disponibilidade": "Disponibilité",
      "Desempenho": "Performance", "Qualidade": "Qualité", "Ciclo real": "Cycle réel", "Ciclo planejado": "Cycle prévu", "Produção e qualidade": "Production et qualité",
      "Ordem, lote, receita, peças boas e refugos.": "Ordre, lot, recette, bonnes pièces et rebuts.", "Peças boas": "Bonnes pièces", "Refugos": "Rebuts", "Ordem de produção": "Ordre de fabrication",
      "Lote": "Lot", "Receita / programa": "Recette / programme", "Segurança e processo": "Sécurité et processus", "Estados informados pela máquina e intertravamentos.": "États machine et interverrouillages.",
      "Circuito E-stop": "Circuit d'arrêt d'urgence", "Portas / proteções": "Portes / protections", "Permissão de START": "Autorisation START", "Modo operacional": "Mode opératoire", "Alarmes do processo": "Alarmes processus",
      "Manutenção e confiabilidade": "Maintenance et fiabilité", "Horas, MTBF, MTTR, ferramenta e preventivas.": "Heures, MTBF, MTTR, outil et préventif.", "Horas de operação": "Heures de fonctionnement", "Vida da ferramenta": "Durée de vie de l'outil",
      "Energia e conectividade": "Énergie et connectivité", "Utilidades, consumo e qualidade da comunicação.": "Utilités, consommation et qualité de communication.", "Potência instantânea": "Puissance instantanée", "Energia acumulada": "Énergie cumulée",
      "Ar comprimido": "Air comprimé", "Não informado": "Non renseigné", "ATIVO": "ACTIF", "NORMAL": "NORMAL", "BLOQUEADO": "BLOQUÉ", "FECHADAS": "FERMÉES", "ABERTAS": "OUVERTES", "LIBERADA": "AUTORISÉE",
      "Painel configurado para esta máquina": "Indicateurs configurés pour cette machine", "TELEMETRIA INDUSTRIAL": "TÉLÉMÉTRIE INDUSTRIELLE", "SINAIS ATIVOS": "SIGNAUX ACTIFS", "Como este painel funciona": "Fonctionnement de ce tableau",
      "1. Você escolhe os módulos no cadastro da máquina.": "1. Choisissez les modules dans les paramètres de la machine.", "2. O Edge publica a telemetria real.": "2. Edge publie la télémétrie réelle.",
      "3. Os valores aparecem aqui automaticamente.": "3. Les valeurs apparaissent ici automatiquement.", "Sem valor significa que o Edge ainda não enviou esse sinal.": "Une valeur absente signifie qu'Edge n'a pas encore envoyé ce signal.",
      "Indicadores personalizados": "Indicateurs personnalisés", "Dados específicos do equipamento.": "Données propres à l'équipement.", "Indicador": "Indicateur"
    },
    de: {
      "Eficiência e OEE": "Effizienz und OEE", "Disponibilidade, desempenho, qualidade e ciclo.": "Verfügbarkeit, Leistung, Qualität und Zyklus.", "Eficiência global": "Gesamteffizienz", "Disponibilidade": "Verfügbarkeit", "Desempenho": "Leistung", "Qualidade": "Qualität",
      "Ciclo real": "Ist-Zyklus", "Ciclo planejado": "Soll-Zyklus", "Produção e qualidade": "Produktion und Qualität", "Ordem, lote, receita, peças boas e refugos.": "Auftrag, Charge, Rezept, Gutteile und Ausschuss.", "Peças boas": "Gutteile", "Refugos": "Ausschuss",
      "Ordem de produção": "Produktionsauftrag", "Lote": "Charge", "Receita / programa": "Rezept / Programm", "Segurança e processo": "Sicherheit und Prozess", "Estados informados pela máquina e intertravamentos.": "Maschinenzustände und Verriegelungen.",
      "Circuito E-stop": "Not-Halt-Kreis", "Portas / proteções": "Türen / Schutzeinrichtungen", "Permissão de START": "START-Freigabe", "Modo operacional": "Betriebsart", "Alarmes do processo": "Prozessalarme", "Manutenção e confiabilidade": "Wartung und Zuverlässigkeit",
      "Horas, MTBF, MTTR, ferramenta e preventivas.": "Stunden, MTBF, MTTR, Werkzeug und Prävention.", "Horas de operação": "Betriebsstunden", "Vida da ferramenta": "Werkzeugstandzeit", "Energia e conectividade": "Energie und Konnektivität",
      "Utilidades, consumo e qualidade da comunicação.": "Medien, Verbrauch und Kommunikationsqualität.", "Potência instantânea": "Momentanleistung", "Energia acumulada": "Gesamtenergie", "Ar comprimido": "Druckluft", "Não informado": "Nicht gemeldet",
      "ATIVO": "AKTIV", "NORMAL": "NORMAL", "BLOQUEADO": "GESPERRT", "FECHADAS": "GESCHLOSSEN", "ABERTAS": "OFFEN", "LIBERADA": "FREIGEGEBEN", "Painel configurado para esta máquina": "Für diese Maschine konfigurierte Anzeigen",
      "TELEMETRIA INDUSTRIAL": "INDUSTRIETELEMETRIE", "SINAIS ATIVOS": "AKTIVE SIGNALE", "Como este painel funciona": "So funktioniert dieses Dashboard", "1. Você escolhe os módulos no cadastro da máquina.": "1. Wählen Sie Module in den Maschineneinstellungen.",
      "2. O Edge publica a telemetria real.": "2. Edge veröffentlicht reale Telemetrie.", "3. Os valores aparecem aqui automaticamente.": "3. Die Werte erscheinen hier automatisch.", "Sem valor significa que o Edge ainda não enviou esse sinal.": "Ein fehlender Wert bedeutet, dass Edge dieses Signal noch nicht gesendet hat.",
      "Indicadores personalizados": "Benutzerdefinierte Anzeigen", "Dados específicos do equipamento.": "Gerätespezifische Daten.", "Indicador": "Anzeige"
    },
    it: {
      "Eficiência e OEE": "Efficienza e OEE", "Disponibilidade, desempenho, qualidade e ciclo.": "Disponibilità, prestazioni, qualità e ciclo.", "Eficiência global": "Efficienza globale", "Disponibilidade": "Disponibilità", "Desempenho": "Prestazioni", "Qualidade": "Qualità",
      "Ciclo real": "Ciclo reale", "Ciclo planejado": "Ciclo previsto", "Produção e qualidade": "Produzione e qualità", "Ordem, lote, receita, peças boas e refugos.": "Ordine, lotto, ricetta, pezzi buoni e scarti.", "Peças boas": "Pezzi buoni", "Refugos": "Scarti",
      "Ordem de produção": "Ordine di produzione", "Lote": "Lotto", "Receita / programa": "Ricetta / programma", "Segurança e processo": "Sicurezza e processo", "Estados informados pela máquina e intertravamentos.": "Stati macchina e interblocchi.",
      "Circuito E-stop": "Circuito arresto di emergenza", "Portas / proteções": "Porte / protezioni", "Permissão de START": "Permesso START", "Modo operacional": "Modalità operativa", "Alarmes do processo": "Allarmi di processo", "Manutenção e confiabilidade": "Manutenzione e affidabilità",
      "Horas, MTBF, MTTR, ferramenta e preventivas.": "Ore, MTBF, MTTR, utensile e preventive.", "Horas de operação": "Ore di funzionamento", "Vida da ferramenta": "Vita utensile", "Energia e conectividade": "Energia e connettività",
      "Utilidades, consumo e qualidade da comunicação.": "Utenze, consumo e qualità della comunicazione.", "Potência instantânea": "Potenza istantanea", "Energia acumulada": "Energia accumulata", "Ar comprimido": "Aria compressa", "Não informado": "Non comunicato",
      "ATIVO": "ATTIVO", "NORMAL": "NORMALE", "BLOQUEADO": "BLOCCATO", "FECHADAS": "CHIUSE", "ABERTAS": "APERTE", "LIBERADA": "CONSENTITO", "Painel configurado para esta máquina": "Indicatori configurati per questa macchina",
      "TELEMETRIA INDUSTRIAL": "TELEMETRIA INDUSTRIALE", "SINAIS ATIVOS": "SEGNALI ATTIVI", "Como este painel funciona": "Come funziona questo pannello", "1. Você escolhe os módulos no cadastro da máquina.": "1. Scegli i moduli nelle impostazioni della macchina.",
      "2. O Edge publica a telemetria real.": "2. Edge pubblica la telemetria reale.", "3. Os valores aparecem aqui automaticamente.": "3. I valori appaiono qui automaticamente.", "Sem valor significa que o Edge ainda não enviou esse sinal.": "Un valore assente significa che Edge non ha ancora inviato quel segnale.",
      "Indicadores personalizados": "Indicatori personalizzati", "Dados específicos do equipamento.": "Dati specifici dell'apparecchiatura.", "Indicador": "Indicatore"
    }
  };

  const language = () => ["pt", "en", "es", "fr", "de", "it"].includes(localStorage.getItem("idiomaSistema")) ? localStorage.getItem("idiomaSistema") : "pt";
  const tr = value => language() === "pt" ? value : translations[language()]?.[value] || value;
  const locale = () => ({ pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", it: "it-IT" })[language()] || "pt-BR";

  function context(machine, diagnostic) {
    const telemetry = object(diagnostic?.dadosExtras || machine?.dadosExtrasAtuais || machine?.dadosExtras);
    const machineMeta = object(machine?.integracaoMeta);
    const diagnosticMeta = object(diagnostic?.integracaoMeta);
    const meta = {
      ...machineMeta,
      ...diagnosticMeta,
      dashboard: {
        ...object(machineMeta.dashboard),
        ...object(diagnosticMeta.dashboard)
      }
    };
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
    ].map(section => ({
      ...section,
      title: tr(section.title),
      caption: tr(section.caption),
      metrics: section.metrics.map(item => ({
        ...item,
        label: tr(item.label),
        caption: tr(item.caption),
        boolLabels: item.boolLabels?.map(tr) || null
      }))
    }));
  }

  function dashboardConfiguration(ctx) {
    const dashboard = object(ctx.meta.dashboard);
    const modules = Array.isArray(dashboard.modules) ? dashboard.modules.map(String) : [];
    return { dashboard, modules, enabled: dashboard.enabled === true && modules.length > 0 };
  }

  function customSections(ctx) {
    const sections = object(ctx.meta.dashboard).sections;
    if (!Array.isArray(sections)) return [];
    return sections.map(section => {
      const metrics = Array.isArray(section?.metrics) ? section.metrics.map(item => {
        const paths = Array.isArray(item?.paths) ? item.paths : [item?.path].filter(Boolean);
        return metric(item?.label || tr("Indicador"), ctx.first(paths), item?.unit || "", iconName(item?.icon), "accent", item?.caption || "");
      }) : [];
      return { title: section?.title || tr("Indicadores personalizados"), caption: section?.caption || tr("Dados específicos do equipamento."), icon: iconName(section?.icon), tone: "accent", metrics };
    }).filter(section => section.metrics.length);
  }

  function iconName(name) {
    const map = { temperature: "fa-temperature-half", thermostat: "fa-temperature-half", vibration: "fa-wave-square", energy: "fa-bolt", bolt: "fa-bolt", production: "fa-boxes-stacked", inventory: "fa-boxes-stacked", safety: "fa-shield-halved", shield: "fa-shield-halved", maintenance: "fa-screwdriver-wrench", build: "fa-screwdriver-wrench", network: "fa-signal", wifi: "fa-wifi", speed: "fa-gauge-high", gauge: "fa-gauge-high" };
    return map[String(name || "").toLowerCase()] || "fa-chart-line";
  }

  function format(metric) {
    if (!present(metric.value)) return tr("Não informado");
    if (typeof metric.value === "boolean") return metric.value ? metric.boolLabels?.[0] || tr("ATIVO") : metric.boolLabels?.[1] || tr("NORMAL");
    const parsed = number(metric.value);
    const value = parsed === null ? String(metric.value) : parsed.toLocaleString(locale(), { maximumFractionDigits: parsed % 1 === 0 ? 0 : 1 });
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
    container.__steelDashboardState = { machine, diagnostic };
    const currentDashboard = container.querySelector(".industrial-dynamic-dashboard");
    const openSections = new Set(
      [...(currentDashboard?.querySelectorAll(".industrial-section[open]") || [])]
        .map(section => section.dataset.section)
        .filter(Boolean)
    );
    const ctx = context(machine, diagnostic);
    const configuration = dashboardConfiguration(ctx);
    if (!configuration.enabled) {
      container.replaceChildren();
      return;
    }
    const defaults = defaultSections(ctx);
    const moduleOrder = ["efficiency", "production", "safety", "maintenance", "energy"];
    const selectedDefaults = defaults.filter((_, index) => configuration.modules.includes(moduleOrder[index]));
    const sections = [...selectedDefaults, ...customSections(ctx)]
      .filter(section => section.metrics.length);
    const all = sections.flatMap(section => section.metrics);
    if (!all.length) {
      container.replaceChildren();
      return;
    }
    const activeCount = all.filter(item => present(item.value)).length;
    const coverageTone = activeCount === all.length ? "good" : activeCount > 0 ? "medium" : "";
    container.innerHTML = `<section class="industrial-dynamic-dashboard">
      <header class="industrial-dynamic-head">
        <span class="industrial-dynamic-icon"><i class="fa-solid fa-table-cells-large"></i></span>
        <div><span>${escapeHtml(tr(configuration.dashboard.machineType || configuration.dashboard.profile || "TELEMETRIA INDUSTRIAL"))}</span><h3>${escapeHtml(tr("Painel configurado para esta máquina"))}</h3><p>${escapeHtml(tr("Como este painel funciona"))}</p></div>
        <span class="industrial-coverage ${coverageTone}"><b>${activeCount}/${all.length}</b><small>${escapeHtml(tr("SINAIS ATIVOS"))}</small></span>
      </header>
      <div class="industrial-dynamic-guide"><i class="fa-solid fa-circle-info"></i><div><strong>${escapeHtml(tr("Como este painel funciona"))}</strong><ol><li>${escapeHtml(tr("1. Você escolhe os módulos no cadastro da máquina."))}</li><li>${escapeHtml(tr("2. O Edge publica a telemetria real."))}</li><li>${escapeHtml(tr("3. Os valores aparecem aqui automaticamente."))}</li></ol><small>${escapeHtml(tr("Sem valor significa que o Edge ainda não enviou esse sinal."))}</small></div></div>
      <div class="industrial-sections">${sections.map((section, index) => `<details class="industrial-section tone-${escapeHtml(section.tone)}" data-section="${escapeHtml(section.title)}" ${openSections.has(section.title) || (!currentDashboard && index === 0) ? "open" : ""}>
        <summary><span class="industrial-section-icon"><i class="fa-solid ${escapeHtml(section.icon)}"></i></span><span><strong>${escapeHtml(section.title)}</strong><small>${escapeHtml(section.caption)}</small></span><i class="fa-solid fa-chevron-down"></i></summary>
        <div class="industrial-kpi-grid">${section.metrics.map(renderMetric).join("")}</div>
      </details>`).join("")}</div>
    </section>`;
  }

  window.SteelIndustrialDashboard = { render };
  window.addEventListener("idiomaAplicado", () => {
    document.querySelectorAll(".industrial-dynamic-mount").forEach(container => {
      const state = container.__steelDashboardState;
      if (state) render(container, state.machine, state.diagnostic);
    });
  });
})();
