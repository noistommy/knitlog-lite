const {series, parallel, src, dest, watch} = require('gulp')
const fs = require('fs')
const del = require('del')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')

const gulpSass = require('gulp-sass')

const sass = gulpSass(require('dart-sass'))

async function clean(cb) {
  return del(['./views/output/*']).then(path => {
    console.log(`clean to ${path}`)
  })
}

function build() {
  return src('./views/*.scss')
  .pipe(notify('build scss!!'))
  .pipe(plumber({ errorHandler: notify.onError((error) => `Error: ${error.message}`)}))
  .pipe(sass())
  .pipe(dest('./views/output'))
}

function watcher() {
  const watched = watch(['./views/*.scss'], series(clean, build))
  watched.on('change', function (path) {
    console.log(path)
    notify({
      title: 'change file',
      message: `changing file: ${path}`
    })
  })
}

if (process.env.NODE_ENV === 'production') {
  exports.default = series(clean, build)
}
exports.clean = clean
exports.build = series(clean, build)
exports.default = series(clean, build, watcher)
