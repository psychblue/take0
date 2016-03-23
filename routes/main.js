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
mainManager.showMainPage = function(req, res){

  res.render("index", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname
  });
};

/*
Show Phtographer List Function
*/
mainManager.showTodayStudioList = function(req, res){

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

  var query = "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ?? INNER JOIN ?? ON ?? = ?? LIMIT ?,?";

  var params = [
    [
      "studio.username",
      "studio.studio_name",
      "studio.slider_photo_list",
      "takeUser.nickname"
    ],
    "studio",
    "todayStudioList",
    "studio.username",
    "todayStudioList.username",
    "takeUser",
    "studio.username",
    "takeUser.username",
    Number(req.body.start),
    Number(req.body.end)
  ];

  logger.debug("SQL Query [SELECT %s FROM %s INNER JOIN %s ON %s=%s INNER JOIN %s ON %s=%s LIMIT %d,%d]",
    params[0].toString(),
    params[1],
    params[2],
    params[3],
    params[4],
    params[5],
    params[6]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

module.exports = mainManager;
