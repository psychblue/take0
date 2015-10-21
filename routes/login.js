//Modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-node');
var configure = require('../configure.json');
var request = require('request');
var mysqlUserDb;

exports.getPassport = function(app, mysqlDb){

  app.use(passport.initialize());
  app.use(passport.session());

  mysqlUserDb = mysqlDb;

  passport.use(new LocalStrategy(function(username, password, done){

    var selectPassword = "SELECT password FROM takeUser WHERE username = \'" + username + "\'";
    mysqlDb.query(selectPassword, function(err, rows, feilds){
      //console.log("password:%s", rows[0].password);
      if(err){
        return done(err);
      }
      if(!rows[0]){
        return done(null, false);
      }
      if(bcrypt.compareSync(password, rows[0].password)){
        var user = {'username': username};
        return done(null, user);
      }else{
        return done(null, false);
      }
    });
  }));

  passport.serializeUser(function(user, done){
    //console.log('serialize');
    done(null, user);
  });

  passport.deserializeUser(function(user, done){
    //console.log('deserialize');
    done(null, user);
  });

  return passport;
}

//loginPost Callback
exports.loginAuth = function(passport){
  return passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'});
}

exports.encryptPassword = function(req){
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(req.body.password, salt);
}

exports.loginByKakao = function(req, res, next){
  var redirectUrl = 'https://kauth.kakao.com/oauth/authorize?client_id=' + configure.kakao_client_id + '&redirect_uri=' + configure.kakao_redirect_uri + '&response_type=code';
  res.redirect(redirectUrl);
}

exports.loginByKakaoCallback = function(req, res, next){
  console.log('code: %s', req.query.code);
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
    if(!error && response.statusCode == 200){
      var accessToken = JSON.parse(body).access_token;
      console.log("access token: %s", accessToken);
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
          console.log("id: %s", userId);
          var selectUsername = "SELECT username FROM takeUser WHERE username = \'" + userId + "\'";
          mysqlUserDb.query(selectUsername, function(err, rows, feilds){
            //console.log("password:%s", rows[0].password);
            if(err){
              console.log("%s", err);
            }
            if(!rows[0]){
              var salt = bcrypt.genSaltSync(10);
              var encryptedPassword = bcrypt.hashSync(userId, salt);
              var insertUser = "INSERT INTO takeUser values\(\"" + userId + "\", \"" + encryptedPassword + "\"\)";
              mysqlUserDb.query(insertUser, function(err, rows, fields){
                if(err){
                  res.send('Error');
                }else{
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
              console.log("Error");
            }
          });
        }else if(error){
          console.log("%s", error);
        }else {
          console.log("%s", body);
          //error handling for getting user id
        }
      });
    }else if(error){
      console.log("%s", error);
      //error handling for getting tokens
    }else{
      console.log("%s", body);
    }
  });
}
