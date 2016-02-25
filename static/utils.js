var timer;

var utils = {
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
  logoutTimer: function(url) {
    if (!timer) {
      timer = window.setInterval(function() {
        // if we are logged out and not already on the home page
        if (this.readCookie('loggedout') === "True" && window.location.pathname !== url) {
          window.location.assign(url);
        }
      }, 1000);
    } else {
      window.clearInterval(timer);
    }
  },
};
