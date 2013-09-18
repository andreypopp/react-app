/**
 * Express application for serving rendered React components and corresponding
 * client code.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var path = require('path'),
    express = require('express'),
    defer = require('kew').defer,
    callsite = require('callsite'),
    XMLHttpRequest = require('xhr2'),
    reactify = require('reactify'),
    Bundler = require('./bundler'),
    Router = require('./router');

function _genServerRenderingCode(module, props) {
  return [
    "var React = require('react-tools/build/modules/React');",
    "var Component = require(" + JSON.stringify(module) + ");",
    "var props = " + JSON.stringify(props) + ";",
    "var render = function(data) {",
    "  if (data) {",
    "    for (var k in data) props[k] = data[k];",
    "  }",
    "  Component = Component.Component || Component;",
    "  React.renderComponentToString(Component(props), function(markup) {",
    "    __done({markup: markup, props: props});",
    "  });",
    "};",
    "if (typeof Component.getData === 'function') {",
    "  Component.getData(props).then(render).fail(__error).end();",
    "} else {",
    "  render();",
    "}",
  ].join('\n');
}

function _genClientRoutingCode(handler, props, routes) {
  return [
    "<script>",
      "var __bootstrap = function() {",
        "var handler = require(" + JSON.stringify(handler) + ");",
        "var props = " + JSON.stringify(props) + ";",
        "var routes = " + JSON.stringify(routes) + ";",
        "var bootstrap = require('react-app/bootstrap');",
        "for (var key in routes) {",
        "  routes[key] = require(routes[key]);",
        "}",
        "bootstrap(handler, props, routes);",
      "};",
    "</script>"
  ].join('\n');
}

/**
 * Render React component into string.
 *
 * @param {String} bundle Computed browserify bundle which serves as environment
 * @param {String} module Module name which points to React component to render
 * @param {Object} props Component props to use
 * @returns {String} Rendered React component
 */
function renderComponent(bundle, module, props) {
  var promise = defer(),
      context = {
        __done: promise.resolve.bind(promise),
        __error: promise.reject.bind(promise),
        console: console,
        self: {XMLHttpRequest: XMLHttpRequest}
      },
      contextify = require('contextify');
  contextify(context);
  context.run(bundle);
  context.run(_genServerRenderingCode(module, props));
  return promise.then(function(result) {
    // if we dispose context on the current tick we will crash cause Node didn't
    // free some I/O handles yet
    process.nextTick(function() { context.dispose(); });
    return result;
  });
}

/**
 * Insert <script> tag into markup.
 *
 * @param {String} markup Markup to insert script tag into
 * @param {String} tag Script tag to insert
 * @returns {String} Markup with inserted script tags
 */
function _insertIntoHead(markup, tag) {
  var index = markup.indexOf('</head>');
  if (index > -1) {
    return markup.slice(0, index) + tag + markup.slice(index);
  } else {
    return markup + tag;
  }
}

/**
 * Send a page a currently active React component as HTML.
 *
 * @param {routes} routes Route table
 * @param {function} getBundle Returns a promise for a computed bundle
 */
function sendPage(routes, getBundle) {
  return function(req, res, next) {
    var router = new Router(routes),
        match = router.match(req.path);

    if (!match) {
      return next();
    }

    var props = {
      path: req.path,
      query: req.query,
      params: match.params
    };

    getBundle()
      .js.then(function(result) {
        return renderComponent(result, match.handler, props);
      }).then(function(rendered) {
        rendered = _insertIntoHead(rendered.markup,
          _genClientRoutingCode(match.handler, rendered.props, routes) +
          '<link rel="stylesheet" href="/__styles__">' +
          '<script async onload="__bootstrap();" src="/__script__"></script>')
        return res.send(rendered);
      }).fail(next)
  };
}

/**
 * Send computed script bundle.
 *
 * @param {function} getBundle returns a promise for a computed bundle
 */
function sendScript(getBundle) {
  return function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    getBundle()
      .js.then(function(result) { res.send(result) })
      .fail(next);
  };
}

function sendStyles(getBundle) {
  return function(req, res, next) {
    res.setHeader('Content-Type', 'text/css');
    getBundle()
      .css.then(function(result) { res.send(result) })
      .fail(next);
  };
}

/**
 * Construct express application which serves rendered React components as HTML
 * and corresponding client code.
 *
 * Route table should be in form of {route pattern: node module id}.
 *
 * Available option keys are:
 *
 *  - `configureBundle` configures browserify bundle
 *  - `debug` inserts source maps into bundle and starts watching for source
 *    code changes
 *
 * @param {Object} routes Route table
 * @param {Object} options Options
 * @retuens {Object} Configured express application
 */
module.exports = function(routes, options) {
  var root = path.dirname(callsite()[1].getFileName()),
      app = express(),
      bundle = new Bundler(),
      bundlePromise = null;

  options = options || {};

  function updateBundle() {
    bundlePromise = bundle.bundle({debug: options.debug})
  }

  function getBundle() {
    return bundlePromise;
  }

  if (options.transforms) {
    options.transforms.forEach(function(transform) {
      bundle.transform(transform);
    });
  }

  bundle
    .transform(reactify)
    .require('react-tools/build/modules/React', {expose: true})
    .require(path.join(__dirname, './bootstrap.js'),
      {expose: 'react-app/bootstrap'});

  for (var k in routes) {
    bundle.require(
      (routes[k][0] === '.' ? path.resolve(root, routes[k]) : routes[k]),
      {expose: routes[k]});
  }

  if (options.configureBundle) {
    bundle = options.configureBundle(bundle);
  }

//if (options.debug) {
//  watchify(bundle).on('update', updateBundle);
//}

  updateBundle();

  app.get('/__script__', sendScript(getBundle));
  app.get('/__styles__', sendStyles(getBundle));
  app.use(sendPage(routes, getBundle));

  return app;

};
