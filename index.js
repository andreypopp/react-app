/**
 * Express application for serving rendered React components and corresponding
 * client code.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */

var path = require('path'),
    express = require('express'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    defer = require('kew').defer,
    Router = require('./router'),
    getCaller = require('./utils').getCaller;

function _genServerRenderingCode(module, props) {
  return [
    "var React = require('react-tools/build/modules/React');",
    "var Component = require(" + JSON.stringify(module) + ");",
    "React.renderComponentToString(",
    "Component(" + (JSON.stringify(props)) + "),",
    "function(str) { result = str; });"
  ].join('\n');
};

function _genClientRoutingCode(handler, request, routes) {
  return [
    "<script>",
      "var __bootstrap = function() {",
        "var handler = require(" + JSON.stringify(handler) + ");",
        "var request = " + JSON.stringify(request) + ";",
        "var routes = " + JSON.stringify(routes) + ";",
        "var bootstrap = require('react-app/bootstrap');",
        "for (var key in routes) {",
        "  routes[key] = require(routes[key]);",
        "}",
        "bootstrap(handler, request, routes);",
      "};",
    "</script>"
  ].join('\n');
};

/**
 * Render React component into string.
 *
 * @param {String} bundle Computed browserify bundle which serves as environment
 * @param {String} module Module name which points to React component to render
 * @param {Object} props Component props to use
 * @returns {String} Rendered React component
 */
function renderComponent(bundle, module, props) {
  var context = {result: null};
  var contextify = require('contextify');
  contextify(context);
  context.run(bundle);
  context.run(_genServerRenderingCode(module, props));
  context.dispose();
  return context.result;
};

/**
 * Insert <script> tag into markup.
 *
 * @param {String} markup Markup to insert script tag into
 * @param {String} tag Script tag to insert
 * @returns {String} Markup with inserted script tags
 */
function _insertScriptTag(markup, tag) {
  var index = markup.indexOf('</html>');
  if (index > -1) {
    return markup.slice(0, index) + tag + markup.slice(index);
  } else {
    return markup + scripts;
  }
};

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

    if (match == null) {
      return next();
    }

    var request = {
      path: req.path,
      query: req.query,
      params: match.params
    };

    getBundle()
      .then(function(result) {
        var rendered = renderComponent(result, match.handler, request);
        rendered = _insertScriptTag(rendered,
          _genClientRoutingCode(match.handler, request, routes) +
          '<script async onload="__bootstrap();" src="/__script__"></script>')
        return res.send(rendered);
      }).fail(next);
  };
};

/**
 * Send computed script bundle.
 *
 * @param {function} getBundle returns a promise for a computed bundle
 */
function sendScript(getBundle) {
  return function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    getBundle()
      .then(function(result) { res.send(result) })
      .fail(next);
  };
};

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
  var root = path.dirname(getCaller()),
      app = express(),
      bundle = browserify(),
      bundlePromise = null;

  options = options || {};

  function computeBundle() {
    var promise = defer();
    bundle.bundle({debug: options.debug}, function(err, result) {
      if (err) throw err;
      promise.resolve(result);
    });
    return promise;
  };

  function updateBundle() {
    bundlePromise = computeBundle();
  };

  function getBundle() {
    return bundlePromise;
  };

  if (options.transforms) {
    options.transforms.forEach(function(transform) {
      bundle.transform(transform);
    });
  }

  bundle
    .transform('reactify')
    .require('react-tools/build/modules/React')
    .require(path.join(__dirname, './bootstrap'),
      {expose: 'react-app/bootstrap'});

  for (var k in routes) {
    bundle.require(
      (routes[k][0] === '.' ? path.resolve(root, routes[k]) : routes[k]),
      {expose: routes[k]});
  }

  if (options.configureBundle) {
    bundle = options.configureBundle(bundle);
  }

  if (options.debug) {
    watchify(bundle).on('update', updateBundle);
  }

  updateBundle();

  app.get('/__script__', sendScript(getBundle));
  app.use(sendPage(routes, getBundle));

  return app;

};
