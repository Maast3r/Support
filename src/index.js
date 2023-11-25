const { app, Menu, Tray } = require('electron');
const path = require('path');

/**
 * todo:
 * create list of plugins
 *
 */
console.log('asdf');

const iconPath = path.join(__dirname, '../assets/IconTemplate.png');
console.log(iconPath);

app.whenReady().then(async () => {
    const LcuPluginManager = await (await import('lcu-plugin-manager')).default;
    const TahmKenchLcuPlugin = await (
        await import('lcu-tahm-kench-plugin')
    ).default;
    const StartQueueLcuPlugin = await (
        await import('lcu-start-queue-plugin')
    ).default;

    const plugins = {
        tahmKench: {
            checked: true,
            label: 'Tahm Kench',
            plugin: TahmKenchLcuPlugin,
        },
        startQueue: {
            checked: true,
            label: 'Start Queue',
            plugin: StartQueueLcuPlugin,
        },
    };

    const pluginManager = new LcuPluginManager(Object.values(plugins));

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
            pluginManager.connectPlugin(plugin);
            console.log('connected', plugin);
        } else {
            pluginManager.disconnectPlugin(plugin);
            console.log('disconnected', plugin);
        }
    };
};
