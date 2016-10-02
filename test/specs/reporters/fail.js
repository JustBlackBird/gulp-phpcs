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

    it('should fail immediately when PHPCS error defined', function(done) {
        reporter.on('error', function(error) {
            expect(error).to.be.an.instanceof(gutil.PluginError);
            expect(error.message).to.contain('/src/bad_file.php');
            done();
        });

        var fakeFile = new File({
            path: '/src/bad_file.php'
        });

        fakeFile.phpcsReport = {
            error: true,
            output: 'test error'
        };

        reporter.write(fakeFile);
    });

    it('should fail at the end of the stream when PHPCS error defined', function(done) {
        var reporter = failReporter({ failOnFirst: true });

        reporter.on('error', function(error) {
            expect(error).to.be.an.instanceof(gutil.PluginError);
            expect(error.message).to.contain('PHP Code Sniffer failed');
            done();
        });

        var fakeFile = new File({
            path: '/src/bad_file.php'
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
