require('babel-register')({
  presets: ["es2015", "react", "stage-2"],
});
require('babel-polyfill');

var fs = require('fs');
var gulp = require('gulp');
var webpack = require('webpack');
var util = require('gulp-util');
var gulpif = require('gulp-if');
var jasmine = require('gulp-jasmine');
var eslint = require('gulp-eslint');


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

// These go in vendor.js and are left out of app specific bundles.
var vendorLibs = [
  'react',
  'react-dom',
  'react-bootstrap/lib/Button.js',
  'react-bootstrap/lib/Glyphicon.js',
  'react-autosuggest',
  'fetch-polyfill',
  'babel-polyfill',
  'es6-promise',
  'warning',
];

var dest = '../static/bundle';

var strip_debug = true;

function webpackConfig() {
  return {
    entry: {
      reporting: './src/reporting/main',
      manageusers: './src/manageusers/manageusers',
      vendor: vendorLibs,
    },
    resolve: {},
    output: {
      path: '../static/bundle',
      filename: '[name].js',
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          query: {
            presets: ["es2015", "react", "stage-2"],
          }
        },
      ],
    },
    plugins: [],
  };
}

gulp.task('bundle', function(callback) {
  var config = webpackConfig();
  config.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }));
  webpack(config, function(err, stats) {
    if(err) {
      throw new util.PluginError("webpack", err);
    }
    util.log("\n", stats.toString("minimal"));
    fs.writeFile('profile.json', JSON.stringify(stats.toJson(), null, 4));
    callback();
  });
});

var webpackCache = {};

gulp.task('watch-bundle', function(callback) {
  var config = webpackConfig();
  config.debug = true;
  config.devtool = 'eval-source-map';
  config.cache = webpackCache;
  config.resolve.unsafeCache = true;
  config.profile = true;
  config.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js',
      minChunks: Infinity,
    }))
  webpack(config, function(err, stats) {
    if(err) {
      throw new util.PluginError("webpack", err);
    }
    util.log(stats.toString('minimal'));
    fs.writeFile('profile.json', JSON.stringify(stats.toJson(), null, 4));
    callback();
  });
});

gulp.task('test', function() {
  return gulp.src(['./src/**/spec/*.js'])
    .pipe(jasmine({
      includeStackTrace: false,
    }));
});

/**
 * lint-fix: run eslint with fix mode on.
 *
 * This can be helpful in limited circumstances. Be careful.
 *
 * It is not part of watch or the default build. Let's keep it
 * that way.
 */
gulp.task('lint-fix', function() {
  function isFixed(file) {
    return file.eslint != null && file.eslint.fixed;
  };
  return gulp.src(['./src/**/*.js'])
    .pipe(eslint({
      extends: 'airbnb',
      env: {
        jasmine: true,
      },
      parser: 'babel-eslint',
      plugins: ['babel'],
      rules: {
        "babel/object-curly-spacing": 1,
        "babel/no-await-in-loop": 1,
      },
      fix: true,
    }))
    .pipe(eslint.format())
    .pipe(gulpif(isFixed, gulp.dest("./src")));
});

gulp.task('lint', function() {
  return gulp.src(['./src/**/*.js', '!./src/manageusers/**/*'])
    .pipe(eslint({
      extends: 'airbnb',
      env: {
        jasmine: true,
      },
      parser: 'babel-eslint',
      plugins: ['babel'],
      rules: {
        "babel/object-curly-spacing": 1,
        "babel/no-await-in-loop": 2,
      },
    }))
    .pipe(eslint.format());
});

// Build everything. Good way to start after a git checkout.
gulp.task('build', ['bundle', 'lint', 'test']);

// Leave this running in development for a pleasant experience.
gulp.task('watch', ['watch-bundle'], function() {
    return gulp.watch('src/**/*', ['watch-bundle', 'test', 'lint']);
});

gulp.task('default', ['build']);
