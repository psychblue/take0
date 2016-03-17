/*
Common Utils
*/

//Modules
var logger = require("../logger/logger")(__filename);
var confParams = require("../conf/conf").getParams();

var commonUtil = {};

/*
Check white list path for loading default take parameters
*/
commonUtil.checkPathWhiteList = function(path){

  var whiteList = [
    "/loginpopup",
    "/todaystudiolist"
  ];

  for(var i = 0; i < whiteList.length; i++){
    if(path == whiteList[i]){
      return 1;
    }
  }

  return 0;
};

module.exports = commonUtil;
