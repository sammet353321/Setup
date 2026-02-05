const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getUrl: () => ipcRenderer.invoke('get-url'),
  setUrl: (url) => ipcRenderer.invoke('set-url', url),
  close: () => ipcRenderer.send('app-close'),
  minimize: () => ipcRenderer.send('app-minimize'),
  openExternal: (url) => shell.openExternal(url)
});
