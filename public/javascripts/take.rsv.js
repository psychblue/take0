/*
 * Reservation Controller
 */

var RsvController = (function(){

  var pageMode, rsvId, photographer = "";

  var $backButton,
  $msgButton,
  $rsvConfirmButton,
  $rsvCancelButton,
  $rsvCancelConfirm,
  $rsvPayButton,
  $takeCompleteButton;

  (function(){
    $(document).ready(function(){
      loadElements();
      bindEvents();
      setTimeline();
    });
  }());

  function loadElements(){
    $backButton = $(".back-button");
    $msgButton = $(".message-button");
    $rsvConfirmButton = $(".rsv-confirm-button");
    $rsvCancelButton = $(".rsv-cancel-button");
    $rsvCancelConfirm = $(".rsv-cancel-confirm");
    $rsvPayButton = $(".rsv-pay-button");
    $takeCompleteButton = $(".take-complete-button");
  }

  function bindEvents(){
    ButtonController.setButton($backButton, goBack);
    ButtonController.setButton($msgButton, sendMsg);
    ButtonController.setButton($rsvConfirmButton, sendStatus, 3);
    ButtonController.setButton($rsvPayButton, sendStatus, 4);
    ButtonController.setButton($takeCompleteButton, sendStatus, 5);
    if(pageMode === 0){
      ButtonController.setButton($rsvCancelButton, sendStatus, 8);
    }
    else{
      ButtonController.setButton($rsvCancelButton, sendStatus, 9);
    }
    ButtonController.setButton($rsvCancelConfirm, sendStatus, 9);
  }

  function goBack(){
    if(pageMode == 1){
      location.href = "/studio/" + photographer + "/reserve";
    }
    else{
      location.href = "/user/cart";
    }
  }

  function setTimeline(){
    $(".timeline").each(function(){
      $(this).find(".line").css({
        "height": ( $(this).next(".contents").height() + 30 ) + "px"
      });
    });
  }

  function sendStatus(status){
    var body = {rsv_status: status};

    if(status == 3){
      body.price = $("input[name='price']").val();
    }

    $.ajax({
      type: "POST",
      url: "/reserve/status?rsv_id=" + rsvId,
      data: body,
      success: function(data){
        if(data.result == "success"){

          switch(status){
            case 3:
              alert("예약을 확정하였습니다.");
              break;
            case 8:
              alert("예약 취소를 오쳥하였습니다.");
              break;
          }
          location.reload();
        }
        else if(data.result == "fail"){
          alert(data.text);
          if(data.code == "401"){
            location.href = "/login?redirect=" + location.href;
          }
        }
      },
      error: function(xhr, option, error){
        alert(error);
      }
    });
  }

  function sendMsg(){
    $.ajax({
      type: "POST",
      url: "/reserve/msg?rsv_id=" + rsvId,
      data: $(".msg-form").serialize(),
      success: function(data){
        if(data.result == "success"){
          location.reload();
        }
        else if(data.result == "fail"){
          alert(data.text);
          if(data.code == "401"){
            location.href = "/login?redirect=" + location.href;
          }
        }
      },
      error: function(xhr, option, error){
        alert(error);
      }
    });
  }

  var setStatus = function(mode, user, id, status){
    pageMode = mode;
    rsvId = id;
    photographer = user;

    if(status < 8){
      $(".rsv-status[for='" + status + "']").removeClass("bg-color-grey")
      .addClass("bg-color-mint");
    }
    else{
      $(".rsv-status-box").css({
        "width": "250px"
      });
      $(".rsv-status[for='" + status + "']").removeClass("bg-color-grey")
      .addClass("bg-color-red");
    }
  };

  return {
    setStatus: setStatus
  };
}());
