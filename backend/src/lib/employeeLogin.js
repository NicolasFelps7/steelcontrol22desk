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

// Atualiza nome, namespace e identificadores juntos. Nunca altera o e-mail real.
export async function atualizarEmpresaComLogins(tx, empresaId, dados) {
  await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(2026101923)::text AS lock");
  const atual = await tx.empresa.findUnique({ where: { id: empresaId } });
  if (!atual) throw Object.assign(new Error("Empresa não encontrada."), { statusCode: 404 });
  const base = nomeParaSufixo(dados.nome ?? atual.nome);
  const usuarios = await tx.usuario.findMany({ where: { empresaId, loginInterno: { not: null } }, select: { id: true, loginInterno: true } });
  let dominio;
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    const candidato = `${base}${tentativa ? `-${empresaId}${tentativa > 1 ? `-${tentativa}` : ""}` : ""}.com`;
    const dono = await tx.empresa.findUnique({ where: { loginDomain: candidato } });
    if (dono && dono.id !== empresaId) continue;
    const logins = usuarios.map(u => ({ id: u.id, login: `${u.loginInterno.split("@")[0]}@${candidato}` }));
    const conflito = logins.length ? await tx.usuario.findFirst({ where: { OR: logins.map(u => ({ email: u.login, id: { not: u.id } })) }, select: { id: true } }) : null;
    if (conflito) continue;
    dominio = candidato;
    break;
  }
  if (!dominio) throw Object.assign(new Error("Não foi possível atualizar o sufixo. Escolha outro nome de empresa."), { statusCode: 409 });
  const empresa = await tx.empresa.update({ where: { id: empresaId }, data: { ...dados, loginDomain: dominio } });
  for (const usuario of usuarios) {
    const loginInterno = `${usuario.loginInterno.split("@")[0]}@${dominio}`;
    if (loginInterno !== usuario.loginInterno) await tx.usuario.update({ where: { id: usuario.id }, data: { loginInterno } });
  }
  return empresa;
}
