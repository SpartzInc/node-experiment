module.exports = experiment;

var core = require('./core');

/**
 * Returns configured core object
 *
 * @param {object} config
 * @returns {object}
 */
function experiment(config) {
    core.setExperiments(config);

    return core;
}
