'use strict';
const { app, BrowserWindow, Menu, Tray, ipcMain, dialog, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { WorkerClient } = require('./worker-client.cjs');
const { SERVER_URL, trustedRemote } = require('./security.cjs');
app.setName('SteelControl');
let mainWindow, tray, worker;
let quitting = false, shutdownStarted = false;
let workerState = { running: false, message: 'Iniciando conexões…' };
let settings = { autoStart: true };
const loginOptions = () => ({ path: process.execPath, args: ['--background'] });

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => openSystem());
  app.whenReady().then(start).catch(() => {
    dialog.showErrorBox('SteelControl', 'Não foi possível iniciar o aplicativo. Reinstale o SteelControl Desktop.');
    app.exit(1);
  });
}
app.on('window-all-closed', () => { /* O ícone mantém o Edge ativo. */ });
app.on('activate', () => openSystem());
app.on('before-quit', event => {
  if (quitting) return;
  event.preventDefault();
  if (shutdownStarted) return;
  shutdownStarted = true;
  Promise.resolve(worker?.stop()).finally(() => { quitting = true; app.quit(); });
});

function saveSettings() {
  const target = path.join(app.getPath('userData'), 'desktop-settings.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target + '.tmp', JSON.stringify(settings), { mode: 0o600 });
  fs.renameSync(target + '.tmp', target);
}
function autoStart(enabled) {
  if (!app.isPackaged || process.platform !== 'win32') return false;
  app.setLoginItemSettings({ ...loginOptions(), openAtLogin: enabled });
  return app.getLoginItemSettings(loginOptions()).openAtLogin;
}

function securedWindow(options) {
  const win = new BrowserWindow({
    backgroundColor: '#0c131b', icon: path.join(__dirname, 'assets', 'steelcontrol.png'),
    ...options,
    webPreferences: {
      nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true,
      allowRunningInsecureContent: false, webviewTag: false,
      partition: 'persist:steelcontrol',
      preload: path.join(__dirname, 'computer-preload.cjs')
    }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event, url) => {
    if (!trustedRemote(url)) event.preventDefault();
  });
  win.webContents.on('will-redirect', (event, url) => {
    if (!trustedRemote(url)) event.preventDefault();
  });
  win.webContents.on('will-attach-webview', event => event.preventDefault());
  win.on('close', event => {
    if (!quitting) { event.preventDefault(); win.hide(); }
  });
  return win;
}
function openSystem(target) {
  const destination = typeof target === 'string' && trustedRemote(target) ? target : SERVER_URL + '/app/login';
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = securedWindow({ width: 1360, height: 880, minWidth: 1000, minHeight: 680, title: 'SteelControl' });
    mainWindow.loadURL(destination).catch(error => {
      if (error.code === 'ERR_ABORTED') return;
      dialog.showMessageBox(mainWindow, { type: 'warning', title: 'Sem conexão com o site',
        message: 'Não foi possível abrir o SteelControl. Confira a internet e use Sistema → Recarregar.',
        detail: 'As conexões locais continuam tentando reconectar. Use Máquinas → Conectar máquina para configurar o Edge.' });
    });
  } else if (typeof target === 'string' && trustedRemote(target)) {
    mainWindow.loadURL(destination).catch(() => {});
  }
  mainWindow.show(); mainWindow.focus();
}
function openConnections() {
  openSystem(SERVER_URL + '/app/maquinas?conexoes=1');
}

async function start() {
  app.setAppUserModelId('br.com.steelcontrol.desktop');
  try {
    const saved = JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'desktop-settings.json'), 'utf8'));
    settings.autoStart = saved.autoStart !== false;
  } catch { /* Primeiro uso. */ }
  autoStart(settings.autoStart);
  const remote = session.fromPartition('persist:steelcontrol');
  remote.setPermissionRequestHandler((wc, permission, callback, details) => {
    // Copiar para Edge escreve no clipboard; leitura pelo site continua negada.
    if (permission === 'clipboard-sanitized-write') return callback(trustedRemote(wc.getURL()) &&
      details.isMainFrame === true && trustedRemote(details.requestingUrl));
    // A facial precisa somente de câmera, no domínio do sistema e no frame principal.
    callback(permission === 'media' && trustedRemote(wc.getURL()) &&
      details.isMainFrame === true && trustedRemote(details.requestingUrl) &&
      Array.isArray(details.mediaTypes) && details.mediaTypes.length === 1 && details.mediaTypes[0] === 'video');
  });
  remote.setPermissionCheckHandler((wc, permission, origin, details) =>
    Boolean(wc) && trustedRemote(wc.getURL()) && trustedRemote(origin) && details.isMainFrame === true &&
    (permission === 'clipboard-sanitized-write' || (permission === 'media' && details.mediaType === 'video')));
  const command = app.isPackaged ? path.join(process.resourcesPath, 'edge', 'SteelControlEdge.exe') :
    (process.env.STEELCONTROL_PYTHON || (process.platform === 'win32' ? 'python' : 'python3'));
  const args = app.isPackaged ? [] : ['-u', path.join(__dirname, '..', 'steelcontrol-edge', 'desktop_worker.py')];
  worker = new WorkerClient(command, args, {
    cwd: app.isPackaged ? path.dirname(command) : path.join(__dirname, '..', 'steelcontrol-edge'),
    env: { ...process.env, STEELCONTROL_EDGE_HOME: path.join(app.getPath('userData'), 'Edge'), PYTHONUNBUFFERED: '1' }
  });
  worker.on('state', state => { workerState = state; tray?.setToolTip('SteelControl — ' + state.message); });
  ipcMain.handle('computer:pair', async event => {
    if (!mainWindow || event.sender !== mainWindow.webContents || event.senderFrame !== mainWindow.webContents.mainFrame || !trustedRemote(event.senderFrame.url)) throw new Error('Origem inválida.');
    return worker.request('pair');
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Sistema', submenu: [
      { label: 'Abrir SteelControl', click: openSystem },
      { label: 'Iniciar com o Windows', type: 'checkbox', checked: settings.autoStart, enabled: app.isPackaged && process.platform === 'win32', click: item => { settings.autoStart = autoStart(item.checked); saveSettings(); } },
      { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
      { type: 'separator' }, { label: 'Sair e desconectar máquinas', click: () => app.quit() }
    ] },
    { label: 'Máquinas', submenu: [{ label: 'Conectar máquina / Gerenciar conexões', accelerator: 'CmdOrCtrl+Shift+M', click: openConnections }] },
    { label: 'Visualizar', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] }
  ]));
  tray = new Tray(path.join(__dirname, 'assets', 'steelcontrol.png'));
  tray.setToolTip('SteelControl');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Abrir SteelControl', click: openSystem },
    { label: 'Conectar máquina / Conexões', click: openConnections },
    { type: 'separator' }, { label: 'Sair e desconectar máquinas', click: () => app.quit() }
  ]));
  tray.on('double-click', openSystem);
  worker.start();
  if (!process.argv.includes('--background')) openSystem();
}
