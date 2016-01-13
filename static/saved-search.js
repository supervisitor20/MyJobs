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

// temporary code for storing the fact that there is a new user/the email provided
var new_user;

$('#saved-search-btn').click(function(e) {
    e.preventDefault();
    blocks_widget_div = $(this).closest("[data-secure-block-id]");
    save_search();
});

function handle_error() {
    // Fills with the most recent text and then overwrites applicable parts
    // with the error message. Uses the most recent text to ensure formatting
    // and variables supplied by myjobs are persistent, so the experience
    // for logged in users continues to be the same.
    //$(".warning").remove();
    //$('.saved-search-form').prepend('<em class="warning">Something went wrong!</em>');
    //$('#ss-btn-link').html('Try saving this search again');
    $(blocks_widget_div).data("error__once", true);
    reload_widget(remove_error_flag);
}

function remove_error_flag() {
    $(blocks_widget_div).data("error__once", false);
}

function save_search() {
    // If there is any hint that there isn't a well-defined user email
    // provided, attempts to get a user from the input and create a new user.
    // Otherwise, uses the currently provided user to create a saved search.
    if (user_email) {
        $('.saved-search-form').html('<em class="saved-search-widget-loading"> Saving </em>');
        create_saved_search();
    }
    else {
        try {
            user_email = $('#saved-search-email').val();
            $('.saved-search-form').html('<em class="saved-search-widget-loading"> Saving </em>');
            create_user();
        }
        catch(err) {
            handle_error();
        }
    }
}

function check_widget(data) {
    if(data.error) {
        handle_error();
    }
    else {
        debugger;
        if (new_user){
            $(blocks_widget_div).data("new_user_email", user_email);
        }
        reload_widget();
    }

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
    jsonp_ajax_call(base_url + "/api/v1/savedsearch/?callback=check_widget&email=" + user_email + ss_api_str + "&url=" + ss_url,
                    "check_widget");
}

function create_user() {
    new_user = true;
    jsonp_ajax_call(base_url + "/api/v1/user/?callback=create_saved_search&email=" + user_email + ss_api_str + "&source=" + window.location.hostname,
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
        timeout: 20000,
        jsonpCallback: callback,
        headers: {
            'Content-Type': "application/json",
            Accept: 'text/javascript'
        },
        error: function(xhr, status, thrown) {
            debugger;
            handle_error();
        },
    });
}