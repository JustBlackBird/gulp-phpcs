var gutil = require('gulp-util'),
    through = require('through2'),
    exec = require('child_process').exec;

/**
 * Builds shell command for PHP Code Sniffer according to specified options.
 *
 * @param {Object} options List of PHP Code Sniffer options.
 * @returns {String} Shell command with all needed flags.
 */
var buildCommand = function (options) {
    var opt = options || {};
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

    if (opt.hasOwnProperty('showSniffCode') && opt.showSniffCode) {
        command += ' -s';
    }

    if (opt.hasOwnProperty('sniffs') && typeof opt.sniffs === 'object' && opt.sniffs.length !== 0) {
        command += ' --sniffs=' + opt.sniffs.join(',');
    }

    if (opt.hasOwnProperty('colors') && opt.colors) {
        command += ' --colors';
    }

    return command;
};

var phpcsPlugin = function (options) {
    return through.obj(function (file, enc, callback) {
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
        var phpcs = exec(buildCommand(options), function (error, stdout, stderr) {
            var report = {
                error: false,
                output: ''
            };

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

        // Detect line endings like it's done in PHPCS
        var matches = /\r\n?|\n/.exec(file.contents.toString()),
            eol = matches ? matches[0] : '\n';

        // Pass the file name to Code Sniffer
        phpcs.stdin.write('phpcs_input_file: ' + file.path + eol);

        // Pass content of the file as STDIN to Code Sniffer
        phpcs.stdin.write(file.contents);
        phpcs.stdin.end();
    });
};

// Attach reporters loader to the plugin.
phpcsPlugin.reporter = require('./reporters');

module.exports = phpcsPlugin;
