var InputController = (function(){

  var onKeydown = function(keyEvent, targetInput, submitButton){
    targetInput.siblings("label").hide();

    if(keyEvent.which == 13){
      submitButton.focus();
    }
  };

  var onFocus = function(targetInput){
    targetInput.removeClass("bg-color-pink border-solid-thin-lightgrey").addClass("border-solid-thin-mint");
    targetInput.siblings("label").removeClass("font-red font-bold").addClass("font-grey");
  };

  var onFocusout = function(targetInput){
    if(targetInput.val() == ""){
      targetInput.siblings("label").show();
    }

    targetInput.removeClass("border-solid-thin-mint").addClass("border-solid-thin-lightgrey");
  };

  return {
    onKeydown,
    onFocus,
    onFocusout
  }
}());

var ButtonController = (function(){

  var onMouseenter = function(targetButton){
    targetButton.animate({"font-size": "1.1em"}, 100);
  };

  var onMouseleave = function(targetButton){
    targetButton.animate({"font-size": "1em"}, 100);
  };

  return {
    onMouseenter,
    onMouseleave
  }
}());
