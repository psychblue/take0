/*
 * Search Box Controller
 */
var SearchBoxController = (function(){

  var categoryEnabled = 0;
  var regionEnabled = 0;
  var dateEnabled = 0;

  var $searchBox;
  var $searchBoxDividers;
  var $searchBoxCategory = $("<div></div>").addClass("font-grey bg-color-white float-left cursor-pointer");
  var $searchBoxCategoryList = $("<div></div>").addClass("search-box-list");
  var $searchBoxRegion = $("<div></div>").addClass("font-grey bg-color-white float-left cursor-pointer");
  var $searchBoxRegionList = $("<div></div>").addClass("search-box-list");
  var $searchBoxDate = $("<div></div>").addClass("font-grey bg-color-white float-left cursor-pointer");
  var $searchBoxDatepicker = $("<div></div>").addClass("bg-color-white border-solid-thin-lightgrey");
  var $searchBoxButton = $("<div></div>").addClass("font-white center-aligned bg-color-mint float-left");

  (function(){
    $(document).ready(function(){
      makeSearchBox();
      initDatepicker();
      bindEvents();
    });
  }());

  function makeSearchBox(){
    $searchBox = $("#search-box");

    $searchBox
    .append($searchBoxCategory)
    .append($("<div></div>").addClass("search-box-divider bg-color-lightgrey"))
    .append($searchBoxRegion)
    .append($("<div></div>").addClass("search-box-divider bg-color-lightgrey"))
    .append($searchBoxDate)
    .append($searchBoxButton)
    .append($("<div></div>").addClass("float-clear"))
    .append($searchBoxCategoryList)
    .append($searchBoxRegionList)
    .append($searchBoxDatepicker);

    $searchBoxDividers = $(".search-box-divider");

    $searchBoxCategory
    .attr("id", "search-box-category")
    .append($("<span></span>").addClass("search-box-text").text("서비스를 선택하세요."))
    .append($("<div></div>").addClass("down-arrow float-right"))
    .append($("<div></div>").addClass("float-clear"));

    $searchBoxRegion
    .attr("id", "search-box-region")
    .append($("<span></span>").addClass("search-box-text").text("지역을 선택하세요."))
    .append($("<div></div>").addClass("down-arrow float-right"))
    .append($("<div></div>").addClass("float-clear"));

    $searchBoxDate
    .attr("id", "search-box-date")
    .append($("<span></span>").addClass("search-box-text").text("날짜를 선택하세요."))
    .append($("<div></div>").addClass("down-arrow float-right"))
    .append($("<div></div>").addClass("float-clear"));

    $searchBoxButton
    .attr("id", "search-box-button")
    .text("검 색");

    $searchBoxDatepicker
    .attr("id", "search-box-datepicker");

    var categoryItems = ["웨딩", "돌/백일", "데이트"];
    for(var item in categoryItems){
      $searchBoxCategoryList.append($("<div></div>").addClass("search-box-item").text(categoryItems[item]));
    }

    var regionItems = ["서울", "경기", "인천", "부산"];
    for(item in regionItems){
      $searchBoxRegionList.append($("<div></div>").addClass("search-box-item").text(regionItems[item]));
    }
  }

  function bindEvents(){
    $(window).click(function(e){
      hideSelectMenu(e);
    });

    //Select Item
    $(".search-box-item").click(function(e){
      selectItem(e);
    });

    /*
    Category Menu Control
    */
    $searchBoxCategory.hover(function(e){
      selectMenuMouseOver(e);
    },
    function(e){
      selectMenuMouseOut(e);
    });

    $searchBoxCategory.click(function(){
      if(categoryEnabled === 0){
        setSearchBoxListPosition($searchBoxCategoryList, $searchBoxCategory);
        $searchBoxCategoryList.fadeIn("fast");
        categoryEnabled = 1;
      }else{
        $searchBoxCategoryList.fadeOut("fast");
        categoryEnabled = 0;
      }
    });

    /*
    Region Menu Control
    */
    $searchBoxRegion.hover(function(e){
      selectMenuMouseOver(e);
    },
    function(e){
      selectMenuMouseOut(e);
    });

    $searchBoxRegion.click(function(){
      if(regionEnabled === 0){
        setSearchBoxListPosition($searchBoxRegionList, $searchBoxRegion);
        $searchBoxRegionList.fadeIn("fast");
        regionEnabled = 1;
      }else{
        $searchBoxRegionList.fadeOut("fast");
        regionEnabled = 0;
      }
    });

    /*
    Date Menu Control
    */
    $searchBoxDate.hover(function(e){
      selectMenuMouseOver(e);
    },
    function(e){
      selectMenuMouseOut(e);
    });

    $searchBoxDate.click(function(){
      if(dateEnabled === 0){
        setSearchBoxListPosition($searchBoxDatepicker, $searchBoxDate);
        $searchBoxDatepicker.fadeIn("fast");
        dateEnabled = 1;
      }else{
        $searchBoxDatepicker.fadeOut("fast");
        dateEnabled = 0;
      }
    });

    //Submit Button Control
    $searchBoxButton.click(function(){
      categoryCheck();
    });
  }

  function selectMenuMouseOver(e){
    $(e.target).find(".down-arrow").css({"border-top": "10px solid #404040"});
  }

  function selectMenuMouseOut(e){
    $(e.target).find(".down-arrow").css({"border-top": "10px solid #ccc"});
  }

  function setSearchBoxListPosition(list, menu){
    var leftOfList = menu.offset().left
                  - $searchBox.offset().left
                  - ($searchBox.outerWidth() - $searchBox.innerWidth()) / 2;
    var topOfList = menu.offset().top
                  - $searchBox.offset().top
                  + $searchBox.outerHeight()
                  - ($searchBox.outerHeight() - $searchBox.innerHeight())
                  + 5;

    list.css({
      "left": leftOfList,
      "top": topOfList
    });
  }

  function hideSelectMenu(e){
    if(!$searchBoxCategory.is(e.target)
    && !$searchBoxCategory.has(e.target).length
    && !$searchBoxCategoryList.has(e.target).length){
      $searchBoxCategoryList.fadeOut("fast");
      categoryEnabled = 0;
    }

    if(!$searchBoxRegion.is(e.target)
    && !$searchBoxRegion.has(e.target).length
    && !$searchBoxRegionList.has(e.target).length){
      $searchBoxRegionList.fadeOut("fast");
      regionEnabled = 0;
    }

    var isPrevOrNext = 0;
    if($(e.target).attr("class")){
      if($(e.target).attr("class").indexOf("ui-icon") != -1){
        isPrevOrNext = 1;
      }
    }

    if(!isPrevOrNext
    && !$searchBoxDate.is(e.target)
    && !$searchBoxDate.has(e.target).length
    && !$searchBoxDatepicker.is(e.target)
    && !$searchBoxDatepicker.has(e.target).length){
      $searchBoxDatepicker.fadeOut("fast");
      dateEnabled = 0;
    }
  }

  function selectItem(e){
    if($searchBoxCategoryList.has(e.target).length){
      $searchBoxCategory.children(".search-box-text").text($(e.target).text()).removeClass("font-red").addClass("font-darkgrey font-bold");
      $searchBoxCategory.removeClass("bg-color-pink").addClass("bg-color-white");
      $searchBoxCategoryList.fadeOut("fast");
      categoryEnabled = 0;
    }else if($searchBoxRegionList.has(e.target).length){
      $searchBoxRegion.children(".search-box-text").text($(e.target).text()).addClass("font-darkgrey font-bold");
      $searchBoxRegionList.fadeOut("fast");
      regionEnabled = 0;
    }
  }

  function categoryCheck(){
    if($searchBoxCategory.children(".search-box-text").text() == "서비스를 선택하세요."){
      $searchBoxCategory.children(".search-box-text").addClass("font-red font-bold");
      $searchBoxCategory.addClass("bg-color-pink");
    }
  }

  function initDatepicker(){
    $searchBoxDatepicker.datepicker({
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
        $searchBoxDate.children(".search-box-text").text(date).addClass("font-darkgrey font-bold");
        $searchBoxDatepicker.fadeOut("fast");
        dateEnabled = 0;
      }
    });
  }

  var setSearchBox = function(options){
    $searchBox.css({
      "width": options.boxWidth,
      "border": options.borderStyle,
    });

    if(options.marginStyle){
      $searchBox.css({"margin": options.marginStyle});
    }

    if(options.boxPosition){
      $searchBox.css({
        "position": options.boxPosition.positionType,
        "top": options.boxPosition.boxTop,
        "left": options.boxPosition.boxLeft,
        "z-index": "101"
      });
    }

    $searchBoxCategory
    .add($searchBoxRegion)
    .add($searchBoxDate)
    .add($searchBoxButton)
    .css({
      "height": 20,
      "padding-top": (options.boxHeight - 20) / 2,
      "padding-bottom": (options.boxHeight - 20) / 2,
      "padding-right": 15,
      "padding-left": 15
    });

    $searchBoxDividers.css({
      "height": options.boxHeight
    });
  };

  return {
    setSearchBox: setSearchBox
  };
}());
