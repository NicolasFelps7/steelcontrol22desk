import { Router } from "express";
import { deviceRequired } from "../../middlewares/deviceAuth.js";
import {
  receberTelemetriaDevice,
  heartbeatDevice,
  configuracaoDevice,
  proximoComando,
  confirmarComando,
  autorizarExecucao
} from "./device.controller.js";

export const deviceRoutes = Router();
function commandProtocol(req, res, next) {
  if (req.get("X-SteelControl-Command-Protocol") !== "2") return res.status(426).json({
    codigo: "EDGE_COMMAND_UPDATE_REQUIRED",
    mensagem: "Atualize o SteelControl Edge antes de executar comandos. Monitoramento continua disponível."
  });
  next();
}

deviceRoutes.post("/:id/telemetria", deviceRequired, receberTelemetriaDevice);
deviceRoutes.post("/:id/heartbeat", deviceRequired, heartbeatDevice);
deviceRoutes.get("/:id/config", deviceRequired, configuracaoDevice);
deviceRoutes.get("/:id/comandos/proximo", deviceRequired, commandProtocol, proximoComando);
deviceRoutes.post("/:id/comandos/:comandoId/confirmar", deviceRequired, commandProtocol, confirmarComando);

deviceRoutes.post("/:id/comandos/:comandoId/autorizar", deviceRequired, commandProtocol, autorizarExecucao);
