const Store = require('electron-store');
const { getAllPlugins } = require('./plugins');
const {
    ELIGIBLE_PLAYERS,
    GAME_EVENTS_TO_AUDIO,
} = require('./quadrakillSettings');

const store = new Store();
console.log('store location:', store.path);

const PLUGINS_PATH = 'plugins';
const getPluginEnabled = (label) => {
    return store.get(`${PLUGINS_PATH}.${label}.enabled`) || false;
};
const getPlugins = () => {
    return store.get(PLUGINS_PATH) || {};
};
const loadPlugins = async () => {
    const plugins = (await getAllPlugins()) || {};
    Object.values(plugins).forEach((plugin) => {
        const pluginPath = `${PLUGINS_PATH}.${plugin.label}`;
        if (!store.get(pluginPath)) {
            store.set(pluginPath, { enabled: true });
        }
    });
};
const updatePlugin = ({ enabled, label }) => {
    const pluginPath = `${PLUGINS_PATH}.${label}.enabled`;
    store.set(pluginPath, enabled);
};

const QUADRAKILL_PATH = 'quadrakill'
const ELIGIBLE_PLAYERS_PATH = `${QUADRAKILL_PATH}.players`;
const SOUNDS_PATH = `${QUADRAKILL_PATH}.sounds`;
const getPlayers = () => {
    return store.get(ELIGIBLE_PLAYERS_PATH) || [];
};
const getSounds = () => {
    return store.get(SOUNDS_PATH) || {};
};
const loadSounds = () => {
    const storedPlayers = store.get(ELIGIBLE_PLAYERS_PATH) || [];
    ELIGIBLE_PLAYERS.forEach((player) => {
        if (!storedPlayers.includes(player)) {
            storedPlayers.push(player);
        }
    });
    store.set(ELIGIBLE_PLAYERS_PATH, storedPlayers);

    const storedSounds = getSounds() || {};
    Object.entries(GAME_EVENTS_TO_AUDIO).forEach(([key, value]) => {
        if (!storedSounds[key]) {
            storedSounds[key] = value;
        }
    });
    store.set(SOUNDS_PATH, storedSounds);
};
const updateSound = ({ filePath, name, volume }) => {
    store.set(`${SOUNDS_PATH}.${name}`, {
        soundFile: filePath,
        volume,
    });
};

module.exports = {
    getPlayers,
    getPluginEnabled,
    getPlugins,
    getSounds,
    loadPlugins,
    loadSounds,
    store,
    updateSound,
    updatePlugin,
};
