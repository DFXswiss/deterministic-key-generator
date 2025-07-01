const path = require('path');

module.exports = {
  entry: './lds.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lds.js',
    library: 'lds',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "vm": require.resolve("vm-browserify")
    }
  },
  plugins: [
    new (require('webpack')).ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ],
  mode: 'production',
};
