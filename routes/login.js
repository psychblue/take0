/*
Functions for User Login Page
*/

//Modules
var passport = require("./set-passport");
//var bcrypt = require("bcrypt-node");
var request = require("request");
var mysqlDb = require("../database/mysqldb");
var logger = require("../logger/logger")(__filename);
var confParams = require("../conf/conf").getParams();
var httpUtil = require("../util/http-util");
var loginManager = {};

/*
Show Login Popup
*/
/*
loginManager.showLoginPopup = function(req, res){

	res.render("login/login-popup", {
    service: confParams.html.service_name
  });
};
*/

/*
User Local Login Post Function
*/
loginManager.loginAuth = function(req, res, next){

  passport.authenticate("local", function(err, user, info){
    if(err){
      return next(err);
    }

    if(!user){
      res.send({
        "result": "fail",
        "text": "아이디 또는 비밀번호를 확인하세요."
      });
    }
    else{
      req.logIn(user, function(err){
        if(err){
          logger.error(err.toString());

					httpUtil.sendInfoPage(req, res, {
        		infoText: "죄송합니다. 서비스에 오류가 발생하였습니다.<br>" + err.toString(),
        		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
        	});
        }
        else{
          res.send({"result": "success"});
        }
      });
    }
  })(req, res, next);
};

/*
Kakao Login Function
*
loginManager.loginByKakao = function(req, res){
  var redirectUrl = "https://kauth.kakao.com/oauth/authorize?client_id="
                    + confParams.kakao.kakao_client_id
                    + "&redirect_uri="
                    + confParams.kakao.kakao_redirect_uri
                    + "&response_type=code";
  res.redirect(redirectUrl);
};
*/

/*
Getting Kakao Aceess Token
*
loginManager.getAccessToken = function(req, res, next){

	logger.debug("code: %s", req.query.code);

	request.post({
    url: "https://kauth.kakao.com/oauth/token",
    method: "POST",
    qs: {
      grant_type: "authorization_code",
      client_id: confParams.kakao.kakao_client_id,
      redirect_uri: confParams.kakao.kakao_redirect_uri,
      code: req.query.code
    }
  }, function(error, response, body){
		req.__take_params.kakaoApiData = {
			error: error,
			response: response,
			body: body
		};
		next();
	});
};
*/

/*
Getting Kakao User Data
*/
loginManager.getKakaoUser = function(req, res, next){

	req.__take_params.kakaoApiData = {accessToken: req.body.access_token};
	logger.debug("access token: %s", req.__take_params.kakaoApiData.accessToken);
	//Getting Username
	request.get({
		url: "https://kapi.kakao.com/v1/user/me",
		method: "GET",
		headers: {
			"Authorization": "Bearer " + req.__take_params.kakaoApiData.accessToken,
			"Content-type": "application/x-www-form-urlencoded;charset=utf-8"
		}
	}, function(error, response, body){
		req.__take_params.kakaoApiData.error = error;
		req.__take_params.kakaoApiData.response = response;
		req.__take_params.kakaoApiData.body = body;
		next();
	});
};

/*
Insert Kakao User to User Database
*/
loginManager.joinKakaoUser = function(req, res, next){
	if(!req.__take_params.kakaoApiData.error && req.__take_params.kakaoApiData.response.statusCode == 200){
		var kakaoId = "k" + JSON.parse(req.__take_params.kakaoApiData.body).id;
		var nickname = JSON.parse(req.__take_params.kakaoApiData.body).properties.nickname;
		logger.debug("id: %s", kakaoId);

		var callbackForError = function(err){
			httpUtil.sendDBErrorPage(req, res, err);
		};

		var callbackForNoResult = function(){
			var redirectUrl = "/join/kakaouser?username="
									+ kakaoId
									+ "&nickname="
									+ nickname;

			res.send({
				"result": "redirect",
				"url": redirectUrl
			});

			/*
			res.render("join/additional-info", {
				title: confParams.html.title,
				service: confParams.html.service_name,
				username: kakaoId,
				nickname: JSON.parse(req.__take_params.kakaoApiData.body).properties.nickname,
				accessToken: req.__take_params.kakaoApiData.accessToken
			});
			*/
		};

		var callbackForSuccess = function(rows, fields){
			req.__take_params.kakaoApiData.username = kakaoId;
			next();
		};

		var query = "SELECT ?? FROM ?? WHERE ?? = ?";

		var params = ["username", "takeUser", "username", kakaoId];

		logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
			params[0],
			params[1],
			params[2],
			params[3]
		);

		mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
	}
	else if(req.__take_params.kakaoApiData.error){
		logger.error(req.__take_params.kakaoApiData.error.toString());
		//error handling for getting username
	}
	else{
		logger.error(req.__take_params.kakaoApiData.body);
		//error handling for getting username
	}
};

/*
Updating Access Token
*/
loginManager.updateAccessToken = function(req, res){

	var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForSuccess = function(){
		var user = {"username": req.__take_params.kakaoApiData.username};

		req.login(user, function(err){
			if(err){
				logger.error(err.toString());

				httpUtil.sendInfoPage(req, res, {
					infoText: "죄송합니다. 서비스에 오류가 발생하였습니다.<br>" + err.toString(),
					infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
				});
			}
			else{
				res.send({"result": "success"});
			}
		});
  };

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
		"takeUser",
		{access_token: req.__take_params.kakaoApiData.accessToken},
		"username", req.__take_params.kakaoApiData.username
	];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

/*
Load user_from (Local, Kakao or Naver)
*/
loginManager.loadUserFrom = function(req, res, next){

	var callbackForError = function(err){
		httpUtil.sendDBErrorPage(req, res, err);
	};

	var callbackForNoResult = function(){
		httpUtil.sendNoDataFromDBPage(req, res);
	};

	var callbackForSuccess = function(rows, fields){
		req.__take_params.userFrom = rows[0].user_from;
		//req.__take_params.accessToken = rows[0].access_token;
		next();
	};

	var username = req.__take_params.username;

	var query = "SELECT ?? FROM ?? WHERE ?? = ?";

	var params = ["user_from", "takeUser", "username", username];

	logger.debug("SQL Query [SELECT %s, %s FROM %s WHERE %s=%s]",
		params[0],
		params[1],
		params[2],
		params[3]
	);

	mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

/*
Logout Function
*/
loginManager.logout = function(req, res){

	req.logout();
	res.send({
		"result": "success",
		"userFrom": req.__take_params.userFrom
	});
};

/*
Send Access Token
*/
loginManager.sendUserFrom = function(req, res){

	if(req.__take_params.isAuth){
		res.send({
			"result": "success",
			"userFrom": req.__take_params.userFrom
		});
	}
	else{
		res.send({
			"result": "fail",
			"text": "Unauthenticated User"
		});
	}
};

module.exports = loginManager;
