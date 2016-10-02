var gutil = require('gulp-util'),
    through = require('through2'),
    chalk = require('chalk');

/**
 * Returns "fail" reporter.
 *
 * The "fail" reporter rises an error on files stream if PHP Code Sniffer fails
 * for at least one file.
 *
 * @returns {Function}
 */
module.exports = function(options) {
    // set failOnFirst true by default
    options = options || {};
    options.failOnFirst = options.failOnFirst || true;

    var phpcsError = false;

    return through.obj(
        // Watch for errors
        function(file, enc, callback) {
            var report = file.phpcsReport || {};

            if (report.error) {
                phpcsError = true;

                if (options.failOnFirst) {
                    var errorMessage = 'PHP Code Sniffer failed' +
                        ' on ' + chalk.magenta(file.path);

                    this.emit('error', new gutil.PluginError('gulp-phpcs', errorMessage));
                    callback();

                    return;
                }
            }

            this.push(file);
            callback();
        },

        // Abort if we had at leaste one error
        function(callback) {
            if (phpcsError) {
                this.emit('error', new gutil.PluginError('gulp-phpcs', 'PHP Code Sniffer' +
                    ' failed at at leaste one file.'));
            }

            callback();
        });
};
