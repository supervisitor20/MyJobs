var prodConfig = require('./webpack.config.js');

prodConfig.plugins = [];

// In development we still want our modules built even when eslint is
// complaining.
prodConfig.eslint = {};

module.exports = prodConfig;
