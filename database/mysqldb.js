/*
mySQL Module
*/

//Modules
var mysql = require("mysql");
var logger = require("../logger/logger")(__filename);
var mysqlDb = {};

//MySQL User DB Settings
mysqlDb.init = function(options){

	mysqlDb.connectionPool = mysql.createPool(options);
	logger.info("MySQL User DB is connected...");
};
/*
SELECT Function
*/
mysqlDb.doSQLSelectQuery = function(query, params, callbackForSuccess, callbackForNoResult, callbackForError){

	mysqlDb.connectionPool.getConnection(function(err, connection){
		connection.query(query, params, function(err, rows, fields){
			connection.release();
		  if(err){
		    logger.error(err.toString());
				callbackForError(err);
		  }
			else{
			  if(rows.length === 0){
					callbackForNoResult();
				}
				else if(rows.length > 0){
			    callbackForSuccess(rows, fields);
			  }
			}
		});
	});
};

mysqlDb.doSQLInsertQuery = function(query, params, callbackForSuccess, callbackForError){

	mysqlDb.connectionPool.getConnection(function(err, connection){
		connection.query(query, params, function(err, rows, fields){
			connection.release();
			if(err){
				logger.error(err.toString());
				callbackForError(err);
			}
			else{
				callbackForSuccess(rows);
			}
		});
	});
};

mysqlDb.doSQLUpdateQuery = function(query, params, callbackForSuccess, callbackForError){

	mysqlDb.connectionPool.getConnection(function(err, connection){
		connection.query(query, params, function(err, rows, fields){
			connection.release();
			if(err){
				logger.error(err.toString());
				callbackForError(err);
			}
			else{
				callbackForSuccess();
			}
		});
	});
};

mysqlDb.doSQLDeleteQuery = function(query, params, callbackForSuccess, callbackForError){

	mysqlDb.connectionPool.getConnection(function(err, connection){
		connection.query(query, params, function(err, rows, fiedls){
			connection.release();
			if(err){
				logger.error(err.toString());
				callbackForError(err);
			}
			else{
				callbackForSuccess();
			}
		});
	});
};

module.exports = mysqlDb;
