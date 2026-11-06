import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const html = read("frontend/operacao.html");
const workspace = read("frontend/assets/js/machine-workspace.js");
const machines = read("frontend/assets/js/maquinas.js");
const runtime = read("frontend/assets/js/controller-runtime.js");
const dashboard = read("frontend/assets/js/dashboard.js");
const app = read("backend/src/app.js");
const machineController = read("backend/src/modules/machines/machine.controller.js");
const hmiPolicy = read("backend/src/lib/hmiPolicy.js");

const requiredControllers = [
  "ESP32",
  "DOBOT_MAGICIAN",
  "CLP_PLC",
  "CONTROLADOR_ROBOTICO",
  "CNC",
  "GATEWAY_INDUSTRIAL",
  "OUTRO"
];

for (const id of ['op3DScene','opMachine','dobotControlTemplate']) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Central industrial incompleta: ${id}`);
}
for (const check of ['IHM_START','IHM_STOP','IHM_RESET','startPolicy','impressora3d/comandos','SteelDobotControl.mount','/manutencoes']) {
  if (!workspace.includes(check)) throw new Error(`Área integrada incompleta: ${check}`);
}
if (!read('frontend/index.html').includes('url=/app/dashboard')) throw new Error('Entrada antiga deve encaminhar para a central.');

if (!machineController.includes("criarComandoIhm") || !machineController.includes("IHM_START")) {
  throw new Error("Backend da IHM industrial ausente.");
}

if (!hmiPolicy.includes("startPermitted") || !hmiPolicy.includes("comandoPayloadExpirado")) {
  throw new Error("Hardening da IHM (intertravamentos/TTL) ausente.");
}

if (html.includes('id="dobotMenuButton"')) {
  throw new Error("Dobot ainda aparece como item global do menu.");
}

if (!app.includes('"/app/dashboard": "operacao.html"') ||
    !fs.existsSync(path.join(root,'frontend/assets/js/machine-workspace.js'))) {
  throw new Error("Rota da central industrial ou área integrada ausente.");
}

if (
  !machines.includes('/app/dashboard?view=controller') ||
  !machines.includes('/app/dashboard?view=dobot')
) {
  throw new Error("Roteamento profissional dos painéis por controlador ausente.");
}

for (const controller of requiredControllers) {
  if (!machines.includes(controller)) {
    throw new Error(`Cadastro sem perfil: ${controller}`);
  }

  if (controller !== "DOBOT_MAGICIAN" && !runtime.includes(controller)) {
    throw new Error(`Runtime adaptativo sem perfil: ${controller}`);
  }
}

console.log(
  `[CONTROLLERS] OK: ${requiredControllers.length} perfis, IHM supervisionada, rota /app/dashboard e painéis adaptativos validados.`
);
