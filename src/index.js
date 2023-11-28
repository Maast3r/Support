const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');

const { getAllPlugins } = require('./plugins');
const {
    ELIGIBLE_PLAYERS,
    GAME_EVENTS_TO_AUDIO,
} = require('./quadrakillSettings');
const { loadStore } = require('./store');

/**
 * todo:
 * add quadrakill
 * - save sound files to store?
 * - create gui to manage sound files?
 *
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

const initQuadrakill = async () => {
    if (!process.env.DISCORD_BOT_TOKEN) {
        return null;
    }

    const { default: Quadrakill } = await import('quadrakill');
    const quadrakill = new Quadrakill({
        eligiblePlayers: ELIGIBLE_PLAYERS,
        gameEventsToAudio: GAME_EVENTS_TO_AUDIO,
    });

    const toggleQuadrakill = () => {
        if (quadrakill.isDisconnected()) {
            quadrakill.joinSketchyCloset();
        } else {
            quadrakill.leaveSketchyCloset();
        }
    };

    return {
        quadrakill,
        quadrakillItem: {
            checked: false,
            click: toggleQuadrakill,
            enabled: false,
            id: 'quadrakill',
            label: 'Quadrakill Hype Man',
            type: 'checkbox',
        },
    };
};

const handleQuadrakillEvents = ({ contextMenu, quadrakill, tray }) => {
    quadrakill.eventEmitter.on('disconnect', () => {
        contextMenu.getMenuItemById('quadrakill').checked = false;
        tray.setContextMenu(contextMenu);
    });
    quadrakill.eventEmitter.on('ready', () => {
        contextMenu.getMenuItemById('quadrakill').enabled = true;
        tray.setContextMenu(contextMenu);
    });
};

const quitApp = () => {
    app.isQuitting = true;
    app.quit();
};

const startTray = async ({ pluginManager, plugins, store }) => {
    const tray = new Tray(iconPath);
    const pluginItems = Object.values(plugins).map((plugin) => ({
        checked: plugin.checked,
        click: togglePlugin({ plugin, pluginManager, store }),
        label: plugin.label,
        type: 'checkbox',
    }));
    const { quadrakill, quadrakillItem } = await initQuadrakill();
    const contextMenu = Menu.buildFromTemplate([
        ...pluginItems,
        { type: 'separator' },
        ...(quadrakillItem ? [quadrakillItem, { type: 'separator' }] : []),
        {
            click: openThing,
            label: 'Settings',
            type: 'normal',
        },
        { type: 'separator' },
        { click: quitApp, label: 'Quit' },
    ]);

    handleQuadrakillEvents({ contextMenu, quadrakill, tray });

    tray.setTitle('Support');
    tray.setToolTip('Support for League of Legends');
    tray.setContextMenu(contextMenu);
};

let browserWindow;
const openThing = () => {
    browserWindow.show();
};

app.whenReady().then(async () => {
    const store = await loadStore();
    const { pluginManager, plugins } = await startPluginManager(store);
    startTray({ pluginManager, plugins, store });

    browserWindow = new BrowserWindow({
        backgroundColor: 'purple',
        center: true,
        minHeight: 800,
        minWidth: 800,
        resizeable: false,
        show: false,
        title: 'Support',
    });
    browserWindow.loadFile('./settings.html');
    browserWindow.setMenuBarVisibility(false);
    browserWindow.on('minimize', (event) => {
        event.preventDefault();
        browserWindow.hide();
    });
    browserWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            browserWindow.hide();
        }

        return false;
    });
});
