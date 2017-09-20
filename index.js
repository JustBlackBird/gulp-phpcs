var util = require('util'),
    path = require('path'),
    gutil = require('gulp-util'),
    through = require('through2'),
    which = require('which'),
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
        args.push('--standard=' + opts.standard);
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
        args.push('--encoding=' + opts.encoding);
    }

    if (opts.hasOwnProperty('report')) {
        args.push('--report=' + opts.report);
    }

    if (opts.hasOwnProperty('showSniffCode') && opts.showSniffCode) {
        args.push('-s');
    }

    var useSniffs = opts.hasOwnProperty('sniffs') &&
        Array.isArray(opts.sniffs) &&
        opts.sniffs.length !== 0;
    if (useSniffs) {
        args.push('--sniffs=' + opts.sniffs.join(','));
    }

    var useExclude = opts.hasOwnProperty('exclude') &&
        Array.isArray(opts.exclude) &&
        opts.exclude.length !== 0;
    if (useExclude) {
        args.push('--exclude=' + opts.exclude.join(','));
    }

    if (opts.hasOwnProperty('colors') && opts.colors) {
        args.push('--colors');
    }

    // Finally specify the file is streamed on stdin.
    args.push('-');

    return {
        bin: opts.bin || 'phpcs',
        args: args
    };
};

/**
 * Resolves real path of the command.
 *
 * The results are cached inside of the function.
 *
 * @type Function
 * @param {String} bin A command which should be resolved.
 * @param {Function} callback A function which will be called onece the command
 * is resolved or a error occurs. The error object (or null) is passed as the
 * first argument. The real path of the command is passed as the second argument.
 * If the command is not found the second argument is boolean false.
 */
var resolveCommand = (function(){
    // Closure is used here to cache resolved commands.
    var cache = {};

    return function(bin, callback) {
        if (cache.hasOwnProperty(bin)) {
            return callback(null, cache[bin]);
        }

        var normalizedBin = path.normalize(bin.replace(/[\\/]/g, path.sep));
        which(normalizedBin, function(err, resolved) {
            if (err) {
                if (err.code !== 'ENOENT') {
                    // Something is totally wrong. Let the outer code know.
                    return callback(err);
                }

                // The command is just not found.
                cache[bin] = false;

                return callback(null, false);
            }

            cache[bin] = resolved;
            callback(null, resolved);
        });
    };
})();

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
    resolveCommand(bin, function(error, resolvedBin) {
        if (error) {
            // A real error occurs during command resolving. We can do nothing
            // here, so just let the developer know.
            var wrappedError = new Error(util.format(
                'Cannot resolve real path of "%s"',
                bin
            ));
            wrappedError.originalError = error;

            return callback(wrappedError);
        }

        if (resolvedBin === false) {
            // The bin is not found. Let the developer know about it.
            return callback(new Error(util.format('Cannot find "%s"', bin)));
        }

        // A buffer for PHPCS stdout stream.
        var stdout = '';
        // child_process.spawn is used instead of child_process.exec because of
        // its flexibility.
        var phpcs = spawn(resolvedBin, args);

        phpcs.on('error', function(error) {
            callback(error);
        });

        phpcs.on('close', function(code) {
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
    });
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

            if (exitCode > 2) {
                // On codding style problems Code Sniffer should exists with "1" or "2" code.
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

            if ((exitCode === 1) || (exitCode === 2)) {
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
