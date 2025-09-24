import { contextBridge as n, ipcRenderer as e } from "electron";
n.exposeInMainWorld("api", {
  // Cada una de estas funciones llama a su "handler" correspondiente en main.tsx
  getDashboardStats: () => e.invoke("get-dashboard-stats"),
  getContainersInYard: () => e.invoke("get-containers-in-yard"),
  createMovement: (t) => e.invoke("create-movement", t)
});
