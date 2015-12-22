/*
Functions for Main Page
*/

//Modules
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);
var mainManager = {};

/*
Show Phtographer List Function
*/
mainManager.showPhotograherList = function(req, res, next){

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

  mysqlDb.doSQLSelectLimitQuery('*', 'photographerList', null, null, req.body.start, req.body.end, listSelectCallbackForList, listSelectCallbackForNoList, listSelectCallbackForError);
}

module.exports = mainManager;
