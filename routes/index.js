/*
Main Router
*/

//Modules
var express = require("express");
var loginManager = require("./login");
var joinManager = require("./join");
var mainManager = require("./main");
var userManager = require("./user");
var photographerManager = require("./photographer");
var confManager = require("../conf/conf");
var httpUtil = require("../util/http-util");
var confParams = confManager.getParams();
var logger = require("../logger/logger")(__filename);

//Express Router Settings
var router = express.Router();

//Routing Middleware
router.use(function(req, res, next){
  if(req.user !== undefined){
    logger.debug("User request is on [ %s ] by [ \"%s\" ]", req.path, req.user.username);
  }
  else{
    logger.debug("User request is on [ %s ] by [ Anonymous ]", req.path);
  }
  next();
});
router.use(userManager.loadDefaultTakeParams);

/*
Routing Logics
*/

// "/" - Main Page
router.get("/",
  mainManager.showMainPage
);
// Main Photographer List
router.post("/todaystudiolist",
  mainManager.showTodayStudioList
);

// Login Popup
/*
router.get("/loginpopup",
  loginManager.showLoginPopup
);
*/
// login page
router.get("/login",
  loginManager.showLoginPage
);
// "/login" post
router.post("/login",
  loginManager.loginAuth
);
// "/logout"
router.get("/logout",
  loginManager.loadUserFrom,
  loginManager.logout
);
// Get Access Token
router.get("/userfrom",
  loginManager.loadUserFrom,
  loginManager.sendUserFrom
);
// "/login/kakao" - Kakao Login Redirect
/*
router.get("/login/kakao",
  loginManager.loginByKakao
);
*/
// "/login/kakao/callback" - Kakao Login Callback
router.post("/login/kakao",
  //loginManager.getAccessToken,
  loginManager.getKakaoUser,
  loginManager.joinKakaoUser,
  loginManager.updateAccessToken
);

// "/join" - User Join Page
router.get("/join",
  joinManager.showJoinPage
);
// ID, Pasword Join
router.get("/join/takeuser",
  joinManager.showTakeJoinPage
);
// Kakao User Join
router.get("/join/kakaouser",
  joinManager.showKakaoJoinPage
);
// "/join" post
router.post("/join",
  joinManager.joinUser
);
// Welcome
router.get("/join/welcome",
  joinManager.showWelcomePage
);
// "/withdraw" - User Withdraw
router.get("/withdraw",
  joinManager.showWithdrawPage
);
// "/withdraw/confirmed"
router.get("/withdraw/confirmed",
  joinManager.deleteUserFiles,
  joinManager.deleteUser
);
// "/withdraw/success"
router.get("/withdraw/success",
  joinManager.showWithdrawSuccessPage
);

// User Info
router.get("/user/userinfo",
  userManager.checkLogin,
  userManager.loadUserInfo,
  userManager.showUserInfoPage
);
// User Info Update (AJAX)
router.post("/user/userinfo/update",
  userManager.checkLoginOnAjax,
  userManager.updateUserInfo
);
// Password
router.get("/user/password",
  userManager.checkLogin,
  userManager.showPasswordPage
);
// Password Update (AJAX)
router.post("/user/password/update",
  userManager.checkLoginOnAjax,
  userManager.matchPassword,
  userManager.updatePassword
);
router.get("/user/cart",
  userManager.checkLogin,
  userManager.loadReservations,
  userManager.showCartPage
);
// Likes List
router.get("/user/likeslist",
  userManager.checkLogin,
  userManager.loadLikesStudioIds,
  userManager.loadStudioData,
  userManager.loadLikesProductIds,
  userManager.loadProductData,
  userManager.showLikesListPage
);
// Likes List Update (AJAX)
router.post("/user/likeslist/add",
  userManager.checkLoginOnAjax,
  userManager.checkDupLikes,
  userManager.insertLikesList
);
// Likes List Delete
router.post("/user/likeslist/delete",
  userManager.checkLoginOnAjax,
  userManager.deleteLikesList
);

// Studio
router.get("/studio/:photographer",
  photographerManager.isOwner,
  photographerManager.loadStudio,
  photographerManager.loadProducts,
  photographerManager.loadPortfolios
);
// Studio Makepage
router.get("/makestudio",
  photographerManager.checkLogin,
  photographerManager.showMakeStudioPage
);
// Studio Add
router.post("/addstudio",
  photographerManager.checkLogin,
  photographerManager.insertStudio,
  photographerManager.updateHasStudio,
  photographerManager.addServiceCategory
);
// Show Product Reservation Page
router.get("/reserve",
  photographerManager.loadProduct,
  photographerManager.loadUserReservationsByDate,
  photographerManager.showReservPage
);
// Show Product Reservation Detail Page
router.get("/reserve/details",
  photographerManager.checkLogin,
  photographerManager.loadReservation,
  photographerManager.openedByOnwer,
  photographerManager.updateReservationStatusByOwner,
  photographerManager.insertReservationEvent,
  photographerManager.loadReservationEvents,
  photographerManager.loadReservUserNickname,
  photographerManager.loadReservEventsNickname,
  photographerManager.showReservDetailsPage
);
// Request Product Reservation (AJAX)
router.post("/reserve",
  photographerManager.checkLoginOnAjax,
  photographerManager.insertReservation
);
// Change Reservation Status (AJAX)
router.post("/reserve/status",
  photographerManager.checkLoginOnAjax,
  photographerManager.loadReservation,
  photographerManager.updateReservationStatusByOwner,
  photographerManager.insertReservationEvent
);
// Change Reservation Status (AJAX)
router.post("/reserve/cancel",
  photographerManager.checkLoginOnAjax,
  photographerManager.loadReservation,
  photographerManager.updateReservationStatusByUser,
  photographerManager.insertReservationEvent
);
// Change Reservation Status (AJAX)
router.post("/reserve/msg",
  photographerManager.checkLoginOnAjax,
  photographerManager.setMsgEvent,
  photographerManager.insertReservationEvent
);
//Get Reservation Data (AJAX)
router.get("/rsvdata",
  photographerManager.loadUserReservationsByDate,
  photographerManager.sendReservationsData
);
// Studio Photo Slider Update
router.post("/studio/:photographer/slider/update",
  photographerManager.isOwner,
  photographerManager.checkReqFromOwner,
  photographerManager.saveNewSliderPhotoFiles,
  photographerManager.loadSliderPhotoList,
  photographerManager.updateSliderPhotoList
);
// Studio Introduction Update
router.post("/studio/:photographer/intro/update",
  photographerManager.isOwner,
  photographerManager.checkReqFromOwner,
  photographerManager.updateIntro
);
// Studio Product Add
router.post("/studio/:photographer/product/add",
  photographerManager.isOwner,
  photographerManager.checkReqFromOwner,
  photographerManager.insertProduct,
  photographerManager.updateNumberOfProducts
);
// Studio Product Update
router.post("/studio/:photographer/product/update",
  photographerManager.isOwner,
  photographerManager.checkReqFromOwner,
  photographerManager.updateProduct
);
// Studio Product Delete
router.post("/studio/:photographer/product/delete",
  photographerManager.isOwner,
  photographerManager.checkReqFromOwner,
  photographerManager.deleteProduct,
  photographerManager.updateNumberOfProducts
);
// Studio Portfolio Update
router.post("/studio/:photographer/portfolio/update",
  photographerManager.isOwner,
  photographerManager.checkReqFromOwner,
  photographerManager.saveNewPortfolioFiles,
  photographerManager.updatePortfolio,
  photographerManager.insertPortfolio,
  photographerManager.updateNumberOfPortfolios
);
// Studio Portfolio Delete
router.post("/studio/:photographer/portfolio/delete",
  photographerManager.isOwner,
  photographerManager.checkReqFromOwner,
  photographerManager.deletePortfolio,
  photographerManager.updateNumberOfPortfolios
);
// Get Portfolio Photo List
router.get("/studio/:photographer/portfolio/:portfolio_id/photolist",
  photographerManager.loadPortfolioPhotoList
);
//Studio Reservation page
router.get("/studio/:photographer/reserve",
  photographerManager.isOwner,
  photographerManager.checkReqFromOwner,
  photographerManager.loadStudioReservations,
  photographerManager.showReservManamgementPage
);

// Not Found
router.all("/*", httpUtil.send404Page);

module.exports = router;
