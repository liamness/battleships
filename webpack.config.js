var webpack = require('webpack');

module.exports = {
    entry: './src/js/app.js',
    output: {
        filename: 'public/app.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            mangle: true,
            screw_ie8: true,
            sourceMap: true
        })
    ]
};
