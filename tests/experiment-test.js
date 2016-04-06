jest.dontMock('../src/experiment');

describe('experiment', function() {

    var experiment = require('../src/experiment');
    var core = require('../src/core');

    it('should export constructor', function() {
        expect(typeof experiment).toEqual('function');
    });

    it('should set experiment configuration', function() {
        var configuration = {'experiment': 100};

        experiment(configuration);
        expect(core.setExperiments.mock.calls[0][0]).toEqual(configuration);
    });

    it('should return core', function() {
        expect(experiment({})).toEqual(core);
    });
});
