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

  var query = 'SELECT ?? FROM ?? INNER JOIN ?? WHERE ?? = ?? LIMIT ?,?';
  var params = [['studio.username', 'studio.studio_name'], 'studio', 'todaysPhotographerList', 'studio.username', 'todaysPhotographerList.username', Number(req.body.start), Number(req.body.end)];
  logger.debug('SQL Query [SELECT %s, %s FROM %s INNER JOIN %s WHERE %s=%s LIMIT %d,%d]', params[0][0], params[0][1], params[1], params[2], params[3], params[4], params[5], params[6]);

  mysqlDb.doSQLSelectQuery(query, params, listSelectCallbackForList, listSelectCallbackForNoList, listSelectCallbackForError);
}

module.exports = mainManager;
