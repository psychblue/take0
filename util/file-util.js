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
  fs.unlinkSync(imageFilePrefix + filepath);
  logger.debug("%s is deleted", imageFilePrefix + filepath);
};

module.exports = fileUtil;
