const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './webpack-entry.js',
    output: {
        filename: 'ark-sdk-bundle.js',
        path: path.resolve(__dirname, 'src/js'),
        library: 'ArkSDK',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    mode: 'production',
    resolve: {
        extensions: ['.js', '.json'],
        fallback: {
            // Polyfills for Node.js modules used by the SDK
            "buffer": require.resolve("buffer/"),
            "process": require.resolve("process/browser"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "util": require.resolve("util/"),
            "assert": require.resolve("assert/"),
            "events": require.resolve("events/"),
            "path": require.resolve("path-browserify"),
            "url": require.resolve("url/"),
            "http": false,
            "https": false,
            "os": false,
            "fs": false,
            "net": false,
            "tls": false,
            "child_process": false
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    },
    optimization: {
        minimize: true
    }
};