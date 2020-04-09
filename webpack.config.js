const path = require('path');
const webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
  mode: "production",
  target: "node",
  entry: {
    main: './src/index.ts',
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [{
      test: /\.ts?$/,
      use: 'awesome-typescript-loader'
    }]
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new CheckerPlugin()
  ]
}