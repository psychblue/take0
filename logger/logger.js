/*
Logger Module
*/

//Modules
var winston = require("winston");
var path = require("path");
var moment = require("moment");
var basePath = path.resolve(__dirname, "..");
var container = new winston.Container();

/*
Logger Setting Function
*/
module.exports = function(jsname){
	var label = path.relative(basePath, jsname);
	container.add(label, {
		transports: [
			new winston.transports.File({
				level: "debug",
				filename: "take0_main_.log",
				maxsize: 1000000000,
				maxFiles: 10,
				rotationFormat: function(){

					function getFormattedDate(){
    				var temp = new Date();
    				return dateStr = padStr(temp.getFullYear())
														+ padStr(1 + temp.getMonth())
														+ padStr(temp.getDate())
														+ "_"
														+ padStr(temp.getHours())
                  					+ padStr(temp.getMinutes())
                  					+ padStr(temp.getSeconds());
    			}

    			function padStr(i){
        		return (i < 10) ? "0" + i : "" + i;
    			}

					return getFormattedDate();
  			},
				json: false,
				timestamp: function(){
					return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
				},
				formatter: function(options){
					return options.timestamp()	+ " ["
																			+ options.level.toUpperCase()
																			+ "]\t["
																			+ label
																			+ "]  "
																			+ options.message;
				}
			})
		]
	});
	var logger = container.get(label);
	logger.info("Logger for %s is set... ", label);
	return logger;
};
