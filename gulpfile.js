var bs = require('browser-sync').create(),
    del = require('del'),
    filter = require('gulp-filter'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    stylish = require('jshint-stylish'),
    webpack = require('webpack');

var webpackOptions = {
    entry: './src/app.js',
    output: {
        filename: 'public/app.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    }
};

// build tasks
gulp.task('clean', function() {
    del([
        'public/*.css',
        'public/*.js',
        'public/*.map'
    ]);
});

gulp.task('js', function(done) {
    webpack({
        entry: webpackOptions.entry,
        output: webpackOptions.output,
        module: webpackOptions.module,
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                mangle: true,
                screw_ie8: true,
                sourceMap: true
            })
        ]
    }, function(err, stats) {
        done();
    });
});

gulp.task('jshint', function() {
    return gulp
        .src('src/*.js')
        .pipe(jshint({ esnext: true }))
        .pipe(jshint.reporter(stylish));
});

gulp.task('sass', function() {
    return gulp
        .src('sass/*.scss')
        .pipe(sass({
            includePaths: require('node-bourbon').includePaths,
            outputStyle: 'compressed'
        }))
        .pipe(gulp.dest('public'));
});

// watch tasks
gulp.task('sass-watch', function(done) {
    return gulp
        .src('sass/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: require('node-bourbon').includePaths,
            outputStyle: 'expanded'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public'))
        .pipe(filter('*.css'))
        .pipe(bs.stream());
});

gulp.task('js-watch', function() {
    webpack({
        entry: webpackOptions.entry,
        output: webpackOptions.output,
        module: webpackOptions.module,
        watch: true,
        devtool: 'source-map',
    }, function(err, stats) {
        bs.reload();
    });
});

gulp.task('default', ['clean', 'jshint', 'js', 'sass']);

gulp.task('serve', ['clean', 'jshint', 'js-watch', 'sass-watch'], function() {
    bs.init({ server: 'public' });
    gulp.watch('public/*.html', bs.reload);
    gulp.watch('src/*.js', ['jshint']);
    gulp.watch('sass/*.scss', ['sass-watch']);
});
