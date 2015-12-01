var gutil = require('gulp-util'),
    fs = require('fs');

/**
 * Loads reporter by its name.
 *
 * The function works only with reporters that shipped with the plugin.
 *
 * @param {String} name Name of a reporter to load.
 * @param {Object} options Custom options object that will be passed to
 *   a reporter.
 * @returns {Function}
 */
module.exports = function(name, options) {
    if (typeof name !== 'string') {
        throw new gutil.PluginError('gulp-phpcs', 'Reporter name must be a string');
    }

    if (name === 'index') {
        throw new gutil.PluginError('gulp-phpcs', 'Reporter cannot be named "index"');
    }

    var fileName = './' + name + '.js',
        reporter = null;
    try {
        reporter = require(fileName)(options || {});
    } catch(error) {
        if (error.code !== 'MODULE_NOT_FOUND') {
            throw error;
        }

        throw new gutil.PluginError('gulp-phpcs', 'There is no reporter "' + name + '"');
    }

    return reporter;
};
