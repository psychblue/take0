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

    for(var fileName in list){
      origPhotoList.push(list[fileName]);
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

    $introEditorInputs.focus(function(){
      InputController.onFocus($(this));
    });

    $introEditorInputs.focusout(function(){
      InputController.onFocusout($(this));
    });
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

    var $productBox,
    $productDescBox,
    $productEditButton,
    $productEditorBox,
    $productEditorInputs,
    $submitButton,
    $deleteButton,
    $cancelButton,
    $productForm;

    var inputValues = {
      productId: "",
      productName: "",
      productDesc: ""
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
      $productBox = $("#" + pid);
      $productDescBox = $productBox.find(".product-desc-box");
      $productEditButton = $productBox.find(".product-edit-button");
      $productEditorBox = $productBox.find(".product-editor-box");
      $productEditorInputs = $productEditorBox.find("input").add($productEditorBox.find("textarea"));
      $submitButton = $productEditorBox.find(".editor-submit-button");
      $deleteButton = $productEditorBox.find(".editor-delete-button");
      $cancelButton = $productEditorBox.find(".editor-cancel-button");
      $productForm = $productEditorBox.find(".product-form");

      productBoxHeight = $productBox.height();
    };

    function bindEvents(){
      ButtonController.setButton($productEditButton, showEditor);

      ButtonController.setButton($submitButton, submit);

      ButtonController.setButton($deleteButton, deleteProduct);

      ButtonController.setButton($cancelButton, closeEditor);
    };

    function showEditor(){
      closeOtherEditors();
      loadInputValues();

      $productDescBox.css({"visibility": "hidden"});
      $productBox.animate({"height": "550px"}, 200);
      $productEditorBox.css({"height": "550px"});
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
      inputValues.productDesc = $productDescBox.find("ul").html()
      .trim()
      .replace(/<\/li><li>/gi, "\r\n").replace(/<li>/gi, "").replace(/<\/li>/gi, "");
    };

    function resetInputValues(){
      $productEditorInputs.filter("[name='product_name']").val(inputValues.productName);
      $productEditorInputs.filter("[name='product_desc']").val(inputValues.productDesc);
    };

    function submit(){
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

    var closeEditor = function(){
      $productEditorBox.fadeOut("fast");
      $productBox.animate({"height": productBoxHeight}, 200);
      $productDescBox.css({"visibility": "visible"});
      setTimeout(resetInputValues, 200);
    };

    return {
      getProductBox,
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
    numProducts++;
  };

  var closeEditor = function(){
    for(var index in productEditors){
      productEditors[index].closeEditor();
    }
  }

  return {
    setProduct,
    closeEditor
  }
}());
