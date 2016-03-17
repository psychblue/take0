var InputController = (function(){

  function onFocus(targetInput){
    targetInput.removeClass("bg-color-pink border-solid-thin-lightgrey").addClass("border-solid-thin-mint");
    targetInput.siblings("label").removeClass("font-red font-bold").addClass("font-grey");
  };

  function onFocusout(targetInput){
    if(targetInput.val() == ""){
      targetInput.siblings("label").show();
    }

    targetInput.removeClass("border-solid-thin-mint").addClass("border-solid-thin-lightgrey");
  };

  var onKeydown = function(keyEvent, targetInput, submitButton){
    targetInput.siblings("label").hide();

    if(keyEvent.which == 13){
      if(submitButton.is("button")){
        submitButton.focus();
      }
      else{
        submitButton.click();
      }
    }
  };

  var setInputFocus = function(targetInput){
    targetInput.focus(function(){
      onFocus($(this));
    });

    targetInput.focusout(function(){
      onFocusout($(this));
    });
  }

  return {
    onKeydown,
    setInputFocus
  }
}());

var CheckboxController = (function(){

  var setCheckbox = function(targetCheckbox){
    targetCheckbox.each(function(){
      if($(this).is(":checked")){
        $(this).next("label").find(".box").addClass("checked");
      }
    });

    targetCheckbox.change(function(){
      var isChecked = $(this).is(":checked");

      if(!isChecked){
        $(this).next("label").find(".box").removeClass("checked");
      }
      else{
        $(this).next("label").find(".box").addClass("checked");
      }
    });
  };

  return {
    setCheckbox
  }
}());

var ButtonController = (function(){

  function onMouseenter(targetButton){
    targetButton.animate({"font-size": "1.1em"}, 100);
  };

  function onMouseleave(targetButton){
    targetButton.animate({"font-size": "1em"}, 100);
  };

  var setButton = function(targetButton, clickFunc, target){
    targetButton.hover(function(){
      onMouseenter($(this));
    },
    function(){
      onMouseleave($(this));
    });

    if(clickFunc){
      if(target){
        targetButton.click(function(){
          clickFunc(target);

          return false;
        });
      }
      else{
        targetButton.click(clickFunc);

        return false;
      }
    }
  };

  return {
    setButton
  }
}());

var BackgroundController = (function(){

  var onMouseenter = function(targetDiv){
    targetDiv.animate({
      "width": "110%",
      "height": "110%",
      "top": "-" + targetDiv.width()/20,
      "left": "-" + targetDiv.height()/20
    }, 100);
  };

  var onMouseleave = function(targetDiv){
    targetDiv.animate({
      "width": "100%",
      "height": "100%",
      "top": "0",
      "left": "0"
    }, 100);
  };

  return {
    onMouseenter,
    onMouseleave
  }
}());

var HeaderController = (function(){

  var $header,
  $userButton,
  $userMenuBox;


  (function(){
    $(document).ready(function(){
      loadElements();
      bindEvents();
    });
  }());

  function loadElements(){
    $header = $("#header");
    $userButton = $header.find("#user-button");
    $userMenuBox = $header.find(".user-menu-box");
  };

  function bindEvents(){
    $userButton.hover(function(){
      $userMenuBox.fadeIn(100);
      $userMenuBox.unbind().mouseleave(function(e){
        var pointerX = $(window).width() - e.pageX;
        var pointerY = e.pageY;
        var offsetX = $(window).width() - $userButton.offset().left;
        var offsetY = $(this).offset().top;

        if(pointerY > offsetY || (pointerY <= offsetY && (pointerX > offsetX || pointerX < 30))){
          $userMenuBox.fadeOut(100);
        }
      });
    },
    function(e){
      var pointerX = $(window).width() - e.pageX;
      var pointerY = e.pageY;
      var offsetX = $(window).width() - $(this).offset().left;
      var offsetY = $(this).offset().top;

      if(pointerX > offsetX || pointerX < 30 || pointerY < offsetY){
        $userMenuBox.fadeOut(100);
      }
    });
  };

  var setBgColor = function(color){
    $header.css({
      "background-color": color
    });
  };

  return {
    setBgColor
  }
}());
