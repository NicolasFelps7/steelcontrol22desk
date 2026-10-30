import { DOBOT_COMMANDS } from "./dobotPolicy.js";
import { normalizarComandoIhm } from "./hmiPolicy.js";

export const STOP_COMMANDS = new Set(["DOBOT_STOP", "PARAR_SEGURANCA", "IHM_STOP", "PRINTER3D_CANCEL"]);
const printer = new Set(["PRINTER3D_PAUSE", "PRINTER3D_RESUME", "PRINTER3D_CANCEL", "PRINTER3D_HOME", "PRINTER3D_LIGHT_ON", "PRINTER3D_LIGHT_OFF"]);

// Revalidação feita com o cadastro atual, inclusive após o comando entrar na fila.
export function commandAllowedNow(machine, command, now = Date.now()) {
  if (!machine?.ativo || machine.modoSimulacao !== false) return false;
  const name = command?.comando;
  // O driver atual não comprova a conclusão física de HOME. Calibração é local.
  if (name === "DOBOT_HOME") return false;
  const created = new Date(command?.criadoEm).getTime();
  const expires = Date.parse(command?.payload?.expiresAt);
  // STOP legado também expira; somente ele pode omitir expiresAt.
  const deadline = STOP_COMMANDS.has(name) && !command?.payload?.expiresAt ? created + 15000 : expires;
  if (!Number.isFinite(created) || created > now + 1000 ||
      !Number.isFinite(deadline) || deadline <= now || deadline - created > 60000) return false;
  if (STOP_COMMANDS.has(name)) return true;
  if (machine.paradaSeguranca && name !== "LIBERAR_OPERACAO") return false;
  const meta = machine.integracaoMeta || {};
  if (DOBOT_COMMANDS.includes(name)) {
    return machine.controlador === "DOBOT_MAGICIAN" && meta.dobot?.remoteControlEnabled === true;
  }
  if (normalizarComandoIhm(name)) return meta.hmi?.remoteControlEnabled === true;
  if (printer.has(name)) return machine.controlador === "IMPRESSORA_3D" && meta.impressora3d?.remoteControlEnabled === true;
  return name === "LIBERAR_OPERACAO";
}

export function commandEnvelope(command) {
  return {
    id: command.id, maquinaId: command.maquinaId, comando: command.comando,
    payload: command.payload, criadoEm: command.criadoEm,
    tentativaEntrega: command.tentativasEntrega
  };
}
