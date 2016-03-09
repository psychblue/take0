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
  $loginInputLabels,
  $loginPopupBackground,
  $loginButton,
  $loginPopupCloseButton,
  $loginSubmitButton,
  $logoutButton;

  (function(){
    $(document).ready(function(){
      $.get("/loginpopup", function(data){
        $("body").append(data);

        loadElements();
        bindEvents();

        if(redirectUrl != ""){
          viewLoginPopup();
        }
      });
    });
  }());

  function loadElements(){
    $loginPopup = $("#login-popup");
    $loginError = $("#login-error");
    $loginForm = $("#login-form");
    $loginInputs = $(".login-input > input");
    $loginInputLabels = $(".login-input > label");
    $loginPopupBackground = $("#login-popup-background");
    $loginButton = $("#login-button");
    $loginPopupCloseButton = $("#login-popup-close-button");
    $loginSubmitButton = $("#login-submit-button");
    $logoutButton = $("#logout-button");
  };

  function bindEvents(){
    $(window).resize(function(){
      setLoginPopupPosition();
    });

    $loginPopupBackground.click(function(){
      closeLoginPopup();
    });

    $loginButton.click(function(){
      viewLoginPopup();
    });

    $loginPopupCloseButton.click(function(){
      if(redirectUrl == ""){
        closeLoginPopup();
      }
      else{
        history.go(-1);
      }
    });

    $loginInputs.keydown(function(keyEvent){
      InputController.onKeydown(keyEvent, $(this), $loginSubmitButton);
    });

    InputController.setInputFocus($loginInputs);

    $loginSubmitButton.click(function(){
      $.ajax({
        type: "POST",
        url: "/login",
        data: $loginForm.serialize(),
        success: function(data){
          if(data.result == "success"){
            if(redirectUrl == ""){
              location.reload();
            }
            else{
              location.href = redirectUrl;
            }
          }
          else if(data.result == "fail"){
            $loginError.text(data.text).addClass("font-red font-bold").css({"margin-bottom": "30px"});
            $loginPopup.css({"height": "380"});
          }
        },
        error: function(xhr, option, error){
          alert(error);
        }
      });
    });

    $logoutButton.click(function(){
      $.get("/logout", function(data){
        if(data.result == "success"){
          location.reload();
        }
      });
    });
  };

  function setLoginPopupPosition(){
    $loginPopup.css({
      "top": $(window).height() / 2 - $loginPopup.height() / 2,
      "left": $(window).width() / 2 - $loginPopup.width() / 2 - 20
    });
  };

  function closeLoginPopup(){
    if(loginPopupEnabled == 1){
      $("body").css({
        "overflow": "auto"
      });

      $loginPopupBackground.fadeOut("fast");
      $loginPopup.fadeOut("fast");
      loginPopupEnabled = 0;
    }
  };

  var viewLoginPopup = function(){
    if(loginPopupEnabled == 0){

      $loginError.empty();
      $loginForm[0].reset();
      $loginInputLabels.show();
      setLoginPopupPosition();
      $loginPopupBackground.fadeIn("fast");
      $loginPopup.css({"height": "330"}).fadeIn("fast");
      loginPopupEnabled = 1;

      $("body").css({
        "overflow": "hidden"
      });
    }
  };

  var setRedirectUrl = function(url){
    redirectUrl = url;
  };

  return {
    viewLoginPopup,
    setRedirectUrl
  }
}());
