jest.dontMock('../src/experiment');
jest.mock('@dose/feature');

describe('experiment', function() {

    var experiment = require('../src/experiment');
    var feature = require('@dose/feature');

    var _experimentConfig = {
        experimentA: {
            weight: 1,
            variants: 100,
            slug: '123'
        },
        experimentB: {
            weight: 1,
            variants: [
                'variantA',
                'variantB',
                'variantC'
            ],
            slug: '234'
        },
        experimentC: {
            weight: 2,
            variants: {
                variantA: 10,
                variantB: 10,
                variantC: 20
            },
            slug: '345'
        },
        experimentD: {
            weight: 0,
            variants: [
                'variantA'
            ],
            slug: '456'
        },
        experimentE: {
            weight: -100,
            variants: [
                'variantA'
            ],
            slug: '567'
        },
        experimentF: {
            weight: 'NaN',
            variants: [
                'variantA'
            ],
            slug: '789'
        },
        experimentG: {
            weight: true,
            variants: [
                'variantA'
            ],
            slug: '890'
        },
        experimentH: {
            weight: false,
            variants: [
                'variantA'
            ],
            slug: '901'
        },

    };

    var _mockGetDigest = jest.fn();

    _mockGetDigest.mockReturnValue({
        experiments: 'experimentA',
        'experiment.experimentA': 'variantA'
    });

    feature.mockReturnValue({
        getDigest: _mockGetDigest
    });

    beforeEach(function() {
        feature.mockClear();
        _mockGetDigest.mockClear();
    });

    it('should export instantiated experiment object', function() {
        var experiments = experiment({});

        expect(typeof experiments).toEqual('object');
        expect(typeof experiments.getDigest).toEqual('function');
    });

    it('throws an error when configuration is invalid', function() {
        expect(function() {
            experiment('Not and Object');
        }).toThrow();
    });

    it('sets feature configuration', function() {
        experiment(_experimentConfig);

        expect(feature.mock.calls[0][0]).toEqual({
            experiments: {
                experimentA: 20,
                experimentB: 20,
                experimentC: 40,
                experimentG: 100
            },
            'experiment.experimentA': 100,
            'experiment.experimentB': [
                'variantA',
                'variantB',
                'variantC'
            ],
            'experiment.experimentC': {
                variantA: 10,
                variantB: 10,
                variantC: 20
            },
            'experiment.experimentG': [
                'variantA'
            ]
        });
    });

    it('gets digest', function() {
        var experiments = experiment(_experimentConfig);

        expect(experiments.getDigest('context')).toEqual({
            experimentA: 'variantA'
        });
    });

    it('applies overrides in json format', function() {
        var experiments = experiment(_experimentConfig);

        experiments.getDigest('context', {234: 0});
        experiments.getDigest('context', {234: 2});
        experiments.getDigest('context', {234: -100});
        experiments.getDigest('context', {234: 100});
        experiments.getDigest('context', {234: null});
        experiments.getDigest('context', [234]);

        expect(_mockGetDigest.mock.calls[0][1]).toEqual({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantA'
        });
        expect(_mockGetDigest.mock.calls[1][1]).toEqual({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantC'
        });
        expect(_mockGetDigest.mock.calls[2][1]).toEqual({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantA'
        });
        expect(_mockGetDigest.mock.calls[3][1]).toEqual({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantC'
        });
        expect(_mockGetDigest.mock.calls[4][1]).toEqual({
            experiments: 'experimentB'
        });
        expect(_mockGetDigest.mock.calls[5][1]).toEqual({
            experiments: 'experimentB'
        });
    });

    it('applies overrides in json string format', function() {
        var experiments = experiment(_experimentConfig);

        experiments.getDigest('context', JSON.stringify({345: 0}));
        experiments.getDigest('context', JSON.stringify({345: 2}));
        experiments.getDigest('context', JSON.stringify({345: -100}));
        experiments.getDigest('context', JSON.stringify({345: 100}));
        experiments.getDigest('context', JSON.stringify({345: null}));
        experiments.getDigest('context', JSON.stringify([345]));

        expect(_mockGetDigest.mock.calls[0][1]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        });
        expect(_mockGetDigest.mock.calls[1][1]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        });
        expect(_mockGetDigest.mock.calls[2][1]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        });
        expect(_mockGetDigest.mock.calls[3][1]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        });
        expect(_mockGetDigest.mock.calls[4][1]).toEqual({
            experiments: 'experimentC'
        });
        expect(_mockGetDigest.mock.calls[5][1]).toEqual({
            experiments: 'experimentC'
        });
    });

    it('applies overrides in string format', function() {
        var experiments = experiment(_experimentConfig);

        experiments.getDigest('context', '345-0');
        experiments.getDigest('context', '345-2');
        experiments.getDigest('context', '345-100');
        experiments.getDigest('context', '345');

        expect(_mockGetDigest.mock.calls[0][1]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        });
        expect(_mockGetDigest.mock.calls[1][1]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        });
        expect(_mockGetDigest.mock.calls[2][1]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        });
        expect(_mockGetDigest.mock.calls[3][1]).toEqual({
            experiments: 'experimentC'
        });
    });

    it('overrides experiments with 0 weight', function() {
        var experiments = experiment(_experimentConfig);

        experiments.getDigest('context', [567]);

        expect(_mockGetDigest.mock.calls[0][1]).toEqual({
            experiments: 'experimentE'
        });
    });

    it('overrides all experiments to null if slug does not exist', function() {
        var experiments = experiment(_experimentConfig);

        experiments.getDigest('context', [73]);

        expect(_mockGetDigest.mock.calls[0][1]).toEqual({
            experiments: null
        });
    });
});
