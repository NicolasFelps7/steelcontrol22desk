'use strict';
const { pathToFileURL } = require('node:url');
const SERVER_URL = 'https://web-production-6682df.up.railway.app';
const SERVER_ORIGIN = new URL(SERVER_URL).origin;
function trustedRemote(value) {
  try { return new URL(value).origin === SERVER_ORIGIN; } catch { return false; }
}
function trustedLocal(frame, window, filename) {
  return Boolean(window && !window.isDestroyed() && frame === window.webContents.mainFrame && frame.url === pathToFileURL(filename).href);
}
function parseEdgeLink(value) {
  if (typeof value !== 'string' || value.length > 160) return null;
  try {
    const url=new URL(value);
    if(url.protocol!=='steelcontrol:'||url.hostname!=='connect'||url.username||url.password||url.port||url.hash||!['','/'].includes(url.pathname))return null;
    if([...url.searchParams.keys()].some(key=>key!=='maquinaId')||url.searchParams.getAll('maquinaId').length>1)return null;
    const raw=url.searchParams.get('maquinaId');
    if(raw===null)return {machineId:null};
    if(!/^[1-9]\d{0,9}$/.test(raw)||Number(raw)>2147483647)return null;
    return {machineId:Number(raw)};
  }catch{return null;}
}
function trustedRemoteFrame(event, windows) {
  return windows.some(win=>Boolean(win&&!win.isDestroyed()&&event.sender===win.webContents&&event.senderFrame===win.webContents.mainFrame&&trustedRemote(event.senderFrame.url)));
}
module.exports = { SERVER_URL, trustedRemote, trustedLocal, parseEdgeLink, trustedRemoteFrame };
