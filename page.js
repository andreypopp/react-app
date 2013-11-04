/**
 * Page abstraction which empowers native <html> component with window.location
 * tracking and navigation routines.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var React = require('react-tools/build/modules/React'),
    cloneDeep = require('lodash.clonedeep');

var PageHost = React.createClass({
  render: function() {
    return this.props.spec.render.call(this);
  },

  componentDidMount: function() {
    window.addEventListener('click', this.onNavigate);
    if (this.props.spec.pageDidMount) this.props.spec.pageDidMount();
  },

  componentDidUpdate: function() {
    rebindSpec(this.props.spec, this);
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
    if (spec.hasOwnProperty(id))
      if (typeof spec[id] === 'function')
        boundSpec[id] = bindFunction(spec[id], boundSpec)
      else
        boundSpec[id] = spec[id];
  return boundSpec;
}

function rebindSpec(spec, component) {
  spec.__proto__ = component;
  for (var id in spec)
    if (spec.hasOwnProperty(id))
      if (typeof spec[id] === 'function')
        spec[id].rebind(component);
  return spec;
}

function functionToSpec(func) {
  return {
    render: function() {
      return func.call(this, this.props);
    }
  };
}

function renderComponent(component, element, cb) {
  try {
    component = React.renderComponent(component, element);
  } catch (err) {
    return cb(err);
  }
  cb(null, component);
}

function _renderPage(page, doc, cb, force) {
  if (force)
    renderComponent(page, doc, cb);
  if (doc.readyState === 'interactive' || doc.readyState === 'complete')
    renderComponent(page, doc, cb);
  else
    window.addEventListener('DOMContentLoaded', function() {
      renderComponent(page, doc, cb);
    });
}

/**
 * Render page into a document element.
 *
 * @param {Page} page
 * @param {DocumentElement} doc
 * @param {Callback} cb
 */
function renderPage(page, doc, cb, force) {
  page.bootstrap(function(err, data) {
    if (err) return cb(err);
    _renderPage(page, doc, function(err, page) {
      cb(err, page, data); 
    }, force);
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
    var page = PageHost(props, children),
        boundSpec = bindSpec(spec, page);
    props.unboundSpec = spec;
    props.spec = boundSpec;
    return page;
  }
}

function bindFunction(func, obj) {
  var bound,
      ctx = obj;
  switch (func.length) {
    case 0:
      bound = function() {return func.call(ctx);};
      break;
    case 1:
      bound = function(a) {return func.call(ctx, a);};
      break;
    case 2:
      bound = function(a, b) {return func.call(ctx, a, b);};
      break;
    case 3:
      bound = function(a, b, c) {return func.call(ctx, a, b, c);};
      break;
    case 4:
      bound = function(a, b, c, d) {return func.call(ctx, a, b, c, d);};
      break;
    case 5:
      bound = function(a, b, c, d, e) {return func.call(ctx, a, b, c, d, e);};
      break;
    default:
      bound = function() {return func.apply(ctx, arguments);}
  }
  bound.rebind = function(obj) {
    ctx = obj;
    return bound;
  }
  return bound;
}

module.exports = {
  createPage: createPage,
  renderPage: renderPage,
  renderPageToString: renderPageToString
};
