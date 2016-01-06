// IMPORTANT NOTE! Use of this JS is specific to the cross-site
// saved search widget. It relies heavily on the cross site JS
// and will not function without it (secure-block.**-**.js)

var ss_username = "directseo@directemployersfoundation.org";
var ss_api_key = "6fcd589a4efa72de876edfff7ebf508bedd0ba3e";
var ss_api_str = "&username=" + ss_username  + "&api_key=" + ss_api_key;
var base_url = 'https://secure.my.jobs';
var ss_url = encodeURIComponent(window.location.href);

$('#saved-search-btn').click(function(e) {
    e.preventDefault();
    save_search();
});

function handle_error() {
    // Fills with the most recent text and then overwrites applicable parts
    // with the error message. Uses the most recent text to ensure formatting
    // and variables supplied by myjobs are persistent, so the experience
    // for logged in users continues to be the same.
    $(".warning").remove();
    $('.saved-search-form').prepend('<em class="warning">Something went wrong!</em>');
    $('#ss-btn-link').html('Try saving this search again');
}

function save_search() {
    // If there is any hint that there isn't a well-defined user email
    // provided, attempts to get a user from the input and create a new user.
    // Otherwise, uses the currently provided user to create a saved search.
    if (user_email != 'None' && user_email != 'undefined' && user_email) {
        $('#ss-btn-link').html('<em class="saved-search-widget-loading"> Saving </em>');
        create_saved_search();
    }
    else {
        try {
            user_email = $('#saved-search-email').val();
            create_user();
        }
        catch(err) {
            handle_error();
        }
    }
    return false;
}

function check_widget(data) {
    if(data.error) {
        handle_error();
    }
    else {
        reload_widget();
    }
}

function reload_widget() {
    // relies on secure-block.168-30.js for reload_secure_block function.
    // as the secure block script is what imports this js, this shouldn't
    // be a problem
    if (typeof reload_secure_block !== "undefined"){
        reload_secure_block('saved-search');
    }
}


function create_saved_search() {
    jsonp_ajax_call(base_url + "/api/v1/savedsearch/?callback=check_widget&email=" + user_email + ss_api_str + "&url=" + ss_url);
}

function create_user() {
    jsonp_ajax_call(base_url + "/api/v1/user/?callback=create_saved_search&email=" + user_email + ss_api_str + "&source=" + window.location.hostname);
}


function jsonp_ajax_call(ajax_url) {
    $.ajax({
        url: ajax_url,
        dataType: "jsonp",
        type: "GET",
        crossDomain: true,
        jsonp: false,
        processData: false,
        headers: {
            'Content-Type': "application/json",
            Accept: 'text/javascript'
        },
        complete: function() {

        }
    });
}