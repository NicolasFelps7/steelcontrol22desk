import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const must = [
  "dobot-gateway/main.py",
  "dobot-gateway/drivers/magician_driver.py",
  "dobot-gateway/drivers/mock_driver.py",
  "frontend/assets/js/dobot-runtime.js",
  "frontend/assets/css/dobot-runtime.css",
  "backend/prisma/migrations/20260901123000_dobot_gateway_metadata/migration.sql"
];
for (const file of must) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Ausente: ${file}`);
}
const schema = fs.readFileSync(path.join(root,"backend/prisma/schema.prisma"),"utf8");
if (!schema.includes("integracaoMeta") || !schema.includes("dadosExtras")) throw new Error("Schema sem metadados Dobot.");
const routes = fs.readFileSync(path.join(root,"backend/src/modules/machines/machine.routes.js"),"utf8");
if (!routes.includes('/:id/comandos')) throw new Error("Rota segura de comandos Dobot ausente.");
if (!routes.includes('/:id/dobot/automatico')) throw new Error("Rota de sincronização automática do Dobot ausente.");
const policy = fs.readFileSync(path.join(root,"backend/src/lib/dobotPolicy.js"),"utf8");
if (!policy.includes('"DOBOT_ROTATE"')) throw new Error("Rotação segura do Dobot ausente da política de comandos.");
const controller = fs.readFileSync(path.join(root,"backend/src/modules/machines/machine.controller.js"),"utf8");
if (!controller.includes("prepararAutomaticoDobot")) throw new Error("Controller não usa o contrato compartilhado do automático Dobot.");
const runtime = fs.readFileSync(path.join(root,"frontend/assets/js/dobot-runtime.js"),"utf8");
if (!runtime.includes("persistSharedAutomatic") || !runtime.includes("/dobot/automatico")) throw new Error("Desktop não sincroniza o automático com o servidor.");
const html = fs.readFileSync(path.join(root,"frontend/index.html"),"utf8");
if (!html.includes('id="dobotTela"')) throw new Error("Aba Dobot ausente no desktop.");
console.log("[DOBOT] CHECK PROFISSIONAL: OK");
