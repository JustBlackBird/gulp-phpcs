var path = require('path'),
    expect = require('chai').expect,
    File = require('vinyl'),
    gutil = require('gulp-util'),
    isWindows = require('is-windows'),
    phpcs = require('../../index.js');

// NOTICE: All path to commands are specified related to the root of the
// project. This is because cwd is "../../" when the tests are run.

// Attach fixture path to PATH env so we could use just commands from fixture.
var sep = isWindows() ? ';' : ':';
process.env.PATH += sep + path.resolve('./test/fixture');

describe('PHPCS', function() {
    describe('CLI command resolver', function() {
        it('should fail if the CLI command cannot be found', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/missed'
            });

            plugin.on('error', function(error) {
                expect(error).to.be.an.instanceof(gutil.PluginError);
                expect(error.message).to.contain('Cannot find');
                expect(error.message).to.contain('./test/fixture/missed');
                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('test')
            }));
        });

        it('should find command by relative path with win slashes', function(done) {
            var plugin = phpcs({
                bin: '.\\test\\fixture\\zero'
            });

            plugin.on('error', function(error) {
                // This should never happen.
                done(error);
            });

            plugin.on('data', function() {
                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('test')
            }));
        });

        it('should find command by relative path with *nix slashes', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/zero'
            });

            plugin.on('error', function(error) {
                // This should never happen.
                done(error);
            });

            plugin.on('data', function() {
                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('test')
            }));
        });

        it('should find command by relative path without leading dot', function(done) {
            var plugin = phpcs({
                bin: 'test/fixture/zero'
            });

            plugin.on('error', function(error) {
                // This should never happen.
                done(error);
            });

            plugin.on('data', function() {
                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('test')
            }));
        });

        it('should find command in PATH env by its name', function(done) {
            var plugin = phpcs({
                bin: 'zero'
            });

            plugin.on('error', function(error) {
                // This should never happen.
                done(error);
            });

            plugin.on('data', function() {
                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('test')
            }));
        });
    });

    describe('CLI tool runner', function() {
        it('should ignore empty files', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/error'
            });

            plugin.on('data', function(file) {
                expect(file.isNull()).to.be.true;
                expect(file.phpcsReport).to.be.undefined;

                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php'
            }));
        });

        it('should do nothing if PHPCS exists with zero exit-code', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/zero'
            });

            plugin.on('data', function(file) {
                expect(file).to.have.property('phpcsReport');
                expect(file.phpcsReport).to.have.property('error').which.is.false;

                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('test')
            }));
        });

        it('should retrieve stdout "as is" for fixable style errors', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/fixable_style_error'
            });

            plugin.on('data', function(file) {
                expect(file).to.have.property('phpcsReport');
                var report = file.phpcsReport;
                expect(report).to.be.an.instanceof(Object);
                expect(report).to.have.property('error').which.is.true;
                expect(report).to.have.property('output').which.is.a('string');
                expect(report.output).to.match(/Give me these lines\r?\nback!/);
                // File name should be also passed to PHPCS in special format
                expect(report.output).to.match(/^phpcs_input_file: \/src\/bad_file\.php\r?\n/);

                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('Give me these lines\nback!')
            }));
        });

        it('should retrieve stdout "as is" for non-fixable style errors', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/style_error'
            });

            plugin.on('data', function(file) {
                expect(file).to.have.property('phpcsReport');
                var report = file.phpcsReport;
                expect(report).to.be.an.instanceof(Object);
                expect(report).to.have.property('error').which.is.true;
                expect(report).to.have.property('output').which.is.a('string');
                expect(report.output).to.match(/Give me these lines\r?\nback!/);
                // File name should be also passed to PHPCS in special format
                expect(report.output).to.match(/^phpcs_input_file: \/src\/bad_file\.php\r?\n/);

                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('Give me these lines\nback!')
            }));
        });

        it('should retrieve error "as is"', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/error'
            });

            plugin.on('error', function(error) {
                expect(error).to.be.an.instanceof(gutil.PluginError);
                expect(error.message).to.be.equal('Execution of Code Sniffer Failed');
                expect(error).to.have.property('stdout');
                expect(error.stdout).to.contain('This is a test error.');

                done();
            });

            plugin.write(new File({
                path: '/src/bad_file.php',
                contents: new Buffer('test')
            }));
        });
    });

    describe('options builder', function() {
        var fakeFile = null;

        beforeEach(function() {
            fakeFile = new File({
                path: '/src/bad_file.php',
                contents: new Buffer('test')
            });
        });

        afterEach(function() {
            fakeFile = null;
        });

        it('should use only stdin switch by default', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args'
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.be.equal('-');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "severity" option "as is"', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                severity: 0
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.contain('--severity=0');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "warningSeverity" option "as is"', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                warningSeverity: 1
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.contain('--warning-severity=1');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "errorSeverity" option "as is"', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                errorSeverity: 2
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.contain('--error-severity=2');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "standard" option "as is"', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                standard: 'PSR2'
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.contain('--standard=PSR2');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "encoding" option "as is"', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                encoding: 'utf8'
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.contain('--encoding=utf8');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "report" option "as is"', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                report: 'summary'
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.contain('--report=summary');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use "-s" flag if "showSniffCode" option is true', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                showSniffCode: true
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.contain('-s');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should not use "-s" flag if "showSniffCode" option is false', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                showSniffCode: false
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.not.contain('-s');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "sniffs" option', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                sniffs: ['foo', 'bar', 'baz']
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                // Validate the option.
                expect(output).to.match(/--sniffs=([^\s]+)/);
                // Validate used sniffs.
                var usedSniffs = /--sniffs=([^\s]+)/.exec(output);
                expect(usedSniffs[1].split(',')).to.have.members(['foo', 'bar', 'baz']);

                done();
            });

            plugin.write(fakeFile);
        });

        it('should not use "--sniffs" option if an empty array is passed in', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                sniffs: []
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.not.contain('--sniffs');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should not use "--sniffs" option if not an array is passed in', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                sniffs: 'test string'
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.not.contain('--sniffs');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "ignore" option', function(done) {
            var paths = ['foo', 'bar', 'baz'];

            var plugin = phpcs({
                bin: './test/fixture/args',
                ignore: paths
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                var ignoreArgs = /--ignore=([^\s]+)/.exec(output);
                expect(ignoreArgs).to.be.not.null;
                expect(ignoreArgs[1].split(',')).to.have.members(paths);

                done();
            });

            plugin.write(fakeFile);
        });

        it('should not use "--ignore" option if an empty array is passed in', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                ignore: []
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.not.contain('--ignore');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should not use "--ignore" option if not an array is passed in', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                ignore: 'test string'
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.not.contain('--ignore');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use passed in "exclude" option', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                exclude: ['foo', 'bar', 'baz']
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                var excludeArgs = /--exclude=([^\s]+)/.exec(output);
                expect(excludeArgs).to.be.not.null;
                expect(excludeArgs[1].split(',')).to.have.members(['foo', 'bar', 'baz']);

                done();
            });

            plugin.write(fakeFile);
        });

        it('should not use "--exclude" option if an empty array is passed in', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                exclude: []
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.not.contain('--exclude');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should not use "--exclude" option if not an array is passed in', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                exclude: 'test string'
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.not.contain('--exclude');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should use "--colors" flag if "colors" option is true', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                colors: true
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.contain('--colors');
                done();
            });

            plugin.write(fakeFile);
        });

        it('should not use "--colors" flag if "colors" option is false', function(done) {
            var plugin = phpcs({
                bin: './test/fixture/args',
                colors: false
            });

            plugin.on('data', function(file) {
                var output = file.phpcsReport.output.trim();
                expect(output).to.not.contain('--collors');
                done();
            });

            plugin.write(fakeFile);
        });
    });
});
