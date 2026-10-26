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
module.exports = { SERVER_URL, trustedRemote, trustedLocal };
