jest.dontMock('../src/experiment');
jest.mock('node-feature');

describe('experiment', function() {
    var _ = require('lodash');

    var experiment = require('../src/experiment');
    var feature = require('node-feature');

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

        expect(_.isEqual(feature.mock.calls[0][0], {
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
        })).toBeTruthy();
    });

    it('gets digest and slug from simple variant', function() {
        expect(_.isEqual(experiment(_experimentConfig, 'context'), {
            digest: {
                experimentA: 'variantA'
            },
            slug: '123-1'
        })).toBeTruthy();
    });

    it('gets a slug from variant array', function() {
        feature.mockReturnValue({
            experiments: 'experimentB',
            'experiment.experimentB': 'variantC'
        });

        expect(_.isEqual(experiment(_experimentConfig, 'context'), {
            digest: {
                experimentB: 'variantC'
            },
            slug: '234-3'
        })).toBeTruthy();
    });

    it('gets a slug from variant object', function() {
        feature.mockReturnValue({
            experiments: 'experimentC',
            'experiment.experimentC': 'variantB'
        });

        expect(_.isEqual(experiment(_experimentConfig, 'context'), {
            digest: {
                experimentC: 'variantB'
            },
            slug: '345-2'
        })).toBeTruthy();
    });

    it('applies overrides in json format', function() {
        experiment(_experimentConfig, 'context', {234: 0});
        experiment(_experimentConfig, 'context', {234: 2});
        experiment(_experimentConfig, 'context', {234: -100});
        experiment(_experimentConfig, 'context', {234: 100});
        experiment(_experimentConfig, 'context', {234: null});
        experiment(_experimentConfig, 'context', [234]);

        expect(_.isEqual(feature.mock.calls[0][2], {
            experiments: 'experimentB',
            'experiment.experimentB': 'variantA'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[1][2], {
            experiments: 'experimentB',
            'experiment.experimentB': 'variantC'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[2][2], {
            experiments: 'experimentB',
            'experiment.experimentB': 'variantA'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[3][2], {
            experiments: 'experimentB',
            'experiment.experimentB': 'variantC'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[4][2], {
            experiments: 'experimentB'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[5][2], {
            experiments: 'experimentB'
        })).toBeTruthy();
    });

    it('applies overrides in json string format', function() {
        experiment(_experimentConfig, 'context', JSON.stringify({345: 0}));
        experiment(_experimentConfig, 'context', JSON.stringify({345: 2}));
        experiment(_experimentConfig, 'context', JSON.stringify({345: -100}));
        experiment(_experimentConfig, 'context', JSON.stringify({345: 100}));
        experiment(_experimentConfig, 'context', JSON.stringify({345: null}));
        experiment(_experimentConfig, 'context', JSON.stringify([345]));

        expect(_.isEqual(feature.mock.calls[0][2], {
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[1][2], {
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[2][2], {
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[3][2], {
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[4][2], {
            experiments: 'experimentC'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[5][2], {
            experiments: 'experimentC'
        })).toBeTruthy();
    });

    it('applies overrides in string format', function() {
        experiment(_experimentConfig, 'context', '345-0');
        experiment(_experimentConfig, 'context', '345-2');
        experiment(_experimentConfig, 'context', '345-100');
        experiment(_experimentConfig, 'context', '345');

        expect(_.isEqual(feature.mock.calls[0][2], {
            experiments: 'experimentC',
            'experiment.experimentC': 'variantA'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[1][2], {
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[2][2], {
            experiments: 'experimentC',
            'experiment.experimentC': 'variantC'
        })).toBeTruthy();
        expect(_.isEqual(feature.mock.calls[3][2], {
            experiments: 'experimentC'
        })).toBeTruthy();
    });

    it('overrides experiments with 0 weight', function() {
        experiment(_experimentConfig, 'context', [567]);

        expect(_.isEqual(feature.mock.calls[0][2], {
            experiments: 'experimentE'
        })).toBeTruthy();
    });

    it('overrides all experiments to null if slug does not exist', function() {
        experiment(_experimentConfig, 'context', [73]);

        expect(_.isEqual(feature.mock.calls[0][2], {
            experiments: null
        })).toBeTruthy();
    });

    it('does not try to complete coverage when there are no experiments', function() {
        experiment({}, 'context');

        expect(_.isEqual(feature.mock.calls[0][0], {
            experiments: {}
        })).toBeTruthy();
    });
});
