(async () => {
  const host = document.createElement("section");
  host.className = "company-card";
  host.style.cssText = "padding:24px;margin:20px 0;border:1px solid #555;border-radius:12px";
  const main = document.querySelector("main");
  if (!main) return;
  async function api(path, body) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/empresa/solicitacoes${path}`, {
      method: body ? "POST" : "GET", credentials: "include",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.mensagem || "Falha ao consultar solicitações.");
    return data;
  }
  async function load() {
    const users = await api("");
    host.replaceChildren();
    const title = document.createElement("h2"); title.textContent = "Solicitações de acesso";
    const help = document.createElement("p"); help.textContent = "Confira o vínculo com a empresa antes de aprovar. O acesso inicial será Visitante.";
    host.append(title, help);
    if (!users.length) { const p = document.createElement("p"); p.textContent = "Nenhuma solicitação pendente."; host.append(p); }
    for (const user of users) {
      const row = document.createElement("div"); row.style.cssText = "padding:12px 0;display:flex;gap:12px;flex-wrap:wrap;align-items:center";
      const label = document.createElement("span"); label.textContent = `${user.nome} — ${user.email}`;
      row.append(label);
      for (const [text, decisao] of [["Aprovar como Visitante", "APROVAR"], ["Rejeitar", "REJEITAR"]]) {
        const button = document.createElement("button"); button.textContent = text;
        button.onclick = async () => {
          button.disabled = true;
          try { await api(`/${user.id}/decisao`, { decisao }); await load(); }
          catch (e) { alert(e.message); button.disabled = false; }
        };
        row.append(button);
      }
      host.append(row);
    }
  }
  window.addEventListener("steelcontrol:empresa-evento", event => {
    if (String(event.detail?.tipo || "").startsWith("usuario.solicitacao-")) void load().catch(() => {});
  });
  window.addEventListener("focus", () => { if (host.isConnected) void load().catch(() => {}); });
  try { await load(); main.append(host); } catch (_) { /* queue only visible to authorized admins */ }
})();
