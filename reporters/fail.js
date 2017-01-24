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
    var phpcsError = false;
    var badFiles = [];

    // Set failOnFirst true by default
    options = options || {};
    if (!options.hasOwnProperty('failOnFirst')) {
        options.failOnFirst = true;
    }

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
                }  else {
                    badFiles.push(chalk.magenta(file.path));
                }
            }

            this.push(file);
            callback();
        },

        // Abort if we had at least one error.
        function(callback) {
            // We have to check "failOnFirst" flag to make sure we did not
            // throw the error before.
            if (phpcsError && !options.failOnFirst) {
                this.emit('error', new gutil.PluginError(
                    'gulp-phpcs',
                    'PHP Code Sniffer failed on \n    ' + badFiles.join('\n    ')
                ));
            }

            callback();
        });
};
