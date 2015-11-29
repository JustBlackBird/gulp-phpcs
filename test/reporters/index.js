var expect = require('chai').expect,
    loader = require('../../reporters');

describe('Reporter loader', function() {
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
