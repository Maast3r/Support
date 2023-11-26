const getAllPlugins = async () => {
    return Promise.all([
        import('lcu-tahm-kench-plugin'),
        import('lcu-start-queue-plugin'),
        import('lcu-request-party-owner-plugin'),
        import('lcu-reject-party-owner-plugin'),
    ]).then(
        ([
            { default: TahmKenchLcuPlugin },
            { default: StartQueueLcuPlugin },
            { default: RequestPartyOwnerLcuPlugin },
            { default: RejectPartyOwnerLcuPlugin },
        ]) => {
            return {
                tahmKench: {
                    label: 'Tahm Kench',
                    plugin: new TahmKenchLcuPlugin(),
                },
                startQueue: {
                    label: 'Start Queue',
                    plugin: new StartQueueLcuPlugin(),
                },
                requestPartyOwner: {
                    label: 'Request Party Owner',
                    plugin: new RequestPartyOwnerLcuPlugin(),
                },
                rejectPartyOwner: {
                    label: 'Reject Party Owner',
                    plugin: new RejectPartyOwnerLcuPlugin(),
                },
            };
        }
    );
};

module.exports = { getAllPlugins };
