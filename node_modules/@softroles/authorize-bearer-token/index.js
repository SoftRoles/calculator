/**
 * Authorize local host requests as a user (default:_admin_) incase 
 * not previously authorized 
 *
 * tokenVerify:
 *   - Local user object, defaults to _{username: 'admin'}_
 *     !!Important: _username_ field should be always supplied if grant to
 *     local user is desired.
 * 
 * Examples:
 *
 *     app.use(authorizeLocalUser());
 * 
 *     app.use(authorizeLocalUser(null)); // not authorize local user
 * 
 *     app.use(authorizeLocalUser({username:'localUser', roles:[....]}));
 * 
 *     app.get('/profile', authorizeLocalUser(), function(req, res) { ... });
 *
 *
 *
*/

/**
* Module dependencies.
* @private
*/
var assert = require('assert');

/** 
* @param { Funtion } verifyToken
* @return { Function }
* @api public
*/

module.exports = function ensureLogin(verifyToken) {
  assert.equal(typeof verifyToken, 'function', 'verfiyToken must be a function.')
  return function (req, res, next) {
    const token = verifyToken && req.headers && req.headers.authorization
      && req.headers.authorization.split(" ").length == 2
      && /^Bearer$/i.test(req.headers.authorization.split(" ")[0])
      && req.headers.authorization.split(" ")[1]
    //console.log(token)
    if (!req.user && token) {
      verifyToken(token, function (err, user) {
        if (user) { req.user = user; next() }
        else next()
      })
    }
    else next()
  }
}
