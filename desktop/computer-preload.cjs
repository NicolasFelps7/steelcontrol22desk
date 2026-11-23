'use strict';
const { contextBridge, ipcRenderer } = require('electron');
// A página recebe somente o código efêmero de vínculo, nunca token ou Device Key.
contextBridge.exposeInMainWorld('steelControlComputer', Object.freeze({
  pairing: () => ipcRenderer.invoke('computer:pair'),
  // Enumeração somente leitura: não abre a COM, não envia comandos ao robô.
  ports: () => ipcRenderer.invoke('computer:ports'),
  openEdge: machineId => ipcRenderer.invoke('computer:open-edge', machineId)
}));
