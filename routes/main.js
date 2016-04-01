/*
Functions for Main Page
*/

//Modules
var confParams = require("../conf/conf").getParams();
var mysqlDb = require("../database/mysqldb");
var commonUtil = require("../util/common-util");
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

  mysqlDb.doSQLQuery({
    query: "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ?? INNER JOIN ?? ON ?? = ?? LIMIT ?,?",

    params: [
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
    ],

    onSuccess: function(rows, fields){
      res.render("main/main-list", {
        data: rows
      });
    },

    onError: function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    },

    onNoResult: function(){
      httpUtil.sendNoDataFromDBPage(req, res);
    }
  });
};

module.exports = mainManager;
