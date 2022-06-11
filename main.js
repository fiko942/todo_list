// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  ipcMain,
  remote
} = require('electron');
const ipc = ipcMain;
const path = require('path');
let win;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  win.setAutoHideMenuBar(true);
  win.loadFile('page/main.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
});

function loadFile(filePath) {
  return win.loadFile(filePath);
}

ipc.on('minimize-app', () => {
  if(win.isMinimized()) {
    win.restore();
  } else {
    win.minimize();
  }
});

ipc.on('maximize-app', () => {
  if(win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipc.on('close-app', () => {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});