const { app, Menu, Tray } = require('electron');
const path = require('path');

const { loadStore } = require('./store');
const { getAllPlugins } = require('./plugins');

/**
 * todo:
 * add quadrakill
 * create exe
 *
 */
const iconPath = path.join(__dirname, '../assets/IconTemplate.png');

const startPluginManager = async (store) => {
    const { default: LcuPluginManager } = await import('lcu-plugin-manager');

    const plugins = Object.values(await getAllPlugins()).map((plugin) => ({
        ...plugin,
        checked: store.get(`${plugin.label}.checked`),
    }));
    const pluginManager = new LcuPluginManager(
        Object.values(plugins).map((pluginItem) => pluginItem.plugin)
    );

    pluginManager.start();

    return { pluginManager, plugins };
};

const togglePlugin = ({ plugin, pluginManager, store }) => {
    return async () => {
        plugin.checked = !plugin.checked;
        store.set(`${plugin.label}.checked`, plugin.checked);

        if (plugin.checked) {
            await pluginManager.connectPlugin(plugin.plugin);
            console.log('connected', plugin.label);
        } else {
            await pluginManager.disconnectPlugin(plugin.plugin);
            console.log('disconnected', plugin.label);
        }
    };
};

const startTray = ({ pluginManager, plugins, store }) => {
    const tray = new Tray(iconPath);
    const pluginItems = Object.values(plugins).map((plugin) => ({
        checked: plugin.checked,
        click: togglePlugin({ plugin, pluginManager, store }),
        label: plugin.label,
        type: 'checkbox',
    }));
    const contextMenu = Menu.buildFromTemplate([
        ...pluginItems,
        { type: 'separator' },
        { label: 'Quit', role: 'quit' },
    ]);

    tray.setTitle('Support');
    tray.setToolTip('Support for League of Legends');
    tray.setContextMenu(contextMenu);
};

app.whenReady().then(async () => {
    const store = await loadStore();
    const { pluginManager, plugins } = await startPluginManager(store);
    startTray({ pluginManager, plugins, store });
});
