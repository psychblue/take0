/*
mySQL Module
*/

//Modules
var mysql = require("mysql");
var logger = require("../logger/logger")(__filename);
var caller = require("caller-id");
var mysqlDb = {};

function queryToString(query, params, callerFunc){

	var logString = query;

	for(var paramIndex = 0; paramIndex < params.length; paramIndex++){
		logString = logString.replace(/\?+/, JSON.stringify(params[paramIndex]));
	}

	logger.debug("------------------- MySQL --------------------");
	logger.debug("BY\t: " + callerFunc.functionName);
	logger.debug("Query\t: " + logString);
	logger.debug("----------------------------------------------\n");
}

//MySQL User DB Settings
mysqlDb.init = function(options){

	mysqlDb.connectionPool = mysql.createPool(options);
	logger.info("MySQL User DB is connected...");
};

mysqlDb.doSQLQuery = function(options){

	queryToString(options.query, options.params, caller.getData());

	mysqlDb.connectionPool.getConnection(function(err, connection){
		connection.query(options.query, options.params, function(err, rows, fields){
			connection.release();
		  if(err){
		    logger.error("SQL Error >>> [ " + err.toString() + " ]");
				options.onError(err);
		  }
			else{
				if(options.onNoResult){
				  if(rows.length === 0){
						options.onNoResult();
					}
					else if(rows.length > 0){
				    options.onSuccess(rows, fields);
				  }
				}
				else{
					options.onSuccess(rows, fields);
				}
			}
		});
	});
};

/*
SELECT Function

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
*/

module.exports = mysqlDb;
