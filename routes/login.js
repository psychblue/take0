/*
Functions for User Login Page
*/

//Modules
var passport = require('./set-passport');
var bcrypt = require('bcrypt-node');
var request = require('request');
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);
var confParams = require('../conf/conf').getParams();
var loginManager = {};

/*
User Local Login Post Function
*/
loginManager.loginAuth = function(req, res, next){
  //return passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'});
  passport.authenticate('local', function(err, user, info){
    if(err){
      return next(err);
    }
    if(!user){
      return res.send({"result": "fail", "text": "아이디 또는 패스워드를 확인하세요."});
    }
    req.logIn(user, function(err){
      if(err){
        logger.error(err.toString());
        return res.send(err);
      }else{
        return res.send({"result": "success"});
      }
    });
  })(req, res, next);
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
  var redirectUrl = 'https://kauth.kakao.com/oauth/authorize?client_id=' + confParams.kakao.kakao_client_id + '&redirect_uri=' + confParams.kakao.kakao_redirect_uri + '&response_type=code';
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
      client_id: confParams.kakao.kakao_client_id,
      redirect_uri: confParams.kakao.kakao_redirect_uri,
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

            var query = 'INSERT INTO ?? SET ?';
          	var params = ['takeUser', {username: userId, password: encryptedPassword, email: ''}];
            logger.debug('SQL Query [INSERT INTO %s SET %s]', params[0], params[1].toString());

            mysqlDb.doSQLInsertQuery(query, params, kakaoInsertCallbackForSuccess, kakaoInsertCallbackForError);
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

          var query = 'SELECT ?? FROM ?? WHERE ?? = ?';
        	var params = ['username', 'takeUser', 'username', userId];
          logger.debug('SQL Query [SELECT %s FROM %s WHERE %s=%s]', params[0], params[1], params[2], params[3]);

          mysqlDb.doSQLSelectQuery(query, params, kakaoSelectCallbackForExistingUser, kakaoSelectCallbackForNoUser, kakaoSelectCallbackForError);
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
