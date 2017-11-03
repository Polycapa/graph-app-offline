const gulp = require('gulp');
const shell = require('gulp-shell');
const clean = require('gulp-clean');
const filter = require('gulp-filter');
const replace = require('gulp-replace');
const del = require('del');
const browserSync = require('browser-sync');

const src = './';
const dist = './dist';
const filesToWatch = [`${src}src/**/*`];

const baseUrl = '/graph/';

const polymerBuildFolder = `${src}/build`;
const polymerPreset = 'es6-bundled';
const polymerPresetFolder = `${polymerBuildFolder}/${polymerPreset}/**`;

gulp.task('create-polymer-build', shell.task([
    `cd ${src} && polymer build --preset ${polymerPreset}`
]));

gulp.task('polymer-build', ['create-polymer-build'], function () {
    return gulp.src(polymerPresetFolder)
        .pipe(gulp.dest(`${dist}`));
});

gulp.task('replace-build-base-url', ['polymer-build'], () => {
    gulp.src(`${dist}/index.html`)
        .pipe(replace(/\<base.*?\>/, match => {
            return `<base href="${baseUrl}">`;
        }))
        .pipe(gulp.dest(dist));
})

gulp.task('clean:dist', () => {
    return del([dist])
})

gulp.task('clean:build', () => {
    return del([polymerBuildFolder])
})

gulp.task('clean', ['clean:dist', 'clean:build']);

gulp.task('serve', ['browser-sync'], () => {
    gulp.watch(filesToWatch, () => {
        console.log('Reloading browser...');
        browserSync.reload()
    });
});

gulp.task('serve:build', ['build'], shell.task([
    `cd ${dist} && polymer serve -o`
]))

gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: src
        }
    })
})

gulp.task('build', ['replace-build-base-url']);


gulp.task('default', ['build']);