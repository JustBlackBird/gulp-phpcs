var expect = require('chai').expect,
    sinon = require('sinon'),
    mockRequire = require('mock-require'),
    loader = require('../../../reporters');

describe('Reporter loader', function() {
    describe('wrong reporters', function() {
        it('should throw error for unknown reporter', function() {
            expect(function() {
                loader('missed_reporter');
                // Error description must include name of the
                // requested reporter
            }).to.throw(/missed_reporter/);
        });

        it('should throw error for "index" reporter', function() {
            expect(function() {
                loader('index');
                // Error description must include name of the
                // requested reporter.
            }).to.throw(/index/);
        });
    });

    describe('loading logic', function() {
        var reporterBuilder = null;

        before(function() {
            reporterBuilder = sinon.stub();
            // The structure of the returned reporter has no meaning.
            reporterBuilder.returns({
                test: 'value'
            });

            mockRequire('../../../reporters/noop.js', reporterBuilder);
        });

        afterEach(function() {
            reporterBuilder.reset();
        });

        after(function() {
            mockRequire.stopAll();
        });

        it('should load reporter\'s builder and retrieves its result', function() {
            var loadedReporter = loader('noop');
            expect(reporterBuilder.calledOnce).to.be.true;
            expect(loadedReporter).to.be.equal(reporterBuilder());
        });

        it('should pass empty object to reporter\'s builder if no options are specified', function() {
            loader('noop');
            expect(reporterBuilder.calledOnce).to.be.true;
            var args = reporterBuilder.firstCall.args;
            expect(args).to.have.length(1);
            expect(args[0]).to.be.an.instanceof(Object);
            expect(args[0]).to.be.empty;
        });

        it('should pass correct options to the reporter\'s builder', function() {
            // Exact options set has no meaning.
            var options = {
                path: '/test',
                data: 'something useful'
            };

            loader('noop', options);
            expect(reporterBuilder.calledOnce).to.be.true;
            var args = reporterBuilder.firstCall.args;
            expect(args).to.have.length(1);
            expect(args[0]).to.be.equal(options);
        });
    });
});
