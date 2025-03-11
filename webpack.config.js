const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/browser/src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist/browser'),
    filename: 'bundle.js'
  },
  target: 'web',
  mode: 'development',
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/"),
      "url": require.resolve("url/"),
      "querystring": require.resolve("querystring-es3"),
      "http": require.resolve("stream-http"),
      "zlib": require.resolve("browserify-zlib"),
      "os": require.resolve("os-browserify/browser"),
      "fs": false,
      "net": false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ],
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
      }
    ]
  }
};
