jest.dontMock('../src/core');
jest.mock('@dose/feature');

describe('experiment library', function() {

    var _feature = require('@dose/feature');
    var _featureCoreMock = {
        setFeatures: jest.fn(),
        getVariant: jest.fn()
    };
    _feature.mockReturnValue(_featureCoreMock);

    var _core = require('../src/core');

    var _experimentConfig = {
        'experimentA': {
            weight: 10,
            variants: [
                'variantA',
                'variantB',
                'variantC'
            ],
            slug: '123'
        },
        'experimentB': {
            weight: 10,
            variants: [
                'variantA',
                'variantB',
                'variantC'
            ],
            slug: '234'
        },
        'experimentC': {
            weight: 20,
            variants: [
                'variantA',
                'variantB',
                'variantC'
            ],
            slug: '345'
        },
        'experimentD': {
            weight: 0,
            variants: [
                'variantA'
            ],
            slug: '456'
        },
        'experimentE': {
            weight: -100,
            variants: [
                'variantA'
            ],
            slug: '567'
        },
        'experimentF': {
            weight: 'NaN',
            variants: [
                'variantA'
            ],
            slug: '789'
        }
    };

    beforeEach(function() {
        _featureCoreMock.setFeatures.mockClear();
        _featureCoreMock.getVariant.mockClear();
    });

    it('throws an error when configuration is invalid', function() {
        expect(function() {
            _core.setExperiments('Not and Object');
        }).toThrow();
    });

    it('sets feature configuration', function() {
        _core.setExperiments(_experimentConfig);
        expect(_featureCoreMock.setFeatures.mock.calls[0][0]).toEqual({
            experiments: {
                experimentA: 25,
                experimentB: 25,
                experimentC: 100
            },
            'experiment.experimentA': [
                'variantA',
                'variantB',
                'variantC'
            ],
            'experiment.experimentB': [
                'variantA',
                'variantB',
                'variantC'
            ],
            'experiment.experimentC': [
                'variantA',
                'variantB',
                'variantC'
            ]
        });
    });

    it('sets feature configuration when experiment configuration is empty', function() {
        _core.setExperiments({});
        expect(_featureCoreMock.setFeatures.mock.calls[0][0]).toEqual({
            experiments: {}
        });
    });

    it('gets variant for current experiment', function() {
        _featureCoreMock.getVariant.mockReturnValue('experimentA');

        expect(_core.getVariant('context', 'experimentA')).toEqual('experimentA');
        expect(_featureCoreMock.getVariant.mock.calls[1]).toEqual([
            'context',
            'experiment.experimentA'
        ]);
    });

    it('gets null for experiment that is not current', function() {
        _featureCoreMock.getVariant.mockReturnValue('experimentA');

        expect(_core.getVariant('context', 'experimentB')).toEqual(null);
        expect(_featureCoreMock.getVariant.mock.calls.length).toEqual(1);
    });
});
