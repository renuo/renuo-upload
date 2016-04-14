'use strict';

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var babel = require('gulp-babel');
var del = require('del');
var tslint = require('gulp-tslint');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var karma = require('karma');
var open = require('open');
var rename = require('gulp-rename');

var tsProject = ts.createProject('tsconfig.json');
var tsSpecsProject = ts.createProject('tsconfig_specs.json');

const paths = {
  src: 'src/',
  srcTsFiles: 'src/**/*.ts',
  srcSpecFiles: 'src/**/*.spec.ts',
  dist: 'dist/',
  distFiles: 'dist/*',
  tmp: '.tmp/',
  tmpSpecFiles: ['.tmp/specs.js', '.tmp/specs.js.map'],
  tmpHtmlFiles: '.tmp/*.html',
  tmpFiles: '.tmp/*',
  demoFiles: 'demo/**/*.html'
};

// TODO: setup protractor

gulp.task('test', ['tscompile-specs'], function (done) {
  gulp.start('test-raw');
  return done();
});

gulp.task('test-raw', function (done) {
  new karma.Server({
    configFile: __dirname + '/karma.conf.coffee',
    singleRun: true
  }, done).start();
});

gulp.task('tslint', function () {
  return gulp.src(paths.srcTsFiles)
      .pipe(tslint())
      .pipe(tslint.report('prose'));
});

gulp.task('clean-all', function (callback) {
  return del(paths.tmpFiles, callback);
  return del(paths.distFiles, callback);
});

gulp.task('copyhtml', ['clean-html'], function () {
  return gulp.src(paths.demoFiles)
      .pipe(gulp.dest(paths.tmp))
      .pipe(connect.reload());
});

gulp.task('clean-html', function (callback) {
  return del(paths.tmpHtmlFiles, callback);
});

gulp.task('serve', ['copyhtml', 'tslint', 'tscompile', 'tscompile-specs'], function (callback) {
  connect.server({
    root: [paths.tmp, './bower_components'],
    livereload: true,
    host: 'renuo-upload.dev'
  });
  open('http://renuo-upload.dev:8080');
  gulp.start('watch');
  return callback();
});

gulp.task('tdd', ['copyhtml', 'tslint', 'tscompile', 'tscompile-specs'], function (done) {
  gulp.start('watch');
  return done();
});

gulp.task('ts-single-compile', ['clean-js-main'], function () {
  return gulp.src(paths.src + 'renuo_upload.ts')
      .pipe(sourcemaps.init())
      .pipe(ts(tsProject))
      .pipe(babel({presets: ['es2015']}))
      .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: 'src'}))
      .pipe(gulp.dest(paths.tmp))
      .pipe(connect.reload());
});

gulp.task('clean-js-main', function (callback) {
  return del(['.tmp/renuo-upload.js', '.tmp/renuo-upload.js.map'], callback);
});

gulp.task('ts-specs-compile', ['clean-js-specs'], function () {
  return gulp.src(paths.srcSpecFiles)
      .pipe(sourcemaps.init())
      .pipe(ts(tsSpecsProject))
      .pipe(babel({presets: ['es2015']}))
      .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: 'src'}))
      .pipe(gulp.dest(paths.tmp))
      .pipe(connect.reload());
});

gulp.task('clean-js-specs', function (callback) {
  return del(paths.tmpSpecFiles, callback);
});

gulp.task('watch', function (done) {
  gulp.watch(paths.srcTsFiles, ['test', 'tscompile']);
  gulp.watch(paths.demoFiles, ['copyhtml']);
  return done();
});

gulp.task('clean-js-dist', function (callback) {
  return del(['dist/renuo-upload.js', 'dist/renuo-upload.js.map'], callback);
});

gulp.task('dist', ['ts-single-compile'], function (done) {
  return gulp.src('.tmp/renuo-upload.js')
      .pipe(uglify({
        wrap: true,
        screwIE8: true
      }))
      .pipe(rename({
        extname: '.min.js'
      }))
      .pipe(gulp.dest('dist'), done);
});

gulp.task('tscompile', ['tslint', 'ts-single-compile']);
gulp.task('tscompile-specs', ['tslint', 'ts-specs-compile']);
gulp.task('default', ['tslint', 'tscompile', 'test']);

