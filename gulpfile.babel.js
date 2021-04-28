import path from 'path'
import del from 'del'

import babel from 'gulp-babel'
import composer from 'gulp-uglify/composer'
import gulp from 'gulp'
import newer from 'gulp-newer'
import removeCode from 'gulp-remove-code'
import sourcemaps from 'gulp-sourcemaps'
import uglifyes from 'uglify-es'
import nodemon from 'nodemon'

const uglify = composer(uglifyes, console)

const paths = {
  js: ['src/**/*.js', '!dist/**', '!node_modules/**', '!coverage/**'],
  nonJs: ['./package.json', './.env', 'data/**'],
  tests: './server/tests/*.js',
  data: ['utils/*.json', 'utils/*.jpg', 'utils/*.png', 'utils/*.mp3'] // 之後改到 sample data
}

export const clean = () => del(['dist/**', 'dist/.*', '!dist'])

export const copy = () => gulp.src(paths.nonJs, { 'base': '.' }).pipe(newer('dist')).pipe(gulp.dest('dist'))
export const copyData = () => gulp.src(paths.data).pipe(newer('dist/utils')).pipe(gulp.dest('dist/utils'))

export const monitor = () => {
  const nm = nodemon({
    script: path.join('dist', 'app.js'),
    ext: 'js',
    ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
    tasks: ['copy', 'scripts']
  })

  nm.on('crash', () => {
    nodemon.emit('quit')
    setTimeout(() => {

    }, 500)
  })
}

export function scripts () {
  return gulp.src([...paths.js, '!gulpfile.babel.js'])
    .pipe(newer('dist'))
    .pipe(babel())
    // .pipe(uglify())
    .pipe(gulp.dest('dist'))
}

export function scriptsProd () {
  return gulp.src([...paths.js, '!gulpfile.babel.js'])
    .pipe(newer('dist'))
    .pipe(removeCode({ production: true }))
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
}

gulp.task('deploy', gulp.series(clean, copy, scripts))
gulp.task('serve', gulp.series(clean, copy, scripts, monitor))

gulp.task('product', gulp.series(clean, copy, scriptsProd))
