/**
 * Page abstraction which empowers native <html> component with window.location
 * tracking and navigation routines.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var React = require('react-tools/build/modules/React'),
    cloneDeep = require('lodash.clonedeep');

var Page = React.createClass({
  render: function() {
    return this.props.spec.render.call(this);
  },

  componentDidMount: function() {
    window.addEventListener('click', this.onNavigate);
    if (this.props.spec.pageDidMount) this.props.spec.pageDidMount();
  },

  componentDidUpdate: function() {
    if (this.props.spec.pageDidMount) this.props.spec.pageDidMount();
  },

  componentWillUnmount: function() {
    window.removeEventListener('click', this.onNavigate);
    if (this.props.spec.pageWillUnmount) this.props.spec.pageWillUnmount();
  },

  componentWillReceiveProps: function(props) {
    if (this.props.spec.pageWillUnmount) this.props.spec.pageWillUnmount();
  },

  bootstrap: function(cb) {
    if (!this.props.data && this.props.spec.getData)
      callbackOrPromise(this.props.spec.getData, function(err, data) {
        if (err) return cb(err);
        this.props.data = cloneDeep(data);
        cb(null, data);
      }.bind(this))
    else
      cb(null, {});
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

function functionToSpec(func) {
  return {
    render: function() {
      return func.call(this, this.props);
    }
  };
}

function _renderPage(page, doc, cb) {
  if (doc.readyState === 'interactive' || doc.readyState === 'complete')
    cb(null, React.renderComponent(page, doc));
  else
    window.addEventListener('DOMContentLoaded', function() {
      cb(null, React.renderComponent(page, doc));
    });
}

/**
 * Render page into a document element.
 *
 * @param {Page} page
 * @param {DocumentElement} doc
 * @param {Callback} cb
 */
function renderPage(page, doc, cb) {
  page.bootstrap(function(err, data) {
    if (err) return cb(err);
    _renderPage(page, doc, function(err, page) {
      cb(err, page, data); 
    });
  });
}

/**
 * Render page to a string
 *
 * @param {Page} page
 * @param {Callback} cb
 */
function renderPageToString(page, cb) {
  page.bootstrap(function(err, data) {
    if (err) return cb(err);
    React.renderComponentToString(page, function(markup) {
      cb(null, markup, data);
    });
  });
}

/**
 * Create a page from a spec
 *
 * @param {PageSpecification} spec
 */
function createPage(spec) {
  if (typeof spec === 'function')
    spec = functionToSpec(spec);
  return function(props, children) {
    var page = Page(props, children),
        boundSpec = bindSpec(spec, page);
    props.unboundSpec = spec;
    props.spec = boundSpec;
    return page;
  }
}

module.exports = {
  createPage: createPage,
  renderPage: renderPage,
  renderPageToString: renderPageToString
};
