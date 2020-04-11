const gulp = require('gulp');
const runSequence = require('gulp4-run-sequence');
const watch = require('gulp-watch');

const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');

// Patterns for reading files
var files = {
	src: 'raise-comments.js',
	test: 'test.js'
};

// Make it easier to run tasks from inside other tasks.
var tasks = {},
	buildQueue = [];
function task(name, enqueue, fn) {
	tasks[name] = fn;
	gulp.task(name, fn);
	if (enqueue) {
		buildQueue.push(name);
	}
}

// Lint the debug file written by the umd task.
task('lint', true, function() {
	return (gulp
		.src(files.src)
		.pipe(jshint({
			'undef': true,
			'esversion': 6,
			'globals': {
				'require': true,
				'module': true
			}
		}))
		.pipe(jshint.reporter('default'))
	);
});

// Do the tests last so we're testing against the actual built, minified file.
// Individual tests can be changed to use the debug file in dist if tests fail.
task('test', true, function () {
	return (gulp
		.src(files.test)
		.pipe(mocha({
			reporter: 'nyan',
		}))
	);
});

// Run the tasks in series, in the order they were defined. 
task('check', false, function (callback) {
	runSequence(...buildQueue, callback);
});

// On 'src' changes, re-run the 'check' task.
// On 'test' changes, re-run just the 'test' task.
task('watch', false, function () {
	watch(files.src, tasks.check);
	watch(files.test, function (callback) {
		// Do it through runSequence so it runs as a task, for nice output.
		runSequence('test', callback);
	});
});

// Make `gulp` run the check task.
task('default', false, tasks.check);
