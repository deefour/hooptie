require('dotenv').config();

const gulp = require('gulp');
const template = require('gulp-template');

exports.default = () => (
	gulp.src('firebase-messaging-sw.js')
		.pipe(template({}))
		.pipe(gulp.dest('dist'))
);
