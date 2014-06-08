var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('styles', function()
{
    console.log('executing styles...');
    gulp.src('**/*.less')
        .pipe(less())
        .pipe(gulp.dest('.'))
    ;
    console.log('executed styles...');
});

gulp.task('default', function()
{
    gulp.start('styles');

    gulp.watch('**/*.less', function(event)
    {
        gulp.start('styles');
    });
});
