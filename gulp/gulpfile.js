require('babel/register');
require('babel/polyfill');
var process = require('process');

var fs = require('fs');
var gulp = require('gulp');
var webpack = require('webpack');
var util = require('gulp-util');
var jasmine = require('gulp-jasmine');
var eslint = require('gulp-eslint');

process.on('SIGINT', function() {
  process.exit(1);
});

// This build produces several javascript bundles.
// * vendor.js - Contains all the libraries we use, bundled and minified.
//     This code is shared by all other app bundles. It is expected to be
//     larger than app bundles and shared by all pages needing this
//     infrastructure.
//
//     In production this bundle also contains whatever code webpack deemed
//     as common to all app bundles.
//
// * reporting.js, [other-apps].js, etc. - These contain mostly only code
//     used in a specific application. There should be one for each "app"
//     in our site.
//
// For production builds use the default target.
//
// For development tests:
//   run gulp watch-tasks watch

var dest = '../static/bundle';
var produceWebpackProfile = false;

gulp.task('bundle', function(callback) {
  var config = require('./webpack.config.js');
  webpack(config, function(err, stats) {
    if(err) {
      throw new util.PluginError("webpack", err);
    }
    util.log(stats.toString("minimal"));
    if (stats.hasErrors()) {
      callback('webpack error');
      return;
    }
    if (produceWebpackProfile) {
      fs.writeFile('profile.json', JSON.stringify(stats.toJson(), null, 4));
    }
    callback();
  });
});

gulp.task('test', function() {
  var testConfig = require('./jasmine.json');
  return gulp.src(['./src/**/spec/*.js'])
    .pipe(jasmine(testConfig));
});

gulp.task('lint', function() {
  return gulp.src(['./src/**/*.js', './src/**/*.jsx'])
    .pipe(eslint())
    .pipe(eslint.format());
});

// Build everything. Good way to start after a git checkout.
gulp.task('build', ['bundle', 'lint', 'test']);

gulp.task('watch-tasks', ['test', 'lint']);

// Leave this running in development for a pleasant experience.
gulp.task('watch', function() {
    return gulp.watch('src/**/*', ['watch-tasks']);
});

// This is how we build in production.
// In production NODE_ENV is set to 'production'.
gulp.task('default', ['build']);
