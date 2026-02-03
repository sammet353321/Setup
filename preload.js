const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getUrl: () => ipcRenderer.invoke('get-url'),
  setUrl: (url) => ipcRenderer.invoke('set-url', url),
  close: () => ipcRenderer.send('app-close'),
  minimize: () => ipcRenderer.send('app-minimize'),
  openExternal: (url) => require('electron').shell.openExternal(url)
});
