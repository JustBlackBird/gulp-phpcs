var log = require('fancy-log'),
    through = require('through2'),
    chalk = require('chalk');

/**
 * Returns "log" reporter.
 *
 * The "log" reporter, according to its name, logs to the console all problems
 * that PHP Code Sniffer found.
 *
 * @returns {Function}
 */
module.exports = function() {
    return through.obj(function(file, enc, callback) {
        var report = file.phpcsReport || {};

        if (report.error) {
            var message = 'PHP Code Sniffer found a ' + chalk.yellow('problem') +
                ' in ' + chalk.magenta(file.path) + '\n' +
                report.output.replace(/\n/g, '\n    ');
            log.info(message);
        }

        this.push(file);
        callback();
    });
};
