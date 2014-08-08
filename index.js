var gutil = require('gulp-util');
var through = require('through2');
var exec = require('child_process').exec;
var reporterLoader = require('./reporters');

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

    return command;
}

module.exports = function(options) {
    return through.obj(function(file, enc, cb) {
        var stream = this;

        if (file.isNull()) {
            stream.push(file);
            cb();

            return;
        }

        if (file.isStream()) {
            stream.emit('error', new gutil.PluginError('gulp-phpcs', 'Streams are not supported'));
            cb();

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
            cb();
        });

        // Pass content of the file as STDIN to Code Sniffer
        phpcs.stdin.write(file.contents);
        phpcs.stdin.end();
    });
}

// Attach reporters loader to the plugin.
module.exports.reporter = reporterLoader;
