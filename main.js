const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

let store;

async function initStore() {
    if (!store) {
        const { default: Store } = await import('electron-store');
        store = new Store();
    }
}

function setupIpcHandlers() {
    // IPC Handlers
    ipcMain.handle('get-url', () => {
        return store.get('targetUrl', '');
    });

    ipcMain.handle('set-url', (event, url) => {
        store.set('targetUrl', url);
        return true;
    });

    // Add explicit handler for opening external URLs
    ipcMain.handle('open-external', async (event, url) => {
        await shell.openExternal(url);
        return true;
    });

    ipcMain.on('app-close', () => {
        app.quit();
    });

    ipcMain.on('app-minimize', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win) win.minimize();
    });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false, // Custom UI as requested
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, // Enable <webview> tag
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  win.loadFile('index.html');

  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(async () => {
  await initStore();
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
