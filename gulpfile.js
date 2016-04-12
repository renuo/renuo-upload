var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var typescript = require('gulp-tsc');


const paths = {
  src: './src/**/*.ts',
  dist: './dist/',
  tmp: './tmp/'
};

gulp.task('typescript-compile', function(){
  gulp.src(paths.src)
    .pipe(typescript())
    .pipe(gulp.dest(paths.tmp))
});

gulp.task('release', function(){
  gulp.src( paths.src)
    .pipe(typescript())
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(paths.dist))
});

gulp.task('watch', function(){
  gulp.watch([paths.src], ['compile']);
});

gulp.task('default', ['watch']);