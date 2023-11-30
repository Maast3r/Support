const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');

const { getAllPlugins } = require('./plugins');
const {
    getPlayers,
    getPluginEnabled,
    getPlugins,
    getSounds,
    loadPlugins,
    loadSounds,
    updateSound,
    updatePlugin,
} = require('./store');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

/**
 * todo:
 * - style settings page more
 * - reorg files to be cleaner
 * - create exe
 *
 */
const iconPath = path.join(__dirname, '../assets/IconTemplate.png');

const startPluginManager = async () => {
    const { default: LcuPluginManager } = await import('lcu-plugin-manager');

    const plugins = Object.values(await getAllPlugins()).map((plugin) => ({
        ...plugin,
        enabled: getPluginEnabled(plugin.label),
    }));
    const pluginManager = new LcuPluginManager(
        Object.values(plugins).map((pluginItem) => pluginItem.plugin)
    );

    pluginManager.start();

    return { pluginManager, plugins };
};

const togglePlugin = async ({ plugin, pluginManager }) => {
    plugin.enabled = !plugin.enabled;
    updatePlugin({ enabled: plugin.enabled, label: plugin.label });

    if (plugin.enabled) {
        await pluginManager.connectPlugin(plugin.plugin);
        console.log('connected', plugin.label);
    } else {
        await pluginManager.disconnectPlugin(plugin.plugin);
        console.log('disconnected', plugin.label);
    }
};

const togglePluginAndNotifyBrowser = async ({
    plugin,
    pluginManager,
    settingsWindow,
}) => {
    await togglePlugin({ plugin, pluginManager });
    settingsWindow.send('pluginUpdateFromTray', {
        enabled: plugin.enabled,
        label: plugin.label,
    });
};

const toggleQuadrakill = async (quadrakill) => {
    if (quadrakill.isDisconnected()) {
        await quadrakill.joinSketchyCloset();
    } else {
        await quadrakill.leaveSketchyCloset();
    }
};

const initQuadrakill = async (settingsWindow) => {
    if (!process.env.DISCORD_BOT_TOKEN) {
        return null;
    }

    const { default: Quadrakill } = await import('quadrakill');
    const quadrakill = new Quadrakill({
        eligiblePlayers: getPlayers(),
        gameEventsToAudio: getSounds(),
    });

    const toggleQuadrakillAndNotifyBrowser = () => {
        toggleQuadrakill(quadrakill);
        settingsWindow.send('quadrakillUpdateFromTray', {
            isDisconnected: quadrakill.isDisconnected(),
        });
    };

    return {
        quadrakill,
        quadrakillItem: {
            checked: false,
            click: toggleQuadrakillAndNotifyBrowser,
            enabled: false,
            id: 'quadrakill',
            label: 'Quadrakill Hype Man',
            type: 'checkbox',
        },
    };
};

const handleQuadrakillEvents = ({ contextMenu, quadrakill, tray }) => {
    quadrakill.eventEmitter.on('connected', () => {
        contextMenu.getMenuItemById('quadrakill').checked = true;
        tray.setContextMenu(contextMenu);
    });
    quadrakill.eventEmitter.on('disconnected', () => {
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

const openSettings = (settingsWindow) => {
    settingsWindow.show();
};

const startTray = async ({ pluginManager, plugins, settingsWindow }) => {
    const tray = new Tray(iconPath);
    const pluginItems = Object.values(plugins).map((plugin) => ({
        checked: plugin.enabled,
        click: () =>
            togglePluginAndNotifyBrowser({
                plugin,
                pluginManager,
                settingsWindow,
            }),
        id: plugin.label,
        label: plugin.label,
        type: 'checkbox',
    }));
    const { quadrakill, quadrakillItem } = await initQuadrakill(settingsWindow);
    const contextMenu = Menu.buildFromTemplate([
        ...pluginItems,
        { type: 'separator' },
        ...(quadrakillItem ? [quadrakillItem, { type: 'separator' }] : []),
        {
            click: () => openSettings(settingsWindow),
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

    return { contextMenu, quadrakill, tray };
};

const createSettingsWindow = () => {
    const settingsWindow = new BrowserWindow({
        center: true,
        icon: iconPath,
        minHeight: 800,
        minWidth: 800,
        resizeable: false,
        show: false,
        title: 'Support',
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });
    settingsWindow.setMenuBarVisibility(false);
    settingsWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    settingsWindow.on('minimize', (event) => {
        event.preventDefault();
        settingsWindow.hide();
    });
    settingsWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            settingsWindow.hide();
        }

        return false;
    });

    return settingsWindow;
};

app.whenReady().then(async () => {
    const settingsWindow = createSettingsWindow();
    await loadPlugins();
    loadSounds();
    const { pluginManager, plugins } = await startPluginManager();
    const { contextMenu, quadrakill, tray } = await startTray({
        pluginManager,
        plugins,
        settingsWindow,
    });

    ipcMain.handle('requestPlugins', getPlugins);
    ipcMain.on('togglePlugin', async (_event, label) => {
        const plugin = plugins.find((plugin) => plugin.label === label);
        await togglePlugin({ plugin, pluginManager });
        contextMenu.getMenuItemById(label).checked = plugin.enabled;
        tray.setContextMenu(contextMenu);
    });

    ipcMain.handle('requestSounds', getSounds);
    ipcMain.on('toggleQuadrakill', () => {
        toggleQuadrakill(quadrakill);
    });
    ipcMain.on('updateSound', (_event, { filePath, name, volume }) => {
        updateSound({ filePath, name, volume });
    });
});
