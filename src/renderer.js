// 运行在 Electron 渲染进程 下的页面脚本

const autosend_element = document.createElement('div');
autosend_element.innerHTML = `
<a 
 id="repeatmsg"
 class="q-context-menu-item q-context-menu-item--normal" 
 aria-disabled="false" 
 role="menuitem" 
 tabindex="-1">
  <div class="q-context-menu-item__icon q-context-menu-item__head">
    <i class="q-icon" data-v-717ec976="" style="--b4589f60: inherit; --6ef2e80d: 16px;">
    <svg xmlns='http://www.w3.org/2000/svg'  viewBox='0 0 24 24' fill='#000000' width='24' height='24'><path d="M21.063 15H13v2h9v-2zM4 7h11v2H4zm0 4h11v2H4zm0 4h7v2H4z"></path></svg>
    </i>
  </div>
  <!---->
  <span class="q-context-menu-item__text">刷屏</span>
  <!---->
</a>
`;

async function addAutoSendMenu(qContextMenu, message_element) {
    console.log('adding auto send menu');
    const { classList } = message_element;
    const msgprops = message_element
        ?.closest('.msg-content-container')
        ?.closest('.message')?.__VUE__?.[0]?.props;
    const msgIds = msgprops?.msgRecord.msgId;
    const qThemeValue = document.body.getAttribute('q-theme');
    const autosendmsg = autosend_element.cloneNode(true);
    autosendmsg.addEventListener('click', async () => {
        const peer = await LLAPI.getPeer();
        if (classList[0] == 'ptt-element__progress') {
            const msg = await LLAPI.getPreviousMessages(
                peer,
                1,
                msgIds.toString()
            );
            const elements = msg[0].elements;

            var settings = await auto_sender.getSettings();
            var numbers = 0;
            const interval = setInterval(async () => {
                await LLAPI.sendMessage(peer, elements);

                numbers++;
                if (numbers >= settings.send_number) clearInterval(interval);
            }, settings.send_interval * 1000);
        } else {
            var settings = await auto_sender.getSettings();
            var numbers = 0;
            const interval = setInterval(async () => {
                await LLAPI.forwardMessage(peer, peer, [msgIds]);

                numbers++;
                if (numbers >= settings.send_number) clearInterval(interval);
            }, settings.send_interval * 1000);
        }
        // 关闭右键菜单
        qContextMenu.remove();
    });
    if (qThemeValue != 'light') {
        autosendmsg.querySelector('svg').setAttribute('fill', '#ffffff');
    }
    qContextMenu.appendChild(autosendmsg);
}

// 页面加载完成时触发
function onLoad() {
    LLAPI.add_qmenu(addAutoSendMenu);
}

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
        var value = parseInt(sendNumberInput.value);
        settings.send_number = value;
        auto_sender.setSettings(JSON.stringify(settings));
    });
}

// 这两个函数都是可选的
export { onLoad, onConfigView };
