/*
Functions for User Page
*/

//Modules
var mysqlDb = require("../database/mysqldb");
var bcrypt = require("bcrypt-node");
var logger = require("../logger/logger")(__filename);
var confParams = require("../conf/conf").getParams();
var joinManager = require("./join");
var commonUtil = require("../util/common-util");
var httpUtil = require("../util/http-util");
var userManager = {};

/*
Load user data
*/
userManager.loadDefaultTakeParams = function(req, res, next){

	logger.debug("User request is on [ %s ]", req.path);

	req.__take_params = {};

	req.__take_params.isAuth = req.isAuthenticated();
	req.__take_params.username = req.__take_params.isAuth ? req.user.username : "";

	if(!commonUtil.checkPathWhiteList(req.path)){

		var callbackForError = function(err){
			httpUtil.sendDBErrorPage(req, res, err);
		};

		var callbackForNoResult = function(){
			req.__take_params.nickname = "";
			req.__take_params.hasStudio = 0;
			next();
		};

		var callbackForSuccess = function(rows, fields){
			req.__take_params.nickname = rows[0].nickname;
			req.__take_params.hasStudio = rows[0].has_studio;
			next();
		};

		var query = "SELECT ?? FROM ?? WHERE ?? = ?";

		var params = [["nickname", "has_studio"], "takeUser", "username", req.__take_params.username];

		logger.debug("SQL Query [SELECT %s %s FROM %s WHERE %s=%s]",
			params[0][0],
			params[0][1],
			params[1],
			params[2],
			params[3]
		);

		mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
	}
	else{
		next();
	}
};

userManager.checkLogin = function(req, res, next){

  if(req.__take_params.isAuth){
    next();
  }
  else {
    res.redirect("/");
  }
};

userManager.loadUserInfo = function(req, res, next){

	var callbackForError = function(err){
		httpUtil.sendDBErrorPage(req, res, err);
	};

	var callbackForNoResult = function(){
		httpUtil.sendNoDataFromDBPage(req, res);
	};

	var callbackForSuccess = function(rows, fields){
		req.__take_params.userInfo = rows[0];
		next();
	};

	var query = "SELECT * FROM ?? WHERE ?? = ?";

	var params = ["takeUser", "username", req.__take_params.username];

	logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s]",
		params[0],
		params[1],
		params[2]
	);

	mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

userManager.showUserInfoPage = function(req, res){

	req.__take_params.userInfo.join_date = req.__take_params.userInfo.join_date.slice(0, 10);

  res.render("user/userinfo", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname,
		userInfo: req.__take_params.userInfo
  });
};

userManager.updateUserInfo = function(req, res, next){

	var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    res.send({
			"result": "success"
		});
  };

	var emailAgree;
	if(req.body.email_agree == 1){
		emailAgree = 1;
	}
	else{
		emailAgree = 0;
	}

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
		"takeUser",
		{
			nickname: req.body.nickname,
			email: req.body.email,
			email_agree: emailAgree
		},
		"username",
		req.user.username
	];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

userManager.showPasswordPage = function(req, res){

  res.render("user/password", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
		username: req.__take_params.username,
		nickname: req.__take_params.nickname
  });
};

userManager.matchPassword = function(req, res, next){

	var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  }

  var callbackForNoResult = function(){
    httpUtil.sendNoDataFromDBPage(req, res);
  }

  var callbackForSuccess = function(rows, fields){
    if(bcrypt.compareSync(req.body.password_old, rows[0].password)){
      req.__take_params.passwordMatched = 1;
    }else{
      req.__take_params.passwordMatched = 0;
    }
		next();
  }

  var query = "SELECT ?? FROM ?? WHERE ?? = ?";

  var params = ["password", "takeUser", "username", req.__take_params.username];

  logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

userManager.updatePassword = function(req, res, next){

	if(req.__take_params.passwordMatched){
		var callbackForError = function(err){
	    res.send({
	      "result": "fail",
	      "text": err
	    });
	  };

	  var callbackForSuccess = function(){
	    res.send({
				"result": "success"
			});
	  };

		//Password Encryption
	  var encryptedPassword = joinManager.encryptPassword(req.body.password_new);

	  var query = "UPDATE ?? SET ? WHERE ?? = ?";

	  var params = [
			"takeUser",
			{
				password: encryptedPassword,
			},
			"username",
			req.user.username
		];

	  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
	    params[0],
	    JSON.stringify(params[1]),
	    params[2],
	    params[3]
	  );

	  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
	}
	else{
		res.send({
			"result": "fail",
			"text": "기존 비밀번호를 확인하세요."
		});
	}
};

module.exports = userManager;
