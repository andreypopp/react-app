/**
 * Page abstraction which empowers native <html> component with window.location
 * tracking and navigation routines.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var qs = require('querystring'),
    React = require('react-tools/build/modules/React'),
    bootstrapComponent = require('./bootstrap').bootstrapComponent;

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

module.exports = React.createClass({

  componentDidMount: function() {
    window.addEventListener('popstate', this.onPopState);
  },

  componentWillUnmount: function() {
    window.removeEventListener('popstate', this.onPopState);
  },

  activeContents: function(path, query, callback) {
    var match = this.props.router.match(path);
    if (match) {
      var props = {
        path: path,
        query: query,
        params: match.params
      };
      bootstrapComponent(match.handler, props, function(err, spec) {
        if (err) return callback(err);
        var result = spec.Component(spec.props)
          .render()
          .getInitialState()
          .contents;
        callback(null, result);
      });
    }
  },

  loadURL: function(path, query) {
    if (path !== this.state.path || !shallowEqual(query, this.state.query)) {
      this.activeContents(path, query, function(err, contents) {
        this.setState({
          path: path,
          query: query,
          contents: contents
        });
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

  getInitialState: function() {
    return {
      path: this.props.path,
      query: this.props.query,
      contents: this.props.children
    };
  },

  render: function() {
    return React.DOM.html({onClick: this.onNavigate}, this.state.contents);
  }
});
