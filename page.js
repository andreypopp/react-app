/**
 * Page abstraction which empowers native <html> component with window.location
 * tracking and navigation routines.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var qs = require('querystring'),
    React = require('react-tools/build/modules/React'),
    renderPage = require('./bootstrap').renderPage;

/**
 * Shallow equality test
 *
 * Shamelessly stolen from React codebase
 *
 * Copyright 2013 Facebook, Inc.
 */
function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  var key;
  // Test for A's keys different from B.
  for (key in objA) {
    if (objA.hasOwnProperty(key) &&
        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
      return false;
    }
  }
  // Test for B'a keys missing from A.
  for (key in objB) {
    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

var Page = React.createClass({
  render: function() {
    return this.props.spec.render.call(this);
  },

  componentDidMount: function() {
    window.addEventListener('popstate', this.onPopState);
    window.addEventListener('click', this.onNavigate);
    if (this.props.spec.pageDidMount) this.props.spec.pageDidMount();
  },

  componentWillUnmount: function() {
    window.removeEventListener('popstate', this.onPopState);
    window.removeEventListener('click', this.onNavigate);
    if (this.props.spec.pageWillUnmount) this.props.spec.pageWillUnmount();
  },

  componentWillReceiveProps: function(props) {
    props.spec = bindSpec(props.unboundSpec, this);
  },

  loadURL: function(path, query) {
    if (path !== this.props.request.path || !shallowEqual(query, this.props.request.query)) {
      var match = this.props.router.match(path);
      if (!match) return;

      var props = {
        request: {
          path: path,
          query: query || {},
          params: match.params || {}
        },
        options: this.props.options,
        router: this.props.router,
        unboundSpec: this.props.unboundSpec
      };

      var page = match.handler(props);
      if (this.props.spec.pageWillUnmount) this.props.spec.pageWillUnmount();
      renderPage(page, document, function(err, spec) {
        if (err) throw err;
        if (this.props.spec.pageDidMount) this.props.spec.pageDidMount();
      }.bind(this));
    }
  },

  navigate: function(path, query) {
    var completeURL = path;
    if (query) {
      completeURL = completeURL + '?' + qs.stringify(query);
    }
    window.history.pushState(null, '', completeURL);
    this.loadURL(path, query);
  },

  setQuery: function(query) {
    var k, newQuery = {}
    for (k in this.props.request.query)
      newQuery[k] = this.props.request.query[k];
    for (k in query)
      newQuery[k] = query[k];
    this.navigate(this.props.request.path, newQuery);
  },

  onPopState: function(e) {
    e.preventDefault();
    this.loadURL(
      window.location.pathname,
      qs.parse(window.location.search.slice(1)));
  },

  onNavigate: function(e) {
    var current = e.target;
    while (current) {
      if (current.tagName === 'A') {
        var href = current.attributes.href && current.attributes.href.value;
        if (href && !href.match(/^https?:/)) {
          e.preventDefault();
          this.navigate(href);
        }
        break;
      }
      current = current.parentNode;
    }
  },

  bootstrap: function(cb) {
    if (this.props.spec.getData)
      callbackOrPromise(this.props.spec.getData, function(err, data) {
        if (err) return cb(err);
        this.props.data = data;
        cb(null, this);
      }.bind(this))
    else
      cb(null, this);
  }
});

function callbackOrPromise(func, cb) {
  if (func.length === 1)
    func(cb)
  else
    func().then(cb.bind(null, null), cb.bind(null))
}

function bindSpec(spec, component) {
  var boundSpec = Object.create(component);
  for (var id in spec)
    if (typeof spec[id] === 'function')
      boundSpec[id] = spec[id].bind(boundSpec)
    else
      boundSpec[id] = spec[id];
  return boundSpec;
}

module.exports = function(spec) {
  var factory = function(props, children) {
    var page = Page(props, children),
        boundSpec = bindSpec(spec, page);
    props.unboundSpec = spec;
    props.spec = boundSpec;
    return page;
  }
  factory.spec = spec;
  return factory;
}
