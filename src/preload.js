// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require('electron');

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld('auto_sender', {
    getSettings: () => ipcRenderer.invoke(
        "LiteLoader.auto_sender.getSettings"
    ),
    setSettings: content => ipcRenderer.invoke(
        "LiteLoader.auto_sender.setSettings",
        content
    ),
});
