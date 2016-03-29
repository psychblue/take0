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

    var isVisible = 0,
    flag;
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
    }

    function addDelButton(target){
      var $delButton = $("<img></img>");

      $delButton.addClass("del-button cursor-pointer")
      .attr("src", "/images/studio/del.png")
      .css({
        "position": "absolute",
        "right": "-12px",
        "top": "-12px"
      });

      target.empty()
      .append($delButton);
    }

    function onClickDelButton(target){
      target.find(".del-button").click(function(){
        var parent = $(this).parent();
        var inputId = parent.attr("for");

        flag[inputId.charAt(11) - 1] = 2;
        $flag.val(flag);

        $(this).hide();

        resetPhotoBox(parent)
        .text("+")
        .next().val("");

        return false;
      });
    }

    function resetPhotoBox(target){
      target.css({
        "background-image": "none",
        "border": "1px dashed #999"
      });

      return target;
    }

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

              onClickDelButton($(this));
            });
          };
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

        onClickDelButton($(this));
      });

      $sliderEditorBox.fadeIn("fast");

      isVisible = 1;
    };

    var close = function(){
      if(isVisible == 1){
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

        isVisible = 0;
      }
    };

    return {
      bindEvents: bindEvents,
      init: init,
      show: show,
      close: close
    };
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
  }

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
  }

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
  }

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
  }

  function closeOtherEditors(){
      StudioIntrodunctionController.closeEditor();
      StudioProductController.closeEditor();
      StudioPortfolioController.closeEditor();
  }

  var enableSlider = function(list){
    sliderEnabled = 1;

    for(var fileNo in list){
      origPhotoList.push(list[fileNo]);
    }
  };

  return {
    enableSlider: enableSlider,
    closeEditor: SliderEditor.close
  };
}());

/*
 * Introduction Controller
 */
var StudioIntrodunctionController = (function(){

  var isVisible = 0;

  var $studioIntroWindow,
  $studioLikeButton,
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
    $studioLikeButtion = $studioIntroWindow.find(".studio-like-button");
    $introEditButton = $studioIntroWindow.find(".intro-edit-button");
    $introEditorBox = $studioIntroWindow.find(".intro-editor-box");
    $introEditorInputs = $introEditorBox.find("input").add($introEditorBox.find("textarea"));
    $submitButton = $introEditorBox.find(".editor-submit-button");
    $cancelButton = $introEditorBox.find(".editor-cancel-button");
  }

  function bindEvents(){
    ButtonController.setButton($studioLikeButtion, addToLikesList, $studioLikeButtion);

    ButtonController.setButton($introEditButton, showEditor);

    ButtonController.setButton($submitButton, submit);

    ButtonController.setButton($cancelButton, closeEditor);

    InputController.setInputFocus($introEditorInputs);
  }

  function showEditor(){
    closeOtherEditors();
    loadInputValues();
    $introEditorBox.fadeIn("fast");

    isVisible = 1;
  }

  function closeOtherEditors(){
    StudioPhotoSliderController.closeEditor();
    StudioProductController.closeEditor();
    StudioPortfolioController.closeEditor();
  }

  function loadInputValues(){
    inputValues.studioName = $studioIntroWindow.children("h1").text();
    inputValues.telNum = $studioIntroWindow.find("#tel-num").text();
    inputValues.address = $studioIntroWindow.find("#address").text();
    inputValues.introduction = $studioIntroWindow.find("p").html().replace(/<br>/gi, "\r\n");
  }

  function resetInputValues(){
    $introEditorInputs.filter("[name='studio_name']").val(inputValues.studioName);
    $introEditorInputs.filter("[name='tel_num']").val(inputValues.telNum);
    $introEditorInputs.filter("[name='address']").val(inputValues.address);
    $introEditorInputs.filter("[name='introduction']").html(inputValues.introduction);
  }

  function addToLikesList(targetButton){
    var studioId = Number(targetButton.attr("for"));

    $.ajax({
      type: "POST",
      url: "/user/likeslist/add",
      data: {
        studio_id: studioId
      },
      success: function(data){
        if(data.result == "success"){
          alert("스튜디오가 회원님의 찜 리스트에 추가되었습니다.");
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
    if(isVisible == 1){
      $introEditorBox.fadeOut("fast");
      setTimeout(resetInputValues, 200);

      isVisible = 0;
    }
  };

  return {
    closeEditor: closeEditor
  };
}());

/*
 * Product Controller
 */
var StudioProductController = (function(){

  var productEditors = [];
  var numProducts = 0;

  var $studioProductWindow,
  $productReserveButtons,
  $productLikeButtons;

  /***************************************************
   * Product Editor
   */
  var ProductEditor = function(pid, sid){

    var productBoxHeight;
    var isAdder = 0,
    isVisible = 0;

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
    }

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
    }

    function showEditor(){
      closeOtherEditors();

      if(isAdder != 1){
        loadInputValues();
        $productDescBox.css({"visibility": "hidden"});
      }

      $productBox.animate({"height": "700px"}, 200);
      $productEditorBox.css({"height": "700px"});
      $productEditorBox.fadeIn("fast");

      isVisible = 1;
    }

    function closeOtherEditors(){
      StudioPhotoSliderController.closeEditor();
      StudioIntrodunctionController.closeEditor();
      StudioPortfolioController.closeEditor();

      for(var index in productEditors){
        if(productEditors[index].getProductBox().attr("id") != $productBox.attr("id")){
          productEditors[index].closeEditor();
        }
      }
    }

    function loadInputValues(){
      inputValues.productId = $productForm.find("[name='product_id']").val();
      inputValues.productName = $productBox.find("h1").text();
      inputValues.productPrice = $productBox.find(".product-price").text().split("\\")[1].split(",").join("");
      inputValues.productDuration = $productForm.find("[name='product_duration']").val();
      inputValues.productDesc = $productDescBox.find("ul").html()
      .trim()
      .replace(/<\/li><li>/gi, "\r\n").replace(/<li>/gi, "").replace(/<\/li>/gi, "");
    }

    function resetInputValues(){
      $productEditorInputs.filter("[name='product_name']").val(inputValues.productName);
      $productEditorInputs.filter("[name='product_price']").val(inputValues.productPrice);
      $productEditorInputs.filter("[name='product_duration']").val(inputValues.productDuration);
      $productEditorInputs.filter("[name='product_desc']").val(inputValues.productDesc);
    }

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
    }

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
    }

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
    }


    var getProductBox = function(){
      return $productBox;
    };

    var enableAdder = function(){
      isAdder = 1;
    };

    var closeEditor = function(){
      if(isVisible == 1){
        $productEditorBox.fadeOut("fast");
        $productBox.animate({"height": productBoxHeight}, 200);

        if(isAdder != 1){
          $productDescBox.css({"visibility": "visible"});
        }

        setTimeout(resetInputValues, 200);

        isVisible = 0;
      }
    };

    return {
      getProductBox: getProductBox,
      enableAdder: enableAdder,
      closeEditor: closeEditor
    };
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
    $productLikeButtons = $studioProductWindow.find(".product-like-button");
  }

  function bindEvents(){
    $productReserveButtons.each(function(){
      ButtonController.setButton($(this));
    });

    $productLikeButtons.each(function(){
      ButtonController.setButton($(this), addToLikesList, $(this));
    });
  }

  function addToLikesList(targetButton){
    var productId = Number(targetButton.attr("for"));

    $.ajax({
      type: "POST",
      url: "/user/likeslist/add",
      data: {
        product_id: productId
      },
      success: function(data){
        if(data.result == "success"){
          alert("선택하신 상품이 회원님의 찜 리스트에 추가되었습니다.");
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
    setProduct: setProduct,
    closeEditor: closeEditor
  };
}());

/*
 * Portfolio Controller
 */
var StudioPortfolioController = (function(){

  var portfolioDataSet = {};

  var $studioPortfolioWindow,
  $portfolioBox,
  $portfolioItems,
  $portfolioEditButtons,
  $portfolioAddButton;

  /***************************************************
   * Portfolio Editor
   */
  var PortfolioEditor = (function(){
    var portfolioData = {},
    photoList = [],
    inputCounter = 0,
    isVisible = 0,
    delPhotoList = [],
    portfolioWindowHeight,
    photoBoxWidth;

    var $portfolioEditorBox,
    $editorTitleBox,
    $editorMainBox,
    $editorPhotoBoxes,
    $delButtons,
    $submitButton,
    $deleteButton,
    $cancelButton,
    $portfolioIdInput,
    $portfolioSubjectInput,
    $photoListInput,
    $numPortfoliosInput,
    $delPhotoListInput;

    (function(){
      $(document).ready(function(){
        $(window).resize(resizeEditorBoxes);
      });
    }());

    function init(targetElement){
      loadElements();
      if(targetElement.attr("for")){
        portfolioData = portfolioDataSet[targetElement.attr("for")];
      }
      getPhotoList();
    }

    function loadElements(){
      $portfolioEditorBox = $portfolioBox.siblings(".portfolio-editor-box");
      $editorTitleBox = $portfolioEditorBox.find(".editor-title-box");
      $editorMainBox = $portfolioEditorBox.find(".editor-main-box");
      $submitButton = $portfolioEditorBox.find(".editor-submit-button");
      $deleteButton = $portfolioEditorBox.find(".editor-delete-button");
      $cancelButton = $portfolioEditorBox.find(".editor-cancel-button");
      $portfolioIdInput = $portfolioEditorBox.find("input[name='portfolio_id']");
      $portfolioSubjectInput = $portfolioEditorBox.find("input[name='portfolio_subject']");
      $photoListInput = $portfolioEditorBox.find("input[name='photo_list']");
      $numPortfoliosInput = $portfolioEditorBox.find("input[name='num_portfolios']");
      $delPhotoListInput = $portfolioEditorBox.find("input[name='del_photo_list']");
    }

    function bindEvents(){
      ButtonController.setButton($submitButton);
      ButtonController.setButton($deleteButton, deletePortfolio);
      ButtonController.setButton($cancelButton, closeEditor);

      $delButtons.click(function(){
        $(this).parent().hide();
        resizePortfolioWindow();

        delPhotoList.push(photoList[Number($(this).parent().attr("for"))]);
        photoList[Number($(this).parent().attr("for"))] = "";

        $photoListInput.val(photoList.filter(function(element){
          return element !== "";
        }));

        $delPhotoListInput.val(delPhotoList);
      });
    }

    function unbindEvents(){
      $submitButton.unbind("hover");
      $submitButton.unbind("click");
      $deleteButton.unbind("hover");
      $deleteButton.unbind("click");
      $cancelButton.unbind("hover");
      $cancelButton.unbind("click");
      $delButtons.unbind("click");
    }

    function getPhotoList(){
      if(portfolioData.portfolio_id){
        $.get(location.href + "/portfolio/" + portfolioData.portfolio_id + "/photolist", setPhotoList);
      }
      else{
        setEditor();
      }
    }

    function setPhotoList(data){
      if(data.result == "success"){
        if(data.body.photo_list !== ""){
          photoList = data.body.photo_list.split(",");
        }
        setEditor();
      }
      else{
        alert(data.text);
      }
    }

    function deletePortfolio(){
      $.ajax({
        type: "POST",
        url: location.href + "/portfolio/delete",
        data: {
          portfolio_id: portfolioData.portfolio_id,
          studio_id: portfolioData.studio_id,
          num_portfolios: portfolioDataSet.length - 1,
          photo_list: photoList.toString()
        },
        success: function(data){
          if(data.result == "success"){
            location.reload();
          }
          else if(data.result == "fail"){
            alert(data.text);
          }
          else{
            $(document.documentElement).html(data);
          }
        },
        error: function(xhr, option, error){
          alert(error);
        }
      });
    }

    function resizeEditorBoxes(){
      var mainBoxPadding = 0.1 * $(window).width();

      $editorMainBox.css({
        "padding-left": mainBoxPadding,
        "padding-right": mainBoxPadding
      });

      photoBoxWidth = ( 0.8 * $(window).width() - 100 ) / 5;

      $editorPhotoBoxes.each(function(){
        $(this).css({
          "width": photoBoxWidth,
          "height": photoBoxWidth
        });
      });

      $editorPhotoBoxes.filter(".editor-input-box").css({
        "width": photoBoxWidth - 2,
        "height": photoBoxWidth - 2,
        "line-height": ( photoBoxWidth - 2 ) + "px"
      });
    }

    function resizePortfolioWindow(){
      $studioPortfolioWindow.css({
        "height": $portfolioEditorBox.height() - 150
      }, 200);
    }

    function addDelButton(target){
      var $delButton = $("<img></img>");

      $delButton.addClass("del-button cursor-pointer")
      .attr("src", "/images/studio/del.png")
      .css({
        "position": "absolute",
        "right": "-12px",
        "top": "-12px"
      });

      target.append($delButton);
    }

    function onClickDelButton(target){
      target.find(".del-button").click(function(){
        var parent = $(this).parent();
        parent.next().val("").hide();
        parent.hide();

        resizePortfolioWindow();

        return false;
      });
    }

    function setPreview(target, src){
      target.empty().css({
        "width": photoBoxWidth,
        "height": photoBoxWidth,
        "background-image": "url\(\"" + src + "\"\)",
        "border": "none"
      });

      return target;
    }

    function onChangeInput(target){
      target.change(function(){
        if(window.FileReader){
          var label = $(this).siblings("label");
          var inputId = $(this).attr("id");
          if (!$(this)[0].files[0].type.match(/image\//)){
            return;
          }

          var reader = new FileReader();
          reader.onload = function(e){

            var src = e.target.result;

            label.each(function(){
              if($(this).attr("for") == inputId){
                setPreview($(this), src);
                addDelButton($(this));
              }

              onClickDelButton($(this));
            });
          };
          reader.readAsDataURL($(this)[0].files[0]);

          addInput();
          resizePortfolioWindow();
        }
        else{
          //under IE10
        }
      });
    }

    function addInput(){
      inputCounter++;

      var $floatClear = $editorMainBox.find(".float-clear");
      $floatClear.before($("<label></label>")
        .addClass("editor-photo-box editor-input-box font-grey")
        .attr("for", inputCounter)
        .css({
          "width": photoBoxWidth - 2,
          "height": photoBoxWidth - 2,
          "line-height": ( photoBoxWidth - 2 ) + "px"
        })
        .text("+"));

      $floatClear.before($("<input></input>")
        .addClass("editor-photo-input")
        .attr({
          "id": inputCounter,
          "type": "file",
          "name": "photofile"
        }));

        onChangeInput($editorMainBox.find("#" + inputCounter));

        $editorPhotoBoxes = $editorPhotoBoxes.add($editorMainBox.find("[for='" + inputCounter + "']"));
    }

    function setEditor(){
      $editorMainBox.empty();

      if(portfolioData.portfolio_id){
        $editorTitleBox.text("포트폴리오를 수정하세요.");
      }
      else{
        $editorTitleBox.text("포트폴리오를 추가하세요.");
      }

      for(var i = 0; i < photoList.length; i++){
        var editorPhotoBox = $("<div></div>")
        .addClass("editor-photo-box")
        .css({
          "background-image": "url\(\"" + photoList[i] + "\"\)"
        }).attr("for", i);

        addDelButton(editorPhotoBox);

        $editorMainBox.append(editorPhotoBox);
      }

      $editorMainBox.append($("<div></div>").addClass("float-clear"));

      $editorPhotoBoxes = $editorMainBox.find(".editor-photo-box");
      $delButtons =$editorMainBox.find(".del-button");

      if(portfolioData.portfolio_id){
        $portfolioIdInput.val(portfolioData.portfolio_id);
        $portfolioSubjectInput.val(portfolioData.portfolio_subject);
      }
      else{
        $portfolioIdInput.val("new");
        if(portfolioDataSet.length > 0){
          $numPortfoliosInput.val(portfolioDataSet.length + 1);
        }
        else{
          $numPortfoliosInput.val(1);
        }
      }
      $photoListInput.val(photoList);
      $delPhotoListInput.val(delPhotoList);

      addInput();

      resizeEditorBoxes();

      $studioPortfolioWindow.css({
        "overflow": "hidden"
      });

      portfolioWindowHeight = $studioPortfolioWindow.height();
      resizePortfolioWindow();

      window.scrollTo(0, $studioPortfolioWindow.offset().top);
      $portfolioEditorBox.fadeIn("fast");

      isVisible = 1;

      if(!portfolioData.portfolio_id){
        $deleteButton.hide();
      }
      else{
        $deleteButton.show();
      }

      bindEvents();
    }

    function closeOtherEditors(){
      StudioPhotoSliderController.closeEditor();
      StudioIntrodunctionController.closeEditor();
      StudioProductController.closeEditor();
    }

    var showEditor = function(targetElement){
      closeOtherEditors();
      init(targetElement);

      return false;
    };

    var closeEditor = function(){
      if(isVisible == 1){
        portfolioData = {};
        inputCounter = 0;
        photoList = [];
        delPhotoList = [];

        unbindEvents();

        $portfolioEditorBox.fadeOut("fast");
        $studioPortfolioWindow.animate({
          "height": portfolioWindowHeight
        }, 200);

        isVisible = 0;
      }
    };

    return {
      showEditor: showEditor,
      closeEditor: closeEditor
    };
  }());
  /***************************************************/

  /***************************************************
   * Portfolio Viewer
   */
   var PortfolioViewer = (function(){

     var portfolioData = {},
     photoList = [],
     viewerThumbIndex = 0;

     var $portfolioViewer,
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
         $(window).resize(resizeOrigImageSize);
       });
     }());

     function init(targetElement){
       loadElements();
       portfolioData = portfolioDataSet[Number(targetElement.attr("for"))];
       getPhotoList();
     }

     function loadElements(){
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
     }

     function bindEvents(){
       $viewerThumbItems.click(function(){
         $origImage.attr({
           "src": photoList[$(this).attr("for")]
         }).load(resizeOrigImageSize);

         viewerThumbIndex = Number($(this).attr("for"));

         moveThumbBox($(this));

         if(viewerThumbIndex == photoList.length - 1){
           $viewerRightArrow.hide();
         }
         else if(viewerThumbIndex === 0){
           $viewerLeftArrow.hide();
         }
         else{
           $viewerLeftArrow.show();
           $viewerRightArrow.show();
         }
       });

       $viewerCloseButton.click(closeViewer);

       $viewerThumbBox.hover(function(){
         $(this).animate({
           "height": "100px"
         }, 100);
       },
       function(){
         $(this).animate({
           "height": "10px"
         }, 100);
       });

       $viewerRightArrow.click(function(){
         $origImage.attr({
           "src": photoList[viewerThumbIndex + 1]
         }).load(resizeOrigImageSize);
         viewerThumbIndex++;

         moveThumbBox($viewerThumbItems.filter("[for='" + viewerThumbIndex + "']"));

         if(viewerThumbIndex == 1){
           $viewerLeftArrow.show();
         }

         if(viewerThumbIndex == photoList.length - 1){
           $(this).hide();
         }
       });

       $viewerLeftArrow.click(function(){
         $origImage.attr({
           "src": photoList[viewerThumbIndex - 1]
         }).load(resizeOrigImageSize);
         viewerThumbIndex--;

         moveThumbBox($viewerThumbItems.filter("[for='" + viewerThumbIndex + "']"));

         if(viewerThumbIndex == photoList.length - 2){
           $viewerRightArrow.show();
         }

         if(viewerThumbIndex === 0){
           $(this).hide();
         }
       });
     }

     function unbindEvents(){
       $viewerThumbItems.unbind("click");
       $viewerCloseButton.unbind("click");
       $viewerThumbBox.unbind("hover");
       $viewerRightArrow.unbind("click");
       $viewerLeftArrow.unbind("click");
     }

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

       setCounter();
     }

     function getPhotoList(){
       $.get(location.href + "/portfolio/" + portfolioData.portfolio_id + "/photolist", setPhotoList);
     }

     function setPhotoList(data){
       if(data.result == "success"){
         if(data.body.photo_list !== ""){
           photoList = data.body.photo_list.split(",");
         }
         setViewer();
       }
       else{
         alert(data.text);
       }
     }

     function setViewer(){
       $viewerLeftArrow.css({
         "top": "0",
         "left": "0",
         "line-height": $(window).height() + "px",
       }).hide();

       $viewerRightArrow.css({
         "top": "0",
         "right": "0",
         "line-height": $(window).height() + "px"
       });

       if(photoList.length > 1){
         $viewerRightArrow.show();
       }
       else{
         $viewerRightArrow.hide();
       }

       $portfolioViewer.fadeIn("fast");

       $("body").css({
         "overflow": "hidden"
       });

       $origImage.attr({
         "src": photoList[0],
       })
       .load(resizeOrigImageSize);

       viewerThumbIndex = 0;
       setCounter();
       setViewerThumbs();
       bindEvents();
     }

     function setCounter(){
       if(photoList.length > 0){
         $viewerCounter.text(portfolioData.portfolio_subject + " : " + ( viewerThumbIndex + 1 ) + " / " + photoList.length);
       }
       else{
         $viewerCounter.text(portfolioData.portfolio_subject + " : " + "0 / " + photoList.length);
       }
     }

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
     }

     function setViewerThumbs(){
       $viewerThumbInnerBox.empty();

       for(var i = 0; i < photoList.length; i++){
         var thumbBoxItem = $("<div></div>")
         .addClass("thumb-box-item")
         .css({
           "background-image": "url\(\"" + photoList[i] + "\"\)"
         }).attr("for", i);

         if(i === 0){
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
     }

     function closeViewer(){
       $("body").css({
         "overflow": "auto"
       });

       unbindEvents();

       $portfolioViewer.fadeOut("fast");
     }

     var showViewer = function(targetElement){
       init(targetElement);
     };

     return {
       showViewer: showViewer
     };
   }());
   /***************************************************/


  (function(){
    $(document).ready(function(){
      loadElements();
      loadItems();
      bindEvents();
    });
  }());

  function loadElements(){
    $studioPortfolioWindow = $("#studio-portfolio-window");
    $portfolioBox = $studioPortfolioWindow.find(".portfolio-box");
    $portfolioItems = $portfolioBox.find(".portfolio-item");
    $portfolioEditButtons = $portfolioBox.find(".portfolio-edit-button");
    $portfolioAddButton = $portfolioBox.find(".portfolio-add-button");
  }

  function loadItems(){
    $portfolioItems.each(function(index){
      if(portfolioDataSet[index].photo_list !== ""){
        $(this).children(".take-item-img").css({
          "background-image": "url\(\"" + portfolioDataSet[index].photo_list + "\"\)"
        });
      }
    });
  }

  function bindEvents(){
    $portfolioItems.hover(function(){
      BackgroundController.onMouseenter($(this).children(".take-item-img"));
      $(this).children(".portfolio-subject").fadeIn("fast");
    },
    function(){
      BackgroundController.onMouseleave($(this).children(".take-item-img"));
      $(this).children(".portfolio-subject").fadeOut("fast");
    });

    $portfolioItems.click(function(){
      PortfolioViewer.showViewer($(this));
    });

    $portfolioEditButtons.each(function(){
      ButtonController.setButton($(this), PortfolioEditor.showEditor, $(this));
    });

    $portfolioAddButton.click(function(){
      PortfolioEditor.showEditor($(this));
    });
  }

  var initPortfolio = function(data){
    portfolioDataSet = data;
  };

  var closeEditor = function(){
    PortfolioEditor.closeEditor();
  };

  return {
    initPortfolio: initPortfolio,
    closeEditor: closeEditor
  };
}());
