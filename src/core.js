module.exports.setExperiments = setExperiments;
module.exports.getVariant = getVariant;

/**
 * Instance of feature
 *
 * @type {object}
 * @private
 */
var _feature = require('@dose/feature');

/**
 * Stores configured feature object
 *
 * @type {object}
 * @private
 */
var _experiments = _feature({});

/**
 * Sets and parses configured experiments
 *
 * @param {object} experiments
 */
function setExperiments(experiments) {
    if (typeof experiments !== 'object') {
        throw Error('Invalid configuration');
    }

    _experiments.setFeatures(_getParsedExperimentConfig(experiments));
}

/**
 * Gets a winning variant for the specified experiment
 *
 * @param {string} context
 * @param {string} name
 * @returns {string|null}
 */
function getVariant(context, name) {
    if (_experiments.getVariant(context, 'experiments') !== name) {
        return null;
    }

    return _experiments.getVariant(context, 'experiment.' + name);
}

/**
 * Gets parsed and normalized experiment configuration
 *
 * @param {object} experimentConfig
 * @returns {object}
 * @private
 */
function _getParsedExperimentConfig(experimentConfig) {
    var parsedExperiments = {
        experiments: {}
    };
    var experiment;
    var experimentWeight;
    var totalWeight = 0;

    // Parse important data from the experiment configuration
    for (experiment in experimentConfig) {
        experimentWeight = _getSanitizedWeight(experimentConfig[experiment].weight);

        // Ignore 0 weight experiments
        if (experimentWeight === 0) {
            continue;
        }

        totalWeight += experimentWeight;
        parsedExperiments.experiments[experiment] = experimentWeight;
        parsedExperiments['experiment.' + experiment] = experimentConfig[experiment].variants;
    }

    // Convert weights into odds
    for (experiment in parsedExperiments.experiments) {
        parsedExperiments.experiments[experiment] = parsedExperiments.experiments[experiment] / totalWeight * 100;
    }

    // Make last experiment 100 to ensure complete coverage
    if (Object.keys(parsedExperiments.experiments).length) {
        parsedExperiments.experiments[experiment] = 100;
    }

    return parsedExperiments;
}

/**
 * Gets a normalized weights
 *
 * @param {*} weight
 * @returns {number}
 * @private
 */
function _getSanitizedWeight(weight) {
    if (isNaN(weight)) {
        return 0;
    }
    return weight < 0 ? 0 : weight;
}
