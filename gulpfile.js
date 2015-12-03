'use strict';

var argv = require('minimist')(process.argv.slice(2));
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var fs = require('fs');
var gulp = require('gulp');
var del = require('del');
var $ = require('gulp-load-plugins')();

// Minimize and optimize during a build?
var RELEASE = !!argv.release;

//
// Set up some paths for configuration
var src    = 'src';
var target = 'extension';

// Define the asset paths
var paths = {
  main:        src + '/scripts/**/*.{js,hbs}',
  background: [src + '/background.js', src + '/background/**/*.js'],
  templates:   src + '/scripts/templates/**/*.hbs',
  styles:      src + '/styles/**/*.scss',
  images:      src + '/images/**',
  icons:       src + '/icons/**',
  other:      [src + '/*.{json,html}', src + '/content.js']
};

gulp.task('clean', function(cb) { del([target + '/**/*'], cb); });

gulp.task('bundle_bg', function(cb) {
  return gulp.src(paths.background)
    .pipe($.plumber())
    .pipe($.webpack({
      output: { filename: 'background.js' },
      debug: !!RELEASE }))
    .pipe($.if(RELEASE, $.uglify()))
    .pipe(gulp.dest('extension'));
});

gulp.task('bundle', function(cb) {
  return gulp.src(paths.main)
    .pipe($.plumber())
    .pipe($.webpack({
      output: { filename: 'app.js' },
      module: { loaders: [{ test: /\.hbs$/, loader: 'handlebars-loader' }] },
      debug: !!RELEASE }))
    .pipe($.if(RELEASE, $.uglify()))
    .pipe(gulp.dest('extension'));
});

// Compiles SASS using compass
gulp.task('compass', function() {
  del(['.tmp/css/**/*']);
  return gulp.src(paths.styles)
    .pipe($.plumber({ errorHandler: function(error) {
      console.log(error.message);
      this.emit('end');
    }}))
    .pipe($.compass({ css: '.tmp/css', sass: 'src/styles', require: ['sass-globbing'] }))
    .pipe($.if(RELEASE, $.minifyCss()))
    .pipe(gulp.dest(target));
});

// Copies all static icons to extension folder
gulp.task('icons', function() {
  return gulp.src(paths.icons, { base: 'src' })
    .pipe($.plumber())
    .pipe($.if(RELEASE, $.imagemin({ optimizationLevel: 5 })))
    .pipe(gulp.dest(target));
});

// Copies all static images to extension folder
gulp.task('images', function() {
  return gulp.src(paths.images, { base: 'src' })
    .pipe($.plumber())
    .pipe($.if(RELEASE, $.imagemin({ optimizationLevel: 5 })))
    .pipe(gulp.dest(target));
});

// Copies static assets to the extension folder
gulp.task('copy', function() {
  return gulp.src(paths.other)
    .pipe($.plumber())
    .pipe(gulp.dest(target));
});

gulp.task('crx', ['build'], function() {
  return gulp.src('extension')
    .pipe($.crx({
      privateKey: fs.readFileSync('./extension.pem', 'utf8'),
      filename: 'give-me-five.crx'
    }))
    .pipe(gulp.dest('.'));
});

// Rerun the tasks when files changes
gulp.task('watch', function() {
  gulp.watch(paths.main, ['bundle']);
  gulp.watch(paths.background, ['bundle_bg']);
  gulp.watch(paths.other, ['copy']);
  gulp.watch(paths.html, ['htmlmin']);
  gulp.watch(paths.styles, ['compass']);
  gulp.watch(paths.icons, ['icons']);
  gulp.watch(paths.images, ['images']);
});

// Build
gulp.task('build', [
  'clean', 'bundle', 'bundle_bg', 'compass', 'copy', 'images', 'icons'
]);

// Default performs all tasks and watches
gulp.task('default', [
  'build', 'watch'
]);

// Build extension
gulp.task('release', ['crx']);
