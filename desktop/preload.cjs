'use strict';
const { contextBridge, ipcRenderer } = require('electron');
// Este preload existe apenas na janela LOCAL; o site não recebe APIs nativas.
contextBridge.exposeInMainWorld('steelConnections', Object.freeze({
  request: (action, data = {}) => ipcRenderer.invoke('edge:request', action, data),
  onChange: callback => {
    const listener = () => callback();
    ipcRenderer.on('edge:changed', listener);
    return () => ipcRenderer.removeListener('edge:changed', listener);
  }
}));
