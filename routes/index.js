/*
Main Router
*/

//Modules
var express = require("express");
var loginManager = require("./login");
var joinManager = require("./join");
var mainManager = require("./main");
var photographerManager = require("./photographer");
var confManager = require("../conf/conf");
var httpUtil = require("../util/http-util");
var confParams = confManager.getParams();

//Express Router Settings
var router = express.Router();

//Routing Middleware
router.use(loginManager.loadUserData);

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
router.get("/loginpopup",
  loginManager.showLoginPopup
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
  photographerManager.getPortfolioPhotoList
);

// Not Found
router.all("/*", httpUtil.send404Page);

module.exports = router;
