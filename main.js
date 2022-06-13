// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  ipcMain,
  remote
} = require('electron');
const ipc = ipcMain;
const path = require('path');
const Settings = require('electron-config');
const settings = new Settings();
let win;

function createWindow () {
  win = new BrowserWindow({
    frame: false,
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });
  win.loadFile('page/main.html');
}

function sendListData() {
  win.webContents.send('list-data', settings.get('data.list'));
}

app.whenReady().then(() => {
  createWindow();
  win.webContents.on('did-finish-load', () => {
    sendListData();
  });
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

function randomString(length = 1) {
  let allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890____________';
  let c = '';
  for(let i = 0; i < length; i++) {
    c += allowedChars[Math.floor(Math.random() * allowedChars.length)];
  }
  return c;
}

// Initialize data settings for
// first using this application
if(!settings.has('data')) {
  settings.set('data', {
    list: [],
    task: []
  });
}

ipc.on('add-list', (e, data) => { 
  let listname = data.replace('<', '').replace('>', '').replace(';', '');
  if(listname.trim().length < 1) {
    win.webContents.send('add-list-error', 'Please enter list name at least 1 characters');
    sendListData();
  } else if(listname.trim().length > 30) {
    win.webContents.send('add-list-error', 'Please enter list name less than 30 characters');
    sendListData();
  } else {
    let dataBefore = settings.get('data')['list'];
    let randomId = randomString(25);
    dataBefore.push({id: randomId, name: listname});
    settings.set('data.list', dataBefore);
    win.webContents.send('add-list-complete', null);
    sendListData();
  }
});

ipc.on('delete-list', (e, data) => {
  var list = settings.get('data')['list'];
  var arr = [];
  for(let i = 0; i < list.length; i++) {
    if(list[i]['id'] != data['id']) {
      arr.push(list[i]);
    }
  }
  settings.set('data.list', arr);
  sendListData();
});

ipc.on('add-task', (e, data) => {
  console.log(data);
});

ipc.on('open-task', (e, id) => {
  console.log(id);
});

