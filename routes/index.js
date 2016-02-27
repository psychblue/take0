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
router.get('/', mainManager.showMainPage);
// Main Photographer List
router.post('/todaystudiolist', mainManager.showTodayStudioList);

// '/login'
router.get('/login', loginManager.showLoginPopup);
// '/login' post
router.post('/login', loginManager.loginAuth);
// "/logout"
router.get('/logout', loginManager.logout);
// "/login/kakao" - Kakao Login Redirect
router.get('/login/kakao', loginManager.loginByKakao);
// "/login/kakao/callback" - Kakao Login Callback
router.get('/login/kakao/callback', loginManager.loginByKakaoCallback);

// "/join" - User Join Page
router.get('/join', joinManager.showJoinPage);
// "/join" post
router.post('/join', joinManager.joinUser);
// "/withdraw" - User Withdraw
router.get('/withdraw', joinManager.showWithdrawPage);
// "/withdraw/confirmed"
router.get('/withdraw/confirmed', joinManager.withdrawUser);
// "/withdraw/success"
router.get('/withdraw/success', joinManager.showWithdrawSuccessPage);

// "/list" post
router.post('/list', listManager.showList);

// Studio
router.get('/studio/:photographer', photographerManager.showStudio);

// Studio Photo Slider Update
router.post('/studio/:photographer/slider/update', photographerManager.updateSlider);

// Studio Introduction Update
router.post('/studio/:photographer/intro/update', photographerManager.updateIntro);

module.exports = router;
