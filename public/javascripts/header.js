var popupEnabled = 0;

function setLoginPosition(){
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  var popupWidth = $("#login-popup").width();
  var popupHeight = $("#login-popup").height();
  $("#login-popup").css({"top": windowHeight/2-popupHeight/2, "left": windowWidth/2-popupWidth/2-20});
}

function viewPopup(){
  if(popupEnabled == 0){

    $("#login-error").empty();
    $("#login-popup").css("height", "330");
    $("#login-form")[0].reset();
    $(".loginInput>label").show();
    setLoginPosition();
    $("#popup-bg").css("opacity", "0.7");
    $("#popup-bg").fadeIn("fast");
    $("#login-popup").fadeIn("fast");
    popupEnabled = 1;
  }
}

function closePopup(){
  if(popupEnabled == 1){
    $("#popup-bg").fadeOut("fast");
    $("#login-popup").fadeOut("fast");
    popupEnabled = 0;
  }
}

function searchBoxMouseOver(arrow){
  return function(){
    arrow.css({"border-top": "10px solid #404040"});
  }
}

function searchBoxMouseOut(arrow){
  return function(){
    arrow.css({"border-top": "10px solid #ccc"});
  }
}

function setSearchBoxPosition(){
  var windowWidth = $(window).width();
  var searchbarWidth = $("#searchbar").width();
  $("#searchbar").css({"left": windowWidth/2-searchbarWidth/2 - 100});
}

function setSearchBoxListPosition(list, menu){
  var boxOffset = $("#searchbar").offset().left;
  list.css({"left": menu.offset().left - boxOffset, "top": 42});
}

$(document).ready(function(){

  if($(location).attr("pathname") != "/"){
    $.get("/searchbar", function(data){
      $("body").append(data);

      var categoryEnabled = 0;
      var regionEnabled = 0;
      var dateEnabled = 0;

      setSearchBoxPosition();

      $("body").click(function(e){
        if(!$("#searchbar-category").is(e.target) && !$("#searchbar-category").has(e.target).length && !$("#searchbar-category-list").has(e.target).length){
          $("#searchbar-category-list").fadeOut("fast");
          categoryEnabled = 0;
        }
        if(!$("#searchbar-region").is(e.target) && !$("#searchbar-region").has(e.target).length && !$("#searchbar-region-list").has(e.target).length){
          $("#searchbar-region-list").fadeOut("fast");
          regionEnabled = 0;
        }
        var isPrevOrNext = 0;
        if($(e.target).attr("class")){
          if($(e.target).attr("class").indexOf("ui-icon") != -1){
            isPrevOrNext = 1;
          }
        }
        if(!isPrevOrNext && !$("#searchbar-date").is(e.target) && !$("#searchbar-date").has(e.target).length && !$("#searchbar-datepicker").is(e.target) && !$("#searchbar-datepicker").has(e.target).length){
          $("#searchbar-datepicker").fadeOut("fast");
          dateEnabled = 0;
        }
      });

      var categoryArrow = $("#searchbar-category > .downArrow");
      $("#searchbar-category").hover(searchBoxMouseOver(categoryArrow), searchBoxMouseOut(categoryArrow));

      $("#searchbar-category").click(function(){
        if(categoryEnabled == 0){
          setSearchBoxListPosition($("#searchbar-category-list"), $("#searchbar-category"));
          $("#searchbar-category-list").fadeIn("fast");
          categoryEnabled = 1;
        }else{
          $("#searchbar-category-list").fadeOut("fast");
          categoryEnabled = 0;
        }
      });

      var regionArrow = $("#searchbar-region > .downArrow");
      $("#searchbar-region").hover(searchBoxMouseOver(regionArrow), searchBoxMouseOut(regionArrow));

      $("#searchbar-region").click(function(){
        if(regionEnabled == 0){
          setSearchBoxListPosition($("#searchbar-region-list"), $("#searchbar-region"));
          $("#searchbar-region-list").fadeIn("fast");
          regionEnabled = 1;
        }else{
          $("#searchbar-region-list").fadeOut("fast");
          regionEnabled = 0;
        }
      });

      $(".searchbarItem").click(function(e){
        if($("#searchbar-category-list").has(e.target).length){
          $("#searchbar-category > .searchbarText").text($(e.target).text()).css({"color": "#404040", "font-weight": "bold"});
          $("#searchbar-category").css({"background-color": "#fff"});
          $("#searchbar-category-list").fadeOut("fast");
          categoryEnabled = 0;
        }else if($("#searchbar-region-list").has(e.target).length){
          $("#searchbar-region > .searchbarText").text($(e.target).text()).css({"color": "#404040", "font-weight": "bold"});
          $("#searchbar-region-list").fadeOut("fast");
          regionEnabled = 0;
        }
      });

      var dateArrow = $("#searchbar-date > .downArrow");
      $("#searchbar-date").hover(searchBoxMouseOver(dateArrow), searchBoxMouseOut(dateArrow));

      $("#searchbar-date").click(function(){
        if(dateEnabled == 0){
          setSearchBoxListPosition($("#searchbar-datepicker"), $("#searchbar-date"));
          $("#searchbar-datepicker").fadeIn("fast");
          dateEnabled = 1;
        }else{
          $("#searchbar-datepicker").fadeOut("fast");
          dateEnabled = 0;
        }
      });

      $("#searchbar-datepicker").datepicker({
        inline: true,
        showOtherMonths: false,
        showMonthAfterYear: true,
        monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
        dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
        nextText: ">",
        prevText: "<",
        yearSuffix: "년",
        dateFormat: "yy'년' m'월' d'일'",
        onSelect: function(date){
          $("#searchbar-date > .searchbarText").text(date).css({"color": "#404040", "font-weight": "bold"});
          $("#searchbar-datepicker").fadeOut("fast");
          dateEnabled = 0;
        }
      });

      $("#searchbar-button").click(function(){
        if($("#searchbar-category > .searchbarText").text() == "서비스를 선택하세요."){
          $("#searchbar-category > .searchbarText").css({"color": "#bb2929", "font-weight": "bold"});
          $("#searchbar-category").css({"background-color": "#fde2e2"});
        }
      });

    });
  }

  $.get("/login", function(data){
    $("body").append(data);

    $("#popup-bg").click(function(){
      closePopup();
    });

    $("#login-button").click(function(){
      viewPopup();
    });

    $("#login-popup-close-button").click(function(){
      closePopup();
    });

    $('.loginInput input[type="text"], .loginInput input[type="password"]').keydown(function(keyEvent){
      $(this).siblings("label").hide();
      if(keyEvent.which == 13){
        $("#login-submit-button").focus();
      }
    });

    $('.loginInput input[type="text"], .loginInput input[type="password"]').focus(function(){
      $(this).css({"border": "1px solid #999","background-color": "#eee"});
    });

    $('.loginInput input[type="text"], .loginInput input[type="password"]').focusout(function(){
      if($(this).val() == ""){
        $(this).siblings("label").show();
      }
      $(this).css({"border": "1px solid #ccc", "background-color": "#fff"});
    });

    $("#login-submit-button").click(function(){
      $.ajax({
        type: "POST",
        url: "/login",
        data: $("#login-form").serialize(),
        success: function(data){
          if(data.result == "success"){
            location.reload();
          }
          else if(data.result == "fail"){
            $("#login-error").text(data.text);
            $("#login-error").css({"color": "#bb2929", "font-weight": "bold", "margin-bottom": "30px"});
            $("#login-popup").css("height", "380");
          }
        },
        error: function(xhr, option, error){
          alert(error);
        }
      });
    });

  });

  $(window).resize(function(){
    setLoginPosition();
    setSearchBoxPosition();
  });

  /*
  $(window).scroll(function(){
    var offset = $(document).scrollTop();
    if(offset > 80){
      $("#headerbar").css("opacity", "0.7");
    }else{
      $("#headerbar").css("opacity", "1");
    }
  });
  */

});
