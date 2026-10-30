import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const textExtensions = new Set([
  ".js", ".mjs", ".cjs", ".json", ".prisma", ".sql", ".py",
  ".html", ".css", ".md", ".txt", ".toml", ".yml", ".yaml",
  ".ino", ".bat", ".ps1", ".env", ".svg"
]);

export function canonicalFileHash(file, bytes = fs.readFileSync(file)) {
  const name = path.basename(file).toLowerCase();
  const text = textExtensions.has(path.extname(name)) || name === ".env" || name.startsWith(".env.");
  // Apenas CRLF -> LF nos formatos de texto conhecidos. Conteúdo e binários
  // continuam sendo verificados; nenhum hash é regenerado ao conferir.
  const payload = text ? Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"), "utf8") : bytes;
  return crypto.createHash("sha256").update(payload).digest("hex");
}
