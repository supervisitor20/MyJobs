/* global $ */
/* eslint-disable */
/**
 * Legacy es5.1 functions used in seo_base_bootstrap3.html template,
 * relocated to the gulp directory to utilize es6, webpack, et al, during Sprint 24.
 * TODO: Modify coding styles to match eslint requirements.
 * TODO: Put utils.js in here as well and make it es6-ish.
 **/

$(document).ready(function () {
  // needed to render 'topbar'
  if (typeof site_name !== 'undefined' && !$('*[data-widget_type=tools]').length) {
    get_toolbar(site_name);
  }

  // Autocomplete functionality for the job,title,keyword input box.
  $('.micrositeTitleField').autocomplete({
    source: function (request, response) {
        $.ajax({
            url: '/ajax/ac/?lookup=title&term=' + request.term,
            dataType: 'jsonp',
            success: function(data) {
                response($.map(data, function (item) {
                    return {
                        label: item.title,
                        value: item.title,
                    };
                }));
            },
        });
    },
    open: function() {
        $('.ui-autocomplete li.ui-menu-item:odd').addClass('ui-menu-item-alternate');
        $('.ui-autocomplete li.ui-menu-item a').removeClass('ui-corner-all');
    },
    select: function (event, ui) {
        $('.micrositeTitleField').val('"' + ui.item.value + '"');
        return false;
    },
    minLength: 2,
  });

    // Autocomplete functionality for the city,state,country input box.
    $('.micrositeLocationField').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/ajax/ac/?lookup=location&term=' + request.term,
                dataType: 'jsonp',
                success: function(data) {
                    response($.map(data, function (item) {
                        return {
                            label: item.location + ' - (' + item.jobcount + ')',
                            value: item.location,
                        };
                    }));
                },
            });
        },
        open: function() {
            $('.ui-autocomplete li.ui-menu-item:odd').addClass('ui-menu-item-alternate');
        },
        minLength: 2,
    });

    // Add syntax highlighting to autocomplete results.
    $.ui.autocomplete.prototype._renderItem = function (ul, item) {
        /**
         Inputs:
         :ul:    the autocomplete object to modify
         :item:  the individual item to modify

         Returns:
         Modified item
         **/
        let term = this.term;
        if ((term.charAt(0) === '"' && term.charAt(term.length - 1) === '"')) {
            term = this.term.substr(1, term.length - 2);
        } else {
            term = this.term.split(' ').join('|');
        }

        let re = new RegExp('(' + term + ')', 'gi');
        let t = item.label.replace(re, '<strong class="ac-highlight">$1</strong>');
        return $('<li></li>')
            .data('item.autocomplete', item)
            .append('<a>' + t + '</a>')
            .appendTo(ul);
    };

    // Size the width of the drop down list to match width of input, always, in any size, without CSS
    $.ui.autocomplete.prototype._resizeMenu = function () {
        const ul = this.menu.element;
        ul.outerWidth(this.element.outerWidth());
    };

    // Submit the search form if location AND title fields have a value in them (and MOC if applicable).
    $('#standardSearch input[type=text]').bind('autocompleteselect', function (event, ul) {
        /**
         Inputs:
         :event: The autocompleteselect event
         :ul: The autocomplete object (an unordered list)
         **/
        $(this).val(ul.item.value);
        if ($('#moc').length > 0) {
            if ($('#location').val() !== '' && $('#q').val() !== '' && $('#moc').val() !== '') {
                $('#standardSearch').submit();
            }
        }
        else {
            if ($('#location').val() !== '' && $('#q').val() !== '') {
                $('#standardSearch').submit();
            }
        }
    });

    // Add autocomplete functionality to the MOC/MOS search field.
    $('.micrositeMOCField').autocomplete({
        source: function(request, response) {
            $.ajax({
                url: '/ajax/mac/?lookup=moc&term=' + request.term,
                dataType: 'jsonp',
                success: function(data) {
                    response($.map(data, function (item) {
                        return {
                            label: item.label,
                            value: item.value,
                            moc_id: item.moc_id,
                        };
                    }));
                },
            });
        },
        select: function(event, ui) {
            $('#moc_id').val(ui.item.moc_id);
        },
        open: function(event, ul) {
            $('.ui-autocomplete li.ui-menu-item:odd').addClass('ui-menu-item-alternate');
        },
        minLength: 2,
    });

    // Clear moc_id value if moc is changed
    $('#moc').change(function (event) {
        $('#moc_id').val('');
    });

    // Save Search Functionality
    get_default_widget_html(false);

});

function get_toolbar(site_name) {
    let site = encodeURIComponent(window.location.protocol + '//' + window.location.hostname),
        url = ABSOLUTE_URL + 'topbar/?v2=1&site_name=' + site_name + '&site=' + site + '&impersonating=' + impersonating;
    $.ajax({
        url: url,
        dataType: 'jsonp',
        type: 'GET',
        jsonpCallback: 'populate_toolbar',
        crossDomain: true,
        processData: false,
        headers: {'Content-Type': 'application/json', Accept: 'text/javascript'},
    });
}

function populate_toolbar(data) {
  $('.direct_dotjobsWideHeader').prepend(data);
}

if (window) {
  window.populate_toolbar = populate_toolbar;
}

const ss_username = 'directseo@directemployersfoundation.org';
const ss_api_key = '6fcd589a4efa72de876edfff7ebf508bedd0ba3e';
const ss_api_str = '&username=' + ss_username + '&api_key=' + ss_api_key;
const base_url = 'https://secure.my.jobs';
const ss_url = encodeURIComponent(window.location.href);

let most_recent_html = '';


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

if (window) {
    window.fill = fill;
}

function save_search() {
    // If there is any hint that there isn't a well-defined user email
    // provided, attempts to get a user from the input and create a new user.
    // Otherwise, uses the currently provided user to create a saved search.

    if (user_email !== 'None' && user_email !== 'undefined' && user_email) {
        $('.saved-search-form').html('<em class="saved-search-widget-loading">Saving this search</em>');
        create_saved_search();
    }
    else {
        try {
            user_email = $('#saved-search-email').val();
            $('.saved-search-form').html('<em class="saved-search-widget-loading">Saving this search</em>');
            create_user();
        }
        catch (err) {
            handle_error();
        }
    }
}

if (window) {
    window.save_search = save_search;
}

function reload_default_widget(data) {
    if (data.error) {
        handle_error();
    }
    else {
        get_default_widget_html(true);
    }
}

function get_default_widget_html(success) {
    let ajax_url;

    if (success) {
        ajax_url = base_url + '/saved-search/widget/?v2=1&callback=fill&success=' + user_email + '&url=' + ss_url;
    }
    else {
        ajax_url = base_url + '/saved-search/widget/?v2=1&callback=fill&url=' + ss_url;
    }
    jsonp_ajax_call(ajax_url);
}

function create_saved_search() {
    jsonp_ajax_call(base_url + '/api/v1/savedsearch/?callback=reload_default_widget&email=' + user_email + ss_api_str + '&url=' + ss_url);
}

function create_user() {
    jsonp_ajax_call(base_url + '/api/v1/user/?callback=create_saved_search&email=' + user_email + ss_api_str + '&source=' + window.location.hostname);
}


function jsonp_ajax_call(ajax_url) {
    $.ajax({
        url: ajax_url,
        dataType: 'jsonp',
        type: 'GET',
        crossDomain: true,
        jsonp: false,
        processData: false,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'text/javascript',
        },
        complete: function () {
            $('#saved-search-email').keyup(function (event) {
                const ENTER = 13; // The keycode of the enter button
                if (event.which === ENTER) {
                    save_search();
                }
            });
        },
    });
}

/*
 JAVASCRIPT FOR THE NEW REBRANDING HOMEPAGE FUNCTIONALITY
 */
// Javascript to show search criteria in mobile view
$('.mobile-search-btn').on('click', function () {
    $('.search-criteria-box').toggleClass('show-search-criteria');
});

// Javascript for showing the search facets in mobile view on click
$('#mobile_search').on('click', function () {
    let mobileSearchFacets = $('.mobile-search-facets');
    mobileSearchFacets.toggleClass('show-mobile-search-facets');
});

// Function for initializing the accordion of the search criteria
function filterAccordion() {
    let accordion = $('.filter-accordion');
    $.each(accordion, function (v, i) {
        let that = $(this);
        let panel = that.next('.filter-panel');
        let filterCaret = that.children('.drop-caret');
        that.on('click', function () {
            panel.toggleClass('filter-panel-deactive');
            filterCaret.toggleClass('caret-rotate');
        });
    });
}
filterAccordion();

// Javascript to cut the count off of the facets and place it separately into a span that floats to the right
// Might need to configure and change settings later to get rid of this function
$.each($('#direct_disambiguationDiv li a'), function (i, v) {
    const self = $(this);
    const text = self.text().split('(')[0];
    const count = self.text().split('(').pop();
    self.html(text);
    self.append('<span class="count"></span>');
    self.children('span').html('(' + count);
});

// Javascript to cut the count off the hidden facets and place it separately inside of a span that floats. The code
// above is duplicated but wouldn't work for the hidden LI that were created on the fly so I am dynamically doing it
// when there is a click event on the option to show more of the filters
$('.direct_optionsMore').on('click', function () {
    $.each($('#direct_disambiguationDiv li a'), function(i, v) {
        const self = $(this);
        const text = self.text().split('(')[0];
        const count = self.text().split('(').pop();
        self.html(text);
        self.append('<span class="count"></span>');
        self.children('span').html('(' + count);
    });
});

// Function for showing and hiding the header when scrolling in mobile view
function showHideHeaderScroll() {
    // Hide Header on on scroll down
    let didScroll;
    let lastScrollTop = 0;
    const delta = 5;
    const navbarHeight = $('nav.main-nav-topbar').outerHeight();
    const viewPort = $(window).width();

  // Checking to make sure a scroll has occured
  function hasScrolled() {
      const scrollTop = $(window).scrollTop();

      // Make sure they scroll more than delta
      if (Math.abs(lastScrollTop - scrollTop) <= delta) {
          return;
      }
      // If they scrolled down and are past the navbar, add class .nav-up.
      if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
          // Scroll Down
          $('nav.main-nav-topbar').removeClass('nav-down').addClass('nav-up');
      } else {
          // Scroll Up
          if (scrollTop + $(window).height() < $(document).height()) {
            $('nav.main-nav-topbar').removeClass('nav-up').addClass('nav-down');
          }
      }

    lastScrollTop = scrollTop;
  }

    // Checking to see if it's a mobile device or if the screensize is in mobile view
  if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || viewPort < 992 ) {
    $(window).scroll(() => {
      didScroll = true;
  });

    setInterval(() => {
      if (didScroll) {
        hasScrolled();
        didScroll = false;
      }
    }, 250);
  }
}

showHideHeaderScroll();
