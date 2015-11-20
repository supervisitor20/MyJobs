require('babel/register');

var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var babel = require('gulp-babel');
var util = require('gulp-util');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var jasmine = require('gulp-jasmine');

// This build produces several javascript bundles.
// * vendor.js - Contains all the libraries we use, bundled and minified.
//     This code is shared by all other app bundles. It is expected to be
//     larger than app bundles and shared by all pages needing this
//     infrastructure.
// * reporting.js, [other-apps].js, etc. - These contain mostly only code
//     used in a specific application. There should be one for each "app"
//     in our site.
//
// For production builds use the default target.
//
// For development run the default target, then leave the watch target running.

// Future: Add jshint to the application bundle builds in the hope that we
//     can use it in a manner similar to how use use flake8 on python code.

// These go in vendor.js and are left out of app specific bundles.
var vendor_libs = [
    'react',
    'react-dom',
    'redux',
    'react-redux',
    'react-bootstrap',
    'react-autosuggest',
    'babel/polyfill',
    'fetch-polyfill',
    'es6-promise',
];

var dest = '../static/bundle';

gulp.task('vendor', function() {
    return browserify([], { debug: true, list: true, })
    .require(vendor_libs)
    .on('package', function(pkg) {
        util.log("Vendor package:", pkg.name)
    })
    .on('error', function(error, meta) {
        util.log("Browserify error:", error.toString());
        this.emit('end');
    })
    .bundle()
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify({ mangle: false }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dest));
});

// If an app task starts logging that it is including packages, add those
// packages to vendor_libs. If more libaries are processed in app specific
// bundle processing, the build starts taking too long and that code will
// be redownloaded for different apps, instead of shared by the vendor.js
// bundle.
//
// The list of ok packages here are:
// * de-build (thats us),
// * babel-runtime
// * process
// * core-js
//
// Ideally this bundle would contain only de-build but I can't figure out
// how to get the others into vendor.js, as they are processed differently
// from ordinary node.js libraries.

gulp.task('reporting', function() {
    return browserify([], {
        debug: true,
        paths: ['./src'],
    })
    .external(vendor_libs)
    .add('src/reporting/main.js')
    .transform(babelify.configure({optional: 'runtime'}))
    .on('package', function(pkg) {
        util.log("Including package:", pkg.name)
    })
    .bundle()
    .on('error', function(error, meta) {
        util.log("Browserify error:", error.toString());
        // Unstick browserify on some errors. Keeps watch alive.
        this.emit('end');
    })
    .pipe(source('reporting.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    // Consider adding this to production builds later when we are sure
    // we won't need unminified code available.
    //.pipe(uglify({ mangle: false }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dest));
});

gulp.task('test', function() {
    return gulp.src(['./src/**/spec/*.js'])
        .pipe(jasmine({
            includeStackTrace: false,
        }));
});

// Build everything. Good way to start after a git checkout.
gulp.task('build', ['vendor', 'reporting']);

// Leave this running in development for a pleasant experience.
gulp.task('watch', function() {
    return gulp.watch('src/**/*', ['test', 'reporting']);
});

gulp.task('default', ['build', 'test']);
