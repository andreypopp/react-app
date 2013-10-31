"use strict";

var qs                    = require('querystring'),
    ReactMount            = require('react-tools/build/modules/ReactMount'),
    createRouter          = require('./router'),
    page                  = require('./page'),
    renderPageToString    = page.renderPageToString,
    renderPage            = page.renderPage;

ReactMount.allowFullPageRender = true;

/**
 * Create an application object from spec
 */
module.exports = function(spec) {
  return new Application(spec);
}

/**
 * Application
 *
 * @param {Object} spec
 */
function Application(spec) {
  this.spec = spec;
  this.routes = this.spec.routes;
  this.router = createRouter(this.routes);
  this.request = null;
  this.page = null;
}

Application.prototype = {

  /**
   * Start application
   *
   * @param {Object} data - bootstrap data which will be passed to the first
   * matched page
   */
  start: function(data) {
    window.addEventListener('popstate', skipFirst(this.onPopState.bind(this)));
    window.addEventListener('click', this.onNavigate.bind(this));
    this.process({
      path: window.location.pathname,
      query: qs.parse(window.location.search.slice(1)),
      data: data
    });
  },

  /**
   * Navigate
   *
   * @param {String|Request} request
   */
  navigate: function(request) {
    if (!request.path)
      request = parseURL(request);
    var url = request.path;
    if (request.query)
      url = url + '?' + qs.stringify(request.query);
    window.history.pushState(null, '', url);
    this.process(request);
  },

  /**
   * Set values in querystring
   *
   * @param {Object} query
   */
  setQuery: function(query) {
    var k, newQuery = {}
    for (k in this.request.query)
      newQuery[k] = this.request.query[k];
    for (k in query)
      newQuery[k] = query[k];
    var request = {path: this.request.path, query: newQuery};
    this.navigate(request);
  },

  /**
   * Generate markup for a page for a specified request
   *
   * @param {String|Request} request
   * @param {Callback} cb
   */
  generateMarkup: function(request, cb) {
    if (!request.path)
      request = parseURL(request);
    var page = this.makePage(request);
    if (!page)
      return cb(new NotFoundError(request.path));
    renderPageToString(page, cb);
  },

  process: function(request, cb) {
    cb = cb || function(err) {};
    var page = this.makePage(request);
    if (!page)
      return cb(new NotFoundError(request.path));
    renderPage(page, this.spec.document || document, function(err, page) {
      if (err)
        return cb(err);
      page.bootstrap(function () {
          this.setProps(this.props);
        }.bind(page), true);
      this.request = request;
      this.page = page;
      cb(null, this);
    }.bind(this), this.spec.forcePageRendering);
  },

  makePage: function(request) {
    var match = this.router.match(request.path);

    if (!match)
      return null;

    return match.handler({
      app: this,
      request: {
        path: request.path,
        query: request.query || {},
        params: match.params || {}
      },
      data: request.data,
      options: this.spec.options
    });
  },

  onPopState: function(e) {
    e.preventDefault();
    this.process({
      path: window.location.pathname,
      query: qs.parse(window.location.search.slice(1))
    });
  },

  onNavigate: function(e) {
    var current = e.target;
    while (current) {
      if (current.tagName === 'A') {
        var href = current.attributes.href && current.attributes.href.value;
        if (href && !href.match(/^https?:/) && !href.match(/^data:/)) {
          e.preventDefault();
          this.navigate(href);
        }
        break;
      }
      current = current.parentNode;
    }
  }
};

/**
 * Skip first invokation for a specified func
 *
 * @param {Function} func
 */
function skipFirst(func) {
  var n = 0;
  return function() {
    if (n > 0) return func.apply(this, arguments);
    n = n + 1;
  }
}

/**
 * Parse URL into request object
 *
 * @param {String} url
 */
function parseURL(url) {
  if (url.indexOf('?') > -1) {
    var parts = url.split('?');
    return {path: parts[0], query: qs.parse(parts[1])};
  } else {
    return {path: url};
  }
}

/**
 * Error which will be thrown in case of no match found for a processed request.
 *
 * @param {String} url
 */
function NotFoundError(url) {
  Error.call(this, 'not found: ' + url);
  this.url = url;
  this.isNotFound = true;
}
NotFoundError.prototype = new Error();
