// Scoped validation token stays in memory and is never stored as an app session.
window.abrirValidacaoEmpresarial = async function (data) {
  if (!data.validacaoToken) throw new Error("Entre novamente para iniciar a autorização e-CNPJ.");
  return new Promise(resolve => {
    const overlay = document.createElement("div"); overlay.className = "face-2fa-overlay";
    const card = document.createElement("section"); card.className = "face-2fa-card";
    card.style.cssText = "max-width:760px;max-height:90vh;overflow:auto";
    const title = document.createElement("h2"); title.textContent = "Validar responsável com e-CNPJ";
    const help = document.createElement("p"); help.textContent = "1. Baixe a autorização. 2. Confira o CNPJ, a conta e o endereço do SteelControl. 3. Assine o arquivo original com o e-CNPJ da empresa, em CMS/CAdES destacado (.p7s). 4. Envie somente a assinatura. Nunca envie PFX, P12, chave privada ou senha do certificado.";
    const status = document.createElement("p"); status.setAttribute("role", "status");
    const preview = document.createElement("pre"); preview.style.cssText = "white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;max-height:240px;overflow:auto";
    const generate = document.createElement("button"); generate.textContent = "Gerar e baixar autorização";
    const choose = document.createElement("input"); choose.type = "file"; choose.accept = ".p7s"; choose.setAttribute("aria-label", "Assinatura destacada .p7s");
    const submit = document.createElement("button"); submit.textContent = "Validar assinatura e-CNPJ"; submit.disabled = true;
    const close = document.createElement("button"); close.textContent = "Voltar ao login";
    let challenge = null; let busy = false;
    const api = async (route, body, json = true) => {
      const response = await fetch(`${window.STEELCONTROL_API_URL}/auth/company-authorization/${route}`, {
        method: "POST", headers: { Authorization: `Bearer ${data.validacaoToken}`, ...(json ? { "Content-Type": "application/json" } : {}) },
        body: json ? JSON.stringify(body || {}) : body
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.mensagem || "Validação indisponível. A empresa permanece bloqueada.");
      return result;
    };
    generate.onclick = async () => {
      if (busy) return; busy = true; generate.disabled = true; submit.disabled = true;
      try {
        challenge = await api("challenge"); preview.textContent = challenge.documento;
        const url = URL.createObjectURL(new Blob([challenge.documento], { type: "text/plain;charset=utf-8" }));
        const a = document.createElement("a"); a.href = url; a.download = challenge.arquivo; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        choose.value = ""; status.textContent = `Autorização emitida. Assine até ${new Date(challenge.expiraEm).toLocaleString()}. Gerar outra invalida a anterior.`;
      } catch (e) { status.textContent = e.message; }
      finally { busy = false; generate.disabled = false; submit.disabled = !challenge || !choose.files.length; }
    };
    choose.onchange = () => { submit.disabled = !challenge || !choose.files.length || busy; };
    submit.onclick = async () => {
      if (busy || !challenge || !choose.files.length) return;
      const file = choose.files[0];
      if (!file.name.toLowerCase().endsWith(".p7s") || file.size > 1024 * 1024) { status.textContent = "Selecione somente .p7s de até 1 MB. Não envie seu certificado privado."; return; }
      busy = true; submit.disabled = true; generate.disabled = true;
      try {
        const form = new FormData(); form.append("autorizacaoId", challenge.autorizacaoId); form.append("assinatura", file);
        const result = await api("verify", form, false);
        status.textContent = result.mensagem; preview.textContent = ""; choose.disabled = true; challenge = null;
        generate.hidden = true; submit.hidden = true; help.textContent = "Empresa autorizada. Volte ao login e confirme o segundo fator para entrar.";
      } catch (e) { status.textContent = e.message; }
      finally { busy = false; generate.disabled = false; submit.disabled = !challenge; }
    };
    close.onclick = () => { if (!busy) { overlay.remove(); resolve(); window.location.href = "/app/login"; } };
    card.append(title, help, generate, preview, choose, submit, status, close); overlay.append(card); document.body.append(overlay);
  });
};
