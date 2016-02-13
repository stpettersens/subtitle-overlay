/*
    Gulpfile to build and package browser addon for both Chrome and Firefox.
*/

var gulp = require('gulp'),
    data = require('gulp-data'),
   clean = require('gulp-rimraf'),
   jsdoc = require('gulp-jsdoc3'),
      pp = require('gulp-ssp-preprocessor'),
      tc = require('to-title-case'),
    exec = require('child_process').exec;

var addon = {};

gulp.task('manifest', function() {
    return gulp.src('package.json')
    .pipe(data(function(pkg) {
        var p = JSON.parse(pkg.contents.toString());
        addon = {
            name: tc(p.name.replace('_', ' ')),
            author: p.author,
            description: p.description,
            dir: p.main.replace('_', '-')
        };
    }));    
});

gulp.task('chrome-copy', ['manifest'], function() {
    return gulp.src(['chrome/*', 'common/skin/*.css'])
    .pipe(gulp.dest(addon.dir + '_chrome_addon'));
});

gulp.task('chrome', ['chrome-copy'], function() {
    return gulp.src(['common/code/*.js', 'common/ui/*.html'])
    .pipe(pp({conditions: ['CHROME']}))
    .pipe(gulp.dest(addon.dir + '_chrome_addon'));
});

gulp.task('ff-copy', ['manifest'], function() {
    return gulp.src(['firefox/*', 'firefox/*/**'])
    .pipe(gulp.dest(addon.dir + '_ff_addon'));
});

gulp.task('ff-pp', ['ff-copy'], function() {
    return gulp.src(['common/code/*.js', 'common/ui/*.html', 'common/skin/*.css'])
    .pipe(pp({conditions: ['FIREFOX']}))
    .pipe(gulp.dest(addon.dir + '_ff_addon/data'));
});

gulp.task('firefox', ['ff-pp'], function() {
    process.chdir(addon.dir + '_ff_addon');
    exec('jpm run', function(stderr, stdout) {
        if(stderr !== null) {
            console.log('Please install jpm:\n[sudo] npm install -g jpm');
        }
        console.log(stdout);
    });
});

gulp.task('doc', function() {
    gulp.src(['common/code/*.js'], {read: false})
    .pipe(jsdoc());
});

gulp.task('clean', ['manifest'], function() {
    return gulp.src(addon.dir + '_*', {read: false})
    .pipe(clean());
});

gulp.task('default', ['chrome'], function(){});
