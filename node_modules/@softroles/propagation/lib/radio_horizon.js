/*!
 * Radio Horizon & Line of sight
 * Copyright(c) 2019 Hüseyin Yiğit
 * MIT Licensed
 *
 * References:
 * 1- Wikipedia {@link https://en.wikipedia.og/wiki/Line-ofsight-propagation}
 */

/**
 * Line of sight.
 * @param {number} h - Antenna height in m.
 * @return {number} los in km.
 */
module.exports.los = function(h) {
    return 3.57 * Math.sqrt(h);
}

/**
 * Radio horizon.
 * @param {number} h - Antenna height in m.
 * @return {number} rfhor in km.
 */
module.exports.rfhor = function(h) {
    return 4.12 * Math.sqrt(h);
}
