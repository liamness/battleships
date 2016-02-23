build:
	# start build tasks
	eslint src/js/** &
	postcss -c config/postcss.json &
	webpack --config config/webpack.config.js

server:
	# start watch tasks
	esw src/js/** --watch &
	postcss -c config/postcss.dev.json -m --watch &
	webpack --config config/webpack.dev.config.js --watch &

	# open browser with live reload
	browser-sync start --server public --files 'public/*.css, public/*.html, public/*.js'
