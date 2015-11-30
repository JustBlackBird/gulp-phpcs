var expect = require('chai').expect,
    File = require('vinyl'),
    sinon = require('sinon'),
    gutil = require('gulp-util'),
    logReporter = require('../../../reporters/log');

describe('Log reporter', function() {
    var reporter = null,
        logStub = null;

    beforeEach(function() {
        reporter = logReporter();
        logStub = sinon.stub(gutil, 'log');
    });

    afterEach(function() {
        reporter = null;
        gutil.log.restore();
    });

    it('should print PHPCS report for file with problems', function(done) {
        reporter.on('data', function(file) {
            expect(logStub.calledOnce).to.be.true;

            var args = logStub.firstCall.args;
            expect(args).to.be.an.instanceof(Array);
            expect(args).to.have.length(1);
            // Make sure PHPCS output is reported
            expect(args[0]).to.contain('test PHPCS output');
            // Make sure file name is reported
            expect(args[0]).to.contain('/src/bad_file.php');

            done();
        });

        var fakeFile = new File({
            path: '/src/bad_file.php'
        });

        fakeFile.phpcsReport = {
            error: true,
            output: 'test PHPCS output'
        }

        reporter.write(fakeFile);
    });

    it('should do nothing for files with no style errors', function(done) {
        reporter.on('data', function(file) {
            expect(logStub.called).to.be.false;
            done();
        });

        var fakeFile = new File();
        fakeFile.phpcsReport = {
            error: false
        };

        reporter.write(fakeFile);
    });

    it('should do nothing if PHPCS data is missed', function(done) {
        reporter.on('data', function(file) {
            expect(logStub.called).to.be.false;
            done();
        });

        reporter.write(new File());
    });
});
