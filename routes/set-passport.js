/*
Passport Setting Module
*/

//Modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-node');
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);

//Passport Local Strategy Setting
passport.use(new LocalStrategy(function(username, password, done){

  var passportSelectCallbackForError = function(err){
    return done(null, false);
  }

  var passportSelectCallbackForNoPassword = function(){
    return done(null, false);
  }

  var passportSelectCallbackForExistingPassword = function(rows, fields){
    if(bcrypt.compareSync(password, rows[0].password)){
      var user = {'username': username};
      return done(null, user);
    }else{
      return done(null, false);
    }
  }

  mysqlDb.doSQLSelectQuery('password', 'takeUser', 'username', username, passportSelectCallbackForExistingPassword, passportSelectCallbackForNoPassword, passportSelectCallbackForError);
}));

//Passport Serializer
passport.serializeUser(function(user, done){
  done(null, user);
});

//Passport Deserializer
passport.deserializeUser(function(user, done){
  done(null, user);
});

logger.info('Passport is set...');

module.exports = passport;
