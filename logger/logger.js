/*
Logger Module
*/

//Modules
var winston = require('winston');
var path = require('path');
var moment = require('moment');
var basePath = path.resolve(__dirname, '..');
var container = new winston.Container();

/*
Logger Setting Function
*/
module.exports = function(jsname){
	var label = path.relative(basePath, jsname);
	container.add(label, {
		transports: [
			new winston.transports.File({
				level: 'debug',
				filename: 'take0_main.log',
				json: false,
				timestamp: function(){
					return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
				},
				formatter: function(options){
					return options.timestamp() + ' [' + options.level.toUpperCase() + ']\t' + ' [' + label + ']  ' + options.message;
				}
			})
		]
	});
	var logger = container.get(label);
	return logger;
}
