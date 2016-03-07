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
      submitButton.focus();
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

var ButtonController = (function(){

  function onMouseenter(targetButton){
    targetButton.animate({"font-size": "1.1em"}, 100);
  };

  function onMouseleave(targetButton){
    targetButton.animate({"font-size": "1em"}, 100);
  };

  var setButton = function(targetButton, clickFunc){
    targetButton.hover(function(){
      onMouseenter($(this));
    },
    function(){
      onMouseleave($(this));
    });

    if(clickFunc){
      targetButton.click(clickFunc);
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
