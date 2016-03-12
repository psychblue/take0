/*
mySQL Module
*/

//Modules
var mysql = require("mysql");
var confParams = require("../conf/conf").getParams();
var logger = require("../logger/logger")(__filename);
var httpUtil = require("../util/http-util");

//MySQL User DB Settings
var mysqlDb = mysql.createConnection({
		host: confParams.mysql.host,
		port: confParams.mysql.port,
		user: confParams.mysql.user,
		password: confParams.mysql.password,
		database: confParams.mysql.database
	});
mysqlDb.connect();
logger.info("MySQL User DB is connected...");

/*
SELECT Function
*/
mysqlDb.doSQLSelectQuery = function(query, params, callbackForSuccess, callbackForNoResult, callbackForError){

	mysqlDb.query(query, params, function(err, rows, fields){
	  if(err){
	    logger.error(err.toString());
			callbackForError(err);
	  }
		else{
		  if(rows.length == 0){
				callbackForNoResult();
			}
			else if(rows.length > 0){
		    callbackForSuccess(rows, fields);
		  }
		}
	});
};

mysqlDb.doSQLInsertQuery = function(query, params, callbackForSuccess, callbackForError){

	mysqlDb.query(query, params, function(err, rows, fields){
		if(err){
			logger.error(err.toString());
			callbackForError(err);
		}
		else{
			callbackForSuccess(rows);
		}
	});
};

mysqlDb.doSQLUpdateQuery = function(query, params, callbackForSuccess, callbackForError){

	mysqlDb.query(query, params, function(err, rows, fields){
		if(err){
			logger.error(err.toString());
			callbackForError(err);
		}
		else{
			callbackForSuccess();
		}
	});
};

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
};

module.exports = mysqlDb;
