module.exports = experiment;

var feature = require('@dose/feature');

/**
 * Get a configured experiments object that exposes getDigest function
 *
 * @param {object} experiments
 * @returns {object}
 */
function experiment(experiments) {
    return {
        experiments: feature(_getParsedExperimentConfig(experiments)),
        getDigest: function(context) {
            return _getDigest(this.experiments, context);
        }
    };
}

/**
 * Gets experiment digest
 *
 * @param {object} experiments
 * @param {string} context
 * @returns {Object}
 * @private
 */
function _getDigest(experiments, context) {
    var experimentDigest = {};
    var digest = experiments.getDigest(context);

    experimentDigest[digest.experiments] = digest['experiment.' + digest.experiments];

    return experimentDigest;
}

/**
 * Gets parsed experiments configuration
 *
 * @param {object} experiments
 * @returns {object}
 * @private
 */
function _getParsedExperimentConfig(experiments) {
    var experiment;
    var experimentWeight;
    var totalWeight = 0;
    var parsedExperiments = {
        experiments: {}
    };

    if (typeof experiments !== 'object') {
        throw Error('Invalid configuration');
    }

    // Parse important data from the experiment configuration
    for (experiment in experiments) {
        experimentWeight = _getSanitizedWeight(experiments[experiment].weight);

        // Ignore 0 weight experiments
        if (experimentWeight === 0) {
            continue;
        }

        totalWeight += experimentWeight;
        parsedExperiments.experiments[experiment] = experimentWeight;
        parsedExperiments['experiment.' + experiment] = experiments[experiment].variants;
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
    if (typeof weight === 'boolean') {
        weight = weight ? 1 : 0;
    } else if (typeof weight !== 'number' || isNaN(weight)) {
        return 0;
    }

    return weight < 0 ? 0 : weight;
}
