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

    }
  }

  var query = 'SELECT * FROM ?? WHERE ?? = ?';
  var params = ['studioProducts', 'studio_id', studioData.studio_id];
  logger.debug('SQL Query [SELECT * FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

  mysqlDb.doSQLSelectQuery(query, params, productsSelectCallbackForSuccess, productsSelectCallbackForNoResult, productsSelectCallbackForError);
}

photographerManager.showStudio = function(req, res, next){

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

  var sliderPhotoStoragePath = 'public/images/main';
  var sliderPhotoUrlPath = '/images/main/';
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

module.exports = photographerManager;
