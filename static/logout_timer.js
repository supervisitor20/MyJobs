var readCookie = utils.readCookie;

(window.setInterval(function() {
  // if we are logged out and not already on the home page
  if (readCookie('loggedout') === "True" && window.location.pathname !== "{% url 'home' %}") {
    window.location.assign("{% url 'home' %}");
  }
}, 1000))();
