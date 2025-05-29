const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {

  // we can also expose variables, not just functions
})
