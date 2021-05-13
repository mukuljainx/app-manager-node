const path = require('path');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');
// @ts-ignore
const common = require('./webpack.common');

const config = {
  mode: 'production',
  entry: ['./src/index'],
  output: {
    publicPath: '/manager/apps/appName/',
    path: path.resolve('build'),
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  // optimization: {
  //   splitChunks: {
  //     // include all types of chunks
  //     chunks: "all",
  //     maxAsyncRequests: 1
  //   },
  //   runtimeChunk: "single"
  // },
  devtool: false,
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
    new UglifyJsPlugin({
      sourceMap: true,
      include: /\.min\.js$/,
      uglifyOptions: {
        ecma: 5,
      },
    }),
    new WebpackManifestPlugin(),
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};

module.exports = merge.default(common, config);
