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
module.exports = function() {
    return through.obj(function(file, enc, callback) {
        var report = file.phpcsReport || {};

        if (report.error) {
            var errorMessage = 'PHP Code Sniffer failed' +
                ' on ' + chalk.magenta(file.path);

            this.emit('error', new gutil.PluginError('gulp-phpcs', errorMessage));
            callback();

            return;
        }

        this.push(file);
        callback();
    });
};
