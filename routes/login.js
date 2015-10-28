/*
Functions for User Login Page
*/

//Modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-node');
var configure = require('../configure.json');
var request = require('request');
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);

/*
Passport Setting Function
*/
exports.initPassport = function(app){

  //Express Passport Setting
  app.use(passport.initialize());
  app.use(passport.session());

  //Passport Local Strategy Setting
  passport.use(new LocalStrategy(function(username, password, done){

    //Query for Select Password
    var selectPassword = "SELECT password FROM takeUser WHERE username = \'" + username + "\'";
    //Selecting From User DB
    mysqlDb.query(selectPassword, function(err, rows, feilds){
      //DB Error Case
      if(err){
        lgger.error(err);
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

  return passport;
}

/*
User Local Login Post Function
*/
exports.loginAuth = function(){
  passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'});
}

/*
Password Encrytion Function
*/
exports.encryptPassword = function(req){
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(req.body.password, salt);
}

/*
Kakao Login Function
*/
exports.loginByKakao = function(req, res, next){
  var redirectUrl = 'https://kauth.kakao.com/oauth/authorize?client_id=' + configure.kakao_client_id + '&redirect_uri=' + configure.kakao_redirect_uri + '&response_type=code';
  res.redirect(redirectUrl);
}

/*
Kakao Login Callback Function
*/
exports.loginByKakaoCallback = function(req, res, next){

  logger.debug('code: %s', req.query.code);
  //Getting Tokens
  request.post({
    url: 'https://kauth.kakao.com/oauth/token',
    method: 'POST',
    qs: {
      grant_type: 'authorization_code',
      client_id: configure.kakao_client_id,
      redirect_uri: configure.kakao_redirect_uri,
      code: req.query.code
    }
  }, function(error, response, body){
    //Token Success
    if(!error && response.statusCode == 200){
      var accessToken = JSON.parse(body).access_token;
      logger.debug("access token: %s", accessToken);
      //Getting Username
      request.get({
        url: 'https://kapi.kakao.com/v1/user/me',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      }, function(error, response, body){
        if(!error && response.statusCode == 200){
          var userId = JSON.parse(body).id;
          logger.debug("id: %s", userId);
          //Query for Select Username
          var selectUsername = "SELECT username FROM takeUser WHERE username = \'" + userId + "\'";
          mysqlDb.query(selectUsername, function(err, rows, feilds){
            if(err){
              logger.error(err);
            }
            //Join User
            if(!rows[0]){
              //Making Password by Username
              var salt = bcrypt.genSaltSync(10);
              var encryptedPassword = bcrypt.hashSync(userId, salt);
              //Query for Insert User
              var insertUser = "INSERT INTO takeUser values\(\"" + userId + "\", \"" + encryptedPassword + "\"\)";
              mysqlDb.query(insertUser, function(err, rows, fields){
                if(err){
                  res.send('Error');
                }else{
                  //Login User
                  var user = {'username': userId};
                  req.login(user, function(err){
                    if(err){
                      res.send(err);
                    }else{
                      res.redirect('/');
                    }
                  });
                }
              });
            }
            //Login User if Username is Already Exist
            else if(rows[0]){
              var user = {'username': userId};
              req.login(user, function(err){
                if(err){
                  res.send(err);
                }else{
                  res.redirect('/');
                }
              });
            }else{
              logger.error("Error");
            }
          });
        }else if(error){
          logger.error(error);
          //error handling for getting username
        }else {
          logger.error(body);
          //error handling for getting username
        }
      });
    }else if(error){
      logger.error(error);
      //error handling for getting tokens
    }else{
      logger.error(body);
      //error handling for getting tokens
    }
  });
}
