/*
Functions for Main Page
*/

//Modules
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);
var confManager = require('../conf/conf');
var confParams = confManager.getParams();
var photographerManager = {};

photographerManager.showStudio = function(req, res, next){

  var studioSelectCallbackForError = function(err){
    res.send('DB Error');
  }

  var studiSelectCallbackForNoResult = function(){
    res.send('No Studio');
  }

  var studioSelectCallbackForSuccess = function(rows, fields){
    var username = '';
    if(req.isAuthenticated()){
  		username = req.user.username;
  	}
    var studioOptions = {
      title: confParams.html.title,
      service: confParams.html.service_name,
      isAuth: req.isAuthenticated(),
      name: username,
      photographerName: req.params.photographer,
      data: rows[0]
    };
    res.render('photographer/studio', studioOptions);
  }

  var query = 'SELECT * FROM ?? WHERE ?? = ?';
  var params = ['studio', 'username', req.params.photographer];
  logger.debug('SQL Query [SELECT * FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

  mysqlDb.doSQLSelectQuery(query, params, studioSelectCallbackForSuccess, studiSelectCallbackForNoResult, studioSelectCallbackForError);
}

module.exports = photographerManager;
