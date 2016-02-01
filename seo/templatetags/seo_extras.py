import datetime
import itertools
from pysolr import safe_urlencode
import random
import re
from slugify import slugify
import unicodedata
from bs4 import BeautifulSoup
import markdown2

from django import template
from django.conf import settings
from django.core.cache import cache
from django.template.defaultfilters import stringfilter
from django.utils.html import escape
from django.utils.safestring import mark_safe
from django.utils.timesince import timesince
from django.utils.translation import ugettext
from django.http import QueryDict

from seo.models import CustomPage, Company, GoogleAnalytics, SiteTag
from universal.helpers import get_object_or_none, update_url_param


register = template.Library()


@register.simple_tag
def newrelic_browser_monitoring():
    script_tag = """<script type="text/javascript">
        window.NREUM||(NREUM={}),__nr_require=function(t,e,n){function r(n){if(!e[n]){var o=e[n]={exports:{}};t[n][0].call(o.exports,function(e){var o=t[n][1][e];return r(o||e)},o,o.exports)}return e[n].exports}if("function"==typeof __nr_require)return __nr_require;for(var o=0;o<n.length;o++)r(n[o]);return r}({QJf3ax:[function(t,e){function n(t){function e(e,n,a){t&&t(e,n,a),a||(a={});for(var c=s(e),f=c.length,u=i(a,o,r),d=0;f>d;d++)c[d].apply(u,n);return u}function a(t,e){f[t]=s(t).concat(e)}function s(t){return f[t]||[]}function c(){return n(e)}var f={};return{on:a,emit:e,create:c,listeners:s,_events:f}}function r(){return{}}var o="nr@context",i=t("gos");e.exports=n()},{gos:"7eSDFh"}],ee:[function(t,e){e.exports=t("QJf3ax")},{}],3:[function(t){function e(t){try{i.console&&console.log(t)}catch(e){}}var n,r=t("ee"),o=t(1),i={};try{n=localStorage.getItem("__nr_flags").split(","),console&&"function"==typeof console.log&&(i.console=!0,-1!==n.indexOf("dev")&&(i.dev=!0),-1!==n.indexOf("nr_dev")&&(i.nrDev=!0))}catch(a){}i.nrDev&&r.on("internal-error",function(t){e(t.stack)}),i.dev&&r.on("fn-err",function(t,n,r){e(r.stack)}),i.dev&&(e("NR AGENT IN DEVELOPMENT MODE"),e("flags: "+o(i,function(t){return t}).join(", ")))},{1:22,ee:"QJf3ax"}],4:[function(t){function e(t,e,n,i,s){try{c?c-=1:r("err",[s||new UncaughtException(t,e,n)])}catch(f){try{r("ierr",[f,(new Date).getTime(),!0])}catch(u){}}return"function"==typeof a?a.apply(this,o(arguments)):!1}function UncaughtException(t,e,n){this.message=t||"Uncaught error with no additional information",this.sourceURL=e,this.line=n}function n(t){r("err",[t,(new Date).getTime()])}var r=t("handle"),o=t(6),i=t("ee"),a=window.onerror,s=!1,c=0;t("loader").features.err=!0,t(5),window.onerror=e;try{throw new Error}catch(f){"stack"in f&&(t(1),t(2),"addEventListener"in window&&t(3),window.XMLHttpRequest&&XMLHttpRequest.prototype&&XMLHttpRequest.prototype.addEventListener&&window.XMLHttpRequest&&XMLHttpRequest.prototype&&XMLHttpRequest.prototype.addEventListener&&!/CriOS/.test(navigator.userAgent)&&t(4),s=!0)}i.on("fn-start",function(){s&&(c+=1)}),i.on("fn-err",function(t,e,r){s&&(this.thrown=!0,n(r))}),i.on("fn-end",function(){s&&!this.thrown&&c>0&&(c-=1)}),i.on("internal-error",function(t){r("ierr",[t,(new Date).getTime(),!0])})},{1:9,2:8,3:6,4:10,5:3,6:23,ee:"QJf3ax",handle:"D5DuLP",loader:"G9z0Bl"}],5:[function(t){function e(){}if(window.performance&&window.performance.timing&&window.performance.getEntriesByType){var n=t("ee"),r=t("handle"),o=t(1),i=t(2);t("loader").features.stn=!0,t(3);var a=Event;n.on("fn-start",function(t){var e=t[0];e instanceof a&&(this.bstStart=Date.now())}),n.on("fn-end",function(t,e){var n=t[0];n instanceof a&&r("bst",[n,e,this.bstStart,Date.now()])}),o.on("fn-start",function(t,e,n){this.bstStart=Date.now(),this.bstType=n}),o.on("fn-end",function(t,e){r("bstTimer",[e,this.bstStart,Date.now(),this.bstType])}),i.on("fn-start",function(){this.bstStart=Date.now()}),i.on("fn-end",function(t,e){r("bstTimer",[e,this.bstStart,Date.now(),"requestAnimationFrame"])}),n.on("pushState-start",function(){this.time=Date.now(),this.startPath=location.pathname+location.hash}),n.on("pushState-end",function(){r("bstHist",[location.pathname+location.hash,this.startPath,this.time])}),"addEventListener"in window.performance&&(window.performance.addEventListener("webkitresourcetimingbufferfull",function(){r("bstResource",[window.performance.getEntriesByType("resource")]),window.performance.webkitClearResourceTimings()},!1),window.performance.addEventListener("resourcetimingbufferfull",function(){r("bstResource",[window.performance.getEntriesByType("resource")]),window.performance.clearResourceTimings()},!1)),document.addEventListener("scroll",e,!1),document.addEventListener("keypress",e,!1),document.addEventListener("click",e,!1)}},{1:9,2:8,3:7,ee:"QJf3ax",handle:"D5DuLP",loader:"G9z0Bl"}],6:[function(t,e){function n(t){i.inPlace(t,["addEventListener","removeEventListener"],"-",r)}function r(t){return t[1]}var o=t("ee").create(),i=t(1)(o),a=t("gos");if(e.exports=o,n(window),"getPrototypeOf"in Object){for(var s=document;s&&!s.hasOwnProperty("addEventListener");)s=Object.getPrototypeOf(s);s&&n(s);for(var c=XMLHttpRequest.prototype;c&&!c.hasOwnProperty("addEventListener");)c=Object.getPrototypeOf(c);c&&n(c)}else XMLHttpRequest.prototype.hasOwnProperty("addEventListener")&&n(XMLHttpRequest.prototype);o.on("addEventListener-start",function(t,e){function n(){return s}if(t[1]){var r=t[1];if("function"==typeof r){var s=a(r,"nr@wrapped",function(){return i(r,"fn-",n,r.name||"anonymous")});this.wrapped=t[1]=s,o.emit("initEventContext",[t,e],this.wrapped)}else"function"==typeof r.handleEvent&&i.inPlace(r,["handleEvent"],"fn-")}}),o.on("removeEventListener-start",function(t){var e=this.wrapped;e&&(t[1]=e)})},{1:24,ee:"QJf3ax",gos:"7eSDFh"}],7:[function(t,e){var n=t("ee").create(),r=t(1)(n);e.exports=n,r.inPlace(window.history,["pushState","replaceState"],"-")},{1:24,ee:"QJf3ax"}],8:[function(t,e){var n=t("ee").create(),r=t(1)(n);e.exports=n,r.inPlace(window,["requestAnimationFrame","mozRequestAnimationFrame","webkitRequestAnimationFrame","msRequestAnimationFrame"],"raf-"),n.on("raf-start",function(t){t[0]=r(t[0],"fn-")})},{1:24,ee:"QJf3ax"}],9:[function(t,e){function n(t,e,n){t[0]=i(t[0],"fn-",null,n)}function r(t,e,n){function r(){return a}this.ctx={};var a={"nr@context":this.ctx};o.emit("initTimerContext",[t,n],a),t[0]=i(t[0],"fn-",r,n)}var o=t("ee").create(),i=t(1)(o);e.exports=o,i.inPlace(window,["setTimeout","setImmediate"],"setTimer-"),i.inPlace(window,["setInterval"],"setInterval-"),i.inPlace(window,["clearTimeout","clearImmediate"],"clearTimeout-"),o.on("setInterval-start",n),o.on("setTimer-start",r)},{1:24,ee:"QJf3ax"}],10:[function(t,e){function n(){f.inPlace(this,p,"fn-",o)}function r(t,e){f.inPlace(e,["onreadystatechange"],"fn-")}function o(t,e){return e}function i(t,e){for(var n in t)e[n]=t[n];return e}var a=t("ee").create(),s=t(1),c=t(2),f=c(a),u=c(s),d=window.XMLHttpRequest,p=["onload","onerror","onabort","onloadstart","onloadend","onprogress","ontimeout"];e.exports=a,window.XMLHttpRequest=function(t){var e=new d(t);try{a.emit("new-xhr",[],e),e.hasOwnProperty("addEventListener")&&u.inPlace(e,["addEventListener","removeEventListener"],"-",o),e.addEventListener("readystatechange",n,!1)}catch(r){try{a.emit("internal-error",[r])}catch(i){}}return e},i(d,XMLHttpRequest),XMLHttpRequest.prototype=d.prototype,f.inPlace(XMLHttpRequest.prototype,["open","send"],"-xhr-",o),a.on("send-xhr-start",r),a.on("open-xhr-start",r)},{1:6,2:24,ee:"QJf3ax"}],11:[function(t){function e(t){var e=this.params,r=this.metrics;if(!this.ended){this.ended=!0;for(var i=0;c>i;i++)t.removeEventListener(s[i],this.listener,!1);if(!e.aborted){if(r.duration=(new Date).getTime()-this.startTime,4===t.readyState){e.status=t.status;var a=t.responseType,f="arraybuffer"===a||"blob"===a||"json"===a?t.response:t.responseText,u=n(f);if(u&&(r.rxSize=u),this.sameOrigin){var d=t.getResponseHeader("X-NewRelic-App-Data");d&&(e.cat=d.split(", ").pop())}}else e.status=0;r.cbTime=this.cbTime,o("xhr",[e,r,this.startTime])}}}function n(t){if("string"==typeof t&&t.length)return t.length;if("object"!=typeof t)return void 0;if("undefined"!=typeof ArrayBuffer&&t instanceof ArrayBuffer&&t.byteLength)return t.byteLength;if("undefined"!=typeof Blob&&t instanceof Blob&&t.size)return t.size;if("undefined"!=typeof FormData&&t instanceof FormData)return void 0;try{return JSON.stringify(t).length}catch(e){return void 0}}function r(t,e){var n=i(e),r=t.params;r.host=n.hostname+":"+n.port,r.pathname=n.pathname,t.sameOrigin=n.sameOrigin}if(window.XMLHttpRequest&&XMLHttpRequest.prototype&&XMLHttpRequest.prototype.addEventListener&&!/CriOS/.test(navigator.userAgent)){t("loader").features.xhr=!0;var o=t("handle"),i=t(2),a=t("ee"),s=["load","error","abort","timeout"],c=s.length,f=t(1),u=window.XMLHttpRequest;t(4),t(3),a.on("new-xhr",function(){this.totalCbs=0,this.called=0,this.cbTime=0,this.end=e,this.ended=!1,this.xhrGuids={}}),a.on("open-xhr-start",function(t){this.params={method:t[0]},r(this,t[1]),this.metrics={}}),a.on("open-xhr-end",function(t,e){"loader_config"in NREUM&&"xpid"in NREUM.loader_config&&this.sameOrigin&&e.setRequestHeader("X-NewRelic-ID",NREUM.loader_config.xpid)}),a.on("send-xhr-start",function(t,e){var r=this.metrics,o=t[0],i=this;if(r&&o){var f=n(o);f&&(r.txSize=f)}this.startTime=(new Date).getTime(),this.listener=function(t){try{"abort"===t.type&&(i.params.aborted=!0),("load"!==t.type||i.called===i.totalCbs&&(i.onloadCalled||"function"!=typeof e.onload))&&i.end(e)}catch(n){try{a.emit("internal-error",[n])}catch(r){}}};for(var u=0;c>u;u++)e.addEventListener(s[u],this.listener,!1)}),a.on("xhr-cb-time",function(t,e,n){this.cbTime+=t,e?this.onloadCalled=!0:this.called+=1,this.called!==this.totalCbs||!this.onloadCalled&&"function"==typeof n.onload||this.end(n)}),a.on("xhr-load-added",function(t,e){var n=""+f(t)+!!e;this.xhrGuids&&!this.xhrGuids[n]&&(this.xhrGuids[n]=!0,this.totalCbs+=1)}),a.on("xhr-load-removed",function(t,e){var n=""+f(t)+!!e;this.xhrGuids&&this.xhrGuids[n]&&(delete this.xhrGuids[n],this.totalCbs-=1)}),a.on("addEventListener-end",function(t,e){e instanceof u&&"load"===t[0]&&a.emit("xhr-load-added",[t[1],t[2]],e)}),a.on("removeEventListener-end",function(t,e){e instanceof u&&"load"===t[0]&&a.emit("xhr-load-removed",[t[1],t[2]],e)}),a.on("fn-start",function(t,e,n){e instanceof u&&("onload"===n&&(this.onload=!0),("load"===(t[0]&&t[0].type)||this.onload)&&(this.xhrCbStart=(new Date).getTime()))}),a.on("fn-end",function(t,e){this.xhrCbStart&&a.emit("xhr-cb-time",[(new Date).getTime()-this.xhrCbStart,this.onload,e],e)})}},{1:"XL7HBI",2:12,3:10,4:6,ee:"QJf3ax",handle:"D5DuLP",loader:"G9z0Bl"}],12:[function(t,e){e.exports=function(t){var e=document.createElement("a"),n=window.location,r={};e.href=t,r.port=e.port;var o=e.href.split("://");return!r.port&&o[1]&&(r.port=o[1].split("/")[0].split("@").pop().split(":")[1]),r.port&&"0"!==r.port||(r.port="https"===o[0]?"443":"80"),r.hostname=e.hostname||n.hostname,r.pathname=e.pathname,r.protocol=o[0],"/"!==r.pathname.charAt(0)&&(r.pathname="/"+r.pathname),r.sameOrigin=!e.hostname||e.hostname===document.domain&&e.port===n.port&&e.protocol===n.protocol,r}},{}],13:[function(t,e){function n(t){return function(){r(t,[(new Date).getTime()].concat(i(arguments)))}}var r=t("handle"),o=t(1),i=t(2);"undefined"==typeof window.newrelic&&(newrelic=window.NREUM);var a=["setPageViewName","addPageAction","setCustomAttribute","finished","addToTrace","inlineHit","noticeError"];o(a,function(t,e){window.NREUM[e]=n("api-"+e)}),e.exports=window.NREUM},{1:22,2:23,handle:"D5DuLP"}],gos:[function(t,e){e.exports=t("7eSDFh")},{}],"7eSDFh":[function(t,e){function n(t,e,n){if(r.call(t,e))return t[e];var o=n();if(Object.defineProperty&&Object.keys)try{return Object.defineProperty(t,e,{value:o,writable:!0,enumerable:!1}),o}catch(i){}return t[e]=o,o}var r=Object.prototype.hasOwnProperty;e.exports=n},{}],D5DuLP:[function(t,e){function n(t,e,n){return r.listeners(t).length?r.emit(t,e,n):void(r.q&&(r.q[t]||(r.q[t]=[]),r.q[t].push(e)))}var r=t("ee").create();e.exports=n,n.ee=r,r.q={}},{ee:"QJf3ax"}],handle:[function(t,e){e.exports=t("D5DuLP")},{}],XL7HBI:[function(t,e){function n(t){var e=typeof t;return!t||"object"!==e&&"function"!==e?-1:t===window?0:i(t,o,function(){return r++})}var r=1,o="nr@id",i=t("gos");e.exports=n},{gos:"7eSDFh"}],id:[function(t,e){e.exports=t("XL7HBI")},{}],G9z0Bl:[function(t,e){function n(){var t=p.info=NREUM.info,e=f.getElementsByTagName("script")[0];if(t&&t.licenseKey&&t.applicationID&&e){s(d,function(e,n){e in t||(t[e]=n)});var n="https"===u.split(":")[0]||t.sslForHttp;p.proto=n?"https://":"http://",a("mark",["onload",i()]);var r=f.createElement("script");r.src=p.proto+t.agent,e.parentNode.insertBefore(r,e)}}function r(){"complete"===f.readyState&&o()}function o(){a("mark",["domContent",i()])}function i(){return(new Date).getTime()}var a=t("handle"),s=t(1),c=window,f=c.document;t(2);var u=(""+location).split("?")[0],d={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",agent:"js-agent.newrelic.com/nr-768.min.js"},p=e.exports={offset:i(),origin:u,features:{}};f.addEventListener?(f.addEventListener("DOMContentLoaded",o,!1),c.addEventListener("load",n,!1)):(f.attachEvent("onreadystatechange",r),c.attachEvent("onload",n)),a("mark",["firstbyte",i()])},{1:22,2:13,handle:"D5DuLP"}],loader:[function(t,e){e.exports=t("G9z0Bl")},{}],22:[function(t,e){function n(t,e){var n=[],o="",i=0;for(o in t)r.call(t,o)&&(n[i]=e(o,t[o]),i+=1);return n}var r=Object.prototype.hasOwnProperty;e.exports=n},{}],23:[function(t,e){function n(t,e,n){e||(e=0),"undefined"==typeof n&&(n=t?t.length:0);for(var r=-1,o=n-e||0,i=Array(0>o?0:o);++r<o;)i[r]=t[e+r];return i}e.exports=n},{}],24:[function(t,e){function n(t){return!(t&&"function"==typeof t&&t.apply&&!t[i])}var r=t("ee"),o=t(1),i="nr@original",a=Object.prototype.hasOwnProperty;e.exports=function(t){function e(t,e,r,a){function nrWrapper(){var n,i,s,f;try{i=this,n=o(arguments),s=r&&r(n,i)||{}}catch(d){u([d,"",[n,i,a],s])}c(e+"start",[n,i,a],s);try{return f=t.apply(i,n)}catch(p){throw c(e+"err",[n,i,p],s),p}finally{c(e+"end",[n,i,f],s)}}return n(t)?t:(e||(e=""),nrWrapper[i]=t,f(t,nrWrapper),nrWrapper)}function s(t,r,o,i){o||(o="");var a,s,c,f="-"===o.charAt(0);for(c=0;c<r.length;c++)s=r[c],a=t[s],n(a)||(t[s]=e(a,f?s+o:o,i,s))}function c(e,n,r){try{t.emit(e,n,r)}catch(o){u([o,e,n,r])}}function f(t,e){if(Object.defineProperty&&Object.keys)try{var n=Object.keys(t);return n.forEach(function(n){Object.defineProperty(e,n,{get:function(){return t[n]},set:function(e){return t[n]=e,e}})}),e}catch(r){u([r])}for(var o in t)a.call(t,o)&&(e[o]=t[o]);return e}function u(e){try{t.emit("internal-error",e)}catch(n){}}return t||(t=r),e.inPlace=s,e.flag=i,e}},{1:23,ee:"QJf3ax"}]},{},["G9z0Bl",4,11,5]);
        ;NREUM.info={beacon:"bam.nr-data.net",errorBeacon:"bam.nr-data.net",licenseKey:"49b0eca3f4",applicationID:"480149",sa:1,agent:"js-agent.newrelic.com/nr-768.min.js"}
        </script>"""

    # Only use the script tag on 1% of page loads.
    return script_tag if random.random() < 0.01 else ""


@register.filter
@stringfilter
def case_insensitive_cut(value, args):
    args = re.compile(re.escape(args), re.IGNORECASE)
    return args.sub('', value)


@register.filter
@stringfilter
def replace(value, args):
    args = args.split('~')
    return value.replace(args[0], args[1])


@register.filter
@stringfilter
def append(value, arg):
    if value != '':
        return value + arg
    else:
        return ''


@register.filter
@stringfilter
def smart_truncate(content, length=32, suffix='...'):
    if isinstance(content, unicode):
        # reduce length by 1 for each wide char
        for c in content:
            if unicodedata.east_asian_width(c) == "W":
                length -= 1
    if len(content) <= length:
        return content
    else:
        return content[:length]+suffix


@register.filter
@stringfilter
def build_rss_link(val):
    val = escape(val)
    split = val.rsplit('?', 1)
    split[0] = split[0].rstrip('/') + '/feed/rss'
    return '?'.join(split)


@register.filter
@stringfilter
def facet_text(val):
    """
    This filter will take the passed in value of the form:
        url::text
    and parse out the text value and return that.
    """
    pieces = val.split("::")
    return pieces[1]


@register.filter
@stringfilter
def facet_url(val):
    """
    This filter will take the passed in value of the form:
        url::text
    and parse out the url value and return that.
    """
    pieces = val.split("::")
    return pieces[0]


@register.tag
def calculate_microsite_tags(parser, token):
    """
    This is a custom template tag used to calculate the opening and
    closing of columns for the microsite depending on a variable number
    of rows. An array is passed to it as a context variable to calculate
    the opening/closing of html tags to form the columns of the microsite
    carousel, processed by the VariableCycleNode

    """
    try:
        tag_name, cycle_string = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError("%r tag requires a single argument" %
                                           token.contents.split()[0])
    return VariableCycleNode(parser.compile_filter(cycle_string))


class VariableCycleNode(template.defaulttags.CycleNode):
    """
    This is a custom template code that can be used to cycle values from
    an array that is passed into the filter tag from a context variable

    """
    def __init__(self, cyclevars, variable_name=None):
        self.cyclevars = cyclevars
        self.variable_name = variable_name

    def render(self, context):
        my_vars = self.cyclevars.resolve(context)
        if self not in context.render_context:
            context.render_context[self] = itertools.cycle(my_vars)
        cycle_iter = context.render_context[self]
        value = cycle_iter.next()
        if self.variable_name:
            context[self.variable_name] = value
        return value


@register.filter
@stringfilter
def multiply_value(value, arg):
    if value != '':
        return int(value) * int(arg)
    else:
        return ''


@register.filter
def joblist_url(job):
    loc_slug = slugify(job.location)
    title_slug = slugify(job.title)
    return '/' + loc_slug + '/' + title_slug + '/' + job.guid + '/job/'


@register.filter
def merge_snippets(hl):
    snippets = hl['text']
    return ' ... '.join([i for i in snippets]) + ' ... '


@register.filter
def timedelta(value, arg=None):
    if not value:
        return ''

    if arg:
        default = arg
    else:
        default = datetime.datetime.now()

    ts = timesince(default, value)

    if value > default:
        retval = "in %s" % ts
    else:
        retval = "%s ago" % ts

    return retval


@register.simple_tag
def append_search_querystring(request, feed_path):
    if request.path == '/search':
        qs = "?%s" % safe_urlencode(request.GET.items())
    else:
        qs = ""

    return feed_path+qs


@register.assignment_tag(takes_context=True)
def custom_page_navigation(context):
    cache_key = '%s:custom_page_links' % context['request'].get_host()
    timeout = 60 * settings.MINUTES_TO_CACHE
    html = cache.get(cache_key)

    if html is None:
        links = CustomPage.objects.filter(
            sites=settings.SITE_ID).values_list('url', 'title')
        html = "".join(["<a href='%s'>%s</a>" % (url, title)
                        for (url, title) in links])
        cache.set(cache_key, html, timeout)
    return html


@register.inclusion_tag('logo-carousel.html', takes_context=True)
def logo_carousel(context):
    if context['company_images'] is not None:
        num_of_cos = len(context['company_images'])
    else:
        num_of_cos = 0
    displayed = context['site_config'].browse_company_show and bool(num_of_cos)
    return {
        'displayed': displayed,
        'num_of_cos': num_of_cos
    }


@register.inclusion_tag('filter-carousel.html', takes_context=True)
def filter_carousel(context):
    widgets = context['widgets']
    # A set of widgets will always be returned, but they may not have any items.
    has_widgets = False
    for each in widgets:
        if each.items:
            has_widgets = True
            break
    return {'widgets': widgets, 'has_widgets': has_widgets}


@register.filter
@stringfilter
def to_slug(co_slab):
    return co_slab.split("::")[0].split("/")[0]


@register.filter
def compare(a, b):
    return a == b


@register.filter
@stringfilter
def highlight_solr(description):
    html = markdown2.markdown(description, safe_mode="replace")
    text = escape(BeautifulSoup(html).text)
    highlighted = text.replace("###{{{###", "<b>").replace("###}}}###", "</b>")
    return mark_safe(highlighted)


@register.assignment_tag(takes_context=True)
def flatpage_site_heading(context):
    """
    Returns site heading for pages where the context variable isn't loaded

    """
    return context.get('site_heading', settings.SITE_HEADING)


@register.assignment_tag(takes_context=True)
def flatpage_site_tags(context):
    """
    Returns site tags for pages where the context variable isn't loaded

    """
    return context.get('site_tags', settings.SITE_TAGS)


@register.assignment_tag(takes_context=True)
def flatpage_site_description(context):
    """
    Returns site description for pages where the context variable isn't loaded

     """
    return context.get('site_description', settings.SITE_DESCRIPTION)


@register.assignment_tag(takes_context=True)
def flatpage_site_title(context, *args, **kwargs):
    """
    Returns site title for pages where the context variable isn't loaded

    CustomPage calls flatpage_site_title with an extra blank string as an
    argument, args=('', ''), so we're catching args and kwargs to to
    prevent an error. There are no obvious places we're calling
    flatpage_site_title or site_title with an extra space, so this may be
    related to the "as" renaming we do in seo_base.html.

    """
    return context.get('site_title', settings.SITE_TITLE)


def get_ga_context():
    """
    rebuilds the google analytics template for flatpages by reconstructing
    the context variable manually

    Inputs:
    none

    Returns:
    ga.html and footer.html rendered with manual context variable.

    """
    site_id = settings.SITE_ID
    ga = GoogleAnalytics.objects.filter(seosite=site_id)
    view_source = settings.VIEW_SOURCE
    build_num = settings.BUILD
    return {
        'google_analytics': ga,
        'view_source': view_source,
        "build_num": build_num
    }


@register.assignment_tag
def all_site_tags():
    tags = SiteTag.objects.exclude(tag_navigation=False).values_list('site_tag',
                                                                     flat=True)
    return tags


@register.inclusion_tag('ga.html', takes_context=False)
def flatpage_ga():
    return get_ga_context()


@register.inclusion_tag('wide_footer.html', takes_context=False)
def flatpage_footer_ga():
    return get_ga_context()


@register.simple_tag
def view_all_jobs_label(view_all_jobs_detail):
    """
    Reads the view_all_jobs_detail config setting, and builds a new link label
    from the site title if enabled. This tag does not impact display of the
    jobs counts.

    Inputs:
    :view_all_jobs_detail: Boolean, set to True to include site title
                           information in label
    Returns:
    :label: Text to display in the search footer.

    """
    label = ugettext("View All Jobs")
    # time to build the new string. This assumes each word is capitalized
    if view_all_jobs_detail:
        cos = settings.SITE.business_units.all()
        if cos:
            # strip "Jobs" from the end
            label = settings.SITE_TITLE.replace("Jobs", "")
            for company in cos:
                # strip any phrases that match the company title. This will
                # leave only phrases from the title that reflect the desired
                # facet info
                if company.title is not None:
                    label = label.replace(company.title, "")
            # assemble the final string and then defrag any spaces (for testing)
            label = "View All %s Jobs" % label
            label = ugettext(re.sub(r"([ ])+", " ", label))

    return label


@register.simple_tag
def build_title(site_title, search_q, location_q, company, heading):
    """
    Build title and metatag title based on search queries and other filters.

    Returns:
    :title:     Returns a string that is the title for the page.
    """
    title = site_title + " - "

    if company:
        title += "%s %s" % (company, "Careers - ")

    if search_q == "\*":
        pass
    elif search_q and heading == "Jobs":
        title += search_q.title() + " "
    elif search_q:
        title += search_q.title() + " - "

    if not heading:
        title += "All Jobs "
    else:
        title += heading + " "

    if location_q == "\*":
        pass
    elif location_q and not location_q in title:
        title += "in " + location_q

    return escape(title)


@register.filter
def make_pixel_qs(request, job=None):
    """
    Constructs a query string that will be appended onto a url pointing at
    the My.jobs tracking pixel. This qs should contain all of the information
    we want to track about this request.

    Inputs:
    :request: HttpRequest object for this request
    :job: the current job, if this is a job detail page

    Returns:
    :safe_qs: Encoded, and marked safe query string
    """
    current_site = settings.SITE
    commitments = current_site.special_commitments.all().values_list('commit',
                                                                     flat=True)

    vs = settings.VIEW_SOURCE
    if vs:
        vs = vs.view_source
    else:
        vs = 88
    qd = QueryDict('', mutable=True)
    qd.setlist('st', settings.SITE_TAGS)
    qd.setlist('sc', commitments)
    qs = {'d': current_site.domain,
          'jvs': vs}
    if request.path == '/':
        qs['pc'] = 'home'
    elif job:
        qs['pc'] = 'listing'
        qs['jvb'] = job.buid if job.buid else 0
        qs['jvg'] = job.guid
        qs['jvt'] = job.title_exact
        qs['jvc'] = job.company_exact
        qs['jvl'] = job.location_exact
        try:
            company = Company.objects.get(name=job.company_exact)
            qs['jvcd'] = company.canonical_microsite
        except Company.DoesNotExist:
            pass
    else:
        qs['pc'] = 'results'
        qs['sl'] = request.REQUEST.get('location', '')
        qs['sq'] = request.REQUEST.get('q', '')
    qd.update(qs)
    safe_qs = mark_safe(qd.urlencode())
    return safe_qs


@register.simple_tag(takes_context=True)
def url_for_sort_field(context, field):
    current_url = context['request'].build_absolute_uri()
    new_url = update_url_param(current_url, 'sort', field)
    return mark_safe('<a href=%s rel="nofollow">Sort by %s</a>' %
                     (new_url, field.title()))


@register.assignment_tag
def get_custom_page(flatpage):
    return get_object_or_none(CustomPage, pk=flatpage.pk)


@register.assignment_tag(takes_context=True)
def is_special_case(context, job):
    return ((job.country_short or '').lower() in ['usa', 'can']
            and bool(job.state))
