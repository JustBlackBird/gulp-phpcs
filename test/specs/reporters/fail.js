var expect = require('chai').expect,
    File = require('vinyl'),
    gutil = require('gulp-util'),
    failReporter = require('../../../reporters/fail');

describe('Fail reporter', function() {
    var reporter = null;

    beforeEach(function() {
        reporter = failReporter();
    });

    afterEach(function() {
        reporter = null;
    });

    it('should fail when PHPCS error defined', function(done) {
        reporter.on('error', function(error) {
            expect(error).to.be.an.instanceof(gutil.PluginError);
            expect(error.message).to.match(/\/test\/bad_file\.php/);
            done();
        });

        var fakeFile = new File({
            path: '/test/bad_file.php'
        });

        fakeFile.phpcsReport = {
            error: true,
            output: 'test error'
        };

        reporter.write(fakeFile);
    });

    it('should do nothing when PHPCS does not report about errors', function(done) {
        reporter.on('data', function(file) {
            done();
        });

        var fakeFile = new File();
        fakeFile.phpcsReport = {
            error: false
        };

        reporter.write(fakeFile);
    });

    it('should do nothing when PHPCS data is missed', function(done) {
        reporter.on('data', function(file) {
            done();
        });

        reporter.write(new File());
    });
});
