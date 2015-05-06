var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

gulp.task('default', function () {
    return gulp.src('./tests/specs/*.js')
        .pipe(jasmine());
});