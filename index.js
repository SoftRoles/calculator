//=============================================================================
// http server
//=============================================================================
const express = require('express');
const argparse = require('argparse').ArgumentParser
const assert = require('assert')
const session = require('express-session');
const mongodbSessionStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const { noCache } = require('helmet');
const { spawn } = require('child_process');

//-------------------------------------
// arguments
//-------------------------------------
const argParser = new argparse({
  addHelp: true,
  description: 'Numerical calculation service'
})
argParser.addArgument(['-p', '--port'], {
  help: 'Listening port',
  defaultValue: '3010'
})
const args = argParser.parseArgs()

//-------------------------------------
// mongodb
//-------------------------------------
let mongodb;
const mongoClient = require("mongodb").MongoClient
const mongoChangeStrem = require("mongodb").ChangeStream
const mongodbUrl = "mongodb://127.0.0.1:27017"
mongoClient.connect(mongodbUrl, {
  poolSize: 10,
  useNewUrlParser: true
}, function(err, client) {
  assert.equal(null, err);
  mongodb = client;
});

//=============================================================================
// http server
//=============================================================================
const app = express();

//-------------------------------------
// session store
//-------------------------------------
var store = new mongodbSessionStore({
  uri: mongodbUrl,
  databaseName: 'auth',
  collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});

var sessionOptions = {
  secret: 'This is a secret',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  store: store,
  resave: true,
  saveUninitialized: true
}

app.use(session(sessionOptions));

//-------------------------------------
// authentication
//-------------------------------------
passport.serializeUser(function(user, cb) {
  cb(null, user.username);
});

passport.deserializeUser(function(username, cb) {
  mongodb.db("auth").collection("users").findOne({
    username: username
  }, function(err, user) {
    if (err) return cb(err)
    if (!user) {
      return cb(null, false);
    }
    return cb(null, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

app.use(require('@softroles/authorize-bearer-token')(function(token, cb) {
  mongodb.db("auth").collection("users").findOne({
    token: token
  }, function(err, user) {
    if (err) return cb(err)
    if (!user) {
      return cb(null, false);
    }
    return cb(null, user);
  });
}))

app.use(require('@softroles/authorize-guest')())

//-------------------------------------
// common middlewares
//-------------------------------------
app.use(noCache());
app.use(require('morgan')('tiny'));
app.use(require('body-parser').json())
app.use(require('body-parser').urlencoded({
  extended: true
}));
app.use(require("cors")())

//=============================================================================
// api v1
//=============================================================================
app.get('/calculator/api/:func', function(req, res) {
  let args = []
  for(key of Object.keys(req.query)){
    args.push(`--${key}=${req.query[key]}`)
  }
  const func = spawn("pathloss", args);
  let response = { output: "", error: "", exit: null }
  func.stdout.on('data', data => {
    response.output += `${data}`
  })
  func.stderr.on('data', data => {
    response.error += `${data}`
  })
  func.on('close', code => {
    response.exit = code
    res.send(response)
  })
});

//=============================================================================
// start service
//=============================================================================
app.listen(Number(args.port), function() {
  console.log(`Service running on http://127.0.0.1:${args.port}`)
})
