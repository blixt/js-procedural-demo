var browserify = require('gulp-browserify');
var es6ify = require('es6ify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var merge = require('merge');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

function browserifyPipe(path, opt_options) {
  var production = !!gutil.env.production;

  // Default options.
  var options = {
    debug: !production,
    name: null,
    es6: true,
    uglify: production
  };

  // Apply user options.
  merge(options, opt_options);

  var browserifyOptions = {debug: options.debug};
  if (options.es6) {
    browserifyOptions.add = es6ify.runtime;
    browserifyOptions.transform = es6ify;
  }

  var pipeline = gulp.src(path)
    .pipe(browserify(browserifyOptions))
      .on('error', function (error) {
        gutil.log(gutil.colors.red('Browserify error:'), error.message);
      })
    .pipe(options.uglify ? uglify() : gutil.noop());

  if (options.name) {
    pipeline = pipeline.pipe(rename(options.name));
  }

  return pipeline.pipe(gulp.dest('build'));
}

gulp.task('browserify', function () {
  return browserifyPipe('index.js');
});

gulp.task('watch', function () {
  gulp.watch(['index.js', 'lib/**/*.js'], ['browserify']);

  // This is only here to make it easier to develop procedural with npm link.
  gulp.watch([
    'node_modules/procedural/index.js',
    'node_modules/procedural/lib/**/*.js'
  ], ['browserify']);
});

gulp.task('default', ['browserify']);
