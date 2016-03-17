/*
Functions for User Page
*/

//Modules
var mysqlDb = require("../database/mysqldb");
var logger = require("../logger/logger")(__filename);
var confParams = require("../conf/conf").getParams();
var httpUtil = require("../util/http-util");
var userManager = {};

/*
Load user data
*/
userManager.loadUserData = function(req, res, next){

	req.__take_params = {};

	req.__take_params.isAuth = req.isAuthenticated();
	req.__take_params.username = req.__take_params.isAuth ? req.user.username : "";

	var callbackForError = function(err){
		httpUtil.sendDBErrorPage(req, res, err);
	};

	var callbackForNoResult = function(){
		req.__take_params.nickname = "";
		next();
	};

	var callbackForSuccess = function(rows, fields){
		req.__take_params.nickname = rows[0].nickname;
		req.__take_params.hasStudio = rows[0].has_studio;
		next();
	};

	var username = req.__take_params.username;

	var query = "SELECT ?? FROM ?? WHERE ?? = ?";

	var params = [["nickname", "has_studio"], "takeUser", "username", username];

	logger.debug("SQL Query [SELECT %s %s FROM %s WHERE %s=%s]",
		params[0][0],
		params[0][1],
		params[1],
		params[2],
		params[3]
	);

	mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

userManager.showUserInfoPage = function(req, res){
  res.render("user/userinfo", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname
  });
};

module.exports = userManager;
