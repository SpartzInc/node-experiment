module.exports = experiment;

var feature = require('@dose/feature');

/**
 * Get a configured experiments object that exposes getDigest function
 *
 * @param {object} experiments
 * @returns {object}
 */
function experiment(experiments) {
    if (typeof experiments !== 'object') {
        throw Error('Invalid configuration');
    }

    /**
     * Parsed slug map. This helps us to generate override objects.
     *
     * @type {Object}
     * @private
     */
    var _slugMap = _getParsedSlugMap(experiments);

    /**
     * Feature object configured for experiments.
     *
     * @type {Object}
     * @private
     */
    var _experiments = feature(_getParsedExperimentConfig(experiments));

    /**
     * Gets experiment digest
     *
     * @param {string} context
     * @param {object|string} override
     * @returns {Object}
     */
    function getDigest(context, override) {
        var experimentDigest = {};

        var digest = _experiments.getDigest(context, _getParsedOverride(override));

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
     * Gets parsed slug map
     *
     * @param {object} experiments
     * @returns {object}
     * @private
     */
    function _getParsedSlugMap(experiments) {
        var slugMap = {};
        var variants;

        // Parse important data from the experiment configuration
        for (var experiment in experiments) {
            variants = experiments[experiment].variants;

            if (typeof variants === 'object') {
                if (!Array.isArray(variants)) {
                    variants = Object.keys(variants);
                }
            } else {
                variants = [];
            }

            slugMap[experiments[experiment].slug] = {
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
     * @returns {object}
     * @private
     */
    function _getParsedOverride(override) {
        var parsedOverride = {};

        if (!override) {
            return {};
        }

        try {
            parsedOverride = JSON.parse(override);
        } catch (e) {
            parsedOverride = override;
        }

        if (typeof parsedOverride !== 'object') {
            var overrideParts = override.toString().split('-');
            parsedOverride = {};
            parsedOverride[overrideParts[0]] = overrideParts[1];
        }

        var slug;
        var variant;

        if (Array.isArray(parsedOverride)) {
            slug = parsedOverride[0];
        } else {
            slug = Object.keys(parsedOverride)[0];
            variant = parsedOverride[slug];
        }

        // Turn off all experiments if slug is not found
        if (!_slugMap.hasOwnProperty(slug)) {
            return {
                experiments: null
            };
        }

        var translatedOverride = {
            experiments: _slugMap[slug].name
        };

        if (
            variant !== null &&
            variant !== 'undefined' &&
            _slugMap[slug].variants.length
        ) {
            variant = Math.min(_slugMap[slug].variants.length - 1, variant);
            variant = Math.max(0, variant);

            translatedOverride['experiment.' + _slugMap[slug].name] = _slugMap[slug].variants[variant];
        }

        return translatedOverride;
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

    return {
        getDigest: getDigest
    };
}
