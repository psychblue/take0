/*
 * Reservation Controller
 */

var RsvController = (function(){

  var pageMode, rsvId, photographer = "";

  var $backButton,
  $msgButton,
  $rsvConfirmButton,
  $rsvCancelButton,
  $rsvCancelConfirm;

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
  }

  function bindEvents(){
    ButtonController.setButton($backButton, goBack);
    ButtonController.setButton($msgButton, sendMsg);
    ButtonController.setButton($rsvConfirmButton, rsvConfirm);
    if(pageMode === 0){
      ButtonController.setButton($rsvCancelButton, rsvCancelRequest);
    }
    else{
      ButtonController.setButton($rsvCancelButton, rsvCancelConfirm);
    }
    ButtonController.setButton($rsvCancelConfirm, rsvCancelConfirm);
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

  function rsvConfirm(){
    $.ajax({
      type: "POST",
      url: "/reserve/status?rsv_id=" + rsvId,
      data: {
        rsv_status: 3
      },
      success: function(data){
        if(data.result == "success"){
          alert("예약을 확정하였습니다.");
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

  function rsvCancelConfirm(){
    $.ajax({
      type: "POST",
      url: "/reserve/status?rsv_id=" + rsvId,
      data: {
        rsv_status: 9
      },
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

  function rsvCancelRequest(){
    $.ajax({
      type: "POST",
      url: "/reserve/cancel?rsv_id=" + rsvId,
      data: {
        rsv_status: 8
      },
      success: function(data){
        if(data.result == "success"){
          alert("예약 취소를 요쳥하였습니다.");
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
