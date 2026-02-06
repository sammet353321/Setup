const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// Configure Auto Updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
// IMPORTANT: Disable signature verification since we don't have a code signing certificate
autoUpdater.verifyUpdateCodeSignature = false;

// Function to get config path (handles both dev and prod)
function getConfigPath() {
    if (app.isPackaged) {
        // In production, config.txt is next to the executable
        return path.join(path.dirname(app.getPath('exe')), 'config.txt');
    } else {
        // In development, config.txt is in the project root
        return path.join(__dirname, 'config.txt');
    }
}

// Function to read URL from config.txt
function getUrlFromConfig() {
    try {
        const configPath = getConfigPath();
        
        // If config file doesn't exist, create it with a default template
        if (!fs.existsSync(configPath)) {
            const defaultContent = "https://google.com";
            try {
                fs.writeFileSync(configPath, defaultContent, 'utf-8');
            } catch (writeError) {
                console.error('Error creating config.txt:', writeError);
            }
            return null; // Return null first time so user sees the alert and can edit the file
        }
        
        if (fs.existsSync(configPath)) {
            const content = fs.readFileSync(configPath, 'utf-8').trim();
            if (content && (content.startsWith('http://') || content.startsWith('https://'))) {
                return content;
            }
        }
        return null;
    } catch (error) {
        console.error('Error reading config.txt:', error);
        return null;
    }
}

function setupIpcHandlers() {
    // IPC Handlers
    ipcMain.handle('get-url', () => {
        // Read directly from config file every time
        return getUrlFromConfig();
    });

    ipcMain.handle('set-url', (event, url) => {
        // We don't save to file from UI anymore, but keep handler to prevent crash
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

    // Auto Updater Handlers
    ipcMain.on('check-for-update', () => {
        autoUpdater.checkForUpdates();
    });

    ipcMain.on('start-download', () => {
        autoUpdater.downloadUpdate();
    });

    ipcMain.on('quit-and-install', () => {
        autoUpdater.quitAndInstall();
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

  // Auto Updater Events
  autoUpdater.on('update-available', (info) => {
      win.webContents.send('update-available', info);
  });

  autoUpdater.on('update-not-available', (info) => {
      win.webContents.send('update-not-available', info);
  });

  autoUpdater.on('download-progress', (progressObj) => {
      win.webContents.send('download-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
      win.webContents.send('update-downloaded', info);
  });

  autoUpdater.on('error', (err) => {
      win.webContents.send('update-error', err);
  });
}

app.whenReady().then(async () => {
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
