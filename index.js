var gutil = require('gulp-util'),
    through = require('through2'),
    exec = require('child_process').exec;

/**
 * Builds shell command for PHP Code Sniffer according to specified options.
 *
 * @param {Object} opt List of PHP Code Sniffer options.
 * @returns {String} Shell command with all needed flags.
 */
var buildCommand = function(opt) {
    var opt = opt || {};
    var command = opt.bin || 'phpcs';

    if (opt.hasOwnProperty('standard')) {
        command += ' --standard="' + opt.standard + '"';
    }

    if (opt.hasOwnProperty('severity')) {
        command += ' --severity=' + parseInt(opt.severity);
    }

    if (opt.hasOwnProperty('warningSeverity')) {
        command += ' --warning-severity=' + parseInt(opt.warningSeverity);
    }

    if (opt.hasOwnProperty('errorSeverity')) {
        command += ' --error-severity=' + parseInt(opt.errorSeverity);
    }

    if (opt.hasOwnProperty('encoding')) {
        command += ' --encoding="' + opt.encoding + '"';
    }

    if (opt.hasOwnProperty('showSniffCode')) {
        command += ' -s';
    }

    return command;
}

var phpcsPlugin = function(options) {
    return through.obj(function(file, enc, callback) {
        var stream = this;

        if (file.isNull()) {
            stream.push(file);
            callback();

            return;
        }

        if (file.isStream()) {
            stream.emit('error', new gutil.PluginError('gulp-phpcs', 'Streams are not supported'));
            callback();

            return;
        }

        // Run code sniffer
        var phpcs = exec(buildCommand(options), function(error, stdout, stderr) {
            var report = {
                error: false,
                output: ''
            }

            if (error) {
                // Something went wrong. Attache report to the file to allow
                // reporters do their job.
                report.error = error;
                report.output = stdout;
            }

            file.phpcsReport = report;
            stream.push(file);
            callback();
        });

        // Pass content of the file as STDIN to Code Sniffer
        phpcs.stdin.write(file.contents);
        phpcs.stdin.end();
    });
}

// Attach reporters loader to the plugin.
phpcsPlugin.reporter = require('./reporters');

module.exports = phpcsPlugin;
