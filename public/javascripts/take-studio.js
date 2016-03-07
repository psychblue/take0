/*
 * Studio
 */

/*
 * Photo Slider Controller
 */
var StudioPhotoSliderController = (function(){

  var sliderEnabled = 0;
  var numPhoto = 0;
  var origPhotoList = [];
  var $unslider,
  $unsliderArrows,
  $studioPhotoSliderWindow,
  $sliderEditButton;

  /***************************************************
   * Photo Slider Editor
   */
  var SliderEditor = (function(){

    var flag;
    var $sliderEditorBox,
    $editorPhotoBoxes,
    $editorPhotoInputs,
    $submitButton,
    $cancelButton,
    $flag;

    function loadElements(){
      $sliderEditorBox = $studioPhotoSliderWindow.children(".slider-editor-box");
      $editorPhotoBoxes = $sliderEditorBox.find(".editor-photo-box");
      $editorPhotoInputs = $sliderEditorBox.find(".editor-photo-input");
      $submitButton = $sliderEditorBox.find(".editor-submit-button");
      $cancelButton = $sliderEditorBox.find(".editor-cancel-button");
      $flag = $sliderEditorBox.find("#flag");
    };

    function addDelButton(target){
      var $delButton = $("<img></img>");

      $delButton.addClass("del-button")
      .attr("src", "/images/studio/del.png")
      .css({
        "position": "absolute",
        "right": "-12px",
        "top": "-12px"
      });

      target.empty()
      .append($delButton);
    };

    function clickDelButton(target){
      target.find(".del-button").click(function(){
        var parent = $(this).parent();
        var inputId = parent.attr("for");

        flag[inputId.charAt(11) - 1] = 2;
        $flag.val(flag);

        $(this).hide();
        parent
        resetPhotoBox(parent)
        .text("+")
        .next().val("");

        return false;
      });
    };

    function resetPhotoBox(target){
      target.css({
        "background-image": "none",
        "border": "1px dashed #999"
      });

      return target;
    };

    function setPreview(target, src){
      target.css({
        "background-image": "url\(\"" + src + "\"\)",
        "border": "1px solid #999"
      });

      return target;
    }

    var bindEvents = function(){
      ButtonController.setButton($submitButton);

      ButtonController.setButton($cancelButton, close);

      $editorPhotoInputs.change(function(){
        if(window.FileReader){
          var label = $(this).siblings("label");
          var inputId = $(this).attr("id");
          if (!$(this)[0].files[0].type.match(/image\//)){
            return;
          }

          flag[inputId.charAt(11) - 1] = 1;
          $flag.val(flag);

          var reader = new FileReader();
          reader.onload = function(e){

            var src = e.target.result;

            label.each(function(){
              if($(this).attr("for") == inputId){
                addDelButton($(this));
                setPreview($(this), src);
              }

              clickDelButton($(this));
            });
          }
          reader.readAsDataURL($(this)[0].files[0]);
        }
        else{
          //under IE10
        }
      });
    };

    var init = function(){
      loadElements();
    };

    var show = function(){
      flag = [0, 0, 0, 0, 0];
      $flag.val(flag);

      $editorPhotoBoxes.each(function(index){
        if(!$(this).hasClass("no-photo")){
          addDelButton($(this));
          setPreview($(this), origPhotoList[index])
          .next().val("");
        }
        else{
          resetPhotoBox($(this))
          .text("+")
          .next().val("");
        }

        clickDelButton($(this));
      });

      $sliderEditorBox.fadeIn("fast");
    };

    var close = function(){
      $sliderEditorBox.fadeOut("fast");

      if(sliderEnabled == 1){
        $unslider.mouseenter(function(){
          $unsliderArrows.fadeIn("fast");
        });
        $unsliderArrows.fadeIn("fast");
      }
      else{
        $studioPhotoSliderWindow.find(".font-level-larger").fadeIn("fast");
      }
    };

    return {
      bindEvents,
      init,
      show,
      close
    }
  }());
  /***************************************************/

  (function(){
    $(document).ready(function(){
      loadElements();

      if(sliderEnabled){
        setPhotoSlider();
        bindSliderEvents();
      }

      SliderEditor.init();
      bindEditorEvents();
    });
  }());

  function loadElements(){
    $studioPhotoSliderWindow = $("#studio-photo-slider-window");
    $sliderEditButton = $studioPhotoSliderWindow.find(".slider-edit-button");
  }

  function bindSliderEvents(){
    $unslider.hover(function(){
      $unsliderArrows.fadeIn("fast");
    },
    function(){
      $unsliderArrows.fadeOut();
    });
  };

  function bindEditorEvents(){
    $sliderEditButton.hover(function(){
      $(this).animate({"font-size": "3.5em"}, 100);
    },
    function(){
      $(this).animate({"font-size": "2.5em"}, 100);
    });

    $sliderEditButton.click(function(){
      showEditor();
    });

    SliderEditor.bindEvents();
  };

  function setPhotoSlider(){
    $studioPhotoSliderWindow.unslider({
      autoplay: true,
      delay: 4000,
      arrows: {
        prev: '<div class="unslider-arrow prev">&lt;</div>',
        next: '<div class="unslider-arrow next">&gt;</div>'
      }
    });

    $unslider = $(".unslider");
    $unsliderArrows = $unslider.find(".unslider-arrow");

    $studioPhotoSliderWindow.find(".photo-box").each(function(index){
      $(this).css({"background-image": "url\(\"" + origPhotoList[index] + "\"\)"});
    });

    $unsliderArrows.each(function(){
      $(this).hide();
    });
  };

  function showEditor(){
    closeOtherEditors();

    SliderEditor.show();

    if(sliderEnabled == 1){
      $unslider.unbind("mouseenter");
      $unsliderArrows.fadeOut();
    }
    else{
      $studioPhotoSliderWindow.find(".font-level-larger").fadeOut("fast");
    }
  };

  function closeOtherEditors(){
      StudioIntrodunctionController.closeEditor();
      StudioProductController.closeEditor();
  }

  var enableSlider = function(list){
    sliderEnabled = 1;

    for(var fileNo in list){
      origPhotoList.push(list[fileNo]);
    }
  };

  return {
    enableSlider,
    closeEditor: SliderEditor.close
  }
}());

/*
 * Introduction Controller
 */
var StudioIntrodunctionController = (function(){

  var $studioIntroWindow,
  $introEditButton,
  $introEditorInputs,
  $introEditorBox,
  $submitButton,
  $cancelButton;

  var inputValues = {
    studioName: "",
    telNum: "",
    address: "",
    introduction: ""
  };

  (function(){
    $(document).ready(function(){
      loadElements();
      bindEvents();
      loadInputValues();
      resetInputValues();
    });
  }());

  function loadElements(){
    $studioIntroWindow = $("#studio-introduction-window");
    $introEditButton = $studioIntroWindow.find(".intro-edit-button");
    $introEditorBox = $studioIntroWindow.find(".intro-editor-box");
    $introEditorInputs = $introEditorBox.find("input").add($introEditorBox.find("textarea"));
    $submitButton = $introEditorBox.find(".editor-submit-button");
    $cancelButton = $introEditorBox.find(".editor-cancel-button");
  };

  function bindEvents(){
    ButtonController.setButton($introEditButton, showEditor);

    ButtonController.setButton($submitButton, submit);

    ButtonController.setButton($cancelButton, closeEditor);

    InputController.setInputFocus($introEditorInputs);
  };

  function showEditor(){
    closeOtherEditors();
    loadInputValues();
    $introEditorBox.fadeIn("fast");
  };

  function closeOtherEditors(){
    StudioPhotoSliderController.closeEditor();
    StudioProductController.closeEditor();
  };

  function loadInputValues(){
    inputValues.studioName = $studioIntroWindow.children("h1").text();
    inputValues.telNum = $studioIntroWindow.find("#tel-num").text();
    inputValues.address = $studioIntroWindow.find("#address").text();
    inputValues.introduction = $studioIntroWindow.find("p").html().replace(/<br>/gi, "\r\n");
  };

  function resetInputValues(){
    $introEditorInputs.filter("[name='studio_name']").val(inputValues.studioName);
    $introEditorInputs.filter("[name='tel_num']").val(inputValues.telNum);
    $introEditorInputs.filter("[name='address']").val(inputValues.address);
    $introEditorInputs.filter("[name='introduction']").html(inputValues.introduction);
  };

  function submit(){
    $.ajax({
      type: "POST",
      url: location.href + "/intro/update",
      data: $("#intro-form").serialize(),
      success: function(data){
        if(data.result == "success"){
          location.reload();
        }
        else if(data.result == "fail"){
          alert(data.text);
        }
      },
      error: function(xhr, option, error){
        alert(error);
      }
    });
  }

  var closeEditor = function(){
    $introEditorBox.fadeOut("fast");
    setTimeout(resetInputValues, 200);
  };

  return {
    closeEditor
  }
}());

/*
 * Product Controller
 */
var StudioProductController = (function(){

  var productEditors = [];
  var numProducts = 0;

  var $studioProductWindow,
  $productReserveButtons;

  /***************************************************
   * Product Editor
   */
  var ProductEditor = function(pid, sid){

    var productBoxHeight;
    var isAdder = 0;

    var $productBox,
    $productDescBox,
    $productEditButton,
    $productAddButton,
    $productEditorBox,
    $productEditorInputs,
    $submitButton,
    $deleteButton,
    $cancelButton,
    $productForm;

    var inputValues = {
      productId: "",
      productName: "",
      productPrice: "",
      productDesc: ""
    };

    (function(){
      $(document).ready(function(){
        loadElements();
        bindEvents();

        if(isAdder != 1){
          loadInputValues();
        }

        resetInputValues();
      });
    }());

    function loadElements(){
      if(isAdder != 1){
        $productBox = $("#" + pid);
        $productDescBox = $productBox.find(".product-desc-box");
        $productEditButton = $productBox.find(".product-edit-button");
        $productEditorBox = $productBox.find(".product-editor-box");
        $deleteButton = $productEditorBox.find(".editor-delete-button");
      }
      else{
        $productBox = $("#product-add");
        $productEditorBox = $productBox.find(".product-editor-box");
        $productAddButton = $productBox.find(".product-add-button");
      }

      $productEditorInputs = $productEditorBox.find("input").add($productEditorBox.find("textarea"));
      $submitButton = $productEditorBox.find(".editor-submit-button");
      $cancelButton = $productEditorBox.find(".editor-cancel-button");
      $productForm = $productEditorBox.find(".product-form");

      productBoxHeight = $productBox.height();
    };

    function bindEvents(){
      if(isAdder != 1){
        ButtonController.setButton($productEditButton, showEditor);
        ButtonController.setButton($deleteButton, deleteProduct);
        ButtonController.setButton($submitButton, updateProduct);
      }
      else{
        ButtonController.setButton($submitButton, addProduct);

        $productAddButton.hover(function(){
          $(this).animate({"font-size": "3.5em"}, 100);
        },
        function(){
          $(this).animate({"font-size": "2.5em"}, 100);
        });

        $productAddButton.click(function(){
          showEditor();
        });
      }

      ButtonController.setButton($cancelButton, closeEditor);

      InputController.setInputFocus($productEditorInputs);
    };

    function showEditor(){
      closeOtherEditors();

      if(isAdder != 1){
        loadInputValues();
        $productDescBox.css({"visibility": "hidden"});
      }

      $productBox.animate({"height": "650px"}, 200);
      $productEditorBox.css({"height": "650px"});
      $productEditorBox.fadeIn("fast");
    };

    function closeOtherEditors(){
      StudioPhotoSliderController.closeEditor();
      StudioIntrodunctionController.closeEditor();

      for(var index in productEditors){
        if(productEditors[index].getProductBox().attr("id") != $productBox.attr("id")){
          productEditors[index].closeEditor();
        }
      }
    };

    function loadInputValues(){
      inputValues.productId = $productForm.find("[name='product_id']").val();
      inputValues.productName = $productBox.find("h1").text();
      inputValues.productPrice = $productBox.find(".product-price").text().split("\\")[1].split(",").join("");
      inputValues.productDesc = $productDescBox.find("ul").html()
      .trim()
      .replace(/<\/li><li>/gi, "\r\n").replace(/<li>/gi, "").replace(/<\/li>/gi, "");
    };

    function resetInputValues(){
      $productEditorInputs.filter("[name='product_name']").val(inputValues.productName);
      $productEditorInputs.filter("[name='product_price']").val(inputValues.productPrice);
      $productEditorInputs.filter("[name='product_desc']").val(inputValues.productDesc);
    };

    function updateProduct(){
      $.ajax({
        type: "POST",
        url: location.href + "/product/update",
        data: $productForm.serialize(),
        success: function(data){
          if(data.result == "success"){
            location.reload();
          }
          else if(data.result == "fail"){
            alert(data.text);
          }
        },
        error: function(xhr, option, error){
          alert(error);
        }
      });
    };

    function addProduct(){
      $.ajax({
        type: "POST",
        url: location.href + "/product/add",
        data: $productForm.serialize(),
        success: function(data){
          if(data.result == "success"){
            location.reload();
          }
          else if(data.result == "fail"){
            alert(data.text);
          }
        },
        error: function(xhr, option, error){
          alert(error);
        }
      });
    };

    function deleteProduct(){
      $.ajax({
        type: "POST",
        url: location.href + "/product/delete",
        data: {
          product_id: inputValues.productId,
          studio_id: sid,
          num_products: numProducts - 1
        },
        success: function(data){
          if(data.result == "success"){
            location.reload();
          }
          else if(data.result == "fail"){
            alert(data.text);
          }
        },
        error: function(xhr, option, error){
          alert(error);
        }
      });
    };


    var getProductBox = function(){
      return $productBox;
    };

    var enableAdder = function(){
      isAdder = 1;
    };

    var closeEditor = function(){
      $productEditorBox.fadeOut("fast");
      $productBox.animate({"height": productBoxHeight}, 200);

      if(isAdder != 1){
        $productDescBox.css({"visibility": "visible"});
      }

      setTimeout(resetInputValues, 200);
    };

    return {
      getProductBox,
      enableAdder,
      closeEditor
    }
  };
  /***************************************************/

  (function(){
    $(document).ready(function(){
      loadElements();
      bindEvents();
    });
  }());

  function loadElements(){
    $studioProductWindow = $("#studio-product-window");
    $productReserveButtons = $studioProductWindow.find(".product-reserve-button");
  };

  function bindEvents(){
    $productReserveButtons.each(function(){
      ButtonController.setButton($(this));
    });
  };

  var setProduct = function(productId, studioId){
    var editor = ProductEditor(productId, studioId);

    productEditors.push(editor);

    if(productId != "product-add"){
      numProducts++;
    }
    else{
      editor.enableAdder();
    }
  };

  var closeEditor = function(){
    for(var index in productEditors){
      productEditors[index].closeEditor();
    }
  };

  return {
    setProduct,
    closeEditor
  }
}());

/*
 * Portfolio Controller
 */
var StudioPortfolioController = (function(){

  var portfolioData = {};
  var viewerPhotoList, viewerPhotoId;

  var $portfolioBox,
  $portfolioItems,
  $portfolioViewer,
  $origImageBox,
  $origImage,
  $thumbBox,
  $viewerCloseButton,
  $viewerLeftArrow,
  $viewerRightArrow,
  $viewerThumbBox,
  $viewerThumbInnerBox,
  $viewerThumbItems,
  $viewerCounter;

  (function(){
    $(document).ready(function(){
      loadElements();
      loadItems();
      bindEvents();
    });
  }());

  function loadElements(){
    $portfolioBox = $(".portfolio-box");
    $portfolioItems = $portfolioBox.find(".portfolio-item");
    $portfolioViewer = $portfolioBox.next("#portfolio-viewer");
    $origImageBox = $portfolioViewer.find(".orig-image-box");
    $origImage = $origImageBox.find(".orig-image");
    $thumbBox = $portfolioViewer.find(".thumb-box");
    $viewerCloseButton = $portfolioViewer.find(".close-button");
    $viewerLeftArrow = $portfolioViewer.find(".left-arrow");
    $viewerRightArrow = $portfolioViewer.find(".right-arrow");
    $viewerThumbBox = $portfolioViewer.find(".thumb-box");
    $viewerThumbInnerBox = $viewerThumbBox.find(".inner-box");
    $viewerCounter = $portfolioViewer.find(".counter");
  };

  function loadItems(){
    $portfolioItems.each(function(index){
      $(this).children(".item-img").css({
        "background-image": "url\(\"" + portfolioData[index].photo_list.split(",")[0] + "\"\)"
      });
    });
  };

  function bindEvents(){
    $(window).resize(resizeOrigImageSize);

    $portfolioItems.hover(function(){
      BackgroundController.onMouseenter($(this).children(".item-img"));
    },
    function(){
      BackgroundController.onMouseleave($(this).children(".item-img"));
    });

    $portfolioItems.click(function(){
      showViewer($(this));
    });
  };

  function resizeOrigImageSize(){
    $origImage.attr({
      "width": "",
      "height": $origImageBox.height() - 100 + "px"
    });

    if($origImage.width() > $origImageBox.width() - 100){
      $origImage.attr({
        "height": "",
        "width": $origImageBox.width() - 100 + "px"
      });
    }

    $origImageBox.css({
      "padding-top": ( $origImageBox.height() - $origImage.height() ) / 2,
      "padding-bottom": ( $origImageBox.height() - $origImage.height() ) / 2
    });
  };

  function moveThumbBox(item){
    $viewerThumbItems.css({
      "border": "none"
    });

    item.css({
      "border-bottom": "5px solid #3db7cc"
    });

    var offset = $viewerThumbInnerBox.offset().left
      + ( $(window).width() / 2 )
      - item.offset().left
      - 100;

    if(offset > 0){
      offset = 0;
    }

    $viewerThumbInnerBox.animate({
      "left": offset
    }, 200);

    $viewerCounter.text(( viewerPhotoId + 1 ) + " / " + viewerPhotoList.length);
  };

  function setViewerThumbs(){
    $viewerThumbInnerBox.empty();

    for(var i = 0; i < viewerPhotoList.length; i++){
      var thumbBoxItem = $("<div></div>")
      .addClass("thumb-box-item")
      .css({
        "background-image": "url\(\"" + viewerPhotoList[i] + "\"\)"
      }).attr("for", i);

      if(i == 0){
        thumbBoxItem.css({
          "border-bottom": "5px solid #3db7cc"
        });
      }

      $viewerThumbInnerBox.append(thumbBoxItem);
    }

    $viewerThumbInnerBox.append($("<div></div>").addClass("float-clear"));

    $viewerThumbItems = $viewerThumbInnerBox.find(".thumb-box-item");

    $viewerThumbInnerBox.css({
      "left": "0"
    });
  };

  function bindViewerEvents(){
    $viewerThumbItems.unbind().click(function(){
      $origImage.attr({
        "src": viewerPhotoList[$(this).attr("for")]
      }).load(resizeOrigImageSize);

      viewerPhotoId = Number($(this).attr("for"));

      moveThumbBox($(this));

      if(viewerPhotoId == viewerPhotoList.length - 1){
        $viewerRightArrow.hide();
      }
      else if(viewerPhotoId == 0){
        $viewerLeftArrow.hide();
      }
      else{
        $viewerLeftArrow.show();
        $viewerRightArrow.show();
      }
    });

    $viewerCloseButton.unbind().click(closeViewer);

    $viewerThumbBox.unbind().hover(function(){
      $(this).animate({
        "height": "100px"
      }, 100);
    },
    function(){
      $(this).animate({
        "height": "10px"
      }, 100);
    });

    $viewerRightArrow.unbind().click(function(){
      $origImage.attr({
        "src": viewerPhotoList[viewerPhotoId + 1]
      }).load(resizeOrigImageSize);
      viewerPhotoId++;

      moveThumbBox($viewerThumbItems.filter("[for='" + viewerPhotoId + "']"));

      if(viewerPhotoId == 1){
        $viewerLeftArrow.show();
      }

      if(viewerPhotoId == viewerPhotoList.length - 1){
        $(this).hide();
      }
    });

    $viewerLeftArrow.unbind().click(function(){
      $origImage.attr({
        "src": viewerPhotoList[viewerPhotoId - 1]
      }).load(resizeOrigImageSize);
      viewerPhotoId--;

      moveThumbBox($viewerThumbItems.filter("[for='" + viewerPhotoId + "']"));

      if(viewerPhotoId == viewerPhotoList.length - 2){
        $viewerRightArrow.show();
      }

      if(viewerPhotoId == 0){
        $(this).hide();
      }
    });
  }

  function showViewer(targetItem){
    var portfolioId = targetItem.attr("for");
    viewerPhotoList = portfolioData[portfolioId].photo_list.split(",");

    $viewerLeftArrow.css({
      "top": "0",
      "left": "0",
      "line-height": $(window).height() + "px",
    }).hide();

    $viewerRightArrow.css({
      "top": "0",
      "right": "0",
      "line-height": $(window).height() + "px"
    }).show();

    $portfolioViewer.fadeIn("fast");

    $("body").css({
      "overflow": "hidden"
    });

    $origImage.attr({
      "src": viewerPhotoList[0],
    })
    .load(resizeOrigImageSize);

    viewerPhotoId = 0;

    $viewerCounter.text(( viewerPhotoId + 1 ) + " / " + viewerPhotoList.length);

    setViewerThumbs();
    bindViewerEvents();
  };

  function closeViewer(){
    $("body").css({
      "overflow": "auto"
    });

    $portfolioViewer.fadeOut("fast");
  };

  var setPortfolio = function(data){
    portfolioData = data;
  };

  return {
    setPortfolio
  }
}());
