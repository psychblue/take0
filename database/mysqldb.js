/*
mySQL Module
*/

//Modules
var mysql = require('mysql');

//MySQL User DB Settings
var mysqlDb = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "psychblue",
	password: "8219kjs",
	database: "take0"
});
mysqlDb.connect();

module.exports = mysqlDb;
