// 运行在 Electron 主进程 下的插件入口
const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

function checkAndCompleteKeys(json1, json2, check_key) {
    const keys1 = Object.keys(json1[check_key]);
    const keys2 = Object.keys(json2[check_key]);

    for (const key of keys2) {
        if (!keys1.includes(key)) {
            json1[check_key][key] = json2[check_key][key];
        }
    }

    return json1;
}

function setSettings(settingsPath, content) {
    const new_config =
        typeof content == 'string'
            ? JSON.stringify(JSON.parse(content), null, 4)
            : JSON.stringify(content, null, 4);
    fs.writeFileSync(settingsPath, new_config, 'utf-8');
}

// 加载插件时触发
function onLoad(plugin) {
    const pluginDataPath = plugin.path.data;
    const settingsPath = path.join(pluginDataPath, 'settings.json');
    // 默认配置
    const defaultSettings = {
        send_interval: 1,
        send_number: 5,
    };
    // 设置文件判断
    if (!fs.existsSync(pluginDataPath)) {
        fs.mkdirSync(pluginDataPath, { recursive: true });
    }
    if (!fs.existsSync(settingsPath)) {
        fs.writeFileSync(
            settingsPath,
            JSON.stringify(defaultSettings, null, 4)
        );
    } else {
        const data = fs.readFileSync(settingsPath, 'utf-8');
        const config = checkAndCompleteKeys(
            JSON.parse(data),
            defaultSettings,
            'send_interval'
        );
        fs.writeFileSync(
            settingsPath,
            JSON.stringify(config, null, 4),
            'utf-8'
        );
    }

    // 获取设置
    ipcMain.handle('LiteLoader.auto_sender.getSettings', (event) => {
        try {
            const data = fs.readFileSync(settingsPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            return {};
        }
    });

    // 保存设置
    ipcMain.handle('LiteLoader.auto_sender.setSettings', (event, content) => {
        try {
            setSettings(settingsPath, content);
        } catch (error) {
            output(error);
        }
    });
}

// 创建窗口时触发
function onBrowserWindowCreated(window, plugin) {}

// 这两个函数都是可选的
module.exports = {
    onLoad,
    onBrowserWindowCreated,
};
