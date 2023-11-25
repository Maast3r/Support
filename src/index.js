const { app, Menu, Tray } = require('electron');
const path = require('path');

/**
 * todo:
 * settings - remember which plugins were toggled
 * add quadrakill
 * get a better icon
 *
 */
const iconPath = path.join(__dirname, '../assets/IconTemplate.png');

app.whenReady().then(async () => {
    const { default: LcuPluginManager } = await import('lcu-plugin-manager');
    const { default: TahmKenchLcuPlugin } = await import(
        'lcu-tahm-kench-plugin'
    );
    const { default: StartQueueLcuPlugin } = await import(
        'lcu-start-queue-plugin'
    );
    const { default: RequestPartyOwnerLcuPlugin } = await import(
        'lcu-request-party-owner-plugin'
    );
    const { default: RejectPartyOwnerLcuPlugin } = await import(
        'lcu-reject-party-owner-plugin'
    );

    const plugins = {
        tahmKench: {
            checked: true,
            label: 'Tahm Kench',
            plugin: new TahmKenchLcuPlugin(),
        },
        startQueue: {
            checked: true,
            label: 'Start Queue',
            plugin: new StartQueueLcuPlugin(),
        },
        requestPartyOwner: {
            checked: true,
            label: 'Request Party Owner',
            plugin: new RequestPartyOwnerLcuPlugin(),
        },
        rejectPartyOwner: {
            checked: true,
            label: 'Reject Party Owner',
            plugin: new RejectPartyOwnerLcuPlugin(),
        },
    };

    const pluginManager = new LcuPluginManager(
        Object.values(plugins).map((pluginItem) => pluginItem.plugin)
    );
    pluginManager.start();

    console.log('readyyy');
    const tray = new Tray(iconPath);
    const pluginItems = Object.values(plugins).map((plugin) => ({
        label: plugin.label,
        checked: plugin.checked,
        click: togglePlugin({ plugin, pluginManager }),
        type: 'checkbox',
    }));
    const subMenu = Menu.buildFromTemplate([...pluginItems]);
    const contextMenu = Menu.buildFromTemplate([
        ...pluginItems,
        { type: 'separator' },
        { label: 'Item2', submenu: subMenu, type: 'submenu' },
        { label: 'Item3', type: 'radio', checked: true },
        { label: 'Item4', type: 'radio' },
        { label: 'Quit', role: 'quit' },
    ]);
    tray.setToolTip('This is my application.');
    tray.setContextMenu(contextMenu);
});

const togglePlugin = ({ plugin, pluginManager }) => {
    return () => {
        plugin.checked = !plugin.checked;
        if (plugin.checked) {
            pluginManager.connectPlugin(plugin.plugin);
            console.log('connected', plugin.label);
        } else {
            pluginManager.disconnectPlugin(plugin.plugin);
            console.log('disconnected', plugin.label);
        }
    };
};
