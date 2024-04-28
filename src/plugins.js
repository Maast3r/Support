const getAllPlugins = async () => {
    return Promise.all([
        import('lcu-tahm-kench-plugin'),
        import('lcu-start-queue-plugin'),
        import('lcu-request-party-owner-plugin'),
        import('lcu-reject-party-owner-plugin'),
        import('lcu-plugins'),
    ]).then(
        ([
            { default: TahmKenchLcuPlugin },
            { default: StartQueueLcuPlugin },
            { default: RequestPartyOwnerLcuPlugin },
            { default: RejectPartyOwnerLcuPlugin },
            { default: lcuPlugins },
        ]) => {
            const plugins = {
                'Tahm Kench': {
                    label: 'Tahm Kench',
                    plugin: new TahmKenchLcuPlugin(),
                },
                'Start Queue': {
                    label: 'Start Queue',
                    plugin: new StartQueueLcuPlugin(),
                },
                'Request Party Owner': {
                    label: 'Request Party Owner',
                    plugin: new RequestPartyOwnerLcuPlugin(),
                },
                'Reject Party Owner': {
                    label: 'Reject Party Owner',
                    plugin: new RejectPartyOwnerLcuPlugin(),
                },
            };

            lcuPlugins.forEach((plugin) => {
                const PluginName = plugin.plugin;

                plugins[plugin.label] = {
                    label: plugin.label,
                    plugin: new PluginName(),
                };
            });

            return plugins;
        }
    );
};

module.exports = { getAllPlugins };
