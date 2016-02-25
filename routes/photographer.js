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
    var studioOptions = {
      title: confParams.html.title,
      service: confParams.html.service_name,
      isAuth: req.isAuthenticated(),
      isOwner: (req.isAuthenticated() && (req.user.username == req.params.photographer)),
      name: username,
      photographerName: req.params.photographer,
      data: rows[0]
    };
    res.render('photographer/studio', studioOptions);
  }

  var query = 'SELECT * FROM ?? WHERE ?? = ?';
  var params = ['studio', 'username', req.params.photographer];
  logger.debug('SQL Query [SELECT * FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

  mysqlDb.doSQLSelectQuery(query, params, studioSelectCallbackForSuccess, studioSelectCallbackForNoResult, studioSelectCallbackForError);
}

photographerManager.updateSlider = function(req, res, next){

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
      res.redirect('/' + req.params.photographer);
    }

    var query = 'UPDATE ?? SET ? WHERE ?? = ?';
  	var params = ['studio', {num_photo_on_slider: num, slider_photo_list: list}, 'username', req.params.photographer];
    logger.debug('SQL Query [UPDATE %s SET %s WHRER %s = %s]', params[0], JSON.stringify(params[1]), params[2], params[3]);

    mysqlDb.doSQLUpdateQuery(query, params, sliderPhotoListUpdateCallbackForSuccess, sliderPhotoListUpdateCallbackForError);
  }
}

module.exports = photographerManager;
