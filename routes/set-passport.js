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
  //Query for Select Password
  var selectPassword = "SELECT password FROM takeUser WHERE username = \'" + username + "\'";
  //Selecting From User DB
  logger.debug('DB Query: %s', selectPassword);
  mysqlDb.query(selectPassword, function(err, rows, feilds){
    //DB Error Case
    if(err){
      logger.error(err);
      return done(null, false);
    }
    //No Password Case
    if(!rows[0]){
      return done(null, false);
    }
    //Comparing Password
    if(bcrypt.compareSync(password, rows[0].password)){
      var user = {'username': username};
      return done(null, user);
    }else{
      return done(null, false);
    }
  });
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
