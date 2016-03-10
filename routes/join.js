/*
Functions for User Join & Withdraw Page
*/

//Modules
var logger = require('../logger/logger')(__filename);
var bcrypt = require('bcrypt-node');
var mysqlDb = require('../database/mysqldb');
var confParams = require('../conf/conf').getParams();
var loginManager = require('./login');
var joinManager = {};

/*
Show Join Page
*/
joinManager.showJoinPage = function(req, res, next){
  // Check User Login
	if(req.isAuthenticated()){
		res.send('Already joined...');
	}else{
		var joinOptions = {title: confParams.html.title, service: confParams.html.service_name};
		res.render('join/join', joinOptions);
	}
}

/*
Password Encrytion Function
*/
joinManager.encryptPassword = function(seed){
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(seed, salt);
}

/*
User Join Function
*/
joinManager.joinUser = function(req, res, next){
  //Password Encryption
  var encryptedPassword;
  if(!req.body.kakao){
    encryptedPassword = joinManager.encryptPassword(req.body.password);
  }
  else{
    encryptedPassword = joinManager.encryptPassword(req.body.username);
  }
  //Check Submitted Fields
  if(isAvailField(req, res)){

    var joinUserInsertCallbackForError = function(err){
      if(err.code == "ER_DUP_ENTRY"){
        res.send({"result": "fail", "text": "아이디가 이미 존재합니다."});
      }
      else{
        res.send({"result": "fail", "text": "죄송합니다. 서비스에 문제가 발생하였습니다. 다시 시도해주세요."});
      }
    }

    var joinUserInsertCallbackForSuccess = function(){
      var user = {'username': req.body.username};
      //Session Login
      req.login(user, function(err){
        //Session Error Case
        if(err){
          logger.error(err.toString());
          return res.send({"result": "fail", "text": "죄송합니다. 서비스에 문제가 발생하였습니다. 다시 시도해주세요."});
        }else{
          //Redirect to Main Page
          return res.send({"result": "success"});
        }
      });
    }

    var query = 'INSERT INTO ?? SET ?';
  	var params = ['takeUser', {username: req.body.username, password: encryptedPassword, email: req.body.email}];
    logger.debug('SQL Query [INSERT INTO %s SET %s]', params[0], JSON.stringify(params[1]));

    mysqlDb.doSQLInsertQuery(query, params, joinUserInsertCallbackForSuccess, joinUserInsertCallbackForError);
  }
  //Fields Error
  else{
    logger.error("[User Login] Submitted Field Error");
  }
}

/*
Show User Withdraw Page
*/
joinManager.showWithdrawPage = function(req, res, next){

  var withdrawOptions = {
		title: confParams.html.title,
		service: confParams.html.service_name,
		infoText: '<a href="/">' + confParams.html.service_name + "</a>를 떠나시겠습니까?",
		infoLink: '<a href="/withdraw/confirmed" class="font-darkgrey">네</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="/" class="font-darkgrey" onclick="history.back()">아니오</a>'
	};
	res.render('info', withdrawOptions);
}

/*
User Withdraw Function
*/
joinManager.withdrawUser = function(req, res, next){

	if(!req.isAuthenticated()){
		res.redirect('/');

		return;
	}

  var withdrawUserDeleteCallbackForError = function(err){
    res.send('Error');
  }

  var withdrawUserDeleteCallbackForSuccess = function(){
    //Session Logout
    req.logout();
    //Redirecting to Success Page
    res.redirect('/withdraw/success');
  }

  var query = 'DELETE FROM ?? WHERE ?? = ?';
	var params = ['takeUser', 'username', req.user.username];
  logger.debug('SQL Query [DELETE FROM %s WHERE %s=%s]', params[0], params[1], params[2]);

  mysqlDb.doSQLDeleteQuery(query, params, withdrawUserDeleteCallbackForSuccess, withdrawUserDeleteCallbackForError);
}

/*
Show User Withdraw Success Page
*/
joinManager.showWithdrawSuccessPage = function(req, res, next){

  var withdrawSuccessOptions = {title: confParams.html.title};
	res.render('withdraw/success', withdrawSuccessOptions);
}

/*
User Join Field Availability Check Function
*/
function isAvailField(req, res){
  return 1;
}

module.exports = joinManager;
