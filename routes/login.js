/*
Functions for User Login Page
*/

//Modules
var passport = require('./set-passport');
var bcrypt = require('bcrypt-node');
var configure = require('../configure.json');
var request = require('request');
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);
var loginManager = {};
/*
User Local Login Post Function
*/
loginManager.loginAuth = function(){
  return passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'});
}

/*
Password Encrytion Function
*/
loginManager.encryptPassword = function(req){
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(req.body.password, salt);
}

/*
Kakao Login Function
*/
loginManager.loginByKakao = function(req, res, next){
  var redirectUrl = 'https://kauth.kakao.com/oauth/authorize?client_id=' + configure.kakao_client_id + '&redirect_uri=' + configure.kakao_redirect_uri + '&response_type=code';
  res.redirect(redirectUrl);
}

/*
Kakao Login Callback Function
*/
loginManager.loginByKakaoCallback = function(req, res, next){

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

          var kakaoInsertCallbackForError = function(err){
            res.send('DB Error');
          }

          var kakaoInsertCallbackForSuccess = function(){
            var user = {'username': userId};
            req.login(user, function(err){
              if(err){
                logger.error(err.toString());
                res.send(err);
              }else{
                res.redirect('/');
              }
            });
          }

          var kakaoSelectCallbackForError = function(err){
            res.send('DB Error');
          }

          var kakaoSelectCallbackForNoUser = function(){
            var salt = bcrypt.genSaltSync(10);
            var encryptedPassword = bcrypt.hashSync(userId, salt);
            mysqlDb.doSQLInsertQuery('takeUser', {username: userId, password: encryptedPassword}, kakaoInsertCallbackForSuccess, kakaoInsertCallbackForError);
          }

          var kakaoSelectCallbackForExistingUser = function(rows, fields){
            var user = {'username': userId};
            req.login(user, function(err){
              if(err){
                logger.error(err.toString());
                res.send(err);
              }else{
                res.redirect('/');
              }
            });
          }

          mysqlDb.doSQLSelectQuery('username', 'takeUser', 'username', userId, kakaoSelectCallbackForExistingUser, kakaoSelectCallbackForNoUser, kakaoSelectCallbackForError);
        }
        else if(error){
          logger.error(error.toString());
          //error handling for getting username
        }
        else{
          logger.error(body);
          //error handling for getting username
        }
      });
    }
    else if(error){
      logger.error(error.toString());
      //error handling for getting tokens
    }
    else{
      logger.error(body);
      //error handling for getting tokens
    }
  });
}

module.exports = loginManager;
