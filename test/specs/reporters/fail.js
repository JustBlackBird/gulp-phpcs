var expect = require('chai').expect,
    File = require('vinyl'),
    gutil = require('gulp-util'),
    failReporter = require('../../../reporters/fail'),
    through = require('through2');

var filesCounterSpy = function() {
    var counter = through.obj(function (file, enc, callback) {
        counter.filesCount++;
        this.push(file);

        return callback();
    });

    // Initilalize the counter
    counter.filesCount = 0;

    return counter;
};

describe('Fail reporter', function() {
    var reporter = null;

    beforeEach(function() {
        reporter = failReporter();
    });

    afterEach(function() {
        reporter = null;
    });

    it('should fail immediately when PHPCS error defined', function(done) {
        var spy = filesCounterSpy();
        reporter.pipe(spy);

        reporter.on('error', function(error) {
            expect(error).to.be.an.instanceof(gutil.PluginError);
            expect(error.message).to.contain('/src/bad_file.php');
            // Nothing should came through the stream.
            expect(spy.filesCount).to.equal(0);
            done();
        });

        var fakeBadFile = new File({
            path: '/src/bad_file.php'
        });

        fakeBadFile.phpcsReport = {
            error: true,
            output: 'test error'
        };

        var fakeGoodFile = new File({
            path: '/src/good_file.php'
        });

        reporter.write(fakeBadFile);
        reporter.write(fakeGoodFile);
        reporter.end();
    });

    it('should fail immediately when PHPCS error defined(failOnFirst = true)', function(done) {
        var reporter = failReporter({failOnFirst: true}),
            spy = filesCounterSpy();

        reporter.pipe(spy);

        reporter.on('error', function(error) {
            expect(error).to.be.an.instanceof(gutil.PluginError);
            expect(error.message).to.contain('/src/bad_file.php');
            // Nothing should came through the stream.
            expect(spy.filesCount).to.equal(0);
            done();
        });

        var fakeBadFile = new File({
            path: '/src/bad_file.php'
        });

        fakeBadFile.phpcsReport = {
            error: true,
            output: 'test error'
        };

        var fakeGoodFile = new File({
            path: '/src/good_file.php'
        });

        reporter.write(fakeBadFile);
        reporter.write(fakeGoodFile);
        reporter.end();
    });

    it('should fail at the end of the stream when PHPCS error defined and failOnFirst = false', function(done) {
        var reporter = failReporter({failOnFirst: false}),
            spy = filesCounterSpy();

        reporter.pipe(spy);

        reporter.on('error', function(error) {
            expect(error).to.be.an.instanceof(gutil.PluginError);
            expect(error.message).to.contain('at least at one');
            // All the files must pass through the pipe.
            expect(spy.filesCount).to.equal(2);
            done();
        });

        var fakeBadFile = new File({
            path: '/src/bad_file.php'
        });

        fakeBadFile.phpcsReport = {
            error: true,
            output: 'test error'
        };

        var fakeGoodFile = new File({
            path: '/src/good_file.php'
        });

        reporter.write(fakeBadFile);
        reporter.write(fakeGoodFile);
        reporter.end();
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
