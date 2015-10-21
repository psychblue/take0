//Modules
var express = require('express');

var router = express.Router();

//HTML Variables
var MAIN_TITLE = 'T.A.K.E.';

module.exports = function(passport, mysqlDb){
	//Route
	// "/"
	router.get('/', function(req, res, next){
		if(req.isAuthenticated()){
			var username = req.user.username;
		}else{
			var username = '';
		}
		var indexOptions = {title: MAIN_TITLE, isAuth: req.isAuthenticated(), name: username};
		res.render('index', indexOptions);
	});

	// "/login"
	router.get('/login', function(req, res, next){
		if(req.isAuthenticated()){
			res.send('Already logged in...');
		}else{
			var loginOptions = {title: MAIN_TITLE};
			res.render('login', loginOptions);
		}
	});

	router.post('/login', require('./login').loginAuth(passport));

	router.get('/logout', function(req, res, next){
		req.logout();
		res.redirect('/');
	});

	router.get('/login/kakao', require('./login').loginByKakao);
	router.get('/login/kakao/callback', require('./login').loginByKakaoCallback);

	router.get('/join', function(req, res, next){
		if(req.isAuthenticated()){
			res.send('Already joined...');
		}else{
			var joinOptions = {title: MAIN_TITLE};
			res.render('join', joinOptions);
		}
	});

	router.post('/join', require('./join').joinUser(mysqlDb));

	router.get('/withdraw', function(req, res, next){
		var withdrawOptions = {title: MAIN_TITLE};
		res.render('withdraw', withdrawOptions);
	});

	router.get('/withdraw_confirmed', require('./join').withdrawUser(mysqlDb));

	router.get('/withdraw_success', function(req, res, next){
		var withdrawSuccessOptions = {title: MAIN_TITLE};
		res.render('withdraw_success', withdrawSuccessOptions);
	});

	return router;
}
