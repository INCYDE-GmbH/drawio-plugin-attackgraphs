const path = require('path');
const version = require('./package.json').version;
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

const LAUNCH_COMMAND = process.env.npm_lifecycle_event;

module.exports = {
  entry: './src/index.ts',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __VERSION__: JSON.stringify(version),
      __DEVELOPMENT__: LAUNCH_COMMAND === 'watch',
    }),
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname, 'templates'), to: 'templates' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: { 'vm': false }
  },
  output: {
    filename: 'attackgraphs.js',
    path: path.resolve(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]'  // map to source with absolute file path not webpack:// protocol
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    proxy: {
      '/': {
        target: 'https://jgraph.github.io/drawio/src/main/webapp',
        changeOrigin: true,
      },
    },
    compress: true,
    port: 8000,
  }
};
