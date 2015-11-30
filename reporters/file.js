var fs = require('fs'),
    gutil = require('gulp-util'),
    through = require('through2'),
    chalk = require('chalk');

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

    var errors = 0,
        output = '';

    return through.obj(
        function(file, enc, callback) {
            var report = file.phpcsReport || {};

            // collect all errors
            if (report.error) {
                // increase error counter
                errors++;

                // add error to output
                output += report.output +
                    // Separate different outputs
                    '\n\n\n';
            }

            this.push(file);
            callback();
        },

        // After we collected all errors, output them to the defined file.
        function(callback) {
            var stream = this,
                report = output.trim();

            // We don't need to write an empty file.
            if (report.length === 0) {
                callback();

                return;
            }

            // Write the error output to the defined file
            fs.writeFile(options.path, report, function(err) {
                if (err) {
                    stream.emit('error', new gutil.PluginError('gulp-phpcs', error));
                    callback();

                    return;
                }

                // Build console info message
                var message = 'Your report with ' + errors + ' error' + ((errors !== 1) ? 's ' : ' ') +
                    'got written to "' + options.path + '"';

                // output console info message
                if (errors) {
                    gutil.log(chalk.red(message));
                } else {
                    gutil.log(chalk.green(message));
                }

                callback();
            });
        }
    );
};
