/*
 * Login Popup Controller
 */

(function(){

  var loginPopupEnabled = 0;

  var $loginPopup,
  $loginError,
  $loginForm,
  $loginInputs,
  $loginInputLabels,
  $loginPopupBackground,
  $loginButton,
  $loginPopupCloseButton,
  $loginSubmitButton;

  (function(){
    $(document).ready(function(){
      $.get("/login", function(data){
        $("body").append(data);

        $loginPopup = $("#login-popup");
        $loginError = $("#login-error");
        $loginForm = $("#login-form");
        $loginInputs = $(".login-input > input");
        $loginInputLabels = $(".login-input > label");
        $loginPopupBackground = $("#login-popup-background");
        $loginButton = $("#login-button");
        $loginPopupCloseButton = $("#login-popup-close-button");
        $loginSubmitButton = $("#login-submit-button");

        bindEvents();
      });
    });
  }());

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
      closeLoginPopup();
    });

    $loginInputs.keydown(function(keyEvent){
      InputController.onKeydown(keyEvent, $(this), $loginSubmitButton);
    });

    $loginInputs.focus(function(){
      InputController.onFocus($(this));
    });

    $loginInputs.focusout(function(){
      InputController.onFocusout($(this));
    });

    $loginSubmitButton.click(function(){
      $.ajax({
        type: "POST",
        url: "/login",
        data: $loginForm.serialize(),
        success: function(data){
          if(data.result == "success"){
            location.reload();
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
  };

  function setLoginPopupPosition(){
    $loginPopup.css({
      "top": $(window).height() / 2 - $loginPopup.height() / 2,
      "left": $(window).width() / 2 - $loginPopup.width() / 2 - 20
    });
  };

  function viewLoginPopup(){
    if(loginPopupEnabled == 0){
      $loginError.empty();
      $loginForm[0].reset();
      $loginInputLabels.show();
      setLoginPopupPosition();
      $loginPopupBackground.css({"opacity": "0.7"}).fadeIn("fast");
      $loginPopup.css({"height": "330"}).fadeIn("fast");
      loginPopupEnabled = 1;
    }
  };

  function closeLoginPopup(){
    if(loginPopupEnabled == 1){
      $loginPopupBackground.fadeOut("fast");
      $loginPopup.fadeOut("fast");
      loginPopupEnabled = 0;
    }
  };
}());
