/*
Functions for User Join & Withdraw Page
*/

//Modules
var logger = require("../logger/logger")(__filename);
var bcrypt = require("bcrypt-node");
var mysqlDb = require("../database/mysqldb");
var confParams = require("../conf/conf").getParams();
var httpUtil = require("../util/http-util");
var fileUtil = require("../util/file-util")
var loginManager = require("./login");
var joinManager = {};

/*
User Join Field Availability Check Function
*/
var isAvailField = function(req, res){
  return 1;
};

/*
Show Join Page
*/
joinManager.showJoinPage = function(req, res){
  // Check User Login
	if(req.__take_params.isAuth){
		httpUtil.sendInfoPage(req, res, {
			infoText: "이미 가입하셨습니다.",
			infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
		});
	}
	else{
		res.render("join/join", {
			title: confParams.html.title,
			service: confParams.html.service_name
		});
	}
};

/*
Password Encrytion Function
*/
joinManager.encryptPassword = function(seed){
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(seed, salt);
};

/*
User Join Function
*/
joinManager.joinUser = function(req, res){
  //Password Encryption
  var encryptedPassword;

  if(!req.body.kakao){
    encryptedPassword = joinManager.encryptPassword(req.body.password);
  }
  else{
    encryptedPassword = joinManager.encryptPassword(req.body.username);
  }
  //Check Submitted Fields
  if(isAvailField(req, res)){

    var callbackForError = function(err){
      if(err.code == "ER_DUP_ENTRY"){
        res.send({
					"result": "fail",
					"text": "아이디가 이미 존재합니다."
				});
      }
      else{
        res.send({
					"result": "fail",
					"text": "죄송합니다. 서비스에 문제가 발생하였습니다. 다시 시도해주세요."
				});
      }
    };

    var callbackForSuccess = function(result){
      var user = {"username": req.body.username};
      //Session Login
      req.login(user, function(err){
        //Session Error Case
        if(err){
          logger.error(err.toString());
          res.send({
						"result": "fail",
						"text": "죄송합니다. 서비스에 문제가 발생하였습니다. 다시 시도해주세요."
					});
        }
				else{
          //Redirect to Main Page
          res.send({"result": "success"});
        }
      });
    };

		var query = "INSERT INTO ?? SET ?";

  	var params = [
			"takeUser",
			{
				username: req.body.username,
				password: encryptedPassword,
				email: req.body.email,
        has_studio: 0
			}
		];

    logger.debug("SQL Query [INSERT INTO %s SET %s]",
			params[0],
			JSON.stringify(params[1])
		);

    mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
  }
  //Fields Error
  else{
    logger.error("[User Login] Submitted Field Error");
  }
};

/*
Show User Withdraw Page
*/
joinManager.showWithdrawPage = function(req, res){

	if(!req.__take_params.isAuth){
		res.redirect("/");

		return;
	}

	httpUtil.sendInfoPage(req, res, {
		infoText: "<a href='/'>" + confParams.html.service_name + "</a>를 떠나시겠습니까?",
		infoLink: "<a href='/withdraw/confirmed' class='font-darkgrey'>네</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href='/' class='font-darkgrey' onclick='history.back()'>아니오</a>"
	});
};

/*
Delete User Files
*/
joinManager.deleteUserFiles = function(req, res, next){

	if(!req.__take_params.isAuth){
		res.redirect("/");

		return;
	}

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    next();
  };

  var callbackForSuccess = function(rows, fields){
    var sliderPhotoList = JSON.parse(rows[0].slider_photo_list);

    for(var key in sliderPhotoList){
      if(sliderPhotoList[key] != ""){
        fileUtil.deleteImageFile(sliderPhotoList[key]);
      }
    }

    for(var rowsIndex = 0; rowsIndex < rows.length; rowsIndex++){
      var photoList = rows[rowsIndex].photo_list.split(",");

      for(var photoListIndex = 0; photoListIndex < photoList.length; photoListIndex++){
        if(photoList[photoListIndex] != ""){
          fileUtil.deleteImageFile(photoList[photoListIndex]);
        }
      }
    }

    next();
  };

  var query = "SELECT ?? FROM ?? INNER JOIN ?? WHERE ?? = ? AND ?? = ??";

  var params = [
    [
      "studio.slider_photo_list",
      "studioPortfolios.photo_list",
    ],
    "studio",
    "studioPortfolios",
    "studio.username",
    req.user.username,
    "studio.studio_id",
    "studioPortfolios.studio_id"
  ];

  logger.debug("SQL Query [SELECT %s, %s FROM %s INNER JOIN %s WHERE %s=%s AND %s=%s]",
    params[0][0],
    params[0][1],
    params[1],
    params[2],
    params[3],
    params[4],
    params[5],
    params[6]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

/*
Delete User Database
*/
joinManager.deleteUser = function(req, res){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForSuccess = function(){
    //Session Logout
    req.logout();
    //Redirecting to Success Page
    res.redirect("/withdraw/success");
  };

  var query = "DELETE FROM ?? WHERE ?? = ?";

  var params = ["takeUser", "username", req.user.username];

  logger.debug("SQL Query [DELETE FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2]
  );

  mysqlDb.doSQLDeleteQuery(query, params, callbackForSuccess, callbackForError);
};

/*
Show User Withdraw Success Page
*/
joinManager.showWithdrawSuccessPage = function(req, res){

	httpUtil.sendInfoPage(req, res, {
		infoText: "감사합니다.",
		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
	});
};

module.exports = joinManager;
