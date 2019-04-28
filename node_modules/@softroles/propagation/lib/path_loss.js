/*!
 * Path Loss
 * Copyright(c) 2019 Hüseyin Yiğit
 * MIT Licensed
 */

/**
 * Path Loss.
 * @param {number} freq - Frequency in MHz.
 * @param {number} dist - Propagation distance in km.
 * @return {number} Path loss in dB.
 */
module.exports = function(freq, dist) {
    return 32.44 + 20 * Math.log10(freq * dist);
}
