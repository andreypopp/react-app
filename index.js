/**
 * Express application for serving rendered React components and corresponding
 * client code.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var path                = require('path'),
    domain              = require('domain'),
    fs                  = require('fs'),
    url                 = require('url'),
    express             = require('express'),
    q                   = require('kew'),
    callsite            = require('callsite'),
    dcompose            = require('dcompose'),
    dcomposeMiddleware  = require('dcompose-middleware'),
    reactify            = require('reactify'),
    utils               = require('lodash'),
    SourceMapConsumer   = require('source-map').SourceMapConsumer,
    makeXMLHttpRequest  = require('./xmlhttprequest'),
    Router              = require('./router');

var _MAP_STACK_TRACES = fs.readFileSync(
  path.join(__dirname, './prepare-stack-trace.js'),
  'utf8')

function filterProps(props) {
  return {
    request: props.request,
    options: props.options,
    data: props.data
  };
}

function _genServerRenderingCode(module, props) {
  return [
    "var ExecutionEnvironment = require('react-tools/build/modules/ExecutionEnvironment');",
    "ExecutionEnvironment.canUseDOM = false;",
    "var ReactApp = require('react-app');",
    "var Page = require(" + JSON.stringify(module) + ");",
    "var props = " + JSON.stringify(props) + ";",
    "var page = Page(props);",
    "ReactApp.renderPageToString(page, function(err, markup, data) {",
    "  if (err) return __react_app_callback(err);",
    "  __react_app_callback(null, {markup: markup, data: data});",
    "});",
  ].join('\n');
}

function _genClientRoutingCode(handler, props, routes) {
  return [
    "<script>",
    "  var __bootstrap = function() {",
    "    global = window;",
    "    var ReactApp = require('react-app');",
    "    var Page = require(" + JSON.stringify(handler) + ");",
    "    var props = " + JSON.stringify(filterProps(props)) + ";",
    "    var routes = " + JSON.stringify(routes) + ";",
    "    for (var key in routes) {",
    "      routes[key] = require(routes[key]);",
    "    }",
    "    props.router = ReactApp.createRouter(routes);",
    "    var page = Page(props);",
    "    ReactApp.renderPage(page, document, function() {}, true);",
    "  };",
    "</script>"
  ].join('\n');
}

function retrieveSourceMap(source) {
  // Get the URL of the source map
  var match = /\/\/[#@]\s*sourceMappingURL=(.*)\s*$/m.exec(source);
  if (!match) return null;
  var sourceMappingURL = match[1];

  // Read the contents of the source map
  var sourceMapData;
  var dataUrlPrefix = "data:application/json;base64,";
  if (sourceMappingURL.slice(0, dataUrlPrefix.length).toLowerCase() == dataUrlPrefix) {
    // Support source map URL as a data url
    sourceMapData = new Buffer(sourceMappingURL.slice(dataUrlPrefix.length), "base64").toString();
  }

  if (!sourceMapData) {
    return null;
  }

  return {
    url: sourceMappingURL,
    map: new SourceMapConsumer(sourceMapData)
  };
}

/**
 * Render React component into string.
 *
 * @param {String} bundle Computed browserify bundle which serves as environment
 * @param {String} module Module name which points to React component to render
 * @param {Object} props Component props to use
 * @param {Object} location
 * @returns {String} Rendered React component
 */
function renderComponent(bundle, module, props, location, opts) {
  var dom = domain.create(),
      promise = q.defer(),
      XMLHttpRequest = makeXMLHttpRequest(location),
      context = {
        __react_app_callback: promise.makeNodeResolver(),
        console: console,
        XMLHttpRequest: XMLHttpRequest,
        location: location,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
      },
      contextify = require('contextify');

  if (opts.debug)
    context.__react_app_sourceMap = retrieveSourceMap(bundle);

  context.self = context;
  context.window = context;
  context.global = context;

  dom.on('error', promise.reject.bind(promise));
  dom.run(function() {
    contextify(context);
    if (opts.debug)
      context.run(_MAP_STACK_TRACES);
    context.run(bundle);
    context.run(_genServerRenderingCode(module, props));
  });

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
 * @param {Object} pageOptions
 */
function sendPage(routes, bundle, opts) {
  return function(req, res, next) {
    var router = new Router(routes),
        match = router.match(req.path);

    if (!match) {
      return next();
    }

    var props = {
      request: {
        path: req.path,
        query: req.query,
        params: match.params
      },
      options: opts.pageOptions
    };

    var reqOrigin = opts.origin || (
          (!!req.connection.verifyPeer ? 'https://' : 'http://') +
          req.headers.host);
    var location = url.parse(reqOrigin + req.originalUrl);

    bundle()
      .then(function(bundles) { return bundles['bundle.js']; })
      .then(function(bundle) {
        return renderComponent(bundle, match.handler, props, location, opts);
      }).then(function(rendered) {
        var clientFeatureTest = (typeof opts.clientFeatureTest === 'function') ?
          opts.clientFeatureTest : function () { return true; };
        props.data = rendered.data;
        rendered = _insertIntoHead(rendered.markup,
          _genClientRoutingCode(match.handler, props, routes) +
          '<link rel="stylesheet" href="' + opts.assetsUrl + '/bundle.css">' +
          "<script type=\"text/javascript\">" +
            "(function () {" +
              "var bundleScript;" +
              "if (" + clientFeatureTest.toString() + "()) {" +
                "bundleScript = document.createElement('script');" +
                "bundleScript.type = 'text/javascript';" +
                "bundleScript.async = true;" +
                "bundleScript.src = '" + opts.assetsUrl + "/bundle.js';" +
                "bundleScript.addEventListener('load', __bootstrap);" +
                "var scripts = document.getElementsByTagName('script');" +
                "var thisScript = scripts[scripts.length - 1];" +
                "thisScript.parentNode.insertBefore(bundleScript, thisScript);" +
              "}" +
            "}());" +
          "</script>");
        return res.send(rendered);
      }).fail(next);
  };
}

/**
 * Construct express application which serves rendered React components as HTML
 * and corresponding client code.
 *
 * Route table should be in form of {route pattern: node module id}.
 *
 * @param {Object} routes Route table
 * @param {Object} opts Options
 * @retuens {Object} Configured express application
 */
module.exports = function(routes, opts) {
  opts = utils.assign({
    origin: undefined,
    root: path.dirname(callsite()[1].getFileName()),
    assetsUrl: '/assets',
    transform: [],
    debug: false,
    pageOptions: undefined
  }, opts);

  var app = express();

  var pages = [];
  for (var k in routes) {
    pages.push({
      id: routes[k][0] === '.' ?  path.resolve(opts.root, routes[k]) : routes[k],
      expose: routes[k],
      entry: false
    });
  }

  var composer = dcompose(
    [
      {id: 'react-tools/build/modules/React', expose: true, entry: false},
      {id: 'react-tools/build/modules/ExecutionEnvironment', expose: true, entry: false},
      {id: require.resolve('./browser'), expose: 'react-app', entry: false}
    ].concat(pages),
    {
      transform: [].concat(opts.transform, reactify),
      debug: opts.debug
    });

  var bundleServer = dcomposeMiddleware(composer),
      getBundle = function() { return bundleServer.bundle; };

  app.use(opts.assetsUrl, bundleServer);
  app.use(sendPage(routes, getBundle, opts));

  return app;

};
