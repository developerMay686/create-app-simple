const merge = require('webpack-merge');
  const baseConfig = require('./webpack.base.conf.js');

  module.exports = merge(baseConfig, {
      mode: 'development',
      devtool: 'cheap-module-source-map', // 'inline-source-map',
      devServer: {
          contentBase: './dist',
          port: 3000
      }
  });