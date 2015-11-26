var gutil   = require('gulp-util'),
    through = require('through2'),
    chalk   = require('chalk'),
    fs      = require('fs');

/**
 * Returns "file" reporter.
 *
 * The "file" reporter, according to its name, logs all problems
 * that PHP Code Sniffer found to a file.
 *
 * @returns {Function}
 */
module.exports = function(options) {
    var errors = 0,
        output = '',
        message;

    return through.obj(
        function(file, enc, callback) {
            var report = file.phpcsReport || {};

            // collect all errors
            if (report.error) {
                // increase error counter
                errors++;

                // add error to output
                output += report.output +
                          '\n\n\n'; // seperate the different outputs
            }

            this.push(file);
            callback();
        },

        // after we collected all errors, output them to the defined file
        function(callback) {
            // show the user an error message if no path is defined
            if (!options.path) {
                gutil.log(chalk.red('You have to define a path for the file reporter!'));
                callback();
                return;
            }

            // write the error output to the defined file
            fs.writeFile(options.path, output.trim());

            // build console info message
            message = 'Your report with ' + errors + ' error' + ((errors !== 1) ? 's ' : ' ') +
                      'got written to "' + options.path + '"';

            // output console info message
            if (errors) {
                gutil.log(chalk.red(message));
            } else {
                gutil.log(chalk.green(message));
            }

            callback();
        }
    );
}
