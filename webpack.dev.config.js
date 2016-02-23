/* eslint-env node  */

var config = require('./webpack.base.config');

config['devtool'] = 'inline-source-map';

module.exports = config;
