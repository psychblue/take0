/*
mySQL Module
*/

//Modules
var mysql = require('mysql');
var confParams = require('../conf/conf').getParams();
var logger = require('../logger/logger')(__filename);

//MySQL User DB Settings
var mysqlDb = mysql.createConnection({
	host: confParams.mysql.host,
	port: confParams.mysql.port,
	user: confParams.mysql.user,
	password: confParams.mysql.password,
	database: confParams.mysql.database
});
mysqlDb.connect();
logger.info('MySQL User DB is connected...');

/*
SELECT Function
*/
mysqlDb.doSQLSelectQuery = function(query, params, callbackForResult, callbackForNoResult, callbackForError){
	mysqlDb.query(query, params, function(err, rows, fields){
	  if(err){
	    logger.error(err.toString());
			callbackForError(err);
	  }
	  if(!rows[0]){
			callbackForNoResult();
		}
		else if(rows[0]){
	    callbackForResult(rows, fields);
	  }
		else{
	    logger.error("Error");
	  }
	});
}

mysqlDb.doSQLInsertQuery = function(query, params, callbackForSuccess, callbackForError){
	mysqlDb.query(query, params, function(err, rows, fields){
		if(err){
			logger.error(err.toString());
			callbackForError(err);
		}
		else{
			callbackForSuccess();
		}
	});
}

mysqlDb.doSQLDeleteQuery = function(query, params, callbackForSuccess, callbackForError){
		mysqlDb.query(query, params, function(err, rows, fiedls){
		if(err){
			logger.error(err.toString());
			callbackForError(err);
		}
		else{
			callbackForSuccess();
		}
	});
}

module.exports = mysqlDb;
