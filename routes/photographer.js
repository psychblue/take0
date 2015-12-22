/*
Functions for Main Page
*/

//Modules
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);
var confManager = require('../conf/conf');
var confParams = confManager.getParams();
var photographerManager = {};

photographerManager.showPage = function(req, res, next){
  var username = '';
  if(req.isAuthenticated()){
		username = req.user.username;
	}
  var photographerHomeOptions = {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.isAuthenticated(),
    name: username,
    photographerName: req.params.photographer
  };
  res.render('photographer/studio', photographerHomeOptions);
}

module.exports = photographerManager;
