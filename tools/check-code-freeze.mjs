import fs from "node:fs";
import path from "node:path";
import { canonicalFileHash as hashCanonico } from "./canonical-file-hash.mjs";

const root = path.resolve(import.meta.dirname, "..");
const manifestPath = path.join(root, "CODE_FREEZE.sha256");

const scopedDirs = [
  "backend/src",
  "backend/prisma",
  "backend/test",
  "frontend",
  "face-api/app",
  "face-api/tests",
  "dobot-gateway",
  "device-examples",
  "steelcontrol-edge",
  "desktop"
];

const scopedFiles = [
  "backend/package.json",
  "backend/package-lock.json",
  "face-api/requirements.txt",
  "face-api/requirements-lock.txt",
  "face-api/requirements-production.txt"
];

const ignored = new Set([
  "node_modules",
  "venv",
  ".venv",
  "__pycache__",
  ".pytest_cache",
  ".insightface",
  "release",
  "edge-dist",
  "build-edge",
  ".venv-build"
]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name)) return [];

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) return walk(full);
    if (entry.name.endsWith(".pyc")) return [];

    return [full];
  });
}


if (!fs.existsSync(manifestPath)) {
  throw new Error("CODE_FREEZE.sha256 ausente.");
}

const expected = new Map();

for (const line of fs.readFileSync(manifestPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) continue;

  const match = trimmed.match(/^([a-f0-9]{64})\s{2}(.+)$/i);
  if (!match) {
    throw new Error(`Linha inválida no CODE_FREEZE.sha256: ${line}`);
  }

  expected.set(match[2].replaceAll("\\", "/"), match[1].toLowerCase());
}

const currentFiles = [
  ...scopedDirs.flatMap(rel => walk(path.join(root, rel))),
  ...scopedFiles.map(rel => path.join(root, rel)).filter(fs.existsSync)
];

const current = new Set(
  currentFiles.map(file => path.relative(root, file).replaceAll("\\", "/"))
);

const erros = [];

for (const [rel, digest] of expected) {
  const file = path.join(root, rel);

  if (!fs.existsSync(file)) {
    erros.push(`Arquivo congelado ausente: ${rel}`);
    continue;
  }

  const atual = hashCanonico(file);

  if (atual !== digest) {
    erros.push(`Arquivo funcional alterado após o freeze: ${rel}`);
  }
}

for (const rel of current) {
  if (!expected.has(rel)) {
    erros.push(`Novo arquivo funcional fora do manifesto de freeze: ${rel}`);
  }
}

if (erros.length) {
  console.error("[FREEZE] FALHOU");
  erros.forEach(erro => console.error(`- ${erro}`));
  process.exit(1);
}

console.log(
  `[FREEZE] OK: ${expected.size} arquivos funcionais mantêm o conteúdo congelado (hash canônico cross-platform).`
);
