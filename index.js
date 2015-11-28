var util = require('util'),
    gutil = require('gulp-util'),
    through = require('through2'),
    spawn = require('child_process').spawn;

/**
 * Builds shell command for PHP Code Sniffer according to specified options.
 *
 * @param {Object} opts List of PHP Code Sniffer options.
 * @returns {Object} Object with "bin" and "args" keys that specify shell command.
 */
var buildCommand = function(opts) {
    var args = [];

    if (opts.hasOwnProperty('standard')) {
        args.push('--standard=' + opts.standard + '');
    }

    if (opts.hasOwnProperty('severity')) {
        args.push('--severity=' + parseInt(opts.severity));
    }

    if (opts.hasOwnProperty('warningSeverity')) {
        args.push('--warning-severity=' + parseInt(opts.warningSeverity));
    }

    if (opts.hasOwnProperty('errorSeverity')) {
        args.push('--error-severity=' + parseInt(opts.errorSeverity));
    }

    if (opts.hasOwnProperty('encoding')) {
        args.push('--encoding=' + opts.encoding + '');
    }

    if (opts.hasOwnProperty('showSniffCode') && opts.showSniffCode) {
        args.push('-s');
    }

    if (opts.hasOwnProperty('sniffs') && Array.isArray(opts.sniffs) && opts.sniffs.length !== 0) {
        args.push('--sniffs=' + opts.sniffs.join(',') + '');
    }

    if (opts.hasOwnProperty('colors') && opts.colors) {
        args.push('--colors');
    }

    return {
        bin: opts.bin || 'phpcs',
        args: args
    };
};

/**
 * Runs Code Sniffer shell command.
 *
 * @param {String} bin Shell command (without arguments) that should be performed
 * @param {Array} args List of arguments that should be passed to the Shell command.
 * @param {Object} file A file from Gulp pipeline that should be sniffed.
 * @param {Function} callback A function which will be called when Code Sniffer is
 * done or an error occurs. It will recieve three arguments: error instance, exit
 * code and output of the Code Sniffer. The last two arguments will be passed in
 * only if there was no error during execution.
 */
var runCodeSniffer = function(bin, args, file, callback) {
    // A buffer for PHPCS stdout stream.
    var stdout = '';
    // child_process.spawn is used instead of child_process.exec because
    // the later one mix child process creation errors with non-zero exit
    // codes of the created process. Unfortunately, the only way to
    // separate the two groups of errors is to use spawn with all its
    // drawbacks instead of exec.
    var phpcs = spawn(bin, args);

    phpcs.on('error', function(error) {
        var wrapperError = null;

        // Low level error are not informative enough to users of the plugin.
        // We wrapp some errors to make them usefull for non-developers.
        switch(error.code) {
            case 'ENOENT':
                wrappedError = new Error(util.format('Cannot find "%s"', bin));
                break;
            default:
                wrappedError = error;
        }

        if (error !== wrappedError) {
            wrappedError.originalError = error;
        }

        callback(wrappedError);
    });

    phpcs.on('exit', function(code) {
        callback(null, code, stdout);
    });

    phpcs.stdin.on('error', function(error) {
        // Just ignore this event because an error (with more
        // detailed description) should also be emitted at spawned
        // process instance.
    });

    phpcs.stdout.on('data', function(data) {
        // Just buffer data from stdout to use it later.
        stdout += data.toString();
    });

    // Detect line endings like it's done in PHPCS
    var matches = /\r\n?|\n/.exec(file.contents.toString()),
        eol = matches ? matches[0] : '\n';

    // Pass the file name to Code Sniffer. This is needed to
    // get the correct error message from Code Sniffer.
    phpcs.stdin.write('phpcs_input_file: ' + file.path + eol);

    // Pass content of the file as STDIN to Code Sniffer
    phpcs.stdin.write(file.contents);
    phpcs.stdin.end();
};

var phpcsPlugin = function(options) {
    var command = buildCommand(options || {});

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

        runCodeSniffer(command.bin, command.args, file, function(runError, exitCode, output) {
            if (runError) {
                // Something is totally wrong. It seems that execution of Code Sniffer
                // failed (not because of non-zero exit code of PHPCS).
                stream.emit('error', new gutil.PluginError('gulp-phpcs', runError));
                callback();

                return;
            }

            if (exitCode > 1) {
                // On codding style problems Code Sniffer should exists with "1" code.
                // All other non-zero exit codes should be treated as Code Sniffer errors.
                var phpcsError = new gutil.PluginError('gulp-phpcs', 'Execution of Code Sniffer Failed');
                phpcsError.stdout = output;
                stream.emit('error', phpcsError);
                callback();

                return;
            }

            var report = {
                error: false,
                output: ''
            };

            if (exitCode === 1) {
                // A codding style problem is found. Attache report to the file to allow
                // reporters do their job.
                report.error = true;
                report.output = output;
            }

            file.phpcsReport = report;
            stream.push(file);
            callback();
        });
    });
};

// Attach reporters loader to the plugin.
phpcsPlugin.reporter = require('./reporters');

module.exports = phpcsPlugin;
