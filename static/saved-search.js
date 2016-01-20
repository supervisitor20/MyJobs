// IMPORTANT NOTE! Use of this JS is specific to the cross-site
// saved search widget. It relies heavily on the cross site JS
// and will not function without it (secure-block.**-**.js)

var ss_username = "directseo@directemployersfoundation.org";
var ss_api_key = "6fcd589a4efa72de876edfff7ebf508bedd0ba3e";
var ss_api_str = "&username=" + ss_username  + "&api_key=" + ss_api_key;
var base_url = 'https://secure.my.jobs';
var ss_url = encodeURIComponent(window.location.href);
// stores the secure blocks container div for reference in the script
var blocks_widget_div;

//global iables for interacting with secure blocks template assigned values
var email_input;


$('#saved-search-btn').click(function(e) {
  e.preventDefault();
  blocks_widget_div = $(this).closest("[data-secure-block-id]");
  save_search();
});

//borrowed from gulp/src/util/validateEmail.js
function validateEmail(email) {
  var re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return re.test(email);
}

function handle_error(error) {
  // Fills with the most recent text and then overwrites applicable parts
  // with the error message. Uses the most recent text to ensure formatting
  // and variables supplied by myjobs are persistent, so the experience
  // for logged in users continues to be the same.
  var error = error || "Something went wrong!"
  $(blocks_widget_div).data("error", error);
  reload_widget(remove_error_flag);
}

function remove_error_flag() {
  $(blocks_widget_div).data("error", "");
}

function save_search() {
  // If there is any hint that there isn't a well-defined user email
  // provided, attempts to get a user from the input and create a new user.
  // Otherwise, uses the currently provided user to create a saved search.
  email_input = $('#saved-search-email').val() || existing_user_email;
  $(blocks_widget_div).data("current-input", email_input);
  if ($('#saved-search-email') & !validate_email(email_input)) {
    handle_error("Enter a valid email (user@example.com)");
  }
  else {
    $('.saved-search-form').html('<em class="saved-search-widget-loading"> Saving </em>');
    if (email_input == existing_user_email){
      create_saved_search()
    }
    else {
      create_user();
    }
  }
}

function check_save_success(data) {
  if(data.error) {
    handle_error();
  }
  else {
    if (typeof email_input != 'undefined' & existing_user_email != email_input) {
      $(blocks_widget_div).data("new-user-success", true);
    }
    reload_widget(remove_success_flag);
    }
}

function remove_success_flag() {
  $(blocks_widget_div).data("new-user-success", false);
}

function reload_widget(callback) {
  // relies on secure-block.168-30.js for reload_secure_block function.
  // as the secure block script is what imports this js, this shouldn't
  // be a problem
  if (typeof reload_secure_block !== "undefined"){
    var element_id = $(blocks_widget_div).data('secure-block-id')
    reload_secure_block(element_id, callback);
  }
}


function create_saved_search() {
  jsonp_ajax_call(base_url + "/api/v1/savedsearch/?callback=check_save_success&email=" + email_input + ss_api_str + "&url=" + ss_url,
    "check_save_success");
}

function create_user() {
  jsonp_ajax_call(base_url + "/api/v1/user/?callback=create_saved_search&email=" + email_input + ss_api_str + "&source=" + window.location.hostname,
    "create_saved_search");
}


function jsonp_ajax_call(ajax_url, callback) {
  $.ajax({
    url: ajax_url,
    dataType: "jsonp",
    type: "GET",
    crossDomain: true,
    jsonp: false,
    processData: false,
    timeout: 15000,
    jsonpCallback: callback,
    headers: {
      'Content-Type': "application/json",
      Accept: 'text/javascript'
    },
    error: function(xhr, status, thrown) {
      handle_error();
    },
  });
}