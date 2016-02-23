/* eslint-env node  */

module.exports = {
    entry: './src/js/app.js',
    output: {
        filename: 'public/app.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    }
};
