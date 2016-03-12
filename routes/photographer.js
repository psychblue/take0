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

var reqFromOwner = function(req, res){
  if(!(req.isAuthenticated() && (req.user.username == req.params.photographer))){
    httpUtil.sendInfoPage(req, res, {
  		infoText: "허락된 사진작가가 아닙니다.",
  		infoLink: "<a href='/' class='font-darkgrey'>홈으로</a>"
  	});

    return 0;
  }
  else{
    return 1;
  }
};

var hasStudio = function(req, res, callback){

  var query = "SELECT ?? FROM ?? WHERE ?? = ?";

  var params = ["has_studio", "takeUser", "username", req.user.username];

  logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    httpUtil.sendNoDataFromDBPage(req, res);
  };

  var callbackForSuccess = callback;

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

var updateHasStuido = function(req, res){

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = ["takeUser", {has_studio: 1}, "username", req.user.username];

  logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
    params[0],
    JSON.stringify(params[1]),
    params[2],
    params[3]
  );

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    res.redirect("/studio/" + req.user.username);
  };

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
}

var updateNumberOfProducts = function(req, res){

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

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    res.send({"result": "success"});
  };

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

var updateNumberOfPortfolios = function(req, res){

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

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

var addPortfolio = function(req, res, studio_id, photo_list, num_photos){

  var query = "INSERT INTO ?? SET ?";

  var params = [
    "studioPortfolios",
    {
      studio_id: studio_id,
      photo_list: photo_list,
      num_photos: num_photos
    }
  ];

  logger.debug("SQL Query [INSERT INTO %s SET %s]",
    params[0],
    JSON.stringify(params[1])
  );

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    updateNumberOfPortfolios(req, res);
  };

  mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.showStudio = function(req, res, next){

  var loadProducts = function(req, res, username, studioData){

    var query = "SELECT * FROM ?? WHERE ?? = ?";

    var params = ["studioProducts", "studio_id", studioData.studio_id];

    logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s]",
      params[0],
      params[1],
      params[2]
    );

    var callbackForError = function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    };

    var callbackForNoResult = function(){
      httpUtil.sendNoDataFromDPage(req, res);
    };

    var callbackForSuccess = function(rows, fields){
      if(studioData.num_portfolios == 0){
        var studioOptions = {
          title: confParams.html.title,
          service: confParams.html.service_name,
          isAuth: req.isAuthenticated(),
          isOwner: (req.isAuthenticated() && (req.user.username == req.params.photographer)),
          name: username,
          photographerName: req.params.photographer,
          studioData: studioData,
          productsData: rows
        };
        res.render("photographer/studio", studioOptions);
      }
      else{
        loadPortfolios(req, res, username, studioData, rows);
      }
    };

    mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
  };

  var loadPortfolios = function(req, res, username, studioData, productsData){

    var query = "SELECT * FROM ?? WHERE ?? = ?";

    var params = ["studioPortfolios", "studio_id", studioData.studio_id];

    logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s]",
      params[0],
      params[1],
      params[2]
    );

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
        isAuth: req.isAuthenticated(),
        isOwner: (req.isAuthenticated() && (req.user.username == req.params.photographer)),
        name: username,
        photographerName: req.params.photographer,
        studioData: studioData,
        productsData: productsData,
        portfoliosData: rows
      });
    };

    mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
  };

  var query = "SELECT * FROM ?? WHERE ?? = ?";

  var params = ["studio", "username", req.params.photographer];

  logger.debug("SQL Query [SELECT * FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2]
  );

  var callbackForError = function(err){
    httpUtil.sendDBErrorPage(req, res, err);
  };

  var callbackForNoResult = function(){
    httpUtil.send404Page(req, res);
  };

  var callbackForSuccess = function(rows, fields){
    var isAuth = req.isAuthenticated();

    var username = isAuth ? req.user.username : "";

    if(rows[0].num_products == 0){
      if(rows[0].num_portfolios == 0){
        res.render("photographer/studio", {
          title: confParams.html.title,
          service: confParams.html.service_name,
          isAuth: req.isAuthenticated(),
          isOwner: (req.isAuthenticated() && (req.user.username == req.params.photographer)),
          name: username,
          photographerName: req.params.photographer,
          studioData: rows[0]
        });
      }
      else{
        loadPortfolios(req, res, username, rows[0], undefined);
      }
    }
    else{
      loadProducts(req, res, username, rows[0]);
    }
  };

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

photographerManager.makeStudio = function(req, res, next){

  if(req.isAuthenticated()){

    var callbackForSuccess = function(rows, fields){
      if(rows[0].has_studio == 1){
        httpUtil.sendInfoPage(req, res, {
          infoText: "이미 개설된 스튜디오가 있습니다.",
          infoLink: "<a href='/studio/" + req.user.username + "' class='font-darkgrey'>스튜디오 바로가기</a>"
        });
      }
      else{
        res.render("photographer/make-studio", {
          title: confParams.html.title,
          service: confParams.html.service_name,
          name: req.user.username
        });
      }
    };

    hasStudio(req, res, callbackForSuccess);
  }
  else{
    res.render("login/login-page", {
      title: confParams.html.title,
      service: confParams.html.service_name,
      redirectUrl: "/makestudio"
    });
  }
};

photographerManager.addStudio = function(req, res, next){

  if(req.isAuthenticated()){
    var insertStudio = function(req, res){
      var query = "INSERT INTO ?? SET ?";

      var params = ["studio", {
        studio_name: req.body.studio_name,
        username: req.user.username,
        introduction: req.body.introduction,
        address: req.body.address,
        tel_num: req.body.tel_num
      }];

      logger.debug("SQL Query [INSERT INTO %s SET %s]",
        params[0],
        JSON.stringify(params[1])
      );

      var callbackForError = function(err){
        res.send({
          "result": "fail",
          "text": err
        });
      };

      var callbackForSuccess = function(){
        updateHasStuido(req, res);
      };

      mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
    };

    var callbackForSuccess = function(rows, fields){
      if(rows[0].has_studio == 1){
        httpUtil.sendInfoPage(req, res, {
          infoText: "이미 개설된 스튜디오가 있습니다.",
          infoLink: "<a href='/studio/" + req.user.username + "' class='font-darkgrey'>스튜디오 바로가기</a>"
        });
      }
      else{
        insertStudio(req, res);
      }
    };

    hasStudio(req, res, callbackForSuccess);
  }
  else{
    res.render("login/login-page", {
      title: confParams.html.title,
      service: confParams.html.service_name,
      redirectUrl: "/makestudio"
    });
  }
};

photographerManager.updateSlider = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var sliderPhotoStoragePathPrefix = confParams.file.slider_photo_storage_path_prefix;
  var sliderPhotoUrlPathPrefix = confParams.file.slider_photo_url_path_prefix;
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
      var query = "SELECT ?? FROM ?? WHERE ?? = ?";

      var params = ["slider_photo_list", "studio", "username", req.params.photographer];

      logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
        params[0],
        params[1],
        params[2],
        params[3]
      );

      var callbackForError = function(err){
        httpUtil.sendDBErrorPage(req, res, err);
      };

      var callbackForNoResult = function(){
        httpUtil.sendNoDataFromDBPage(req, res);
      };

      var callbackForSuccess = function(rows, fields){
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
                               + filenamePrefix
                               + req.files[index][0].originalname;

              if(currentPhotoList[index] != ""){
                fileUtil.deleteImageFile(currentPhotoList[index]);
              }
              newPhotoList[index] = newFilename;
              break;

            case "2":
              if(currentPhotoList[index] != ""){
                fileUtil.deleteImageFile(currentPhotoList[index]);
              }
              newPhotoList[index] = "";
              break;

            default:
          }
        }

        var numPhoto = 0;

        for(var i = 1; i < 6; i++){
          if(newPhotoList[String(i)] != ""){
            numPhoto++;
          }
          else{
            for(var j = i + 1; j < 6; j++){
              if(newPhotoList[String(j)] != ""){
                newPhotoList[String(i)] = newPhotoList[String(j)];
                newPhotoList[String(j)] = "";
                numPhoto++;
                break;
              }
            }
          }
        }

        updateSliderPhotoList(numPhoto, JSON.stringify(newPhotoList));
      };

      mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
    }
    else{
      res.send(err);
    }
  });

  var updateSliderPhotoList = function(num, list){

    var query = "UPDATE ?? SET ? WHERE ?? = ?";

  	var params = [
      "studio",
      {
        num_photo_on_slider: num,
        slider_photo_list: list
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

    var callbackForError = function(err){
      httpUtil.sendDBErrorPage(req, res, err);
    };

    var callbackForSuccess = function(){
      res.redirect("/studio/" + req.params.photographer);
    };

    mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
  }
};

photographerManager.updateIntro = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

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

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    res.send({"result": "success"});
  };

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.addProduct = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

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
      product_desc: productDesc
    }
  ];

  logger.debug("SQL Query [INSERT INTO %s SET %s]",
    params[0],
    JSON.stringify(params[1])
  );

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    updateNumberOfProducts(req, res);
  };

  mysqlDb.doSQLInsertQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.updateProduct = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var productDesc = "<li>"
                    + req.body.product_desc.replace(/\r\n/gi, "</li><li>")
                    + "</li>";

  var query = "UPDATE ?? SET ? WHERE ?? = ?";

  var params = [
    "studioProducts",
    {
      product_name: req.body.product_name,
      product_price: req.body.product_price,
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

  var callbackForError = function(err){
      res.send({
        "result": "fail",
        "text": err
      });
    };

  var callbackForSuccess = function(){
    res.send({"result": "success"});
  };

  mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.deleteProduct = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var query = "DELETE FROM ?? WHERE ?? = ?";

	var params = ["studioProducts", "product_id", req.body.product_id];

  logger.debug("SQL Query [DELETE FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2]
  );

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    updateNumberOfProducts(req, res);
  };

  mysqlDb.doSQLDeleteQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.updatePortfolio = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var portfolioStoragePathPrefix = confParams.file.portfolio_storage_path_prefix;
  var portfolioUrlPathPrefix = confParams.file.portfolio_url_path_prefix;
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
      var numPhoto;
      var newPhotoList = req.body.photo_list.split(",");
      var delPhotoList = req.body.del_photo_list.split(",");

      if(newPhotoList[0] == ""){
        newPhotoList = [];
      }

      if(req.files["photofile"]){
        for(var i = 0; i < req.files["photofile"].length; i++){
          newPhotoList.push(portfolioUrlPathPrefix + filenamePrefix + req.files["photofile"][i].originalname);
        }
      }

      if(newPhotoList[0] != ""){
        numPhoto = newPhotoList.length;
      }
      else{
        numPhoto = 0;
      }

      if(delPhotoList[0] != ""){
        for(var i = 0; i < delPhotoList.length; i++){
          fileUtil.deleteImageFile(delPhotoList[i]);
        }
      }

      if(req.body.portfolio_id == "new"){
        addPortfolio(req, res, req.body.studio_id, newPhotoList.toString(), numPhoto);
      }
      else{
        var query = "UPDATE ?? SET ? WHERE ?? = ?";

      	var params = [
          "studioPortfolios",
          {photo_list: newPhotoList.toString(), num_photos: numPhoto},
          "portfolio_id",
          req.body.portfolio_id
        ];

        logger.debug("SQL Query [UPDATE %s SET %s WHRER %s = %s]",
          params[0],
          JSON.stringify(params[1]),
          params[2],
          params[3]
        );

        var callbackForError = function(err){
          httpUtil.sendDBErrorPage(req, res, err);
        };

        var callbackForSuccess = function(){
          res.redirect("/studio/" + req.params.photographer);
        };

        mysqlDb.doSQLUpdateQuery(query, params, callbackForSuccess, callbackForError);
      }
    }
    else{
      res.send(err);
    }
  });
};

photographerManager.deletePortfolio = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var query = "DELETE FROM ?? WHERE ?? = ?";

	var params = ["studioPortfolios", "portfolio_id", req.body.portfolio_id];

  logger.debug("SQL Query [DELETE FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2]
  );

  var callbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  };

  var callbackForSuccess = function(){
    var photoList = req.body.photo_list.split(",");
    for(var i = 0; i < photoList.length; i++){
      fileUtil.deleteImageFile(photoList[i]);
    }

    updateNumberOfPortfolios(req, res);
  };

  mysqlDb.doSQLDeleteQuery(query, params, callbackForSuccess, callbackForError);
};

photographerManager.getPortfolioPhotoList = function(req, res, next){

  var query = "SELECT ?? FROM ?? WHERE ?? = ?";

  var params = ["photo_list", "studioPortfolios", "portfolio_id", req.params.portfolio_id];

  logger.debug("SQL Query [SELECT %s FROM %s WHERE %s=%s]",
    params[0],
    params[1],
    params[2],
    params[3]
  );

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

  mysqlDb.doSQLSelectQuery(query, params, callbackForSuccess, callbackForNoResult, callbackForError);
};

module.exports = photographerManager;
