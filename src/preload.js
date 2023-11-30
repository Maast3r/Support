// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('plugins', {
    pluginUpdateFromTray: (data) => ipcRenderer.on('pluginUpdateFromTray', data),
    requestPlugins: () => ipcRenderer.invoke('requestPlugins'),
    togglePlugin: (label) => ipcRenderer.send('togglePlugin', label),
});

contextBridge.exposeInMainWorld('quadrakill', {
    enabled: Boolean(process.env.DISCORD_BOT_TOKEN),
    quadrakillUpdateFromTray: (data) => ipcRenderer.on('quadrakillUpdateFromTray', data),
    requestSounds: () => ipcRenderer.invoke('requestSounds'),
    toggleQuadrakill: () => ipcRenderer.send('toggleQuadrakill'),
    updateSound: ({ filePath, name, volume }) =>
        ipcRenderer.send('updateSound', {
            filePath,
            name,
            volume,
        }),
});
