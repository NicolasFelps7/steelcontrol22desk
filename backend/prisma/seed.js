import "dotenv/config";
import { garantirSufixoEmpresa } from "../src/lib/employeeLogin.js";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

function texto(nome) {
  return String(process.env[nome] || "").trim();
}

function configuracaoInicial() {
  const producao = texto("NODE_ENV").toLowerCase() === "production";
  const email = (
    texto("SEED_ADMIN_EMAIL") ||
    (producao ? "" : "admin@steelcontrol.com")
  ).toLowerCase();
  const senha =
    texto("SEED_ADMIN_PASSWORD") ||
    (producao ? "" : "Steel123!");

  if (!email || !senha) {
    throw new Error(
      "Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD para criar o administrador inicial."
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("SEED_ADMIN_EMAIL não contém um e-mail válido.");
  }

  if (
    producao &&
    (
      senha.length < 12 ||
      !/[a-z]/.test(senha) ||
      !/[A-Z]/.test(senha) ||
      !/\d/.test(senha) ||
      !/[^A-Za-z0-9]/.test(senha)
    )
  ) {
    throw new Error(
      "SEED_ADMIN_PASSWORD deve ter ao menos 12 caracteres, com maiúscula, minúscula, número e símbolo."
    );
  }

  return {
    email,
    senha,
    nomeAdministrador:
      texto("SEED_ADMIN_NAME") ||
      "Administrador",
    nomeEmpresa:
      texto("SEED_COMPANY_NAME") ||
      "SteelControl Demonstração",
    cnpjEmpresa:
      texto("SEED_COMPANY_CNPJ") ||
      "11.222.333/0001-81"
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL não foi encontrada. Confirme que backend/.env existe e contém a conexão PostgreSQL."
    );
  }

  const configuracao = configuracaoInicial();
  const senhaHash = await bcrypt.hash(configuracao.senha, 12);

  const empresa = await prisma.empresa.upsert({
    where: { cnpj: configuracao.cnpjEmpresa },
    update: {},
    create: {
      nome: configuracao.nomeEmpresa,
      cnpj: configuracao.cnpjEmpresa
    }
  });

  await prisma.$transaction(tx => garantirSufixoEmpresa(tx, empresa));

  await prisma.usuario.upsert({
    where: { email: configuracao.email },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: configuracao.nomeAdministrador,
      email: configuracao.email,
      senhaHash,
      cargo: "ADMINISTRADOR", statusVinculo: "ADMIN_PENDENTE"
    }
  });

  console.log(`Administrador inicial confirmado: ${configuracao.email}`);
  console.log("A senha não é exibida nos logs por segurança.");
}

main()
  .catch(erro => {
    console.error("Falha ao executar seed:", erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
