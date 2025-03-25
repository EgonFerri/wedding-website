'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Compile SCSS to CSS
gulp.task('sass', function () {
    return gulp.src('./sass/styles.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename({ basename: 'styles.min' }))
        .pipe(gulp.dest('./css'));
});

// Watch for changes in SCSS files and run the sass task
gulp.task('sass:watch', function () {
    gulp.watch('./sass/**/*.scss', gulp.series('sass'));
});

// Minify JS
gulp.task('minify-js', function () {
    return gulp.src('./js/scripts.js')
        .pipe(uglify())
        .pipe(rename({ basename: 'scripts.min' }))
        .pipe(gulp.dest('./js'));
});

// Inject API key into index.html by replacing the placeholder
gulp.task('inject-key', function () {
    return gulp.src('index.html')
        .pipe(replace('__GOOGLE_MAPS_API_KEY__', process.env.GOOGLE_MAPS_API_KEY))
        .pipe(gulp.dest('dist'));
});

// Copy assets (CSS, JS, images, etc.) into the build folder
gulp.task('copy-assets', function () {
    return gulp.src(['css/**/*', 'js/**/*', 'img/**/*'], { base: '.' })
        .pipe(gulp.dest('dist'));
});

// Default task: compile sass, minify js, inject API key, and copy assets
gulp.task('default', gulp.series(
    gulp.parallel('sass', 'minify-js'),
    gulp.parallel('inject-key', 'copy-assets')
));
