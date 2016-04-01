/*
Passport Setting Module
*/

//Modules
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require("bcrypt-node");
var mysqlDb = require("../database/mysqldb");
var logger = require("../logger/logger")(__filename);

//Passport Local Strategy Setting
passport.use(new LocalStrategy(function(username, password, done){

  mysqlDb.doSQLQuery({
    query: "SELECT ?? FROM ?? WHERE ?? = ?",

    params: ["password", "takeUser", "username", username],

    onSuccess: function(rows, fields){
      if(bcrypt.compareSync(password, rows[0].password)){
        var user = {"username": username};
        return done(null, user);
      }else{
        return done(null, false);
      }
    },

    onError: function(err){
      return done(null, false);
    },

    onNoResult: function(){
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

logger.info("Passport is set...");

module.exports = passport;
