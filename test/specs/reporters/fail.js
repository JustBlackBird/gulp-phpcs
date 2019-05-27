var expect = require('chai').expect,
    File = require('vinyl'),
    PluginError = require('plugin-error'),
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
            expect(error).to.be.an.instanceof(PluginError);
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
            expect(error).to.be.an.instanceof(PluginError);
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
            expect(error).to.be.an.instanceof(PluginError);
            expect(error.message).to.contain('/src/bad_file.php');
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

    it('should list all the bad files with failOnFirst = false', function(done) {
        var reporter = failReporter({failOnFirst: false}),
            spy = filesCounterSpy();

        reporter.pipe(spy);

        reporter.on('error', function(error) {
            expect(error).to.be.an.instanceof(PluginError);
            expect(error.message).to.contain('/src/bad_file.php');
            expect(error.message).to.contain('/src/another_bad_file.php');
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

        var anotherFakeBadFile = new File({
            path: '/src/another_bad_file.php'
        });

        anotherFakeBadFile.phpcsReport = {
            error: true,
            output: 'test error'
        };

        reporter.write(fakeBadFile);
        reporter.write(anotherFakeBadFile);
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
