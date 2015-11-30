var fs = require('fs'),
    gutil = require('gulp-util'),
    mockFs = require('mock-fs'),
    expect = require('chai').expect,
    File = require('vinyl'),
    sinon = require('sinon'),
    through = require('through2'),
    fileExists = require('file-exists'),
    fileReporter = require('../../reporters/file');

var blackHole = function(onStreamEnd) {
    return through.obj(function(file, enc, callback) {
        // Silently throw all files away.
        callback();
    }, function(callback) {
        callback();
        onStreamEnd();
    });
};

var createFile = function(path, error) {
    var file = new File({path: path});

    if (typeof error === 'undefined') {
        return file;
    }

    if (error === false) {
        file.phpcsReport = {
            error: false
        };
    } else {
        file.phpcsReport = {
            error: true,
            output: error
        };
    }

    return file;
};

describe('File reporter', function() {
    var reporter = null;

    describe('initialization errors', function() {
        it('should throw error if no file is specified', function() {
            expect(function() {
                fileReporter();
            }).to.throw(/You have to specify a path/);
        });
    });

    describe('reports saving', function() {
        var logStub = null;

        beforeEach(function() {
            mockFs({
                '/reports/locked.log': mockFs.file({
                    mode: parseInt('444', 8)
                })
            });

            // Actually we have to replace gutil.log with a stub because its
            // current implementation uses "require" at run-time which will
            // fail after file system is mocked.
            logStub = sinon.stub(gutil, 'log');
        });

        afterEach(function() {
            // Restore all mocks that are in use.
            mockFs.restore();
            gutil.log.restore();
            // Clean up created instances.
            logStub = null;
        });

        it('should write report for files with style problem', function(done) {
            var reporter = fileReporter({path: '/reports/errors.log'});

            reporter.pipe(blackHole(function() {
                expect(fileExists('/reports/errors.log')).to.be.true;

                // Validate the report
                var savedReport = fs.readFileSync('/reports/errors.log', {encoding: 'utf8'});
                expect(savedReport).to.be.ok;
                // Make sure the report contains PHPCS output.
                expect(savedReport).to.contain('test PHPCS output');
                // Make sure appropriate error message is written to gulp log.
                expect(logStub.calledOnce).to.be.true;
                var logArgs = logStub.firstCall.args;
                expect(logArgs).to.be.an.instanceof(Array)
                expect(logArgs).to.have.length(1);
                expect(logArgs[0]).to.contain('1 error');

                done();
            }));

            reporter.write(createFile('/src/file.php', 'test PHPCS output'));
            reporter.end();
        });

        it('should write nothing if PHPCS data is missed', function(done) {
            var reporter = fileReporter({path: '/reports/errors.log'});

            reporter.pipe(blackHole(function() {
                // Make sure the file was not created.
                expect(fileExists('/reports/errors.log')).to.be.false;
                // Make sure no messages was written to gulp log.
                expect(logStub.called).to.be.false;

                done();
            }));

            reporter.write(createFile('/src/file.php'));
            reporter.end();
        });

        it('should write nothing if a file has no style problems', function() {
            var reporter = fileReporter({path: '/reports/errors.log'});

            reporter.pipe(blackHole(function() {
                // Make sure the file was not created.
                expect(fileExists('/reports/errors.log')).to.be.false;
                // Make sure no messages was written to gulp log.
                expect(logStub.called).to.be.false;

                done();
            }));

            reporter.write(createFile('/src/file.php', false));
            reporter.end();
        });

        it('should combine reports for each bad file', function(done) {
            var reporter = fileReporter({path: '/reports/errors.log'});

            reporter.pipe(blackHole(function() {
                expect(fileExists('/reports/errors.log')).to.be.true;

                // Validate the report
                var savedReport = fs.readFileSync('/reports/errors.log', {encoding: 'utf8'});
                expect(savedReport).to.be.ok;
                // Make sure the report contains all PHPCS outputs.
                expect(savedReport).to.contain('the first file');
                expect(savedReport).to.contain('the third file');
                expect(savedReport).to.contain('the fith file');
                // Make sure appropriate error message is written to gulp log.
                expect(logStub.calledOnce).to.be.true;
                var logArgs = logStub.firstCall.args;
                expect(logArgs).to.be.an.instanceof(Array)
                expect(logArgs).to.have.length(1);
                expect(logArgs[0]).to.contain('3 errors');

                done();
            }));

            reporter.write(createFile('/src/file_1.php', 'the first file'));
            reporter.write(createFile('/src/file_2.php', false));
            reporter.write(createFile('/src/file_3.php', 'the third file'));
            reporter.write(createFile('/src/file_4.php'));
            reporter.write(createFile('/src/file_5.php', 'the fith file'));
            reporter.end();
        });

        it('should emit error if the target file is not writable', function(done) {
            var reporter = fileReporter({path: '/reports/locked.log'});

            reporter.on('error', function(error) {
                expect(error).to.be.an.instanceof(gutil.PluginError);
                done();
            });

            reporter.write(createFile('/src/file.php', 'A test error'));
            reporter.end();
        });
    });
});
