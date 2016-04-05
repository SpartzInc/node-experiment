module.exports = experiment;

var _core = require('./core');

/**
 * Returns configured core object
 *
 * @param {object} config
 * @returns {object}
 */
function experiment(config) {
    _core.setExperiments(config);

    return _core;
}
