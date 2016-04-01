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

	req.__take_params = {};

	req.__take_params.isAuth = req.isAuthenticated();
	req.__take_params.username = req.__take_params.isAuth ? req.user.username : "";

	if(!commonUtil.checkPathWhiteList(req.path)){

		mysqlDb.doSQLQuery({
			query: "SELECT ?? FROM ?? WHERE ?? = ?",

			params: [
				["nickname", "has_studio"],
				"takeUser",
				"username",
				req.__take_params.username
			],

			onSuccess: function(rows, fields){
				req.__take_params.nickname = rows[0].nickname;
				req.__take_params.hasStudio = rows[0].has_studio;
				next();
			},

			onError: function(err){
				httpUtil.sendDBErrorPage(req, res, err);
			},

			onNoResult: function(){
				req.__take_params.nickname = "";
				req.__take_params.hasStudio = 0;
				next();
			}
		});
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

userManager.checkLoginOnAjax = function(req, res, next){

  if(req.__take_params.isAuth){
    next();
  }
  else {
    res.send({
			"result":"fail",
			"code": "401",
			"text": "로그인 후 이용해주세요."
		});
  }
};

userManager.loadUserInfo = function(req, res, next){

	mysqlDb.doSQLQuery({
		query: "SELECT * FROM ?? WHERE ?? = ?",

		params: ["takeUser", "username", req.__take_params.username],

		onSuccess: function(rows, fields){
			req.__take_params.userInfo = rows[0];
			next();
		},

		onError: function(err){
			httpUtil.sendDBErrorPage(req, res, err);
		},

		onNoResult: function(){
			httpUtil.sendNoDataFromDBPage(req, res);
		}
	});
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

	var emailAgree;
	if(req.body.email_agree == 1){
		emailAgree = 1;
	}
	else{
		emailAgree = 0;
	}

	mysqlDb.doSQLQuery({
		query: "UPDATE ?? SET ? WHERE ?? = ?",

		params: [
			"takeUser",
			{
				nickname: req.body.nickname,
				email: req.body.email,
				email_agree: emailAgree
			},
			"username",
			req.user.username
		],

		onSuccess: function(){
	    res.send({
				"result": "success"
			});
	  },

		onError: function(err){
	    res.send({
	      "result": "fail",
	      "text": err
	    });
	  }
	});
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

	mysqlDb.doSQLQuery({
		query: "SELECT ?? FROM ?? WHERE ?? = ?",

		params: ["password", "takeUser", "username", req.__take_params.username],

		onSuccess: function(rows, fields){
	    if(bcrypt.compareSync(req.body.password_old, rows[0].password)){
	      req.__take_params.passwordMatched = 1;
	    }else{
	      req.__take_params.passwordMatched = 0;
	    }
			next();
	  },

		onError: function(err){
	    httpUtil.sendDBErrorPage(req, res, err);
	  },

		onNoResult: function(){
	    httpUtil.sendNoDataFromDBPage(req, res);
	  }
	});
};

userManager.updatePassword = function(req, res, next){

	if(req.__take_params.passwordMatched){
		//Password Encryption
	  var encryptedPassword = joinManager.encryptPassword(req.body.password_new);

		mysqlDb.doSQLQuery({
			query: "UPDATE ?? SET ? WHERE ?? = ?",

			params: [
				"takeUser",
				{
					password: encryptedPassword,
				},
				"username",
				req.user.username
			],

			onSuccess: function(){
		    res.send({
					"result": "success"
				});
		  },

			onError: function(err){
		    res.send({
		      "result": "fail",
		      "text": err
		    });
		  }
		});
	}
	else{
		res.send({
			"result": "fail",
			"text": "기존 비밀번호를 확인하세요."
		});
	}
};

userManager.loadReservations = function(req, res, next){

	mysqlDb.doSQLQuery({
		query: "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ?? AND ?? = ? INNER JOIN ?? ON ?? = ??",

		params: [
			[
				"studioProducts.product_id",
				"studioProducts.product_name",
				"studioProducts.product_desc",
				"studioProducts.product_price",
				"studioReservations.rsv_id",
				"studioReservations.request_date",
				"studioReservations.rsv_date",
				"studioReservations.rsv_start_time",
				"studioReservations.rsv_end_time",
				"studioReservations.rsv_status",
				"studio.studio_name",
				"studio.username"
			],
			"studioProducts",
			"studioReservations",
			"studioProducts.product_id",
			"studioReservations.product_id",
	    "studioReservations.request_user",
	    req.__take_params.username,
			"studio",
			"studioProducts.studio_id",
			"studio.studio_id"
	  ],

		onSuccess: function(rows, fields){
	    req.__take_params.reservationsData = rows;
	    next();
	  },

		onError: function(err){
	    httpUtil.sendDBErrorPage(req, res, err);
	  },

		onNoResult: function(){
	    req.__take_params.reservationsData = [];
	    next();
	  }
	});
};

userManager.showCartPage = function(req, res){

	res.render("user/cart", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname,
		reservationsData: req.__take_params.reservationsData
  });
};

userManager.loadLikesStudioIds = function(req, res, next){

	mysqlDb.doSQLQuery({
		query: "SELECT ?? FROM ?? WHERE ?? = ?",

		params: ["studio_id", "takeUserLikeStudios", "username", req.__take_params.username],

		onSuccess: function(rows, fields){
	    req.__take_params.likeStudiosData = rows;
			next();
	  },

		onError: function(err){
	    httpUtil.sendDBErrorPage(req, res, err);
	  },

		onNoResult: function(){
	    req.__take_params.likeStudiosData = [];
			next();
	  }
	});
};

userManager.loadLikesProductIds = function(req, res, next){

	mysqlDb.doSQLQuery({
		query: "SELECT ?? FROM ?? WHERE ?? = ?",

		params: ["product_id", "takeUserLikeProducts", "username", req.__take_params.username],

		onSuccess: function(rows, fields){
	    req.__take_params.likeProductsData = rows;
			next();
	  },

		onError: function(err){
	    httpUtil.sendDBErrorPage(req, res, err);
	  },

		onNoResult: function(){
	    req.__take_params.likeProductsData = [];
			next();
	  }
	});
};

userManager.loadStudioData = function(req, res, next){

	var maxIterator = req.__take_params.likeStudiosData.length;

	var load = function(iterator){

		mysqlDb.doSQLQuery({
			query: "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ? AND ?? = ??",

			params: [
				[
					"studio.studio_id",
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
			],

			onSuccess: function(rows, fields){
				rows[0].slider_photo_list = JSON.parse(rows[0].slider_photo_list)["1"];
		    req.__take_params.likeStudiosData[iterator] = rows[0];

				if(iterator < maxIterator - 1){
					load(iterator + 1);
				}
				else{
					next();
				}
		  },

			onError: function(err){
		    httpUtil.sendDBErrorPage(req, res, err);
		  },

			onNoResult: function(){
		    httpUtil.sendNoDataFromDBPage(req, res);
		  }
		});
	};

	if(maxIterator > 0){
			load(0);
	}
	else{
		next();
	}
};

userManager.loadProductData = function(req, res, next){

	var maxIterator = req.__take_params.likeProductsData.length;

	var load = function(iterator){

		mysqlDb.doSQLQuery({
			query: "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ? AND ?? = ??",

			params: [
				[
					"studioProducts.product_id",
					"studioProducts.product_name",
					"studioProducts.product_price",
					"studioProducts.product_desc",
					"studioProducts.is_available",
					"studio.studio_name",
					"studio.username"
				],
				"studioProducts",
				"studio",
				"studioProducts.product_id",
				req.__take_params.likeProductsData[iterator].product_id,
				"studioProducts.studio_id",
				"studio.studio_id"
			],

			onSuccess: function(rows, fields){
		    req.__take_params.likeProductsData[iterator] = rows[0];
				if(iterator < maxIterator - 1){
					load(iterator + 1);
				}
				else{
					next();
				}
		  },

			onError: function(err){
		    httpUtil.sendDBErrorPage(req, res, err);
		  },

			onNoResult: function(){
		    httpUtil.sendNoDataFromDBPage(req, res);
		  }
		});
	};

	if(maxIterator > 0){
			load(0);
	}
	else{
		next();
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

	var sqlParams;

	if(req.body.studio_id){
		sqlParams = [
			"studio_id",
			"takeUserLikeStudios",
			"username",
			req.__take_params.username
		];
	}
	else if(req.body.product_id){
		sqlParams = [
			"product_id",
			"takeUserLikeProducts",
			"username",
			req.__take_params.username
		];
	}

	mysqlDb.doSQLQuery({
		query: "SELECT ?? FROM ?? WHERE ?? = ?",

		params: sqlParams,

		onSuccess: function(rows, fields){
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
	  },

		onError: function(err){
	    httpUtil.sendDBErrorPage(req, res, err);
	  },

		onNoResult: function(){
	    next();
	  }
	});
};

userManager.insertLikesList = function(req, res){

	var sqlParams;

	if(req.body.studio_id){
		sqlParams = [
			"takeUserLikeStudios",
			{
				username: req.__take_params.username,
				studio_id: req.body.studio_id
			}
		];
	}
	else if(req.body.product_id){
		sqlParams = [
			"takeUserLikeProducts",
			{
				username: req.__take_params.username,
				product_id: req.body.product_id
			}
		];
	}

	mysqlDb.doSQLQuery({
		query: "INSERT INTO ?? SET ?",

		params: sqlParams,

		onSuccess: function(result){
			res.send({"result": "success"});
		},

		onError: function(err){
			res.send({
				"result": "fail",
				"text": err
			});
		}
	});
};

userManager.deleteLikesList = function(req, res){

	var sqlParams;

	if(req.body.studio_id){
	  sqlParams = [
			"takeUserLikeStudios",
			"username",
			req.__take_params.username,
			"studio_id",
			req.body.studio_id
		];
	}
	else if(req.body.product_id){
		sqlParams = [
			"takeUserLikeProducts",
			"username",
			req.__take_params.username,
			"product_id",
			req.body.product_id
		];
	}

	mysqlDb.doSQLQuery({
		query: "DELETE FROM ?? WHERE ?? = ? AND ?? = ?",

		params: sqlParams,

		onSuccess: function(){
	    res.send({"result": "success"});
	  },

		onError: function(err){
	    res.send({
				"result": "fail",
				"text": err
			});
	  }
	});
};

module.exports = userManager;
