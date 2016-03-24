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

photographerManager.isOwner = function(req, res, next){

  req.__take_params.isOwner = req.__take_params.isAuth && (req.user.username == req.params.photographer);
  next();
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

photographerManager.loadStudio = function(req, res, next){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    httpUtil.send404Page(req, res);
  };

  var callbackForSuccess = function(rows, fields){

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
  };

  var query = "SELECT * FROM ?? INNER JOIN ?? ON ?? = ? AND ?? = ?";

  var params = [
    "studio",
    "takeUser",
    "studio.username",
    req.params.photographer,
    "takeUser.username",
    req.params.photographer
  ];

  logger.debug("SQL Query [SELECT * FROM %s INNER JOIN %s ON %s=%s AND %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3],
    params[4],
    params[5]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.loadProducts = function(req, res, next){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    req.__take_params.productsData = undefined;
    next();
  };

  var callbackForSuccess = function(rows, fields){
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
  };

  var query = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";

  var params = ["studioProducts", "studio_id", req.__take_params.studioData.studio_id, "is_available", 1];

  logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s AND %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3],
    params[4]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.loadPortfolios = function(req, res){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    httpUtil.sendNoDataFromDBPage(req, res);
  };

  var callbackForSuccess = function(rows, fields){
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
  };

  var query = "SELECT * FROM ?? WHERE ?? = ?";

  var params = ["studioPortfolios", "studio_id", req.__take_params.studioData.studio_id];

  logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.checkLogin = function(req, res, next){

  if(req.__take_params.isAuth){
    next();
  }
  else {
    res.render("login/login-page", {
      title: confParams.html.title,
      service: confParams.html.service_name,
      redirectUrl: req.path
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

photographerManager.insertStudio = function(req, res, next){

  if(req.__take_params.hasStudio == 1){
    httpUtil.sendInfoPage(req, res, {
      infoText: "이미 개설된 스튜디오가 있습니다.",
      infoLink: "<a href='/studio/" + req.user.username + "' class='font-darkgrey'>스튜디오 바로가기</a>"
    });
  }
  else{
    var callbackForError = function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    };

    var callbackForSuccess = function(result){
      req.__take_params.studioId = result.insertId;
      next();
    };

    var query = "INSERT INTO ?? SET ?";

    var params = [
      "studio",
      {
        studio_name: req.body.studio_name,
        username: req.user.username,
        introduction: req.body.introduction,
        address: req.body.address,
        tel_num: req.body.tel_num
      }
    ];

    logger.debug("SQL Query [INSERT INTO %s SET %s]",
      params[0],
      JSON.stringify(params[1])
    );

    mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
  }
};

photographerManager.updateHasStudio = function(req, res, next){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    next();
  };

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = ["takeUser", {has_studio: 1}, "username", req.user.username];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.addServiceCategory = function(req, res){
  if(req.body.category){
    var callbackForError = function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    };

    var callbackForSuccess = function(result){
      res.redirect("/studio/" + req.user.username);
    };

    var query = "INSERT INTO ?? (??, ??) VALUES ";

    var params = [
      "studioServiceCategory",
      "studio_id",
      "service_category"
    ];

    for(var categoryIndex = 0; categoryIndex < req.body.category.length; categoryIndex++){
      if(categoryIndex == req.body.category.length - 1){
        query = query + "(?, ?)";
      }
      else{
        query = query + "(?, ?),";
      }

      params.push(req.__take_params.studioId);
      params.push(Number(req.body.category[categoryIndex]));
    }

    logger.debug("SQL Query [INSERT INTO %s (%s, %s)]",
      params[0],
      params[1],
      params[2]
    );

    mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
  }
  else{
    res.redirect("/studio/" + req.user.username);
  }
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

photographerManager.loadSliderPhotoList = function(req, res, next){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    httpUtil.sendNoDataFromDBPage(req, res);
  };

  var callbackForSuccess = function(rows, fields){
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
  };

  var query = "SELECT ?? FROM ?? WHERE ?? = ?";

  var params = ["slider_photo_list", "studio", "username", req.params.photographer];

  logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.updateSliderPhotoList = function(req, res){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForSuccess = function(){
    res.redirect("/studio/" + req.params.photographer);
  };

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
    "studio",
    {
      num_photo_on_slider: req.__take_params.numPhoto,
      slider_photo_list: req.__take_params.newPhotoList
    },
    "username",
    req.params.photographer
  ];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.updateIntro = function(req, res){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    res.send({"result": "success"});
  };

  var introduction = req.body.introduction.replace(/\r\n/gi, "<br>");

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
    "studio",
    {
      studio_name: req.body.studio_name,
      tel_num: req.body.tel_num,
      address: req.body.address,
      introduction: introduction
    },
    "username",
    req.params.photographer
  ];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2], params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.insertProduct = function(req, res, next){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(result){
    next();
  };

  var productDesc = "<li>"
                    + req.body.product_desc.replace(/\r\n/gi, "</li><li>")
                    + "</li>";

  var query = "INSERT INTO ?? SET ?";

  var params = [
    "studioProducts",
    {
      studio_id: req.body.studio_id,
      product_name: req.body.product_name,
      product_price: req.body.product_price,
      product_duration: req.body.product_duration,
      product_desc: productDesc
    }
  ];

  logger.debug("SQL Query [INSERT INTO %s SET %s]",
    params[0],
    JSON.stringify(params[1])
  );

  mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.updateNumberOfProducts = function(req, res){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    res.send({"result": "success"});
  };

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
    "studio",
    {num_products: req.body.num_products},
    "studio_id",
    req.body.studio_id
  ];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.updateProduct = function(req, res){

  var callbackForError = function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    };

  var callbackForSuccess = function(){
    res.send({"result": "success"});
  };

  var productDesc = "<li>"
                    + req.body.product_desc.replace(/\r\n/gi, "</li><li>")
                    + "</li>";

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
    "studioProducts",
    {
      product_name: req.body.product_name,
      product_price: req.body.product_price,
      product_duration: req.body.product_duration,
      product_desc: productDesc
    },
    "product_id",
    req.body.product_id
  ];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

/*
photographerManager.deleteProduct = function(req, res, next){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    next();
  };

  var query = "DELETE FROM ?? WHERE ?? = ?";

	var params = ["studioProducts", "product_id", req.body.product_id];

  logger.debug("SQL Query [DELETE FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2]
  );

  mysqlDb.doSQLDeleteQuery(query, params, callbackForSuccess, callbackForError);
};
*/

photographerManager.deleteProduct = function(req, res, next){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    next();
  };

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
    "studioProducts",
    {is_available: 0},
    "product_id",
    req.body.product_id
  ];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
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
    var callbackForError = function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    };

    var callbackForSuccess = function(){
      res.redirect("/studio/" + req.params.photographer);
    };

    var query = "UPDATE ?? SET ? WHERE ?? = ?";

    var params = [
      "studioPortfolios",
      {portfolio_subject: req.body.portfolio_subject, photo_list: newPhotoList.toString(), num_photos: numPhoto},
      "portfolio_id",
      req.body.portfolio_id
    ];

    logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
      params[0],
      JSON.stringify(params[1]),
      params[2],
      params[3]
    );

    mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
  }
};

photographerManager.insertPortfolio = function(req, res, next){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(result){
    next();
  };
  var query = "INSERT INTO ?? SET ?";

  var params = [
    "studioPortfolios",
    {
      studio_id: req.body.studio_id,
      portfolio_subject: req.body.portfolio_subject,
      photo_list: req.__take_params.photoList,
      num_photos: req.__take_params.numPhoto
    }
  ];

  logger.debug("SQL Query [INSERT INTO %s SET %s]",
    params[0],
    JSON.stringify(params[1])
  );

  mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.updateNumberOfPortfolios = function(req, res){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    if(req.body.portfolio_id == "new"){
      res.redirect("/studio/" + req.params.photographer);
    }
    else{
      res.send({"result": "success"});
    }
  };

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
    "studio",
    {num_portfolios: req.body.num_portfolios},
    "studio_id",
    req.body.studio_id
  ];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.deletePortfolio = function(req, res, next){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    var photoList = req.body.photo_list.split(",");
    if(photoList[0] !== ""){
      for(var i = 0; i < photoList.length; i++){
        fileUtil.deleteImageFile(photoList[i]);
      }
    }

    next();
  };

  var query = "DELETE FROM ?? WHERE ?? = ?";

	var params = ["studioPortfolios", "portfolio_id", req.body.portfolio_id];

  logger.debug("SQL Query [DELETE FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2]
  );

  mysqlDb.doSQLDeleteQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.getPortfolioPhotoList = function(req, res, next){

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForNoResult = function(){
    res.send({
      "result": "fail",
      "text": "No data"
    });
  };

  var callbackForSuccess = function(rows, fields){
    res.send({
      "result": "success",
      "body": rows[0]
    });
  };

  var query = "SELECT ?? FROM ?? WHERE ?? = ?";

  var params = ["photo_list", "studioPortfolios", "portfolio_id", req.params.portfolio_id];

  logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.loadProduct = function(req, res, next){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    httpUtil.sendNoDataFromDBPage(req, res);
  };

  var callbackForSuccess = function(rows, fields){
    req.__take_params.productData = rows[0];
    next();
  };

  var query = "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ? AND ?? = ??";

  var params = [
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
  ];

  logger.debug("SQL Query [SELECT %s FROM %s INNER JOIN %s ON %s=%s AND %s=%s]",
    params[0].toString(),
    params[1],
    params[2],
    params[3],
    params[4],
    params[5],
    params[6]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.loadReservations = function(req, res, next){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    req.__take_params.reservationsData = [];
    next();
  };

  var callbackForSuccess = function(rows, fields){
    req.__take_params.reservationsData = rows;
    next();
  };

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

  var query = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";

  var params = [
    "studioReservations",
    "product_id",
    req.query.product_id,
    "rsv_date",
    date
  ];

  logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s AND %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3],
    params[4]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.loadReservations = function(req, res, next){

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    req.__take_params.reservationsData = [];
    next();
  };

  var callbackForSuccess = function(rows, fields){
    req.__take_params.reservationsData = rows;
    next();
  };

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

  var query = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";

  var params = [
    "studioReservations",
    "product_id",
    req.query.product_id,
    "rsv_date",
    date
  ];

  logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s AND %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3],
    params[4]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.loadReservation = function(req, res, next){

	var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    httpUtil.sendInfoPage(req, res, {
      infoText: "잘못된 예약 정보입니다.",
  		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
    });
  };

  var callbackForSuccess = function(rows, fields){
    req.__take_params.reservationData = rows[0];
    next();
  };

  var query = "SELECT ?? FROM ?? INNER JOIN ?? ON ?? = ?? AND ?? = ? AND ?? = ? INNER JOIN ?? ON ?? = ??";

  var params = [
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
    "studioReservations.rsv_id",
    req.query.rsv_id,
		"studio",
		"studioProducts.studio_id",
		"studio.studio_id"
  ];

  logger.debug("SQL Query [SELECT %s FROM %s INNER JOIN %s ON %s=%s AND %s=%s AND %s=%s INNER JOIN %s ON %s=%s]",
		params[0].toString(),
    params[1],
    params[2],
		params[3],
		params[4],
		params[5],
		params[6],
		params[7],
		params[8],
		params[9],
    params[10],
    params[11]
  );

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
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

photographerManager.sendReservationsData = function(req, res){

  res.send({
    "result": "success",
    "data": req.__take_params.reservationsData
  });
};

photographerManager.insertReservation = function(req, res){

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

	var params = [
		"studioReservations",
		{
			product_id: req.query.product_id,
      request_user: req.__take_params.username,
      rsv_date: req.body.rsv_date,
      rsv_start_time: req.body.rsv_start_time,
      rsv_end_time: Number(req.body.rsv_start_time) + 100 * Number(req.body.product_duration)
		}
	];

	logger.debug("SQL Query [INSERT INTO %s SET %s]",
		params[0],
		JSON.stringify(params[1])
	);

	mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.showReservDetailsPage = function(req, res){

  res.render("user/rsv-details", {
    title: confParams.html.title,
    service: confParams.html.service_name,
    isAuth: req.__take_params.isAuth,
    hasStudio: req.__take_params.hasStudio,
    username: req.__take_params.username,
    nickname: req.__take_params.nickname,
		reservationData: req.__take_params.reservationData
  });
};

module.exports = photographerManager;
