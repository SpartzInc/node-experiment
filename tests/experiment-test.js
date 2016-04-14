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
        }
    };

    feature.mockReturnValue({
        experiments: 'experimentA',
        'experiment.experimentA': 'variantA'
    });

    beforeEach(function() {
        feature.mockClear();
    });

    it('throws an error when configuration is invalid', function() {
        expect(function() {
            experiment('Not and Object', 'context');
        }).toThrow();
    });

    it('sets feature configuration', function() {
        experiment(_experimentConfig, 'context');

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
        expect(experiment(_experimentConfig, 'context')).toEqual({
            experimentA: 'variantA'
        });
    });

    it('applies overrides in json format', function() {
        experiment(_experimentConfig, 'context', {234: 0});
        experiment(_experimentConfig, 'context', {234: 2});
        experiment(_experimentConfig, 'context', {234: -100});
        experiment(_experimentConfig, 'context', {234: 100});
        experiment(_experimentConfig, 'context', {234: null});
        experiment(_experimentConfig, 'context', [234]);

        expect(feature.mock.calls[0][2]).toEqual({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantA'
        });
        expect(feature.mock.calls[1][2]).toEqual({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantC'
        });
        expect(feature.mock.calls[2][2]).toEqual({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantA'
        });
        expect(feature.mock.calls[3][2]).toEqual({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantC'
        });
        expect(feature.mock.calls[4][2]).toEqual({
            experiments: 'experimentB'
        });
        expect(feature.mock.calls[5][2]).toEqual({
            experiments: 'experimentB'
        });
    });

    it('applies overrides in json string format', function() {
        experiment(_experimentConfig, 'context', JSON.stringify({345: 0}));
        experiment(_experimentConfig, 'context', JSON.stringify({345: 2}));
        experiment(_experimentConfig, 'context', JSON.stringify({345: -100}));
        experiment(_experimentConfig, 'context', JSON.stringify({345: 100}));
        experiment(_experimentConfig, 'context', JSON.stringify({345: null}));
        experiment(_experimentConfig, 'context', JSON.stringify([345]));

        expect(feature.mock.calls[0][2]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        });
        expect(feature.mock.calls[1][2]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        });
        expect(feature.mock.calls[2][2]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        });
        expect(feature.mock.calls[3][2]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        });
        expect(feature.mock.calls[4][2]).toEqual({
            experiments: 'experimentC'
        });
        expect(feature.mock.calls[5][2]).toEqual({
            experiments: 'experimentC'
        });
    });

    it('applies overrides in string format', function() {
        experiment(_experimentConfig, 'context', '345-0');
        experiment(_experimentConfig, 'context', '345-2');
        experiment(_experimentConfig, 'context', '345-100');
        experiment(_experimentConfig, 'context', '345');

        expect(feature.mock.calls[0][2]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        });
        expect(feature.mock.calls[1][2]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        });
        expect(feature.mock.calls[2][2]).toEqual({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        });
        expect(feature.mock.calls[3][2]).toEqual({
            experiments: 'experimentC'
        });
    });

    it('overrides experiments with 0 weight', function() {
        experiment(_experimentConfig, 'context', [567]);

        expect(feature.mock.calls[0][2]).toEqual({
            experiments: 'experimentE'
        });
    });

    it('overrides all experiments to null if slug does not exist', function() {
        experiment(_experimentConfig, 'context', [73]);

        expect(feature.mock.calls[0][2]).toEqual({
            experiments: null
        });
    });

    it('does not try to complete coverage when there are no experiments', function() {
        experiment({}, 'context');

        expect(feature.mock.calls[0][0]).toEqual({
            experiments: {}
        });
    });
});
