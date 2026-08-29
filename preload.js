const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api',
{
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    saveSettings: (data) => ipcRenderer.invoke('save-settings', data),
});