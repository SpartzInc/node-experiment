module.exports = experiment;

var _ = require('lodash');
var feature = require('node-feature');

/**
 * Gets an object containing experiment digest and slug. Digest is an object containing experiment name as key and
 * a single winning variant as the value.
 *
 * @param {object} experimentsConfig
 * @param {string} context
 * @param {object|string} [override]
 * @returns {object}
 */
function experiment(experimentsConfig, context, override) {
    if (!_.isObject(experimentsConfig)) {
        throw Error('Invalid configuration');
    }

    var digest = feature(
        _getParsedExperimentConfig(experimentsConfig),
        context,
        _getParsedOverride(override, _getParsedSlugMap(experimentsConfig))
    );

    var experimentDigest = {};

    experimentDigest[digest.experiments] = digest['experiment.' + digest.experiments];

    var slug = _getExperimentSlugFromDigest(experimentDigest, experimentsConfig);

    return {
        digest: experimentDigest,
        slug: slug
    };
}

/**
 * Gets parsed experiments configuration
 *
 * @param {object} experimentsConfig
 * @returns {object}
 * @private
 */
function _getParsedExperimentConfig(experimentsConfig) {
    var experiment;
    var experimentWeight;
    var totalWeight = 0;
    var parsedExperiments = {
        experiments: {}
    };

    // Parse important data from the experiment configuration
    for (experiment in experimentsConfig) {
        experimentWeight = _getSanitizedWeight(experimentsConfig[experiment].weight);

        // Ignore 0 weight experiments
        if (experimentWeight === 0) {
            continue;
        }

        totalWeight += experimentWeight;
        parsedExperiments.experiments[experiment] = experimentWeight;
        parsedExperiments['experiment.' + experiment] = experimentsConfig[experiment].variants;
    }

    // Convert weights into odds
    for (experiment in parsedExperiments.experiments) {
        parsedExperiments.experiments[experiment] = parsedExperiments.experiments[experiment] / totalWeight * 100;
    }

    // Make last experiment 100 to ensure complete coverage
    if (_.keys(parsedExperiments.experiments).length) {
        parsedExperiments.experiments[experiment] = 100;
    }

    return parsedExperiments;
}

/**
 * Gets parsed slug map
 *
 * @param {object} experimentsConfig
 * @returns {object}
 * @private
 */
function _getParsedSlugMap(experimentsConfig) {
    var slugMap = {};
    var variants;

    // Parse important data from the experiment configuration
    for (var experiment in experimentsConfig) {
        variants = _.cloneDeep(experimentsConfig[experiment].variants);

        if (_.isObject(variants)) {
            if (!_.isArray(variants)) {
                variants = _.keys(variants);
            }
        } else {
            variants = [];
        }

        slugMap[experimentsConfig[experiment].slug] = {
            name: experiment,
            variants: variants
        };
    }

    return slugMap;
}

/**
 * Gets parsed overrides from slug map
 *
 * @param {object|string} override
 * @param {object} slugMap
 * @returns {object}
 * @private
 */
function _getParsedOverride(override, slugMap) {
    var parsedOverride = {};

    if (!override) {
        return {};
    }

    try {
        parsedOverride = JSON.parse(override);
    } catch (e) {
        parsedOverride = override;
    }

    if (!_.isObject(parsedOverride)) {
        var overrideParts = override.toString().split('-');
        parsedOverride = {};
        parsedOverride[_.first(overrideParts)] = _.nth(overrideParts, 1);
    }

    var slug;
    var variant;

    if (_.isArray(parsedOverride)) {
        slug = _.first(parsedOverride);
    } else {
        slug = _.first(_.keys(parsedOverride));
        variant = parsedOverride[slug];
    }

    // Turn off all experiments if slug is not found
    if (!_.has(slugMap, slug)) {
        return {
            experiments: null
        };
    }

    var translatedOverride = {
        experiments: slugMap[slug].name
    };

    if (
        !_.isNil(variant) &&
        slugMap[slug].variants.length
    ) {
        variant = _.min([slugMap[slug].variants.length - 1, variant]);
        variant = _.max([0, variant]);

        translatedOverride['experiment.' + slugMap[slug].name] = _.nth(slugMap[slug].variants, variant);
    }

    return translatedOverride;
}

/**
 * Translates experiment digest into slug string.
 *
 * @param {object} digest
 * @param {object} experimentsConfig
 * @returns {string}
 * @private
 */
function _getExperimentSlugFromDigest(digest, experimentsConfig) {
    var activeExperiment = _.first(_.keys(digest));

    if (_.isUndefined(activeExperiment) || !_.has(experimentsConfig, activeExperiment)) {
        return '';
    }

    var slug = experimentsConfig[activeExperiment].slug;
    var variant = digest[activeExperiment];
    var variants = _.cloneDeep(experimentsConfig[activeExperiment].variants);

    if (_.isObject(variants)) {
        if (!_.isArray(variants)) {
            variants = _.keys(variants);
        }
    } else {
        variants = [];
    }

    var variantIndex = variants.indexOf(variant);
    variantIndex = variantIndex < 0 ? 0 : variantIndex;
    variantIndex++;

    return slug + '-' + variantIndex;
}

/**
 * Gets a normalized weights
 *
 * @param {*} weight
 * @returns {number}
 * @private
 */
function _getSanitizedWeight(weight) {
    if (_.isBoolean(weight)) {
        weight = weight ? 1 : 0;
    } else if (!_.isFinite(weight)) {
        return 0;
    }

    return weight < 0 ? 0 : weight;
}
