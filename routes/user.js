/*
Functions for User Page
*/

//Modules
var mysqlDb = require("../database/mysqldb");
var bcrypt = require("bcrypt-node");
var logger = require("../logger/logger")(__filename);
var confParams = require("../conf/conf").getParams();
var joinManager = require("./join");
var commonUtil = require("../util/common-util");
var httpUtil = require("../util/http-util");
var userManager = {};

/*
Load user data
*/
userManager.loadDefaultTakeParams = function(req, res, next){

	logger.debug("User request is on [ %s ]", req.path);

	req.__take_params = {};

	req.__take_params.isAuth = req.isAuthenticated();
	req.__take_params.username = req.__take_params.isAuth ? req.user.username : "";

	if(!commonUtil.checkPathWhiteList(req.path)){

		var callbackForError = function(err){
			httpUtil.sendDBErrorPage(req, res, err);
		};

		var callbackForNoResult = function(){
			req.__take_params.nickname = "";
			req.__take_params.hasStudio = 0;
			next();
		};

		var callbackForSuccess = function(rows, fields){
			req.__take_params.nickname = rows[0].nickname;
			req.__take_params.hasStudio = rows[0].has_studio;
			next();
		};

		var query = "SELECT ?? FROM ?? WHERE ?? = ?";

		var params = [["nickname", "has_studio"], "takeUser", "username", req.__take_params.username];

		logger.debug("SQL Query [SELECT %s %s FROM %s WHERE %s=%s]",
			params[0][0],
			params[0][1],
			params[1],
			params[2],
			params[3]
		);

		mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
	}
	else{
		next();
	}
};

userManager.checkLogin = function(req, res, next){

  if(req.__take_params.isAuth){
    next();
  }
  else {
    res.redirect("/");
  }
};

userManager.loadUserInfo = function(req, res, next){

	var callbackForError = function(err){
		httpUtil.sendDBErrorPage(req, res, err);
	};

	var callbackForNoResult = function(){
		httpUtil.sendNoDataFromDBPage(req, res);
	};

	var callbackForSuccess = function(rows, fields){
		req.__take_params.userInfo = rows[0];
		next();
	};

	var query = "SELECT * FROM ?? WHERE ?? = ?";

	var params = ["takeUser", "username", req.__take_params.username];

	logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s]",
		params[0],
		params[1],
		params[2]
	);

	mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

userManager.showUserInfoPage = function(req, res){

	req.__take_params.userInfo.join_date = req.__take_params.userInfo.join_date.slice(0, 10);

  res.render("user/userinfo", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname,
		userInfo: req.__take_params.userInfo
  });
};

userManager.updateUserInfo = function(req, res, next){

	var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    res.send({
			"result": "success"
		});
  };

	var emailAgree;
	if(req.body.email_agree == 1){
		emailAgree = 1;
	}
	else{
		emailAgree = 0;
	}

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
		"takeUser",
		{
			nickname: req.body.nickname,
			email: req.body.email,
			email_agree: emailAgree
		},
		"username",
		req.user.username
	];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

userManager.showPasswordPage = function(req, res){

  res.render("user/password", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
		username: req.__take_params.username,
		nickname: req.__take_params.nickname
  });
};

userManager.matchPassword = function(req, res, next){

	var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  }

  var callbackForNoResult = function(){
    httpUtil.sendNoDataFromDBPage(req, res);
  }

  var callbackForSuccess = function(rows, fields){
    if(bcrypt.compareSync(req.body.password_old, rows[0].password)){
      req.__take_params.passwordMatched = 1;
    }else{
      req.__take_params.passwordMatched = 0;
    }
		next();
  }

  var query = "SELECT ?? FROM ?? WHERE ?? = ?";

  var params = ["password", "takeUser", "username", req.__take_params.username];

  logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

userManager.updatePassword = function(req, res, next){

	if(req.__take_params.passwordMatched){
		var callbackForError = function(err){
	    res.send({
	      "result": "fail",
	      "text": err
	    });
	  };

	  var callbackForSuccess = function(){
	    res.send({
				"result": "success"
			});
	  };

		//Password Encryption
	  var encryptedPassword = joinManager.encryptPassword(req.body.password_new);

	  var query = "UPDATE ?? SET ? WHERE ?? = ?";

	  var params = [
			"takeUser",
			{
				password: encryptedPassword,
			},
			"username",
			req.user.username
		];

	  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
	    params[0],
	    JSON.stringify(params[1]),
	    params[2],
	    params[3]
	  );

	  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
	}
	else{
		res.send({
			"result": "fail",
			"text": "기존 비밀번호를 확인하세요."
		});
	}
};

userManager.loadLikesStudioIds = function(req, res, next){

	var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    req.__take_params.likeStudiosData = [];
		next();
  };

  var callbackForSuccess = function(rows, fields){
    req.__take_params.likeStudiosData = rows;
		next();
  };

  var query = "SELECT ?? FROM ?? WHERE ?? = ?";

  var params = ["studio_id", "takeUserLikeStudios", "username", req.__take_params.username];

  logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

userManager.loadLikesProductIds = function(req, res, next){

	var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    req.__take_params.likeProductsData = [];
		next();
  };

  var callbackForSuccess = function(rows, fields){
    req.__take_params.likeProductsData = rows;
		next();
  };

  var query = "SELECT ?? FROM ?? WHERE ?? = ?";

  var params = ["product_id", "takeUserLikeProducts", "username", req.__take_params.username];

  logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

userManager.loadStudioData = function(req, res, next){

	var maxIterator = req.__take_params.likeStudiosData.length;

	var load = function(iterator){

		var callbackForError = function(err){
	    httpUtil.sendDBErrorPage(req, res, err);
	  };

	  var callbackForNoResult = function(){
	    httpUtil.sendNoDataFromDBPage(req, res);
	  };

	  var callbackForSuccess = function(rows, fields){
			rows[0].slider_photo_list = JSON.parse(rows[0].slider_photo_list)["1"];
	    req.__take_params.likeStudiosData[iterator] = rows[0];

			if(iterator < maxIterator - 1){
				load(iterator + 1);
			}
			else{
				next();
			}
	  };

		var query = "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ? AND ?? = ??";

		var params = [
			[
				"studio.studio_name",
				"studio.username",
				"studio.slider_photo_list",
				"takeUser.nickname"
			],
			"studio",
			"takeUser",
			"studio.studio_id",
			req.__take_params.likeStudiosData[iterator].studio_id,
			"studio.username",
			"takeUser.username"
		];

	  logger.debug("SQL Query [SELECT %s %s %s %s FROM %s INNER JOIN %s ON %s=%s AND %s=%s]",
	    params[0][0],
			params[0][1],
			params[0][2],
			params[0][3],
	    params[1],
	    params[2],
			params[3],
			params[4],
			params[5],
			params[6]
	  );

	  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
	};

	if(maxIterator > 0){
			load(0);
	}
};

userManager.loadProductData = function(req, res, next){

	var maxIterator = req.__take_params.likeProductsData.length;

	var load = function(iterator){

		var callbackForError = function(err){
	    httpUtil.sendDBErrorPage(req, res, err);
	  }

	  var callbackForNoResult = function(){
	    httpUtil.sendNoDataFromDBPage(req, res);
	  }

	  var callbackForSuccess = function(rows, fields){
	    req.__take_params.likeProductsData[iterator] = rows[0];
			if(iterator < maxIterator - 1){
				load(iterator + 1);
			}
			else{
				next();
			}
	  }

		var query = "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ? AND ?? = ??"

		var params = [
			[
				"studioProducts.product_name",
				"studioProducts.product_price",
				"studioProducts.product_desc",
				"studio.studio_name",
				"studio.username"
			],
			"studioProducts",
			"studio",
			"studioProducts.product_id",
			req.__take_params.likeProductsData[iterator].product_id,
			"studioProducts.studio_id",
			"studio.studio_id"
		];

	  logger.debug("SQL Query [SELECT %s %s %s %s %s FROM %s INNER JOIN %s ON %s=%s AND %s=%s]",
	    params[0][0],
			params[0][1],
			params[0][2],
			params[0][3],
			params[0][4],
	    params[1],
	    params[2],
			params[3],
			params[4],
			params[5],
			params[6]
	  );

	  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
	};

	if(maxIterator > 0){
			load(0);
	}
};

userManager.showLikesListPage = function(req, res){

  res.render("user/likeslist", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname,
		likeStudiosData: req.__take_params.likeStudiosData,
		likeProductsData: req.__take_params.likeProductsData
  });
};

userManager.checkDupLikes = function(req, res, next){

	if(!req.__take_params.isAuth){
    res.send({
			"result": "fail",
			"text": "로그인이 필요합니다."
		});

		return;
  }

	var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  }

  var callbackForNoResult = function(){
    next();
  }

  var callbackForSuccess = function(rows, fields){
    for(var likesIndex = 0; likesIndex < rows.length; likesIndex++){
			if(req.body.studio_id){
				if(rows[likesIndex].studio_id == req.body.studio_id){
					res.send({
						"result": "fail",
						"text": "이미 찜하신 스튜디오입니다."
					});

					return;
				}
			}
			else if(req.body.product_id){
				if(rows[likesIndex].product_id == req.body.product_id){
					res.send({
						"result": "fail",
						"text": "이미 찜하신 상품입니다."
					});

					return;
				}
			}
		}
		next();
  }

	var query = "SELECT ?? FROM ?? WHERE ?? = ?"

	if(req.body.studio_id){
		var params = [
			"studio_id",
			"takeUserLikeStudios",
			"username",
			req.__take_params.username
		];
	}
	else if(req.body.product_id){
		var params = [
			"product_id",
			"takeUserLikeProducts",
			"username",
			req.__take_params.username
		];
	}

	logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

	mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

userManager.insertLikesList = function(req, res){

	var callbackForError = function(err){
		res.send({
			"result": "fail",
			"text": err
		});
	};

	var callbackForSuccess = function(result){
		res.send({"result": "success"});
	};

	var query = "INSERT INTO ?? SET ?";

	if(req.body.studio_id){
		var params = [
			"takeUserLikeStudios",
			{
				username: req.__take_params.username,
				studio_id: req.body.studio_id
			}
		];
	}
	else if(req.body.product_id){
		var params = [
			"takeUserLikeProducts",
			{
				username: req.__take_params.username,
				product_id: req.body.product_id
			}
		];
	}

	logger.debug("SQL Query [INSERT INTO %s SET %s]",
		params[0],
		JSON.stringify(params[1])
	);

	mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
};

module.exports = userManager;
