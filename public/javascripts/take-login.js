/*
 * Login Popup Controller
 */

var LoginController = (function(){

  var loginPopupEnabled = 0,
  redirectUrl = "";

  var $loginPopup,
  $loginError,
  $loginForm,
  $loginInputs,
  $loginPopupBackground,
  $loginButton,
  $loginPopupCloseButton,
  $loginSubmitButton,
  $kakaoLoginButton,
  $logoutButton;

  (function(){
    $(document).ready(function(){
      //$.get("/loginpopup", function(data){
        //$("body").append(data);

        loadElements();
        bindEvents();
        Kakao.init("a481f23f90ba53b1b10d7e4fa6d7a067");

        if(redirectUrl !== ""){
          viewLoginPopup();
        }
      //});
    });
  }());

  function loadElements(){
    $loginPopup = $("#login-popup");
    $loginError = $loginPopup.find("#login-error");
    $loginForm = $loginPopup.find("#login-form");
    $loginInputs = $loginPopup.find(".take-text-shortinput");
    $loginPopupBackground = $("#login-popup-background");
    $loginButton = $("#login-button");
    $loginPopupCloseButton = $loginPopup.find("#login-popup-close-button");
    $loginSubmitButton = $loginPopup.find("#login-submit-button");
    $kakaoLoginButton = $("#kakao-login-button");
    $logoutButton = $("#logout-button");
  };

  function bindEvents(){

    $loginPopupBackground.click(function(){
      closeLoginPopup();
    });

    $loginButton.click(function(){
      viewLoginPopup();
    });

    $loginPopupCloseButton.click(function(){
      closeLoginPopup();
    });

    $loginInputs.keydown(function(keyEvent){
      InputController.onKeydown(keyEvent, $(this), $loginSubmitButton);
    });

    InputController.setInputFocus($loginInputs);

    ButtonController.setButton($loginSubmitButton, takeLogin);
    ButtonController.setButton($kakaoLoginButton, kakaoLogin);

    $logoutButton.click(function(){
      $.get("/logout", function(data){
        if(data.result == "success"){
          if(data.userFrom == 1){
            Kakao.Auth.logout(function(){
              location.reload();
            });
          }
          else{
            location.reload();
          }
        }
        else{
          alert(data.text);
        }
      });
    });
  };

  function takeLogin(){
    $.ajax({
      type: "POST",
      url: "/login",
      data: $loginForm.serialize(),
      success: function(data){
        if(data.result == "success"){
          if(redirectUrl === ""){
            location.reload();
          }
          else{
            location.href = redirectUrl;
          }
        }
        else if(data.result == "fail"){
          $loginError.text(data.text).addClass("font-red font-bold").css({"margin-bottom": "30px"});
          $loginPopup.css({"height": "480"});
        }
      },
      error: function(xhr, option, error){
        alert(error);
      }
    });
  };

  function closeLoginPopup(){
    if(loginPopupEnabled == 1){
      if(redirectUrl === ""){
        $("body").css({
          "overflow": "auto"
        });

        $loginPopupBackground.fadeOut("fast");
        $loginPopup.fadeOut("fast");
        loginPopupEnabled = 0;
      }
      else{
        history.go(-1);
      }
    }
  };

  var viewLoginPopup = function(){
    if(loginPopupEnabled === 0){

      $loginError.empty();
      $loginForm[0].reset();
      $loginPopupBackground.fadeIn("fast");
      $loginPopup.css({"height": "430"}).fadeIn("fast");
      loginPopupEnabled = 1;

      $("body").css({
        "overflow": "hidden"
      });
    }
  };

  var setRedirectUrl = function(url){
    redirectUrl = url;
  };

  //Called when user withdrawed
  var logout = function(url){
    $.get("/userfrom", function(data){
      if(data.result == "success"){
        if(data.userfrom == 1){
          Kakao.Auth.logout(function(){
            if(url !== ""){
              location.href = url;
            }
            else{
              location.reload();
            }
          });
        }
        else{
          if(url){
            location.href = url;
          }
          else{
            location.reload();
          }
        }
      }
      else{
        alert(data.text);
      }
    });
  };

  var kakaoLogin = function(){
    $("body").css({
      "overflow": "auto"
    });
    $loginPopupBackground.hide();
    $loginPopup.hide();

    Kakao.Auth.login({
      success: function(authObj){
        $.ajax({
          type: "POST",
          url: "/login/kakao",
          data: {
            access_token: authObj.access_token
          },
          success: function(data){
            if(data.result == "success"){
              if(redirectUrl === ""){
                location.reload();
              }
              else{
                location.href = redirectUrl;
              }
            }
            else if(data.result == "fail"){
              alert(data.text);
            }
            else if(data.result == "redirect"){
              location.href = data.url;
            }
          },
          error: function(xhr, option, error){
            alert(error);
          }
        });
      },
      fail: function(err){
        alert(JSON.stringify(err));
      }
    });
  };

  return {
    viewLoginPopup,
    setRedirectUrl,
    kakaoLogin,
    logout
  };
}());
