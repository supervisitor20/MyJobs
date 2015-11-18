$(document).ready(function() {
  var validTags = [];
  $("#p-tags").hide();
  $("#p-tags").tagit({
      showAtuocompleteOnFocus: !create_tags,
      tagSource: function(search, showChoices) {
          var value = $(".tagit-new > input").val(),
              search = {value: value},
              that = this;
          $.ajax({
              type: "GET",
              url: "/prm/view/records/get-tags",
              data: search,
              success: function(data) {
                  var jdata = jQuery.parseJSON(data);
                  validTags = jdata;
                  showChoices(that._subtractArray(jdata, that.assignedTags()))
              }
          });
      },
      beforeTagAdded: function(event, ui) {
          ui.tag.hide();

          if(!ui.duringInitialization && !create_tags && validTags.indexOf(ui.tagLabel) === -1) {
              ui.tag.text("");
          } else {
              $.ajax({
                  type: "GET",
                  url: "/prm/view/records/get-tag-color",
                  data: {"name": ui.tagLabel},
                  success: function(data) {
                      var jdata = jQuery.parseJSON(data);
                      if(jdata.length > 0)
                          ui.tag.css("background-color", "#"+jdata[0]);
                      ui.tag.show();
                  }
              })
          }
      },
      afterTagAdded: function(event, ui) {
          if(!ui.duringInitialization && !create_tags && validTags.indexOf(ui.tagLabel) === -1) {
              var $tags = $("#p-tags");
                  words = $tags.val().split(",");

              $tags.val(words.splice(0, words.length - 1).join(","));
          }
      },
      autocomplete: {delay: 0, minLength: 1},
      placeholderText: "Add Tag"
  });
});
