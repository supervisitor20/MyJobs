var saved_dashboard_url = '';

function read_cookie(cookie) {
    var nameEQ = cookie + "=",
        ca = document.cookie.split(';');
    for (var i=0; i< ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function route_cors_jsonp(url, input_data) {
  // this function determines if the request should be made with CORS
  // or JSONP based on the result of an OPTIONS call
  // need to explicitly marshal the result data into this deferred
  // because we are on old jQuery.
  input_data = input_data || {}
  var result = $.Deferred();
  $.ajax({
    type: "OPTIONS",
    crossDomain: true,
  }).done(function(data, textStatus, xhr) {
    xhr_call(url, input_data).
        done(result.resolve).
        fail(result.reject);
  }).fail(function(xhr, textStatus, error) {
    jsonp_call(url, input_data).
        done(result.resolve).
        fail(result.reject);
  });
  return result.promise();
}

function xhr_call(secure_block_url, input_data) {
  var json = JSON.stringify(input_data);
  return $.ajax({
    url: secure_block_url,
    type: "POST",
    headers: {'X-Requested-With': 'XMLHttpRequest'},
    data: json,
    contentType: "application/json",
    xhrFields: {
      withCredentials: true
    },
  });
}

function jsonp_call(secure_block_url, input_data) {
  var json = JSON.stringify(input_data);
  return $.ajax({
    url: secure_block_url,
    type: "GET",
    dataType: "jsonp",
    data: json,
  });
}

function populate_secure_blocks(request) {
  // take object with element ids and fill in placeholder divs with content
  if (!$.isEmptyObject(request)) {
    route_cors_jsonp(saved_dashboard_url, request).fail(function(xhr, text, error) {
        console.error("dashboard fail: ", xhr, text, error);
    }).done(function(data, text, xhr) {
        $.each(data, function(key, value) {
        $("[data-secure-block-id=" + key + "]").html(value);
        });
    });
  }
}

function load_secure_blocks(dashboard_url) {
  // load secure blocks for all divs containing the proper data tag
  saved_dashboard_url = dashboard_url;
  var request = {};
  $("*[data-secure-block-id]").each(function(i, block) {
    var element_id = $(block).data('secure-block-id');
    request[element_id] = $(block).data();
  });
  populate_secure_blocks({blocks: request});
}

function reload_secure_block(block_id) {
  // reload an individual secure block that may have changed state
  var request = {};
  var block = $("[data-secure-block-id|=" + block_id + "]");
  if (block) {
    request[block_id] = block.data();
    populate_secure_blocks({blocks: request});
  }
}
