coffee = require 'gulp-coffee'
gulp = require 'gulp'
gutil = require 'gulp-util'
rename = require 'gulp-rename'
uglify = require 'gulp-uglify'

paths = {
  src: './src/*.coffee'
  dist: './dist/'
  tmp: './tmp/'
}

gulp.task 'coffee', ->
  gulp.src paths.src
  .pipe coffee({bare: true}).on('error', gutil.log)
  .pipe gulp.dest(paths.tmp)


gulp.task 'release', ->
  gulp.src paths.src
  .pipe coffee({bare: true}).on('error', gutil.log)
  .pipe uglify()
  .pipe rename({extname: '.min.js'})
  .pipe gulp.dest(paths.dist)

gulp.task 'watch', ->
  gulp.watch [paths.src], ['coffee']

gulp.task 'default', ['watch']
