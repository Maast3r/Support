const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { IgnorePlugin } = require('webpack');

const optionalPlugins = [];
if (process.platform !== 'darwin') {
    // don't ignore on OSX
    optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }));
    optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^zlib-sync$/ }));
    optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^bufferutil$/ }));
    optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^utf-8-validate$/ }));
}

module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/main.js',
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'assets'),
                    to: path.resolve(__dirname, '.webpack/assets'),
                },
            ],
        }),
        ...optionalPlugins,
    ],
};
