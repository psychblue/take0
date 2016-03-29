/*
 * List Slider
 */

var ListSlider = function(box, url){

  var targetBox = box;
  var postUrl = url;
  var pageNum = 1;

  var $listSliderArrowLeft,
  $listSliderArrowRight,
  $listSliderList,
  $listBoxes;

  (function(){
    loadElements();
    bindEvents();
  }());

  function loadElements(){

    $listSliderArrowLeft = $("<div>&lt;</div>").addClass("list-slider-arrow-box font-lightgrey");
    $listSliderArrowRight = $("<div>&gt;</div>").addClass("list-slider-arrow-box font-lightgrey");
    $listSliderList = $("<div></div>").addClass("list-slider-list");

    targetBox
    .addClass("list-slider-box")
    .append($listSliderArrowLeft)
    .append($listSliderList)
    .append($listSliderArrowRight)
    .append($("<div></div>").addClass("float-clear"));

    $listSliderArrowLeft.css({"visibility": "hidden"});

    postList(0);
  }

  function bindEvents(){
    $(window).resize(function(){
      resizeListItemBox();
    });

    $listSliderArrowRight.click(function(){
      if(pageNum == 1){
        $listSliderArrowLeft.css({"visibility": "visible"});
      }
      postList(pageNum);
      pageNum++;
      if(pageNum == 2){
        $listSliderArrowRight.css({"visibility": "hidden"});
      }
    });

    $listSliderArrowLeft.click(function(){
      if(pageNum == 2){
        $listSliderArrowRight.css({"visibility": "visible"});
      }
      postList(pageNum - 2);
      pageNum--;
      if(pageNum == 1){
        $listSliderArrowLeft.css({"visibility": "hidden"});
      }
    });
  }

  function onHoverListBox(){
    $listBoxes.hover(function(){
      BackgroundController.onMouseenter($(this).children(".take-item-img"));
    },
    function(){
      BackgroundController.onMouseleave($(this).children(".take-item-img"));
    });
  }

  function postList(pageNum){
    $.post(postUrl, {start:(pageNum * 3), end:3}, function(data){
      $listSliderList.empty().append(data);
      resizeListItemBox();
      onHoverListBox();
    });
  }

  function resizeListItemBox(){
    $listBoxes = targetBox.find(".list-box");
    var listBoxWidth = Math.floor(($listSliderList.width() / 3) - 11);
    var listBoxHeight = listBoxWidth * 1.2;

    $listBoxes.css({
      "width": listBoxWidth,
      "height": listBoxHeight,
    });

    var time = 0;

    $listBoxes.each(function(){
      $(this).delay(time).fadeIn("slow");
      time = time + 150;
    });

    var $arrowBoxes = targetBox.find(".list-slider-arrow-box");
    var arrowBoxMarginTop = (listBoxHeight - $listSliderArrowLeft.height()) / 2;

    $arrowBoxes.css({
      "margin-top": arrowBoxMarginTop
    });

    var $listBoxNotes = targetBox.find(".list-box-note");

    $listBoxNotes.css({
      "width": listBoxWidth - 40
    });
  }
};
