// 运行在 Electron 渲染进程 下的页面脚本

// 页面加载完成时触发
function onLoad() {}

// 打开设置界面时触发
async function onConfigView(view) {
    const plugin_path = LiteLoader.plugins.auto_sender.path.plugin;
    const html_file_path = `llqqnt://local-file/${plugin_path}/src/config/view.html`;
    const css_file_path = `llqqnt://local-file/${plugin_path}/src/config/view.css`;
    // 插入设置页
    const htmlText = await (await fetch(html_file_path)).text();
    view.insertAdjacentHTML('afterbegin', htmlText);
    // 插入设置页样式
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = css_file_path;
    document.head.appendChild(link);
    // 设置
    var settings = await auto_sender.getSettings();

    // 监听
    const sendIntervalInput = view.querySelector('#send_interval');
    sendIntervalInput.value = settings.send_interval || 1;
    sendIntervalInput.addEventListener('change', () => {
        var value = parseFloat(sendIntervalInput.value);
        settings.send_interval = value;
        auto_sender.setSettings(JSON.stringify(settings));
    });

    const sendNumberInput = view.querySelector('#send_number');
    sendNumberInput.value = settings.send_number || 5;
    sendNumberInput.addEventListener('change', () => {
        var value = parseInt(sendIntervalInput.value);
        settings.send_number = value;
        auto_sender.setSettings(JSON.stringify(settings));
    });
}

// 这两个函数都是可选的
export { onLoad, onConfigView };
