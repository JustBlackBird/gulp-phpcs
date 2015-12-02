var fs = require('fs'),
    util = require('util'),
    gutil = require('gulp-util'),
    through = require('through2'),
    chalk = require('chalk'),
    pluralize = require('pluralize');

/**
 * Returns "file" reporter.
 *
 * The "file" reporter, according to its name, logs all problems
 * that PHP Code Sniffer found to a file.
 *
 * @returns {Function}
 */
module.exports = function(options) {
    // Show the user an error message if no path is defined.
    if (!options || !options.path) {
        throw new gutil.PluginError('gulp-phpcs', 'You have to specify a path for the file reporter!');
    }

    var collectedErrors = [];

    return through.obj(
        function(file, enc, callback) {
            var report = file.phpcsReport || {};

            // Collect all errors.
            if (report.error) {
                collectedErrors.push(report.output);
            }

            this.push(file);
            callback();
        },

        // After we collected all errors, output them to the defined file.
        function(callback) {
            var stream = this;

            // We don't need to write an empty file.
            if (collectedErrors.length === 0) {
                callback();

                return;
            }

            var report = collectedErrors.join('\n\n').trim() + '\n';

            // Write the error output to the defined file
            fs.writeFile(options.path, report, function(err) {
                if (err) {
                    stream.emit('error', new gutil.PluginError('gulp-phpcs', err));
                    callback();

                    return;
                }

                // Build console info message
                var message = util.format(
                    'Your PHPCS report with %s got written to %s',
                    chalk.red(pluralize('error', collectedErrors.length, true)),
                    chalk.magenta(options.path)
                );

                // And output it.
                gutil.log(message);

                callback();
            });
        }
    );
};
