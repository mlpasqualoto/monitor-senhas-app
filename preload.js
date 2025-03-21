const { contextBridge, ipcRenderer } = require('electron');

// Expõe funções seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    enviarNotificacao: (canal, dados) => {
        // Canais permitidos
        const canaisPermitidos = ['nova-senha'];
        if (canaisPermitidos.includes(canal)) {
            ipcRenderer.send(canal, dados);
        }
    }
});
