/*
Functions for Main Page
*/

//Modules
var mysqlDb = require("../database/mysqldb");
var logger = require("../logger/logger")(__filename);
var confManager = require("../conf/conf");
var confParams = confManager.getParams();
var httpUtil = require("../util/http-util");
var fileUtil = require("../util/file-util");
var multer = require("multer");
var photographerManager = {};

photographerManager.addServiceCategory = function(req, res){

  if(req.body.category){
    var sqlQuery = "INSERT INTO ?? (??, ??) VALUES ",
    sqlParams = [
      "studioServiceCategory",
      "studio_id",
      "service_category"
    ];

    for(var categoryIndex = 0; categoryIndex < req.body.category.length; categoryIndex++){
      if(categoryIndex == req.body.category.length - 1){
        sqlQuery = sqlQuery + "(?, ?)";
      }
      else{
        sqlQuery = sqlQuery + "(?, ?),";
      }

      params.push(req.__take_params.studioId);
      params.push(Number(req.body.category[categoryIndex]));
    }

    mysqlDb.doSQLQuery({
      query: sqlQuery,

      params: sqlParams,

      onSuccess: function(result){
        res.redirect("/studio/" + req.user.username);
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
    res.redirect("/studio/" + req.user.username);
  }
};

photographerManager.checkLogin = function(req, res, next){

  if(req.__take_params.isAuth){
    next();
  }
  else {
    res.render("login/login-page", {
      title: confParams.html.title,
      service: confParams.html.service_name,
      redirectUrl: req.originalUrl
    });
  }
};

photographerManager.checkLoginOnAjax = function(req, res, next){

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

photographerManager.checkReqFromOwner = function(req, res, next){
  if(!req.__take_params.isOwner){
    httpUtil.sendInfoPage(req, res, {
  		infoText: "허락된 사진작가가 아닙니다.",
  		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
  	});
  }
  else{
    next();
  }
};

photographerManager.deletePortfolio = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "DELETE FROM ?? WHERE ?? = ?",

    params: ["studioPortfolios", "portfolio_id", req.body.portfolio_id],

    onSuccess: function(){
      var photoList = req.body.photo_list.split(",");
      if(photoList[0] !== ""){
        for(var i = 0; i < photoList.length; i++){
          fileUtil.deleteImageFile(photoList[i]);
        }
      }

      next();
    },

    onError: function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    }
  });
};

photographerManager.deleteProduct = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "UPDATE ?? SET ? WHERE ?? = ?",

    params: [
      "studioProducts",
      {is_available: 0},
      "product_id",
      req.body.product_id
    ],

    onSuccess: function(){
      next();
    },

    onError: function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    }
  });
};

photographerManager.insertPortfolio = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "INSERT INTO ?? SET ?",

    params: [
      "studioPortfolios",
      {
        studio_id: req.body.studio_id,
        portfolio_subject: req.body.portfolio_subject,
        photo_list: req.__take_params.photoList,
        num_photos: req.__take_params.numPhoto
      }
    ],

    onSuccess: function(result){
      next();
    },

    onError: function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    }
  });
};

photographerManager.insertProduct = function(req, res, next){

  var productDesc = "<li>"
                    + req.body.product_desc.replace(/\r\n/gi, "</li><li>")
                    + "</li>";

  mysqlDb.doSQLQuery({
    query: "INSERT INTO ?? SET ?",

    params: [
      "studioProducts",
      {
        studio_id: req.body.studio_id,
        product_name: req.body.product_name,
        product_price: req.body.product_price,
        product_duration: req.body.product_duration,
        product_desc: productDesc
      }
    ],

    onSuccess: function(result){
      next();
    },

    onError: function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    }
  });
};

photographerManager.insertReservation = function(req, res){

  mysqlDb.doSQLQuery({
    query: "INSERT INTO ?? SET ?",

    params: [
  		"studioReservations",
  		{
  			product_id: req.query.product_id,
        request_user: req.__take_params.username,
        rsv_date: req.body.rsv_date,
        rsv_start_time: req.body.rsv_start_time,
        rsv_end_time: Number(req.body.rsv_start_time) + 100 * Number(req.body.product_duration),
        rsv_desc: req.body.rsv_desc.replace(/\r\n/gi, "<br>")
  		}
  	],

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

photographerManager.insertReservationEvent = function(req, res, next){

  if(req.__take_params.event_type !== undefined){
    mysqlDb.doSQLQuery({
      query: "INSERT INTO ?? SET ?",

      params: [
        "studioReservationEvents",
        {
          rsv_id: req.query.rsv_id,
          username: req.__take_params.username,
          event_type: req.__take_params.event_type,
          event_desc: req.__take_params.event_desc.toString().replace(/\r\n/gi, "<br>")
        }
      ],

      onSuccess: function(result){
        if(req.path == "/reserve/details"){
          next();
        }
        else{
          res.send({"result": "success"});
        }
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
    next();
  }
};

photographerManager.insertStudio = function(req, res, next){

  if(req.__take_params.hasStudio == 1){
    httpUtil.sendInfoPage(req, res, {
      infoText: "이미 개설된 스튜디오가 있습니다.",
      infoLink: "<a href='/studio/" + req.user.username + "' class='font-darkgrey'>스튜디오 바로가기</a>"
    });
  }
  else{
    mysqlDb.doSQLQuery({
      query: "INSERT INTO ?? SET ?",

      params: [
        "studio",
        {
          studio_name: req.body.studio_name,
          username: req.user.username,
          introduction: req.body.introduction.replace(/\r\n/gi, "<br>"),
          address: req.body.address,
          tel_num: req.body.tel_num
        }
      ],

      onSuccess: function(result){
        req.__take_params.studioId = result.insertId;
        next();
      },

      onError: function(err){
        res.send({
          "result": "fail",
          "text": err
        });
      }
    });
  }
};

photographerManager.isOwner = function(req, res, next){

  req.__take_params.isOwner = req.__take_params.isAuth && (req.user.username == req.params.photographer);
  next();
};

photographerManager.loadPortfolios = function(req, res){

  mysqlDb.doSQLQuery({
    query: "SELECT * FROM ?? WHERE ?? = ?",

    params: ["studioPortfolios", "studio_id", req.__take_params.studioData.studio_id],

    onSuccess: function(rows, fields){
      for(var i = 0; i < rows.length; i++){
        rows[i].photo_list = rows[i].photo_list.split(",")[0];
      }

      res.render("photographer/studio", {
        title: confParams.html.title,
        service: confParams.html.service_name,
        isAuth: req.__take_params.isAuth,
        hasStudio: req.__take_params.hasStudio,
        isOwner: req.__take_params.isOwner,
        username: req.__take_params.username,
        nickname: req.__take_params.nickname,
        studioData: req.__take_params.studioData,
        productsData: req.__take_params.productsData,
        portfoliosData: rows
      });
    },

    onError: function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    },

    onNoResult: function(){
      httpUtil.sendNoDataFromDBPage(req, res);
    }
  });
};

photographerManager.loadPortfolioPhotoList = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "SELECT ?? FROM ?? WHERE ?? = ?",

    params: ["photo_list", "studioPortfolios", "portfolio_id", req.params.portfolio_id],

    onSuccess: function(rows, fields){
      res.send({
        "result": "success",
        "body": rows[0]
      });
    },

    onError: function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    },

    onNoResult: function(){
      res.send({
        "result": "fail",
        "text": "No data"
      });
    }
  });
};

photographerManager.loadProduct = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ? AND ?? = ??",

    params: [
      [
        "studioProducts.product_id",
        "studioProducts.product_name",
        "studioProducts.product_duration",
        "studio.studio_name",
        "studio.username"
      ],
      "studioProducts",
      "studio",
      "studioProducts.product_id",
      req.query.product_id,
      "studioProducts.studio_id",
      "studio.studio_id"
    ],

    onSuccess: function(rows, fields){
      req.__take_params.productData = rows[0];
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

photographerManager.loadProducts = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?",

    params: [
      "studioProducts",
      "studio_id",
      req.__take_params.studioData.studio_id,
      "is_available",
      1
    ],

    onSuccess: function(rows, fields){
      if(req.__take_params.studioData.num_portfolios === 0){
        res.render("photographer/studio", {
          title: confParams.html.title,
          service: confParams.html.service_name,
          isAuth: req.__take_params.isAuth,
          hasStudio: req.__take_params.hasStudio,
          isOwner: req.__take_params.isOwner,
          username: req.__take_params.username,
          nickname: req.__take_params.nickname,
          studioData: req.__take_params.studioData,
          productsData: rows
        });
      }
      else{
        req.__take_params.productsData = rows;
        next();
      }
    },

    onError: function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    },

    onNoResult: function(){
      req.__take_params.productsData = undefined;
      next();
    }
  });
};

photographerManager.loadReservation = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ?? AND ?? = ? INNER JOIN ?? ON ?? = ??",

    params: [
  		[
  			"studioProducts.product_id",
  			"studioProducts.product_name",
  			"studioProducts.product_desc",
  			"studioProducts.product_price",
  			"studioReservations.rsv_id",
        "studioReservations.request_user",
  			"studioReservations.request_date",
  			"studioReservations.rsv_date",
  			"studioReservations.rsv_start_time",
  			"studioReservations.rsv_end_time",
        "studioReservations.rsv_desc",
  			"studioReservations.rsv_status",
  			"studio.studio_name",
  			"studio.username"
  		],
  		"studioProducts",
  		"studioReservations",
  		"studioProducts.product_id",
  		"studioReservations.product_id",
      "studioReservations.rsv_id",
      req.query.rsv_id,
  		"studio",
  		"studioProducts.studio_id",
  		"studio.studio_id"
    ],

    onSuccess: function(rows, fields){
      req.__take_params.reservationData = rows[0];
      next();
    },

    onError: function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    },

    onNoResult: function(){
      httpUtil.sendInfoPage(req, res, {
        infoText: "잘못된 예약 정보입니다.",
    		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
      });
    }
  });
};

photographerManager.loadReservationEvents = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "SELECT * FROM ?? WHERE ?? = ? ORDER BY ?? DESC",

    params: [
      "studioReservationEvents",
      "rsv_id",
      req.query.rsv_id,
      "event_id"
    ],

    onSuccess: function(rows, fields){
      req.__take_params.reservationEventsData = rows;
      next();
    },

    onError: function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    },

    onNoResult: function(){
      req.__take_params.reservationEventsData = [];
      next();
    }
  });
};

photographerManager.loadReservEventsNickname = function(req, res, next){

  var maxIterator = req.__take_params.reservationEventsData.length;
  var statusStrings = ["예약요청중", "예약확인중", "예약확정", "결제완료", "촬영완료", "상품전달중", "상품확인", "취소요청중", "취소완료"];

  var load = function(iterator){

    mysqlDb.doSQLQuery({
      query: "SELECT ?? FROM ?? WHERE ?? = ?",

      params: [
  			"nickname",
  			"takeUser",
  			"username",
  			req.__take_params.reservationEventsData[iterator].username
  		],

      onSuccess: function(rows, fields){
        if(req.__take_params.reservationEventsData[iterator].event_type == 0){
          req.__take_params.reservationEventsData[iterator].rsv_status_string = statusStrings[req.__take_params.reservationEventsData[iterator].event_desc - 1];
        }
        req.__take_params.reservationEventsData[iterator].nickname = rows[0].nickname;

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

photographerManager.loadReservUserNickname = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "SELECT ?? FROM ?? WHERE ?? = ?",

    params: [
      "nickname",
      "takeUser",
      "username",
      req.__take_params.reservationData.request_user
    ],

    onSuccess: function(rows, fields){
      req.__take_params.reservationData.user_nickname = rows[0].nickname;
      next();
    },

    onError: function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    },

    onNoResult: function(){
      httpUtil.sendInfoPage(req, res, {
        infoText: "잘못된 예약 정보입니다.",
    		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
      });
    }
  });
};

photographerManager.loadSliderPhotoList = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "SELECT ?? FROM ?? WHERE ?? = ?",

    params: ["slider_photo_list", "studio", "username", req.params.photographer],

    onSuccess: function(rows, fields){
      var sliderPhotoUrlPathPrefix = confParams.file.slider_photo_url_path_prefix;
      var flag = req.body.flag.split(",");
      var currentPhotoList = JSON.parse(rows[0].slider_photo_list);
      var newPhotoList = {};

      for(var i = 0; i < 5; i++){

        var index = String(i + 1);

        switch(flag[i]){
          case "0":
            newPhotoList[index] = currentPhotoList[index];
            break;

          case "1":
            var newFilename = sliderPhotoUrlPathPrefix
                              + req.__take_params.filenamePrefix
                              + req.files[index][0].originalname;

            if(currentPhotoList[index] !== ""){
              fileUtil.deleteImageFile(currentPhotoList[index]);
            }
            newPhotoList[index] = newFilename;
            break;

          case "2":
            if(currentPhotoList[index] !== ""){
              fileUtil.deleteImageFile(currentPhotoList[index]);
            }
            newPhotoList[index] = "";
            break;

          default:
        }
      }

      var numPhoto = 0;

      for(var photoIndex = 1; photoIndex < 6; photoIndex++){
        if(newPhotoList[String(photoIndex)] !== ""){
          numPhoto++;
        }
        else{
          for(var j = photoIndex + 1; j < 6; j++){
            if(newPhotoList[String(j)] !== ""){
              newPhotoList[String(photoIndex)] = newPhotoList[String(j)];
              newPhotoList[String(j)] = "";
              numPhoto++;
              break;
            }
          }
        }
      }

      req.__take_params.numPhoto = numPhoto;
      req.__take_params.newPhotoList = JSON.stringify(newPhotoList);
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

photographerManager.loadStudio = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "SELECT * FROM ?? INNER JOIN ?? ON ?? = ? AND ?? = ?",

    params: [
      "studio",
      "takeUser",
      "studio.username",
      req.params.photographer,
      "takeUser.username",
      req.params.photographer
    ],

    onSuccess: function(rows, fields){

      if(rows[0].num_products === 0 && rows[0].num_portfolios === 0){
        res.render("photographer/studio", {
          title: confParams.html.title,
          service: confParams.html.service_name,
          isAuth: req.__take_params.isAuth,
          hasStudio: req.__take_params.hasStudio,
          isOwner: req.__take_params.isOwner,
          username: req.__take_params.username,
          nickname: req.__take_params.nickname,
          studioData: rows[0]
        });
      }
      else{
        req.__take_params.studioData = rows[0];
        next();
      }
    },

    onError: function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    },

    onNoResult: function(){
      httpUtil.send404Page(req, res);
    }
  });
};

photographerManager.loadStudioReservations = function(req, res, next){

  var order;

  if(req.query.order){
    order = "studioReservations." + req.query.order;
  }
  else{
    order = "studioReservations.rsv_id";
  }

  mysqlDb.doSQLQuery({
    query: "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ?? INNER JOIN ?? ON ?? = ?? WHERE ?? = ? ORDER BY ?? DESC",

    params: [
      [
        "studioReservations.rsv_id",
        "studioReservations.request_date",
        "studioReservations.rsv_date",
        "studioReservations.rsv_start_time",
        "studioReservations.rsv_status",
        "studioProducts.product_name"
      ],
      "studioProducts",
      "studioReservations",
      "studioReservations.product_id",
      "studioProducts.product_id",
      "studio",
      "studioProducts.studio_id",
      "studio.studio_id",
      "studio.username",
      req.user.username,
      order
    ],

    onSuccess: function(rows, fields){

      for(var dataIndex = 0; dataIndex < rows.length; dataIndex++){
        var date = rows[dataIndex].rsv_date.toString();
        var time = rows[dataIndex].rsv_start_time;

        var year = date.slice(0, 4);
        var month = date.slice(4, 6);
        var dateNum = date.slice(6, 8);

        var timePrefix = "오전";

        if(time >= 1300){
          timePrefix = "오후";
          time = time - 1200;
        }
        time = time.toString();
        var hour;

        if(time.length == 3){
          hour = time.slice(0, 1);
        }
        else{
          hour = time.slice(0, 2);
        }

        var minute = time.slice(-2);

        date = year + "-" + month + "-" + dateNum;
        time = timePrefix + " " + hour + ":" + minute;

        rows[dataIndex].rsv_datetime = date + " " + time;

        var statusStrings = ["예약요청중", "예약확인중", "예약확정", "결제완료", "촬영완료", "상품전달중", "상품확인", "취소요청중", "취소완료"];
        rows[dataIndex].rsv_status_string = statusStrings[rows[dataIndex].rsv_status - 1];
      }

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

photographerManager.loadUserReservationsByDate = function(req, res, next){

  var date = "";

  if(req.query.date){
    date = req.query.date;
  }
  else{
    var today = new Date();
    var month = today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
    var dateNum = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
    date = date + today.getFullYear() + month + dateNum;
  }

  mysqlDb.doSQLQuery({
    query: "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?",

    params: [
      "studioReservations",
      "product_id",
      req.query.product_id,
      "rsv_date",
      date
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

photographerManager.openedByOnwer = function(req, res, next){

  if(req.__take_params.username == req.__take_params.reservationData.username && req.__take_params.reservationData.rsv_status == 1){

    req.__take_params.reservationData.rsv_status = 2;
    req.body.rsv_status = 2;
    next();
  }
  else{
    next();
  }
};

photographerManager.saveNewPortfolioFiles = function(req, res, next){

  var portfolioStoragePathPrefix = confParams.file.portfolio_storage_path_prefix;
  var filenamePrefix = req.params.photographer
                       + "_portfolio_"
                       + Date.now()
                       + "_";

  var storage = multer.diskStorage({
    destination: portfolioStoragePathPrefix,
    filename: function(req, file, callback){
      callback(null, filenamePrefix + file.originalname);
    }
  });

  var fileController = multer({
    storage: storage
  }).fields([
    {name: "portfolio_id"},
    {name: "photo_list"},
    {name: "del_photo_list"},
    {name: "photofile"}
  ]);

  fileController(req, res, function(err){
    if(!err){
      req.__take_params.filenamePrefix = filenamePrefix;
      next();
    }
    else{
      res.send(err);
    }
  });
};

photographerManager.saveNewSliderPhotoFiles = function(req, res, next){

  var sliderPhotoStoragePathPrefix = confParams.file.slider_photo_storage_path_prefix;
  var filenamePrefix = req.params.photographer
                       + "_slider_"
                       + Date.now()
                       + "_";

  var storage = multer.diskStorage({
    destination: sliderPhotoStoragePathPrefix,
    filename: function(req, file, callback){
      callback(null, filenamePrefix + file.originalname);
    }
  });

  var fileController = multer({
    storage: storage
  }).fields([
    {name: "flag"},
    {name: "1"},
    {name: "2"},
    {name: "3"},
    {name: "4"},
    {name: "5"}
  ]);

  fileController(req, res, function(err){
    if(!err){
      req.__take_params.filenamePrefix = filenamePrefix;
      next();
    }
    else{
      res.send(err);
    }
  });
};

photographerManager.sendReservationsData = function(req, res){

  res.send({
    "result": "success",
    "data": req.__take_params.reservationsData
  });
};

photographerManager.setMsgEvent = function(req, res, next){

  req.__take_params.event_type = 1;
  req.__take_params.event_desc = req.body.msg_desc;
  next();
};

photographerManager.showMakeStudioPage = function(req, res){

  if(req.__take_params.hasStudio == 1){
    httpUtil.sendInfoPage(req, res, {
      infoText: "이미 개설된 스튜디오가 있습니다.",
      infoLink: "<a href='/studio/" + req.user.username + "' class='font-darkgrey'>스튜디오 바로가기</a>"
    });
  }
  else{
    res.render("photographer/make-studio", {
      title: confParams.html.title,
      service: confParams.html.service_name,
      isAuth: req.__take_params.isAuth,
      hasStudio: req.__take_params.hasStudio,
      nickname: req.__take_params.nickname
    });
  }
};

photographerManager.showReservDetailsPage = function(req, res){

  res.render("user/rsv-details", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname,
		reservationData: req.__take_params.reservationData,
    reservationEventsData: req.__take_params.reservationEventsData,
    mode: req.query.mode
  });
};

photographerManager.showReservManamgementPage = function(req, res){

  res.render("photographer/rsv-management", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname,
    reservationsData: req.__take_params.reservationsData
  });
};

photographerManager.showReservPage = function(req, res){

  res.render("photographer/reservation", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname,
    productData: req.__take_params.productData,
    reservationsData: req.__take_params.reservationsData
  });
};

photographerManager.updateHasStudio = function(req, res, next){

  mysqlDb.doSQLQuery({
    query: "UPDATE ?? SET ? WHERE ?? = ?",

    params: ["takeUser", {has_studio: 1}, "username", req.user.username],

    onSuccess: function(){
      next();
    },

    onError: function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    }
  });
};

photographerManager.updateIntro = function(req, res){

  mysqlDb.doSQLQuery({
    query: "UPDATE ?? SET ? WHERE ?? = ?",

    params: [
      "studio",
      {
        studio_name: req.body.studio_name,
        tel_num: req.body.tel_num,
        address: req.body.address,
        introduction: req.body.introduction.replace(/\r\n/gi, "<br>")
      },
      "username",
      req.params.photographer
    ],

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

photographerManager.updateNumberOfPortfolios = function(req, res){

  mysqlDb.doSQLQuery({
    query: "UPDATE ?? SET ? WHERE ?? = ?",

    params: [
      "studio",
      {num_portfolios: req.body.num_portfolios},
      "studio_id",
      req.body.studio_id
    ],

    onSuccess: function(){
      if(req.body.portfolio_id == "new"){
        res.redirect("/studio/" + req.params.photographer);
      }
      else{
        res.send({"result": "success"});
      }
    },

    onError: function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    }
  });
};

photographerManager.updateNumberOfProducts = function(req, res){

  mysqlDb.doSQLQuery({
    query: "UPDATE ?? SET ? WHERE ?? = ?",

    params: [
      "studio",
      {num_products: req.body.num_products},
      "studio_id",
      req.body.studio_id
    ],

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

photographerManager.updatePortfolio = function(req, res, next){

  var numPhoto;
  var portfolioUrlPathPrefix = confParams.file.portfolio_url_path_prefix;
  var newPhotoList = req.body.photo_list.split(",");
  var delPhotoList = req.body.del_photo_list.split(",");

  if(newPhotoList[0] === ""){
    newPhotoList = [];
  }

  if(req.files["photofile"]){
    for(var i = 0; i < req.files["photofile"].length; i++){
      newPhotoList.push(portfolioUrlPathPrefix + req.__take_params.filenamePrefix + req.files["photofile"][i].originalname);
    }
  }

  if(newPhotoList[0] !== ""){
    numPhoto = newPhotoList.length;
  }
  else{
    numPhoto = 0;
  }

  if(delPhotoList[0] !== ""){
    for(var photoIndex = 0; photoIndex < delPhotoList.length; photoIndex++){
      fileUtil.deleteImageFile(delPhotoList[photoIndex]);
    }
  }

  if(req.body.portfolio_id == "new"){
    req.__take_params.photoList = newPhotoList.toString();
    req.__take_params.numPhoto = numPhoto;
    next();
  }
  else{
    mysqlDb.doSQLQuery({
      query: "UPDATE ?? SET ? WHERE ?? = ?",

      params: [
        "studioPortfolios",
        {portfolio_subject: req.body.portfolio_subject, photo_list: newPhotoList.toString(), num_photos: numPhoto},
        "portfolio_id",
        req.body.portfolio_id
      ],

      onSuccess: function(){
        res.redirect("/studio/" + req.params.photographer);
      },

      onError: function(err){
        httpUtil.sendDBErrorPage(req, res, err);
      }
    });
  }
};

photographerManager.updateProduct = function(req, res){

  var productDesc = "<li>"
                    + req.body.product_desc.replace(/\r\n/gi, "</li><li>")
                    + "</li>";

  mysqlDb.doSQLQuery({
    query: "UPDATE ?? SET ? WHERE ?? = ?",

    params: [
      "studioProducts",
      {
        product_name: req.body.product_name,
        product_price: req.body.product_price,
        product_duration: req.body.product_duration,
        product_desc: productDesc
      },
      "product_id",
      req.body.product_id
    ],

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

photographerManager.updateReservationStatusByOwner = function(req, res, next){

  if(req.body.rsv_status){

    if(req.__take_params.username != req.__take_params.reservationData.username){

      res.send({
        "result": "fail",
        "text": "허락된 사진작가가 아닙니다."
      });

      return;
    }

    mysqlDb.doSQLQuery({
      query: "UPDATE ?? SET ? WHERE ?? = ?",

      params: [
        "studioReservations",
        {
          rsv_status: req.body.rsv_status
        },
        "rsv_id",
        req.query.rsv_id
      ],

      onSuccess: function(){
        req.__take_params.event_type = 0;
        req.__take_params.event_desc = req.body.rsv_status;

        next();
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
    next();
  }
};

photographerManager.updateReservationStatusByUser = function(req, res, next){

  if(req.body.rsv_status){

    mysqlDb.doSQLQuery({
      query: "UPDATE ?? SET ? WHERE ?? = ?",

      params: [
        "studioReservations",
        {
          rsv_status: req.body.rsv_status
        },
        "rsv_id",
        req.query.rsv_id
      ],

      onSuccess: function(){
        req.__take_params.event_type = 0;
        req.__take_params.event_desc = req.body.rsv_status;

        next();
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
    next();
  }
};

photographerManager.updateSliderPhotoList = function(req, res){

  mysqlDb.doSQLQuery({
    query: "UPDATE ?? SET ? WHERE ?? = ?",

    params: [
      "studio",
      {
        num_photo_on_slider: req.__take_params.numPhoto,
        slider_photo_list: req.__take_params.newPhotoList
      },
      "username",
      req.params.photographer
    ],

    onSuccess: function(){
      res.redirect("/studio/" + req.params.photographer);
    },

    onError: function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    }
  });
};

module.exports = photographerManager;
