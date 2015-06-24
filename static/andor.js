(function(global) {
  "use strict"

  var $andorContainer = $(".andor-container");

  $(".item-container div").each(function() {
    $(this).draggable({
      appendTo: $(this).closest('.andor-container'),
      cancel: ".faded",
      containment: $(this).closest('.andor-container'),
      helper: "clone",
      start: function(event, ui) {
        ui.helper.addClass("from-container");
      },
      scroll: false,
      zIndex: 1000
    });
  });

  $(".item-container").droppable({
    drop: function(event, ui) {
      var tag = ui.draggable,
          $equivalentTag = $('.andor-container').find('.tag-name.faded')
                                                // Exact matching
                                                .filter(function() {
                                                  return $(this).text().trim() === tag.text().trim();
                                                });
      if (tag.hasClass('from-bucket')) {
        tag.remove();
        $equivalentTag.removeClass('faded').css('background-color', $equivalentTag.data('originalRGB'));
      }
    },
    tolerance: "pointer"
  });

  bucketDroppable($(".add-new-bucket"));

  $andorContainer.on("mousedown", ".tag-name.faded", function() {
    var $tag = $(this),
        $equivalentTags = $(this).closest('.andor-container')
                                 .find('.tag-name')
                                 // Exact matching
                                 .filter(function() {
                                   return $(this).text().trim() === $tag.text().trim();
                                 });

    // highlight clicked tag and its equivalent tag.
    $equivalentTags.stop(true, true).effect("highlight", {easing: "easeInQuad"}, 800);
  });

  $andorContainer.on("click", ".add-new-bucket", function() {
    var andBox = $('<div class="andBox"></div>'),
        andInput = $('<input type="text" placeholder="Type Item and hit Enter" value="Type Item and hit Enter" />'),
        orSpacing,
        newBucket;

    orSpacing = $('<div class="or-spacing">&</div>');

    // create a new optional box
    newBucket = $('<div class="add-new-bucket">' +
                    '<div class="inside-bucket">' +
                      '<span class="bucket-text">' +
                        'Drag or Click for New' +
                        '<div class="bucket-icon-green">' +
                          '<i class="fa fa-plus-circle fa-2x"></i>' +
                        '</div>' +
                      '</span>' +
                    '</div>' +
                  '</div>');

    $.each(checkUnusedBuckets(), function(i, e) {
      var $e = $(e);
      $e.next('.or-spacing').remove();
      $e.remove();
    });

    $(this).before(andBox.append(andInput)).after(newBucket).after(orSpacing).remove();

    andInput.on("keypress", function(e) {
      var $this = $(this);
      if ($this.val().trim() === ''){
        $this.val('');
      }
      if (e.keyCode === 13 && $this.val().trim() !== '') {
        var tag = $('<div class="tag-name removable" style="background-color: #d4d4d4;">' + $this.val() + '<i class="fa fa-times close"></i></div>'),
            tagFound = $this.parent().siblings(".item-container")
                            .find('.tag-name')
                            // Exact matching
                            .filter(function() {
                              return $(this).text().trim() === tag.text().trim();
                            });

        if (tagFound.length) {
          tag.css('background-color', tagFound.css('background-color'));
          tagFound.addClass('faded').data('originalRGB', tagFound.css('background-color'))
                  .css('background-color', fadeRGB(tagFound.css('background-color'), "0.25"));
        }

        $this.parent().append(tag);
        $this.val('');
        addBucketDraggable(tag);
      }
    });

    andInput.on("focusout", function() {
      $(this).val('');
    });

    andInput.select();
    bucketDroppable([andBox, newBucket]);
  });

  $andorContainer.on("click", ".tag-name .close", function() {
    var tag = $(this).parent(),
        $equivalentTag = $('.andor-container')
                           .find('.tag-name.faded')
                           // Exact matching
                           .filter(function() {
                             return $(this).text().trim() === tag.text().trim();
                           });

    tag.remove();
    $equivalentTag.removeClass('faded').css('background-color', $equivalentTag.data('originalRGB'));
  });


  function fadeRGB(rgb, a) {
    // deconstruct rgb
    var rgbSplit = rgb.slice(4, rgb.length - 1).split(', ');
    // reconstruct rgb with 'faded' colors
    return "rgb(" + rgbSplit.map(function(hue) {
        // determine the faded color
        return Math.round(a * hue + ((1 - a) * 255));
      }).join(', ') + ")";
  }


  function bucketDroppable(elements) {
    $(elements).droppable({
      drop: function(event, ui) {
        var tag = ui.draggable,
            tagHelper = ui.helper,
            tagClone = tag.clone(),
            originalRGB = tag.css('background-color'),
            andBox,
            orSpacing,
            andInput,
            newBucket;

        if (tagHelper.hasClass('from-container')) {
          // visually update the tag that was dragged & dropped.
          tag.addClass('faded').data('originalRGB', originalRGB)
             .css('background-color', fadeRGB(originalRGB, "0.25"));

          tagClone.addClass('removable').append('<i class="fa fa-times close"></i>');
        } else {
          if (!tag.hasClass('removable')) {
            tag.addClass('removable');
          }
          if (!tag.find('.close')) {
            tag.append('<i class="fa fa-times close"></i>');
          }
        }

        if ($(this).hasClass('add-new-bucket')) {
          // create the box that holds tags for the query
          andBox = $('<div class="andBox"></div>');
          andInput = $('<input type="text" placeholder="Type Item and hit Enter" value="Type Item and hit Enter" />');
          orSpacing = $('<div class="or-spacing">&</div>');

          // create a new optional box
          newBucket = $('<div class="add-new-bucket">' +
                          '<div class="inside-bucket">' +
                            '<span class="bucket-text">' +
                              'Drag or Click for New' +
                              '<div class="bucket-icon-green">' +
                                '<i class="fa fa-plus-circle fa-2x"></i>' +
                              '</div>' +
                            '</span>' +
                          '</div>' +
                        '</div>');

          if (tagHelper.hasClass('from-container')) {
            tagClone.css('top', 0).css('right', 0).css('bottom', 0).css('left', 0);
          } else {
            tag.css('top', 0).css('right', 0).css('bottom', 0).css('left', 0);
          }

          $(this).before(andBox.append(andInput).append((tagHelper.hasClass('from-container') ? tagClone : tag))).after(newBucket).after(orSpacing).remove();
          bucketDroppable([andBox, newBucket]);
          addBucketDraggable((tagHelper.hasClass('from-container') ? tagClone : tag));

          andInput.on("keypress", function(e) {
            var $this = $(this);
            if ($this.val().trim() === ''){
              $this.val('');
            }
            if (e.keyCode === 13 && $this.val().trim() !== '') {
              var tag = $('<div class="tag-name removable" style="background-color: #d4d4d4;">' + $this.val() + '<i class="fa fa-times close"></i></div>'),
                  tagFound = $this.parent().siblings(".item-container")
                                  .find('.tag-name')
                                  // Exact matching
                                  .filter(function() {
                                    return $(this).text().trim() === tag.text().trim();
                                  });

              if (tagFound.length) {
                tag.css('background-color', tagFound.css('background-color'));
                tagFound.addClass('faded').data('originalRGB', tagFound.css('background-color'))
                        .css('background-color', fadeRGB(tagFound.css('background-color'), "0.25"));
              }

              $this.parent().append(tag);
              $this.val('');
              addBucketDraggable(tag);
            }
          });

          andInput.on("focusout", function() {
            $(this).val('');
          });
        } else {
          if (tagHelper.hasClass('from-container')) {
            tagClone.css('top', 0).css('right', 0).css('bottom', 0).css('left', 0);
            $(this).append(tagClone);
            tagClone.draggable('destroy');
            addBucketDraggable(tagClone);
          } else {
            tag.css('top', 0).css('right', 0).css('bottom', 0).css('left', 0);
            $(this).append(tag);
            tag.draggable('destroy');
            addBucketDraggable(tag);
          }
        }
      },
      hoverClass: "color",
      tolerance: "pointer"
    });
  }


  function addBucketDraggable(element) {
    $(element).draggable({
      containment: ".andor-container",
      start: function(event, ui) {
        ui.helper.addClass("from-bucket");
      },
      stop: function() {
        $.each(checkUnusedBuckets(), function(i, e) {
          var $e = $(e);
          $e.next('.or-spacing').remove();
          $e.remove();
        });
      },
      revert: "invalid"
    });
  }

  function checkUnusedBuckets() {
    return $(".andBox").filter(function(i, e) {
      return !$(e).find('.tag-name').length;
    });
  }
})(this);