export function nomeParaSufixo(nome) {
  const base = String(nome || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
  return base || "empresa";
}

// Only call inside a transaction: serialize allocation, also across API replicas.
export async function garantirSufixoEmpresa(tx, empresa) {
  if (empresa.loginDomain) return empresa.loginDomain;
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(2026101923)::text AS lock");
  const atual = await tx.empresa.findUnique({ where: { id: empresa.id } });
  if (atual?.loginDomain) return atual.loginDomain;
  const base = nomeParaSufixo(empresa.nome);
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    const sufixo = `${base}${tentativa ? `-${empresa.id}${tentativa > 1 ? `-${tentativa}` : ""}` : ""}.com`;
    if (await tx.empresa.findUnique({ where: { loginDomain: sufixo } })) continue;
    await tx.empresa.update({ where: { id: empresa.id }, data: { loginDomain: sufixo } });
    return sufixo;
  }
  throw Object.assign(new Error("Não foi possível reservar o sufixo interno da empresa."), { statusCode: 409 });
}

export function montarLoginInterno(parte, sufixo) {
  const prefixo = String(parte || "").trim().toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/.test(prefixo) || prefixo.includes("..")) {
    throw Object.assign(new Error("Informe o nome de login, com até 64 caracteres, sem @, espaços ou acentos. Exemplo: joao.silva."), { statusCode: 400 });
  }
  if (!/^[a-z0-9][a-z0-9-]*\.com$/.test(String(sufixo || ""))) {
    throw Object.assign(new Error("O sufixo de login da empresa ainda não foi configurado. Atualize o backend e as migrations."), { statusCode: 503 });
  }
  return `${prefixo}@${sufixo}`;
}

export function emailContato(valor) {
  const email = String(valor || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error("Informe um e-mail real de contato para receber o segundo fator."), { statusCode: 400 });
  }
  return email;
}
