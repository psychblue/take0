/*
Functions for Main Page
*/

//Modules
var confParams = require('../conf/conf').getParams();
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);
var mainManager = {};


/*
Show Main Page
*/
mainManager.showMainPage = function(req, res, next){

  var username = '';
  //Login Checking
  if(req.isAuthenticated()){
    username = req.user.username;
  }

  var indexOptions = {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.isAuthenticated(),
    name: username
  };

  res.render('index', indexOptions);
}

/*
Show Phtographer List Function
*/
mainManager.showTodayStudioList = function(req, res, next){

  var listSelectCallbackForError = function(err){
    res.send('DB Error');
  }

  var listSelectCallbackForNoList = function(){
    res.send('Empty');
  }

  var listSelectCallbackForList = function(rows, fields){
    //logger.debug(JSON.stringify(rows));
    res.render('main/main-list', {data: rows});
  }

  var query = 'SELECT ?? FROM ?? INNER JOIN ?? WHERE ?? = ?? LIMIT ?,?';
  var params = [['studio.username', 'studio.studio_name'], 'studio', 'todayStudioList', 'studio.username', 'todayStudioList.username', Number(req.body.start), Number(req.body.end)];
  logger.debug('SQL Query [SELECT %s, %s FROM %s INNER JOIN %s WHERE %s=%s LIMIT %d,%d]', params[0][0], params[0][1], params[1], params[2], params[3], params[4], params[5], params[6]);

  mysqlDb.doSQLSelectQuery(query, params, listSelectCallbackForList, listSelectCallbackForNoList, listSelectCallbackForError);
}

module.exports = mainManager;
