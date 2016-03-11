/*
Utils for HTTP Message
*/

//Modules
var logger = require("../logger/logger")(__filename);
var confParams = require("../conf/conf").getParams();

var httpUtil = {};

/*
Send Information Page to Client
*/
httpUtil.sendInfoPage = function(req, res, options){

  var isAuth = req.isAuthenticated();
  var username = isAuth ? req.user.username : "";

  options.title = confParams.html.title;
  options.service = confParams.html.service_name;
  options.isAuth = isAuth;
  options.name = username;

	res.render("info", options);
};

/*
Send Mysql DB Error Page to Client
*/
httpUtil.sendDBErrorPage = function(req, res, err){

	httpUtil.sendInfoPage(req, res, {
		infoText: "죄송합니다. 서비스에 오류가 발생하였습니다.<br>" + err.toString(),
		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
	});
};

/*
Send Mysql No Data Page to Client
*/
httpUtil.sendNoDataFromDBPage = function(req, res){

	httpUtil.sendInfoPage(req, res, {
		infoText: "요청하신 데이터가 없습니다.",
		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
	});
};

module.exports = httpUtil;
