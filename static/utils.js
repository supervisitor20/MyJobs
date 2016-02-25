/**
 * A hodge podge of useful utility functions used across site. This is imported
 * in base.html before anything else to ensure that it is globally available.
 **/
var timer;

var utils = {
  /**
   * Returns the value of the cookie. Returns null if that cookie is not found.
   * cookie: The name of the cookie to retreive.
   **/
  readCookie: function(cookie) {
    const nameEQ = cookie + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  },
  /**
   * Creates a new timer which redirects the user if the `loggedout` cookie is
   * set.
   *
   * url: The url to redirect to.
   **/
  logoutTimer: function(url) {
    if (!timer) {
      timer = window.setInterval(function() {
        // if we are logged out and not already on the home page
        if (this.readCookie('loggedout') && window.location.pathname !== url) {
          window.location.assign(url);
        }
      }, 1000);
    } else {
      window.clearInterval(timer);
    }
  },
};
