(function(global) {
  "use strict"

  $(".item-container").sortable();

  $(".tag-name").draggable({
    addClasses: false,
    connectToSortable: ".item-container",
    zIndex: 1000
  });

  $(".new-bucket").droppable({
    drop: function() {
      console.log("dropped");
      var newBucket = $('<div class="new-bucket">' +
                           '<div class="inside-bucket">' +
                             '<span class="bucket-text">' +
                               'Drag for New' +
                               '<div class="bucket-icon-green">' +
                                 '<i class="fa fa-plus-circle fa-2x"></i>' +
                               '</div>' +
                             '</span>' +
                           '</div>' +
                         '</div>');
      $(this).parent().append(newBucket);
    },
    hoverClass: "color"
  });

})(this);