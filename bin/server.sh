#!/bin/bash

# start watch tasks
esw src/js/** &
postcss -c config/postcss.dev.json -m --watch &
webpack --config config/webpack.dev.config.js --watch &

# open browser with live reload
browser-sync start --server public --files 'public/*.css, public/*.html, public/*.js'
