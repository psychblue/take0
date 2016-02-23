/*
 * List Slider
 */

var ListSlider = function(box, url){

  var targetBox = box;
  var postUrl = url;
  var pageNum = 1;
  var $listSliderArrowLeft = $("<div>&lt;</div>").addClass("list-slider-arrow-box font-lightgrey");
  var $listSliderArrowRight = $("<div>&gt;</div>").addClass("list-slider-arrow-box font-lightgrey");
  var $listSliderList = $("<div></div>").addClass("list-slider-list");

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
  };

  function postList(pageNum){
    $.post(postUrl, {start:(pageNum * 3), end:3}, function(data){
      $listSliderList.empty().append(data);
      resizeListItemBox();
    });
  };

  function resizeListItemBox(){
    var $listBoxes = targetBox.find(".list-box");
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
    var listBoxMarginTop = listBoxHeight - 100;

    $listBoxNotes.css({
      "margin-top": listBoxMarginTop
    });
  };

  var init = function(){
    targetBox
    .addClass("list-slider-box")
    .append($listSliderArrowLeft)
    .append($listSliderList)
    .append($listSliderArrowRight)
    .append($("<div></div>").addClass("float-clear"));

    $listSliderArrowLeft.css({"visibility": "hidden"});

    postList(0);
    bindEvents();
  };

  return {
    init
  }
};
