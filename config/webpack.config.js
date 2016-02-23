/* eslint-env node  */

var webpack = require('webpack');
var config = require('./webpack.base.config');

config['plugins'] = [
    new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        screw_ie8: true,
        sourceMap: true
    })
];

module.exports = config;
