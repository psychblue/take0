/*
Main Router
*/

//Modules
var express = require('express');

//HTML Variables
var MAIN_TITLE = 'T.A.K.E.';

//Express Router Settings
var router = express.Router();

/*
Routing Logics
*/

// "/" - Main Page
router.get('/', function(req, res, next){
	//Check User Login
	if(req.isAuthenticated()){
		var username = req.user.username;
	}else{
		var username = '';
	}
	var indexOptions = {title: MAIN_TITLE, isAuth: req.isAuthenticated(), name: username};
	res.render('index', indexOptions);
});

// "/login" - User Login Page
router.get('/login', function(req, res, next){
	//Check User Login
	if(req.isAuthenticated()){
		res.send('Already logged in...');
	}else{
		var loginOptions = {title: MAIN_TITLE};
		res.render('login', loginOptions);
	}
});

// '/login' post
router.post('/login', require('./login').loginAuth);

// "/logout"
router.get('/logout', function(req, res, next){
	//Session Logout
	req.logout();
	res.redirect('/');
});

// "/login/kakao" - Kakao Login Redirect
router.get('/login/kakao', require('./login').loginByKakao);
// "/login/kakao/callback" - Kakao Login Callback
router.get('/login/kakao/callback', require('./login').loginByKakaoCallback);

// "/join" - User Join Page
router.get('/join', function(req, res, next){
	// Check User Login
	if(req.isAuthenticated()){
		res.send('Already joined...');
	}else{
		var joinOptions = {title: MAIN_TITLE};
		res.render('join', joinOptions);
	}
});

// "/join" post
router.post('/join', require('./join').joinUser());

// "/withdraw" - User Withdraw
router.get('/withdraw', function(req, res, next){
	var withdrawOptions = {title: MAIN_TITLE};
	res.render('withdraw', withdrawOptions);
});

// "/withdraw/confirmed"
router.get('/withdraw/confirmed', require('./join').withdrawUser());

// "/withdraw/success"
router.get('/withdraw/success', function(req, res, next){
	var withdrawSuccessOptions = {title: MAIN_TITLE};
	res.render('withdraw/success', withdrawSuccessOptions);
});

module.exports = router;
