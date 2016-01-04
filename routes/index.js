/*
Main Router
*/

//Modules
var express = require('express');
var loginManager = require('./login');
var joinManager = require('./join');
var mainManager = require('./main');
var listManager = require('./list');
var photographerManager = require('./photographer');
var confManager = require('../conf/conf');
var confParams = confManager.getParams();

//Express Router Settings
var router = express.Router();

/*
Routing Logics
*/

// "/" - Main Page
router.get('/', function(req, res, next){
	//Check User Login
	var username = '';
	if(req.isAuthenticated()){
		username = req.user.username;
	}
	var indexOptions = {title: confParams.html.title, service: confParams.html.service_name, isAuth: req.isAuthenticated(), name: username};
	res.render('index', indexOptions);
});

// Main Photographer List
router.post('/mainList', mainManager.showPhotograherList);

// '/login'
router.get('/login', function(req, res, next){
	var loginOptions = {service: confParams.html.service_name};
	res.render('login/login', loginOptions);
});

// '/login' post
router.post('/login', loginManager.loginAuth);

// "/logout"
router.get('/logout', function(req, res, next){
	//Session Logout
	req.logout();
	res.redirect('/');
});

// "/login/kakao" - Kakao Login Redirect
router.get('/login/kakao', loginManager.loginByKakao);
// "/login/kakao/callback" - Kakao Login Callback
router.get('/login/kakao/callback', loginManager.loginByKakaoCallback);

// "/join" - User Join Page
router.get('/join', function(req, res, next){
	// Check User Login
	if(req.isAuthenticated()){
		res.send('Already joined...');
	}else{
		var joinOptions = {title: confParams.html.title, service: confParams.html.service_name};
		res.render('join', joinOptions);
	}
});

// "/join" post
router.post('/join', joinManager.joinUser);

// "/withdraw" - User Withdraw
router.get('/withdraw', function(req, res, next){
	var withdrawOptions = {title: confParams.html.title, service: confParams.html.service_name};
	res.render('withdraw', withdrawOptions);
});

// "/withdraw/confirmed"
router.get('/withdraw/confirmed', joinManager.withdrawUser);

// "/withdraw/success"
router.get('/withdraw/success', function(req, res, next){
	var withdrawSuccessOptions = {title: confParams.html.title};
	res.render('withdraw/success', withdrawSuccessOptions);
});

// "/search"
router.get('/searchbar', function(req, res, next){
	res.render('search/search-bar');
});

// "/list" post
router.post('/list', listManager.showList);

// "/photographer"
router.get('/:photographer', photographerManager.showStudio);

module.exports = router;
