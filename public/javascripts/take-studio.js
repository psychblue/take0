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
    $cancelButton,
    $flag;

    var bindEvents = function(){
      $cancelButton.click(function(){
        close();
      });

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

                $(this)
                .css({
                  "background-image": "url\(\"" + src + "\"\)",
                  "border": "1px solid #ccc"
                });
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

    function close(){
      $sliderEditorBox.fadeOut("fast");
      $sliderEditButton.fadeIn("fast");

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

    function addDelButton(target){
      var $delButton = $("<img></img>");

      $delButton
      .addClass("del-button")
      .attr("src", "/images/studio/del.png")
      .css({
        "position": "absolute",
        "right": "-12px",
        "top": "-12px"
      });

      target
      .empty()
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
        .css({
          "background-image": "none",
          "border": "1px dashed #ccc"
        })
        .text("+")
        .next().val("");

        return false;
      });
    };

    var init = function(){
      $sliderEditorBox = $studioPhotoSliderWindow.children(".slider-editor-box");
      $editorPhotoBoxes = $sliderEditorBox.find(".editor-photo-box");
      $editorPhotoInputs = $sliderEditorBox.find(".editor-photo-input");
      $cancelButton = $sliderEditorBox.find(".cancel-button");
      $flag = $sliderEditorBox.find("#flag");
    };

    var show = function(){
      flag = [0, 0, 0, 0, 0];
      $flag.val(flag);

      $editorPhotoBoxes.each(function(index){
        if(!$(this).hasClass("no-photo")){
          addDelButton($(this));

          $(this)
          .css({
            "background-image": "url\(\"" + origPhotoList[index] + "\"\)",
            "border": "1px solid #ccc"
          })
          .next().val("");
        }
        else{
          $(this)
          .text("+")
          .css({
            "background-image": "none",
            "border": "1px dashed #ccc"
          })
          .next().val("");
        }

        clickDelButton($(this));
      });

      $sliderEditorBox.fadeIn("fast");
    };

    return {
      bindEvents,
      init,
      show
    }
  }());
  /***************************************************/

  (function(){
    $(document).ready(function(){
      $studioPhotoSliderWindow = $("#studio-photo-slider-window");
      $sliderEditButton = $studioPhotoSliderWindow.find(".slider-edit-button");

      if(sliderEnabled){
        setPhotoSlider();
        bindSliderEvents();
      }

      SliderEditor.init();
      bindEditorEvents();
    });
  }());

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
      showSliderEditor();
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

  function showSliderEditor(){
    $sliderEditButton.fadeOut("fast");
    SliderEditor.show();

    if(sliderEnabled == 1){
      $unslider.unbind("mouseenter");
      $unsliderArrows.fadeOut();
    }
    else{
      $studioPhotoSliderWindow.find(".font-level-larger").fadeOut("fast");
    }
  };

  var enableSlider = function(list){
    sliderEnabled = 1;

    for(var fileName in list){
      origPhotoList.push(list[fileName]);
    }
  };

  return {
    enableSlider
  }
}());
