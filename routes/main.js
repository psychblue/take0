/*
Functions for Main Page
*/

//Modules
var confParams = require("../conf/conf").getParams();
var mysqlDb = require("../database/mysqldb");
var httpUtil = require("../util/http-util");
var logger = require("../logger/logger")(__filename);
var mainManager = {};

/*
Show Main Page
*/
mainManager.showMainPage = function(req, res, next){

  //Login Checking
  var isAuth = req.isAuthenticated();

  res.render("index", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: isAuth,
    name: isAuth ? req.user.username : ""
  });
};

/*
Show Phtographer List Function
*/
mainManager.showTodayStudioList = function(req, res, next){

  var query = "SELECT ?? FROM ?? INNER JOIN ?? WHERE ?? = ?? LIMIT ?,?";

  var params = [
    [
      "studio.username",
      "studio.studio_name",
      "studio.slider_photo_list"
    ],
    "studio",
    "todayStudioList",
    "studio.username",
    "todayStudioList.username",
    Number(req.body.start),
    Number(req.body.end)
  ];

  logger.debug("SQL Query [SELECT %s, %s, %s FROM %s INNER JOIN %s WHERE %s=%s LIMIT %d,%d]",
    params[0][0],
    params[0][1],
    params[0][2],
    params[1],
    params[2],
    params[3],
    params[4],
    params[5],
    params[6]
  );

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    httpUtil.sendNoDataFromDBPage(req, res);
  };

  var callbackForSuccess = function(rows, fields){
    res.render("main/main-list", {
      data: rows
    });
  };

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

module.exports = mainManager;
