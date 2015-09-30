
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

function dashboard(dashboard_url) {
  // need to explicitly marshal the result data into this deferred
  // because we are on old jQuery.
  var result = $.Deferred();
  $.ajax({
    type: "OPTIONS",
    crossDomain: true,
  }).done(function(data, textStatus, xhr) {
    xhr_dashboard(dashboard_url).
        done(result.resolve).
        fail(result.reject);
  }).fail(function(xhr, textStatus, error) {
    jsonp_dashboard(dashboard_url).
        done(result.resolve).
        fail(result.reject);
  });
  return result.promise();
}

function xhr_dashboard(dashboard_url) {
  var csrftoken = read_cookie("csrftoken");
  return $.ajax({
    url: dashboard_url,
    type: "POST",
    headers: {'X-Requested-With': 'XMLHttpRequest'},
    data: {csrfmiddlewaretoken: csrftoken},
    xhrFields: {
      withCredentials: true
    },
  });
}

function jsonp_dashboard(dashboard_url) {
  return $.ajax({
    url: dashboard_url,
    type: "GET",
    dataType: "jsonp",
  });
}

