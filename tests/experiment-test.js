jest.dontMock('../src/experiment');

describe('experiment', function() {

    var _experiment = require('../src/experiment');
    var _core = require('../src/core');

    it('should export constructor', function() {
        expect(typeof _experiment).toEqual('function');
    });

    it('should set experiment configuration', function() {
        var configuration = {'experiment': 100};

        _experiment(configuration);
        expect(_core.setExperiments.mock.calls[0][0]).toEqual(configuration);
    });

    it('should return core', function() {
        expect(_experiment({})).toEqual(_core);
    });
});
