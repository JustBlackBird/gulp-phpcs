var gutil = require('gulp-util'),
    fs = require('fs');

/**
 * Loads fail reporter by its name.
 *
 * The function works only with fail reporters that shipped with the plugin.
 *
 * @param {String} name [fail] Name of a fail reporter to load.
 * @param {Object} options Custom options object that will be passed to
 *   a reporter.
 * @returns {Function}
 */
module.exports = function(name, options) {
    if (typeof name !== 'string') {
        name = 'fail';
    }

    var fileName = __dirname + '/' + name + '.js';
    if (name === 'index' || !fs.existsSync(fileName)) {
        throw new gutil.PluginError('gulp-phpcs', 'There is no fail reporter "' + name + '"');
    }

    return require(fileName)(options || {});
}
