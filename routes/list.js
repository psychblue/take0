/*
Functions for Main Page
*/

//Modules
var mysqlDb = require('../database/mysqldb');
var logger = require('../logger/logger')(__filename);
var listManager = {};

listManager.showList = function(req, res, next){

  var listSelectCallbackForError = function(err){
    res.send('DB Error');
  }

  var listSelectCallbackForNoList = function(){
    res.send('Empty');
  }

  var listSelectCallbackForList = function(rows, fields){
    //logger.debug(JSON.stringify(rows));
    res.render('list/list', {data: rows});
  }

  if(req.body.category == "wedding"){
    if(req.body.region){
      
    }
    else{

    }
  }
}

module.exports = listManager;
