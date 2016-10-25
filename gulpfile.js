/** Usage:
 * "gulp debug"         for building debug files
 * "gulp watch"         for building debug files and recreate when changed
 * "gulp build"         for building release files
 */

'use strict';
const gulp = require('gulp');
const less = require('gulp-less');
const browserify = require('browserify');
const fs = require('fs');

const TABLEMODIFY_ENTRY_SCRIPT = './src/tablemodify.js';
const TARGET_TABLEMODIFY = './dist/tablemodify.js';
const TARGET_TABLEMODIFY_MIN = './dist/tablemodify.min.js';

var debugInstance;

gulp.task('default', () => null);

gulp.task('build', ['buildjs', 'less']);

gulp.task('debug', ['less', 'write_debugjs']);

gulp.task('watch', ['debug'], () => {
    gulp.watch('./src/**/*.js', ['write_debugjs']);
    gulp.watch('./src/**/*.less', ['less']);
    //Return never-resolving promise so that the task will never end
    return new Promise(() => null);
});

gulp.task('write_debugjs', () => {
    if(!debugInstance) {
        debugInstance = browserify({
            entries: [TABLEMODIFY_ENTRY_SCRIPT],
            cache: {},
            packageCache: {},
            debug:true
        }).transform('babelify', {presets: ['es2015']});
    }
    //Write the debug build to both uncompressed and minified target file
    debugInstance.bundle().pipe(fs.createWriteStream(TARGET_TABLEMODIFY));
    return debugInstance.bundle().pipe(fs.createWriteStream(TARGET_TABLEMODIFY_MIN));
});

//Task which creates minified and normal js build
gulp.task('buildjs', () => {
    getBrowserify().bundle().pipe(fs.createWriteStream(TARGET_TABLEMODIFY));
    return getBrowserify().transform('uglifyify', {global: true}).bundle().pipe(fs.createWriteStream(TARGET_TABLEMODIFY_MIN));
});

//Helper task for recompiling less files
gulp.task('less', () => {
    return gulp.src('./src/**/*.less')
        .pipe(less().on('error', err => console.log(err)))
        .pipe(gulp.dest('./dist'));
});


//######## Helper functions #############
function getBrowserify() {
    return browserify(TABLEMODIFY_ENTRY_SCRIPT)
        .transform('babelify', {presets: ['es2015']});
}


/*const watchify = require('watchify');
let watchifyInstance = browserify({
    entries: [TABLEMODIFY_ENTRY_SCRIPT],
    cache: {},
    packageCache: {},
    plugin: [watchify],
    debug: true
}).transform('babelify', {presets: ['es2015']});
const writeBundle = function() {
    watchifyInstance.bundle().pipe(fs.createWriteStream(TARGET_TABLEMODIFY));
    watchifyInstance.bundle().pipe(fs.createWriteStream(TARGET_TABLEMODIFY_MIN));
    console.log('js files have been updated!');
}
writeBundle();
watchifyInstance.on('update', writeBundle);*/
