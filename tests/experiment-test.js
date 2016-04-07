jest.dontMock('../src/experiment');
jest.mock('@dose/feature');

describe('experiment', function() {

    var experiment = require('../src/experiment');
    var feature = require('@dose/feature');

    var _experimentConfig = {
        experimentA: {
            weight: 10,
            variants: 100,
            slug: '123'
        },
        experimentB: {
            weight: 10,
            variants: [
                'variantA',
                'variantB',
                'variantC'
            ],
            slug: '234'
        },
        experimentC: {
            weight: 20,
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
        }
    };

    beforeEach(function() {
        feature.mockClear();
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
                experimentA: 25,
                experimentB: 25,
                experimentC: 100
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
        });
    });

    it('gets digest', function() {
        feature.mockReturnValue({
            getDigest: function() {
                return {
                    experiments: 'experimentA',
                    'experiment.experimentA': 'variantA'
                };
            }
        });

        var experiments = experiment(_experimentConfig);

        expect(experiments.getDigest('context')).toEqual({
            experimentA: 'variantA'
        });
    });
});
