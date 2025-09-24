import { contextBridge, ipcRenderer } from 'electron';

// Expone funciones seguras al "mundo" de tu interfaz de React (el renderer process)
// bajo una variable global `window.api`.
contextBridge.exposeInMainWorld('api', {
  // Cada una de estas funciones llama a su "handler" correspondiente en main.tsx
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  getContainersInYard: () => ipcRenderer.invoke('get-containers-in-yard'),
  createMovement: (data: any) => ipcRenderer.invoke('create-movement', data),
});