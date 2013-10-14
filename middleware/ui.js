"use strict";

var path                = require('path'),
    domain              = require('domain'),
    vm                  = require('vm'),
    fs                  = require('fs'),
    url                 = require('url'),
    q                   = require('kew'),
    SourceMapConsumer   = require('source-map').SourceMapConsumer,
    makeXMLHttpRequest  = require('../xmlhttprequest'),
    createBundler       = require('../bundler');

var PATCH_STACK_TRACE = vm.createScript(fs.readFileSync(
  path.join(__dirname, '../prepare-stack-trace.js'),
  'utf8'))

function _genServerRenderingCode(id, request) {
  return [
    "var ExecutionEnvironment = require('react-tools/build/modules/ExecutionEnvironment');",
    "ExecutionEnvironment.canUseDOM = false;",
    "var ReactApp = require('react-app');",
    "var request = " + JSON.stringify(request) + ";",
    "var app = require(" + JSON.stringify(id) + ");",
    "app.generateMarkup(request, function(err, markup, data) {",
    "  if (err) return __react_app_callback(err);",
    "  __react_app_callback(null, {markup: markup, data: data});",
    "});",
  ].join('\n');
}

function _genClientBootstrapCode(id, data) {
  return [
    "<script>",
    "  global = self;",
    "  var __bootstrap = function() {",
    "    var app = require(" + JSON.stringify(id) + ");",
    "    var data = " + JSON.stringify(data) + ";",
    "    app.start(data);",
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

  if (!sourceMapData)
    return null;

  return {
    url: sourceMappingURL,
    map: new SourceMapConsumer(sourceMapData)
  };
}

/**
 * Render React component into string.
 *
 * @param {String} id Module name which points to React component to render
 * @param {String} bundle Computed browserify bundle which serves as environment
 * @param {Object} location
 * @returns {String} Rendered React component
 */
function generateMarkup(id, bundle, request, location, opts) {
  var dom = domain.create(),
      promise = q.defer();

  dom.on('error', promise.reject.bind(promise));
  dom.run(function() {
    var sandbox = {
      __react_app_callback: promise.makeNodeResolver(),
      __react_app_sourceMap: null,
      console: console,
      XMLHttpRequest: makeXMLHttpRequest(location),
      location: location,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval
    };

    if (opts.debug)
      sandbox.__react_app_sourceMap = bundle.sourceMap;

    sandbox.self = sandbox;
    sandbox.window = sandbox;
    sandbox.global = sandbox;

    var ctx = vm.createContext(sandbox);
    if (opts.debug)
      PATCH_STACK_TRACE.runInContext(ctx);
    bundle.script.runInContext(ctx);
    vm.createScript(_genServerRenderingCode(id, request)).runInContext(ctx);
    promise.fin(function() {
      for (var k in sandbox)
        delete sandbox[k];
      sandbox = null;
      ctx = null;
    });
  });

  return promise.fail(
    function(err) {
      if (err.isNotFound) return null
      else throw err;
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

function makeLocation(req, origin) {
  var protocol = !!req.connection.verifyPeer ? 'https://' : 'http://',
      reqOrigin = origin || (protocol + req.headers.host);
  return url.parse(reqOrigin + req.originalUrl);
}

function scriptBuilder(bundler) {
  var builder = {
    script: null,

    build: function () {
      this.script = bundler.bundle
        .then(function(bundle) {return bundle['bundle.js']})
        .then(function(bundle) {
          return {
            script: vm.createScript(bundle),
            sourceMap: retrieveSourceMap(bundle)
          }
        });
    }
  };

  bundler.on('update', builder.build.bind(builder));
  builder.build();

  return builder;
}

function _cssBundleElement(assetsUrl) {
  return '<link rel="stylesheet" href="' + assetsUrl + '/bundle.css">';
}

function _jsBundleElement(assetsUrl) {
  return '<script async onload="__bootstrap();" src="' + assetsUrl + '/bundle.js"></script>';
}

module.exports = function(id, opts) {
  var bundler = opts.bundler || createBundler(id, opts),
      builder = scriptBuilder(bundler);

  return function(req, res, next) {
    var request = {path: req.path, query: req.query},
        loc = makeLocation(req, opts.origin);

    builder.script
      .then(function(script) {
        return generateMarkup(id, script, request, loc, opts);
      })
      .then(function(rendered) {
        if (rendered === null) return next();
        var markup = rendered.markup,
            data = rendered.data;

        rendered = _insertIntoHead(markup,
          _cssBundleElement(opts.assetsUrl) +
          _genClientBootstrapCode(id, data) +
          _jsBundleElement(opts.assetsUrl));
        return res.send(rendered);
      }).fail(next);
  };
}

