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

    var fileName = __dirname + '/' + name + '.js';
    if (name === 'index' || !fs.existsSync(fileName)) {
        throw new gutil.PluginError('gulp-phpcs', 'There is no reporter "' + name + '"');
    }

    return require(fileName)(options || {});
}
