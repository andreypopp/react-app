var qs                    = require('querystring'),
    createRouter          = require('./router'),
    page                  = require('./page'),
    renderPageToString    = page.renderPageToString,
    renderPage            = page.renderPage;

module.exports = function(spec) {
  return new Application(spec);
}

function NotFoundError(url) {
  Error.call(this, 'not found: ' + url);
  this.url = url;
  this.isNotFound = true;
}
NotFoundError.prototype = new Error();

function Application(spec) {
  this.spec = spec;
  this.routes = this.spec.routes;
  this.router = createRouter(this.routes);
  this.request = null;
  this.page = null;
}

Application.prototype = {

  start: function(data) {
    window.addEventListener('popstate', skipFirst(this.onPopState.bind(this)));
    window.addEventListener('click', this.onNavigate.bind(this));
    this.process({
      path: window.location.pathname,
      query: qs.parse(window.location.search.slice(1)),
      data: data
    });
  },

  navigate: function(request) {
    var url = request.path;
    if (request.query)
      url = url + '?' + qs.stringify(query);
    window.history.pushState(null, '', url);
    this.process(request);
  },

  setQuery: function(query) {
    var k, newQuery = {}
    for (k in this.request.query)
      newQuery[k] = this.request.query[k];
    for (k in query)
      newQuery[k] = query[k];
    var request = {path: this.request.path, query: newQuery};
    this.navigate(request);
  },

  process: function(request, cb) {
    cb = cb || function(err) {};
    var page = this.makePage(request);
    if (!page)
      return cb(new NotFoundError(request.path));
    renderPage(page, document, function(err, page) {
      if (err)
        return cb(err);
      this.request = request;
      this.page = page;
      cb(null, this);
    }.bind(this));
  },

  processAndGenerateMarkup: function(request, cb) {
    var page = this.makePage(request);
    if (!page)
      return cb(new NotFoundError(request.path));
    renderPageToString(page, cb);
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
        if (href && !href.match(/^https?:/)) {
          e.preventDefault();
          // TODO: process querystring
          this.navigate({path: href});
        }
        break;
      }
      current = current.parentNode;
    }
  }
};

function skipFirst(func) {
  var n = 0;
  return function() {
    if (n > 0) return func.apply(this, arguments);
    n = n + 1;
  }
}
