/**
 * Legacy es5.1 functions used in seo_base.html template
**/

$(document).ready(function() {
  /* needed to render 'topbar' */
  if(typeof site_name !== 'undefined' && !$("*[data-widget_type=tools]").length) {
      get_toolbar(site_name);
  }

  /* Save Search Functionality */
  get_default_widget_html(false);
});

function get_toolbar(site_name) {
    var site = encodeURIComponent(window.location.protocol + '//' + window.location.hostname),
        url = ABSOLUTE_URL + "topbar/?v2=1&site_name=" + site_name + "&site=" + site + "&impersonating=" + impersonating;
    $.ajax({
        url: url,
        dataType: "jsonp",
        type: "GET",
        jsonpCallback: 'populate_toolbar',
        crossDomain: true,
        processData: false,
        headers: {'Content-Type': 'application/json', Accept: 'text/javascript'}
    });
}

function populate_toolbar(data) {
    $(".direct_dotjobsWideHeader").prepend(data);
}

var ss_username = "directseo@directemployersfoundation.org";
var ss_api_key = "6fcd589a4efa72de876edfff7ebf508bedd0ba3e";
var ss_api_str = "&username=" + ss_username  + "&api_key=" + ss_api_key;
var base_url = 'https://secure.my.jobs';
var ss_url = encodeURIComponent(window.location.href);
var most_recent_html = '';


function handle_error() {
    // Fills with the most recent text and then overwrites applicable parts
    // with the error message. Uses the most recent text to ensure formatting
    // and variables supplied by myjobs are persistent, so the experience
    // for logged in users continues to be the same.

    fill(most_recent_html);
    $('.saved-search-form').prepend('<em class="warning">Something went wrong!</em>');
    $('.saved-search-form > form > b').html('<p>Your search could not successfully be created.</p>');
    $('label[for="saved-search-email"]').html('<p>Your search could not successfully be created.</p>');
    $('.saved-search-button').html('Try saving this search again');
}

function fill(html) {
    $('#de-myjobs-widget').html(html);
    $('#mobile-de-myjobs-widget').html(html);
    most_recent_html = html;
}

function save_search() {
    // If there is any hint that there isn't a well-defined user email
    // provided, attempts to get a user from the input and create a new user.
    // Otherwise, uses the currently provided user to create a saved search.

    if (user_email != 'None' && user_email != 'undefined' && user_email) {
        $('.saved-search-form').html('<em class="saved-search-widget-loading">Saving this search</em>');
        create_saved_search();
    }
    else {
        try {
            user_email = $('#saved-search-email').val();
            $('.saved-search-form').html('<em class="saved-search-widget-loading">Saving this search</em>');
            create_user();
        }
        catch(err) {
            handle_error();
        }
    }
}

function reload_default_widget(data) {
    if(data.error) {
        handle_error();
    }
    else {
        get_default_widget_html(true);
    }
}

function get_default_widget_html(success) {
    if(success) {
        ajax_url = base_url + '/saved-search/widget/?v2=1&callback=fill&success=' + user_email + '&url=' + ss_url;
    }
    else {
        ajax_url = base_url + '/saved-search/widget/?v2=1&callback=fill&url=' + ss_url;
    }
    jsonp_ajax_call(ajax_url);
}


function create_saved_search() {
    jsonp_ajax_call(base_url + "/api/v1/savedsearch/?callback=reload_default_widget&email=" + user_email + ss_api_str + "&url=" + ss_url);
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
            $('#saved-search-email').keyup(function(event) {
                var ENTER = 13; // The keycode of the enter button
                if (event.which === ENTER) {
                    save_search();
                }
            });
        }
    });
}

/*
JAVASCRIPT FOR THE NEW REBRANDING HOMEPAGE FUNCTIONALITY
*/
  //Javascript to show search criteria in mobile view
  $(".mobile-search-btn").on("click", function(e) {
    $(".search-criteria-box").toggleClass("show-search-criteria");
  });

  //Javascript for showing the search facets in mobile view on click
  $("#mobile_search").on("click", function(e) {
    var mobileSearchFacets = $(".mobile-search-facets");
    mobileSearchFacets.toggleClass("show-mobile-search-facets");
  });

  // //Javascript for activating the mobile footer menu
  // function activeMobileMenu() {
  //   var showMessages = $( '#show_messages' );
  //   var showCompany = $( '#show_company' );
  //   var showProfile = $( '#show_profile' );
  //   var messageMenu = $("#cbp-spmenu-m4");
  //   var companyMenu = $("#cbp-spmenu-c4");
  //   var profileMenu = $("#cbp-spmenu-p4");
  //
  //   showMessages.on("click", function(e)  {
  //     e.stopPropagation();
  //     $( this ).toggleClass('active' );
  //     messageMenu.toggleClass('cbp-spmenu-open' );
  //     if (companyMenu.hasClass('cbp-spmenu-open') || profileMenu.hasClass('cbp-spmenu-open')) {
  //       companyMenu.removeClass('cbp-spmenu-open');
  //       profileMenu.removeClass('cbp-spmenu-open');
  //     }
  //   });
  //   showCompany.on("click", function(e)  {
  //     e.stopPropagation();
  //     $( this ).toggleClass('active' );
  //     companyMenu.toggleClass('cbp-spmenu-open' );
  //     if (messageMenu.hasClass('cbp-spmenu-open') || profileMenu.hasClass('cbp-spmenu-open')) {
  //       messageMenu.removeClass('cbp-spmenu-open');
  //       profileMenu.removeClass('cbp-spmenu-open');
  //     }
  //   });
  //   showProfile.on("click", function(e)  {
  //     e.stopPropagation();
  //     $( this ).toggleClass('active' );
  //     profileMenu.toggleClass('cbp-spmenu-open' );
  //     if (companyMenu.hasClass('cbp-spmenu-open') || messageMenu.hasClass('cbp-spmenu-open')) {
  //       companyMenu.removeClass('cbp-spmenu-open');
  //       messageMenu.removeClass('cbp-spmenu-open');
  //     }
  //   });
  // }
  // activeMobileMenu();

  //Javascript for closing the mobile menu on click of anywhere on the screen
  $(window).click(function() {
    var messageMenu = $("#cbp-spmenu-m4");
    var companyMenu = $("#cbp-spmenu-c4");
    var profileMenu = $("#cbp-spmenu-p4");

    if (companyMenu.hasClass('cbp-spmenu-open') || messageMenu.hasClass('cbp-spmenu-open') || profileMenu.hasClass('cbp-spmenu-open')) {
      companyMenu.removeClass('cbp-spmenu-open');
      messageMenu.removeClass('cbp-spmenu-open');
      profileMenu.removeClass('cbp-spmenu-open');
    }
  });

  //Function for initializing the accordion of the search criteria
  function filterAccordion() {
    var accordion = $(".filter-accordion");
    $.each(accordion, function(v,i) {
      var that = $(this);
      var panel = that.next(".filter-panel");
      var filterCaret = that.children(".drop-caret");
      that.on("click", function(e) {
        panel.toggleClass("filter-panel-deactive");
        filterCaret.toggleClass("caret-rotate");
      })
    })
  }
  filterAccordion();

  //Javascript for showing and hiding the social share icons when the share button is clicked
  $(window).on("click", function() {
    var socialMedia = $(".social-media");
    if(socialMedia.hasClass("show-social")){
      socialMedia.removeClass("show-social");
    }
  });
  $(".share-social").on("click", function(e) {
    e.stopPropagation();
    var social = $(".social-media");
    social.toggleClass("show-social");
  });

  //Javascript to cut the count off of the facets and place it separately into a span that floats to the right
  //Might need to configure and change settings later to get rid of this function
  $.each($("#direct_disambiguationDiv li a"), function(i,v) {
    var self = $(this);
    var text = self.text().split("(")[0];
    var count = self.text().split("(").pop();
    self.html(text);
    self.append("<span class='count'></span>");
    self.children("span").html("(" + count);
  });

  //Javascript to cut the count off the hidden facets and place it separately inside of a span that floats. The code
  //above is duplicated but wouldn't work for the hidden LI that were created on the fly so I am dynamically doing it
  //when there is a click event on the option to show more of the filters
  $(".direct_optionsMore").on("click", function(e) {
    $.each($("#direct_disambiguationDiv li a"), function(i,v) {
      var self = $(this);
      var text = self.text().split("(")[0];
      var count = self.text().split("(").pop();
      self.html(text);
      self.append("<span class='count'></span>");
      self.children("span").html("(" + count);
    });
  });

  //Function for showing and hiding the header when scrolling in mobile view
  function showHideHeaderScroll(){
    // Hide Header on on scroll down
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = $('nav').outerHeight();
    var viewPort = $(window).width();

    //Checking to see if it's a mobile device or if the screensize is in mobile view
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || viewPort < 992 ) {
      $(window).scroll(function(event){
          didScroll = true;
      });

      setInterval(function() {
          if (didScroll) {
              hasScrolled();
              didScroll = false;
          }
      }, 250);

      //Checking to make sure a scroll has occured
      function hasScrolled() {
          var scroll_Top = $(this).scrollTop();

          // Make sure they scroll more than delta
          if(Math.abs(lastScrollTop - scroll_Top) <= delta)
              return;

          // If they scrolled down and are past the navbar, add class .nav-up.
          if (scroll_Top > lastScrollTop && scroll_Top > navbarHeight){
              // Scroll Down
              $('nav').removeClass('nav-down').addClass('nav-up');
          } else {
              // Scroll Up
              if(scroll_Top + $(window).height() < $(document).height()) {
                  $('nav').removeClass('nav-up').addClass('nav-down');
              }
          }

          lastScrollTop = scroll_Top;
      }
    }
  }

  showHideHeaderScroll();
