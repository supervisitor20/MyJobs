var prodConfig = require('./webpack.config.js');

prodConfig.plugins = [];

// In development we still want our modules built even when eslint is
// complaining.
prodConfig.eslint = {};

// Linux users not using docker can do without this.
prodConfig.watchOptions = {poll: 1000};

module.exports = prodConfig;
