/*
Functions for Main Page
*/

//Modules
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);
var confManager = require('../conf/conf');
var confParams = confManager.getParams();
var fs = require('fs');
var multer = require('multer');
var photographerManager = {};

var reqFromOwner = function(req, res){
  if(!(req.isAuthenticated() && (req.user.username == req.params.photographer))){
    res.send('허락된 사진작가만 이용 가능합니다.');
    return 0;
  }
  else{
    return 1;
  }
}

var updateNumberOfProducts = function(req, res){

  var studioUpdateCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var studioUpdateCallbackForSuccess = function(){
    res.send({"result": "success"});
  }

  var query = 'UPDATE ?? SET ? WHERE ?? = ?';
  var params = ['studio', {num_products: req.body.num_products}, 'studio_id', req.body.studio_id];
  logger.debug('SQL Query [UPDATE %s SET %s WHRER %s = %s]', params[0], JSON.stringify(params[1]), params[2], params[3]);

  mysqlDb.doSQLUpdateQuery(query, params, studioUpdateCallbackForSuccess, studioUpdateCallbackForError);
}

var updateNumberOfPortfolios = function(req, res){

  var studioUpdateCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var studioUpdateCallbackForSuccess = function(){
    if(req.body.portfolio_id == "new"){
      res.redirect('/studio/' + req.params.photographer);
    }
    else{
      res.send({"result": "success"});
    }
  }

  var query = 'UPDATE ?? SET ? WHERE ?? = ?';
  var params = ['studio', {num_portfolios: req.body.num_portfolios}, 'studio_id', req.body.studio_id];
  logger.debug('SQL Query [UPDATE %s SET %s WHRER %s = %s]', params[0], JSON.stringify(params[1]), params[2], params[3]);

  mysqlDb.doSQLUpdateQuery(query, params, studioUpdateCallbackForSuccess, studioUpdateCallbackForError);
}

var addPortfolio = function(req, res, studio_id, photo_list, num_photos){

  var portfolioInsertCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var portfolioInsertCallbackForSuccess = function(){
    updateNumberOfPortfolios(req, res);
  }

  var query = 'INSERT INTO ?? SET ?';
  var params = ['studioPortfolios', {studio_id: studio_id, photo_list: photo_list, num_photos: num_photos}];
  logger.debug('SQL Query [INSERT INTO %s SET %s]', params[0], JSON.stringify(params[1]));

  mysqlDb.doSQLInsertQuery(query, params, portfolioInsertCallbackForSuccess, portfolioInsertCallbackForError);
}

photographerManager.showStudio = function(req, res, next){

  var loadProducts = function(req, res, username, studioData){

    var productsSelectCallbackForError = function(err){
      res.send('DB Error');
    }

    var productsSelectCallbackForNoResult = function(){
      res.send('No Products');
    }

    var productsSelectCallbackForSuccess = function(rows, fields){
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
        res.render('photographer/studio', studioOptions);
      }
      else{
        loadPortfolios(req, res, username, studioData, rows);
      }
    }

    var query = 'SELECT * FROM ?? WHERE ?? = ?';
    var params = ['studioProducts', 'studio_id', studioData.studio_id];
    logger.debug('SQL Query [SELECT * FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

    mysqlDb.doSQLSelectQuery(query, params, productsSelectCallbackForSuccess, productsSelectCallbackForNoResult, productsSelectCallbackForError);
  }

  var loadPortfolios = function(req, res, username, studioData, productsData){

    var portfoliosSelectCallbackForError = function(err){
      res.send('DB Error');
    }

    var portfoliosSelectCallbackForNoResult = function(){
      res.send('No Portfolio');
    }

    var portfoliosSelectCallbackForSuccess = function(rows, fields){
      for(var i = 0; i < rows.length; i++){
        rows[i].photo_list = rows[i].photo_list.split(',')[0];
      }

      var studioOptions = {
        title: confParams.html.title,
        service: confParams.html.service_name,
        isAuth: req.isAuthenticated(),
        isOwner: (req.isAuthenticated() && (req.user.username == req.params.photographer)),
        name: username,
        photographerName: req.params.photographer,
        studioData: studioData,
        productsData: productsData,
        portfoliosData: rows
      };
      res.render('photographer/studio', studioOptions);
    }

    var query = 'SELECT * FROM ?? WHERE ?? = ?';
    var params = ['studioPortfolios', 'studio_id', studioData.studio_id];
    logger.debug('SQL Query [SELECT * FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

    mysqlDb.doSQLSelectQuery(query, params, portfoliosSelectCallbackForSuccess, portfoliosSelectCallbackForNoResult, portfoliosSelectCallbackForError);
  }

  var studioSelectCallbackForError = function(err){
    res.send('DB Error');
  }

  var studioSelectCallbackForNoResult = function(){
    res.send('No Studio');
  }

  var studioSelectCallbackForSuccess = function(rows, fields){
    var username = '';
    if(req.isAuthenticated()){
      username = req.user.username;
    }

    if(rows[0].num_products == 0){
      var studioOptions = {
        title: confParams.html.title,
        service: confParams.html.service_name,
        isAuth: req.isAuthenticated(),
        isOwner: (req.isAuthenticated() && (req.user.username == req.params.photographer)),
        name: username,
        photographerName: req.params.photographer,
        studioData: rows[0]
      };
      res.render('photographer/studio', studioOptions);
    }
    else{
      loadProducts(req, res, username, rows[0]);
    }
  }

  var query = 'SELECT * FROM ?? WHERE ?? = ?';
  var params = ['studio', 'username', req.params.photographer];
  logger.debug('SQL Query [SELECT * FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

  mysqlDb.doSQLSelectQuery(query, params, studioSelectCallbackForSuccess, studioSelectCallbackForNoResult, studioSelectCallbackForError);
}

photographerManager.updateSlider = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var sliderPhotoStoragePath = 'public/images/studio';
  var sliderPhotoUrlPath = '/images/studio/';
  var filenamePrefix = req.params.photographer + '_slider_' + Date.now() + '_';

  var storage = multer.diskStorage({
    destination: sliderPhotoStoragePath,
    filename: function(req, file, callback){
      callback(null, filenamePrefix + file.originalname);
    }
  });

  var fileController = multer({
    storage: storage
  }).fields([
    {name: 'flag'},
    {name: '1'},
    {name: '2'},
    {name: '3'},
    {name: '4'},
    {name: '5'}
  ]);

  fileController(req, res, function(err){
    if(!err){
      var sliderPhotoListSelectCallbackForError = function(err){
        res.send('DB Error');
      }

      var sliderPhotoListSelectCallbackForNoResult = function(){
        res.send('DB Error');
      }

      var sliderPhotoListSelectCallbackForSuccess = function(rows, fields){
        var flag = req.body.flag.split(',');
        var currentPhotoList = JSON.parse(rows[0].slider_photo_list);
        var newPhotoList = {};

        for(var i = 0; i < 5; i++){

          var index = String(i + 1);

          switch(flag[i]){
            case '0':
              newPhotoList[index] = currentPhotoList[index];
              break;

            case '1':
              var newFilename = sliderPhotoUrlPath + filenamePrefix + req.files[index][0].originalname;
              if(currentPhotoList[index] != ''){
                fs.unlinkSync('public' + currentPhotoList[index]);
              }
              newPhotoList[index] = newFilename;
              break;

            case '2':
              if(currentPhotoList[index] != ''){
                fs.unlinkSync('public' + currentPhotoList[index]);
              }
              newPhotoList[index] = '';
              break;

            default:
          }
        }

        var numPhoto = 0;

        for(var i = 1; i < 6; i++){
          if(newPhotoList[String(i)] != ''){
            numPhoto++;
          }
          else{
            for(var j = i + 1; j < 6; j++){
              if(newPhotoList[String(j)] != ''){
                newPhotoList[String(i)] = newPhotoList[String(j)];
                newPhotoList[String(j)] = '';
                numPhoto++;
                break;
              }
            }
          }
        }

        updateSliderPhotoList(numPhoto, JSON.stringify(newPhotoList));
      }

      var query = 'SELECT ?? FROM ?? WHERE ?? = ?';
      var params = ['slider_photo_list', 'studio', 'username', req.params.photographer];
      logger.debug('SQL Query [SELECT %s FROM %s WHERE %s=%s]', params[0], params[1], params[2], params[3]);

      mysqlDb.doSQLSelectQuery(query, params, sliderPhotoListSelectCallbackForSuccess, sliderPhotoListSelectCallbackForNoResult, sliderPhotoListSelectCallbackForError);
    }
    else{
      res.send(err);
    }
  });

  var updateSliderPhotoList = function(num, list){

    var sliderPhotoListUpdateCallbackForError = function(err){
      res.send(err);
    }

    var sliderPhotoListUpdateCallbackForSuccess = function(){
      res.redirect('/studio/' + req.params.photographer);
    }

    var query = 'UPDATE ?? SET ? WHERE ?? = ?';
  	var params = ['studio', {num_photo_on_slider: num, slider_photo_list: list}, 'username', req.params.photographer];
    logger.debug('SQL Query [UPDATE %s SET %s WHRER %s = %s]', params[0], JSON.stringify(params[1]), params[2], params[3]);

    mysqlDb.doSQLUpdateQuery(query, params, sliderPhotoListUpdateCallbackForSuccess, sliderPhotoListUpdateCallbackForError);
  }
}

photographerManager.updateIntro = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var introduction = req.body.introduction.replace(/\r\n/gi, '<br>');

  var introUpdateCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var introUpdateCallbackForSuccess = function(){
    res.send({"result": "success"});
  }

  var query = 'UPDATE ?? SET ? WHERE ?? = ?';
  var params = ['studio', {studio_name: req.body.studio_name, tel_num: req.body.tel_num, address: req.body.address, introduction: introduction}, 'username', req.params.photographer];
  logger.debug('SQL Query [UPDATE %s SET %s WHRER %s = %s]', params[0], JSON.stringify(params[1]), params[2], params[3]);

  mysqlDb.doSQLUpdateQuery(query, params, introUpdateCallbackForSuccess, introUpdateCallbackForError);
}

photographerManager.addProduct = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var productDesc = '<li>' + req.body.product_desc.replace(/\r\n/gi, '</li><li>') + '</li>';

  var productInsertCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var productInsertCallbackForSuccess = function(){
    updateNumberOfProducts(req, res);
  }

  var query = 'INSERT INTO ?? SET ?';
  var params = ['studioProducts', {studio_id: req.body.studio_id, product_name: req.body.product_name, product_price: req.body.product_price, product_desc: productDesc}];
  logger.debug('SQL Query [INSERT INTO %s SET %s]', params[0], JSON.stringify(params[1]));

  mysqlDb.doSQLInsertQuery(query, params, productInsertCallbackForSuccess, productInsertCallbackForError);
}

photographerManager.updateProduct = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var productDesc = '<li>' + req.body.product_desc.replace(/\r\n/gi, '</li><li>') + '</li>';

  var productUpdateCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var productUpdateCallbackForSuccess = function(){
    res.send({"result": "success"});
  }

  var query = 'UPDATE ?? SET ? WHERE ?? = ?';
  var params = ['studioProducts', {product_name: req.body.product_name, product_price: req.body.product_price, product_desc: productDesc}, 'product_id', req.body.product_id];
  logger.debug('SQL Query [UPDATE %s SET %s WHRER %s = %s]', params[0], JSON.stringify(params[1]), params[2], params[3]);

  mysqlDb.doSQLUpdateQuery(query, params, productUpdateCallbackForSuccess, productUpdateCallbackForError);
}

photographerManager.deleteProduct = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var productDeleteCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var productDeleteCallbackForSuccess = function(){
    updateNumberOfProducts(req, res);
  }

  var query = 'DELETE FROM ?? WHERE ?? = ?';
	var params = ['studioProducts', 'product_id', req.body.product_id];
  logger.debug('SQL Query [DELETE FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

  mysqlDb.doSQLDeleteQuery(query, params, productDeleteCallbackForSuccess, productDeleteCallbackForError);
}

photographerManager.updatePortfolio = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var portfolioStoragePath = 'public/images/studio';
  var portfolioUrlPath = '/images/studio/';
  var filenamePrefix = req.params.photographer + '_portfolio_' + Date.now() + '_';

  var storage = multer.diskStorage({
    destination: portfolioStoragePath,
    filename: function(req, file, callback){
      callback(null, filenamePrefix + file.originalname);
    }
  });

  var fileController = multer({
    storage: storage
  }).fields([
    {name: 'portfolio_id'},
    {name: 'photo_list'},
    {name: 'del_photo_list'},
    {name: 'photofile'}
  ]);

  fileController(req, res, function(err){
    if(!err){
      var numPhoto;
      var newPhotoList = req.body.photo_list.split(',');
      var delPhotoList = req.body.del_photo_list.split(',');

      if(newPhotoList[0] == ""){
        newPhotoList = [];
      }

      if(req.files['photofile']){
        for(var i = 0; i < req.files['photofile'].length; i++){
          newPhotoList.push(portfolioUrlPath + filenamePrefix + req.files['photofile'][i].originalname);
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
          fs.unlinkSync('public' + delPhotoList[i]);
        }
      }

      if(req.body.portfolio_id == "new"){
        addPortfolio(req, res, req.body.studio_id, newPhotoList.toString(), numPhoto);
      }
      else{
        var portfolioUpdateCallbackForError = function(err){
          res.send(err);
        }

        var portfolioUpdateCallbackForSuccess = function(){
          res.redirect('/studio/' + req.params.photographer);
        }

        var query = 'UPDATE ?? SET ? WHERE ?? = ?';
      	var params = ['studioPortfolios', {photo_list: newPhotoList.toString(), num_photos: numPhoto}, 'portfolio_id', req.body.portfolio_id];
        logger.debug('SQL Query [UPDATE %s SET %s WHRER %s = %s]', params[0], JSON.stringify(params[1]), params[2], params[3]);

        mysqlDb.doSQLUpdateQuery(query, params, portfolioUpdateCallbackForSuccess, portfolioUpdateCallbackForError);
      }
    }
    else{
      res.send(err);
    }
  });
}

photographerManager.deletePortfolio = function(req, res, next){

  if(reqFromOwner(req, res) != 1){
    return;
  }

  var portfolioDeleteCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var portfolioDeleteCallbackForSuccess = function(){
    var photoList = req.body.photo_list.split(',');
    for(var i = 0; i < photoList.length; i++){
      fs.unlinkSync('public' + photoList[i]);
    }

    updateNumberOfPortfolios(req, res);
  }

  var query = 'DELETE FROM ?? WHERE ?? = ?';
	var params = ['studioPortfolios', 'portfolio_id', req.body.portfolio_id];
  logger.debug('SQL Query [DELETE FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

  mysqlDb.doSQLDeleteQuery(query, params, portfolioDeleteCallbackForSuccess, portfolioDeleteCallbackForError);
}

photographerManager.getPortfolioPhotoList = function(req, res, next){

  var photoListSelectCallbackForError = function(err){
    res.send({
      "result": "fail",
      "text": err
    });
  }

  var photoListSelectCallbackForNoResult = function(){
    res.send({
      "result": "fail",
      "text": "No data"
    });
  }

  var photoListSelectCallbackForSuccess = function(rows, fields){
    res.send({
      "result": "success",
      "body": rows[0]
    });
  }

  var query = 'SELECT ?? FROM ?? WHERE ?? = ?';
  var params = ['photo_list', 'studioPortfolios', 'portfolio_id', req.params.portfolio_id];
  logger.debug('SQL Query [SELECT %s FROM %s WHERE %s=%s]', params[0], params[1], params[2], params[3]);

  mysqlDb.doSQLSelectQuery(query, params, photoListSelectCallbackForSuccess, photoListSelectCallbackForNoResult, photoListSelectCallbackForError);
}

module.exports = photographerManager;
