const path = require('path');
const WebpackMessages = require('webpack-messages');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    modules: ['node_modules', '.'],
    alias: {},
  },
  plugins: [
    new WebpackMessages({
      name: 'client',
      logger: (str) => console.log(`>> ${str}`),
    }),
    new ForkTsCheckerWebpackPlugin(),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(svg|mp3)($|\?)/,
        use: [
          {
            loader: 'file-loader',
            options: {
              limit: 65000,
              mimetype: 'image/svg+xml',
              name: '[name].[ext]',
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)($|\?)/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          esModule: false,
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ],
  },
};

module.exports = config;
