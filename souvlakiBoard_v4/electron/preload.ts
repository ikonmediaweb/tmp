const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveFileToAssets: (file: File) => ipcRenderer.invoke('save-file-to-assets', file)
});