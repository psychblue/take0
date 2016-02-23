var InputController = (function(){

  var onKeydown = function(keyEvent, targetInput, submitButton){
    targetInput.siblings("label").hide();

    if(keyEvent.which == 13){
      submitButton.focus();
    }
  };

  var onFocus = function(targetInput){
    targetInput.removeClass("bg-color-pink border-solid-thin-lightgrey").addClass("bg-color-lightergrey border-solid-thin-grey");
    targetInput.siblings("label").removeClass("font-red font-bold").addClass("font-grey");
  };

  var onFocusout = function(targetInput){
    if(targetInput.val() == ""){
      targetInput.siblings("label").show();
    }

    targetInput.removeClass("bg-color-lightergrey border-solid-thin-grey").addClass("border-solid-thin-lightgrey");
  };

  return {
    onKeydown,
    onFocus,
    onFocusout
  }
}());
