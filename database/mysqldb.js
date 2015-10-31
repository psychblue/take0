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
mysqlDb.doSQLSelectQuery = function(selectParam, fromParam, whereParam, value, callbackForResult, callbackForNoResult, callbackForError){
	var query = 'SELECT ?? FROM ?? WHERE ?? = ?';
	var params = [selectParam, fromParam, whereParam, value];
	logger.debug('SQL Query [ method: SELECT, selectParam: %s, fromParam: %s, whereParam: %s, value: %s ]', selectParam, fromParam, whereParam, value);
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

/*
INSERT Function
*/
mysqlDb.doSQLInsertQuery = function(intoParam, values, callbackForSuccess, callbackForError){
	var query = 'INSERT INTO ?? SET ?';
	var params = [intoParam, values];
	logger.debug('SQL Query [ method: INSERT, intoParam: %s, values: %s ]', intoParam, JSON.stringify(values));
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

mysqlDb.doSQLDeleteQuery = function(fromParam, whereParam, value, callbackForSuccess, callbackForError){
	var query = 'DELETE FROM ?? WHERE ?? = ?';
	var params = [fromParam, whereParam, value];
	logger.debug('SQL Query [ method: DELETE, fromParam: %s, whereParam: %s, value: %s]', fromParam, whereParam, value);
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
