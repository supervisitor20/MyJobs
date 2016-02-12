// IMPORTANT NOTE! Use of this JS is specific to the cross-site
// saved search widget. It relies heavily on the cross site JS
// and will not function without it (secure-block.**-**.js)

// stores the secure blocks container div for reference in the script
var blocks_widget_div;

//global iables for interacting with secure blocks template assigned values
var email_input;


$('#saved-search-email').bind('keypress', function(e) {
	if(e.keyCode==13){ // keycode 13 is "enter". Bind "enter" to submit
    e.preventDefault();
    blocks_widget_div = $(this).closest("[data-secure-block-id]");
    save_search();
	}
});

$('#saved-search-btn').click(function(e) {
  e.preventDefault();
  blocks_widget_div = $(this).closest("[data-secure-block-id]");
  save_search();
});

//borrowed from gulp/src/util/validateEmail.js
function validate_email(email) {
  var re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;
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
  if ($('#saved-search-email') && !validate_email(email_input)) {
    handle_error("Enter a valid email (user@example.com)");
  }
  else {
    $('.saved-search-form').html('<em class="saved-search-widget-loading"> Saving </em>');
    create_saved_search()
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

function get_request_data () {
  return {
    url: encodeURIComponent(window.location.href),
    email: email_input,
  }
}

function create_saved_search() {
  var request_data = get_request_data();
  cross_site_request(parent_site_url + '/saved-search/api/secure-saved-search',
                     request_data)
    .fail(function(return_data) { handle_error() })
    .done(function(return_data) {
      if (return_data['error']) {
        handle_error(return_data['error'])
      }
      else {
        $(blocks_widget_div).data("new-user-success", return_data['user_created']);
        reload_widget(remove_success_flag);
      }
    });
}

function cross_site_request(cross_site_url, ajax_data) {
  // need to explicitly marshal the result data into this deferred
  // because we are on old jQuery.
  var result = $.Deferred();
  $.ajax({
    type: "OPTIONS",
    crossDomain: true,
  }).done(function(data, textStatus, xhr) {
    xhr_request(cross_site_url, ajax_data).
        done(result.resolve).
        fail(result.reject);
  }).fail(function(xhr, textStatus, error) {
    jsonp_request(cross_site_url, ajax_data).
        done(result.resolve).
        fail(result.reject);
  });
  return result.promise();
}

function xhr_request(cross_site_url, ajax_data) {
  return $.ajax({
    url: cross_site_url,
    type: "POST",
    headers: {'X-Requested-With': 'XMLHttpRequest'},
    data: JSON.stringify(ajax_data),
    contentType: "application/json",
    xhrFields: {
      withCredentials: true
    },
  });
}

function jsonp_request(cross_site_url, ajax_data) {
  return $.ajax({
    url: cross_site_url,
    type: "GET",
    dataType: "jsonp",
    data: ajax_data,
    timeout: 15000,
  });
}