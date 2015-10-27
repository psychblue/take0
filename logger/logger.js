/*
Logger Module
*/

//Modules
var winston = require('winston');
var path = require('path');
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
					var d = new Date();
					var year = d.getFullYear().toString();
					var month = d.getMonth();
					if(month < 10){
						month = '0' + month.toString();
					}else{
						month = month.toString();
					}
					var date = d.getDate();
					if(date < 10){
						date = '0' + date.toString();
					}else{
						date = date.toString();
					}
					var hour = d.getHours();
					if(hour < 10){
						hour = '0' + hour.toString();
					}else{
						hour = hour.toString();
					}
					var min = d.getMinutes();
					if(min < 10){
						min = '0' + min.toString();
					}
					var sec = d.getSeconds();
					if(sec < 10){
						sec = '0' + sec.toString();
					}else{
						sec = sec.toString();
					}
					var milli = d.getMilliseconds();
					if(milli < 10){
						milli = '00' + milli.toString();
					}else if(milli >= 10 && milli < 100){
						milli = '0' + milli.toString();
					}else{
						milli = milli.toString();
					}
					return year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec + '.' + milli;
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
