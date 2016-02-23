#!/bin/bash

# start build tasks
eslint src/js/** &
postcss -c config/postcss.json &
webpack --config config/webpack.config.js
