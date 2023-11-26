const Store = require('electron-store');
const { getAllPlugins } = require('./plugins');

const loadStore = async () => {
    const store = new Store();
    const plugins = await getAllPlugins();
    Object.values(plugins).forEach((plugin) => {
        if (!store.get(plugin.label)) {
            store.set(plugin.label, { checked: true });
        }
    });

    return store;
};

module.exports = { loadStore };
