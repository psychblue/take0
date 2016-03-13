/*
Utils for File Control
*/

//Modules
var logger = require("../logger/logger")(__filename);
var confParams = require("../conf/conf").getParams();
var fs = require("fs");

var imageFilePathPrefix = confParams.file.image_file_path_prefix;
var fileUtil = {};

/*
Delete Image File
*/
fileUtil.deleteImageFile = function(filepath){
  fs.unlinkSync(imageFilePathPrefix + filepath);
  logger.debug("%s is deleted", imageFilePathPrefix + filepath);
};

module.exports = fileUtil;
