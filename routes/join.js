/*
Functions for User Join & Withdraw Page
*/

//Modules
var logger = require('../logger/logger')(__filename);
var mysqlDb = require('../database/mysqldb');
var loginManager = require('./login');
var joinManager = {};

/*
User Join Function
*/
joinManager.joinUser = function(req, res, next){
  //Password Encryption
  var encryptedPassword = loginManager.encryptPassword(req);
  //Check Submitted Fields
  if(isAvailField(req, res)){

    var joinUserInsertCallbackForError = function(err){
      if(err.code == "ER_DUP_ENTRY"){
        res.send("Username is Already Exist");
      }
      else{
        res.send("Error");
      }
    }

    var joinUserInsertCallbackForSuccess = function(){
      var user = {'username': req.body.username};
      //Session Login
      req.login(user, function(err){
        //Session Error Case
        if(err){
          logger.error(err.toString());
          return res.send(err);
        }else{
          //Redirect to Main Page
          return res.redirect('/');
        }
      });
    }

    mysqlDb.doSQLInsertQuery('takeUser', {username: req.body.username, password: encryptedPassword}, joinUserInsertCallbackForSuccess, joinUserInsertCallbackForError);
  }
  //Fields Error
  else{
    logger.error("[User Login] Submitted Field Error");
  }
}

/*
User Withdraw Function
*/
joinManager.withdrawUser = function(req, res, next){

  var withdrawUserDeleteCallbackForError = function(err){
    res.send('Error');
  }

  var withdrawUserDeleteCallbackForSuccess = function(){
    //Session Logout
    req.logout();
    //Redirecting to Success Page
    res.redirect('/withdraw/success');
  }

  mysqlDb.doSQLDeleteQuery('takeUser', 'username', req.user.username, withdrawUserDeleteCallbackForSuccess, withdrawUserDeleteCallbackForError);
}

/*
User Join Field Availability Check Function
*/
function isAvailField(req, res){
  if(!req.body.password || !req.body.username){
    res.send("Enter Username or Password");
    return 0;
  }
  else{
    return 1;
  }
}

module.exports = joinManager;
