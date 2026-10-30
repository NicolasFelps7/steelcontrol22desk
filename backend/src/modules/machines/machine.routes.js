import { requireControlCredential } from "../../middlewares/controlAuthorization.js";
import { criarRateLimit } from "../../middlewares/security.js";
import { Router } from "express";
import { authRequired } from "../../middlewares/auth.js";
import {
  listar,
  sincronizar,
  criar,
  buscar,
  atualizar,
  excluir,
  simular,
  telemetria,
  receberTelemetriaReal,
  demonstracao,
  diagnostico,
  regenerarDeviceKey,
  liberarSeguranca,
  streamMaquina,
  criarComandoIhm,
  criarComandoDobot,
  salvarPontosAutomaticosDobot,
  obterAutomaticoDobot,
  controlarAutomaticoDobot,
  statusComandoDobot,
  criarComandoImpressora3D
} from "./machine.controller.js";

export const machineRoutes = Router();

machineRoutes.use(authRequired);
const limiteComandos = criarRateLimit({ janelaMs: 1000, limite: 20, prefixo: "command" });
// STOP continua disponível quando a cota de movimentos é excedida.
machineRoutes.use((req, res, next) => {
  if (req.method === "POST" && /\/(comandos|controle)$/.test(req.path) &&
      !["DOBOT_STOP", "IHM_STOP", "PRINTER3D_CANCEL"].includes(req.body?.comando)) {
    return limiteComandos(req, res, next);
  }
  next();
});

machineRoutes.get("/", listar);
machineRoutes.get("/sync", sincronizar);
machineRoutes.post("/", criar);

machineRoutes.get("/:id/stream", streamMaquina);
machineRoutes.get("/:id/diagnostico", diagnostico);
machineRoutes.post("/:id/device-key/regenerar", regenerarDeviceKey);
machineRoutes.post("/:id/liberar-seguranca", requireControlCredential, liberarSeguranca);
machineRoutes.post("/:id/ihm/comandos", requireControlCredential, criarComandoIhm);
machineRoutes.post("/:id/comandos", requireControlCredential, criarComandoDobot);
machineRoutes.put("/:id/dobot/automatic-points", salvarPontosAutomaticosDobot);
machineRoutes.get("/:id/dobot/automatico", obterAutomaticoDobot);
machineRoutes.put("/:id/dobot/automatico", salvarPontosAutomaticosDobot);
machineRoutes.post("/:id/dobot/automatico/controle", requireControlCredential, controlarAutomaticoDobot);
machineRoutes.get("/:id/comandos/:comandoId", statusComandoDobot);
machineRoutes.post("/:id/impressora3d/comandos", requireControlCredential, criarComandoImpressora3D);
machineRoutes.post("/:id/demonstracao", demonstracao);

machineRoutes.post("/:id/simular", simular);
machineRoutes.get("/:id/telemetria", telemetria);
machineRoutes.post("/:id/telemetria", receberTelemetriaReal);

machineRoutes.get("/:id", buscar);
machineRoutes.put("/:id", atualizar);
machineRoutes.delete("/:id", excluir);
