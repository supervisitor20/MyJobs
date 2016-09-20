var prodConfig = require('./webpack.config.js');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

prodConfig.plugins = [new ExtractTextPlugin('custom.css', {allChunks: true})];

// In development we still want our modules built even when eslint is
// complaining.
prodConfig.eslint = {};

prodConfig.watchOptions = {poll: 1000};

module.exports = prodConfig;
