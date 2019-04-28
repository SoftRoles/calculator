const express = require('express');
const freePort = require("find-free-port")
var app = express();

//=========================================
// authorization check
//=========================================
const authorizeBearerToken = require('../')

app.use(authorizeBearerToken(function (token, cb) {
  console.log(token)
  cb(null)
  // cb({ username: 'test' })
}))
app.use(require('@softroles/authorize-local-user')())
app.use(require('morgan')('tiny'));

app.get('/', (req, res) => {
  console.log(req.user)
  res.send({})
})

freePort(3000, function (err, port) {
  app.listen(port, function () {
    console.log("Service running on http://127.0.0.1:" + port)
  })
})
//=========================================
// authorization check
//=========================================
// app.use(ensureLogin({ redirectTo: "/403", localUser: true }, function (token, callback) {
//   mongodb.db("auth").collection("users").findOne({ token: token }, function (err, user) {
//     return callback(user);
//   });
// }))
