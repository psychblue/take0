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

  var query = 'SELECT ?? FROM ?? WHERE ?? = ?';
  var params = ['password', 'takeUser', 'username', username];
  logger.debug('SQL Query [SELECT %s FROM %s WHERE %s=%s]', params[0], params[1], params[2], params[3]);

  mysqlDb.doSQLSelectQuery(query, params, passportSelectCallbackForExistingPassword, passportSelectCallbackForNoPassword, passportSelectCallbackForError);
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
