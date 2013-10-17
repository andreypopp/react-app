"use strict";

var path                = require('path'),
    domain              = require('domain'),
    utils               = require('lodash'),
    vm                  = require('vm'),
    fs                  = require('fs'),
    url                 = require('url'),
    q                   = require('kew'),
    SourceMapConsumer   = require('source-map').SourceMapConsumer,
    makeXMLHttpRequest  = require('../xmlhttprequest'),
    createBundler       = require('../bundler'),
    measure             = require('../common').measure;

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
function generateMarkup(bundle, request, location, opts) {
  var dom = domain.create(),
      promise = q.defer();

  dom.on('error', promise.reject.bind(promise));
  dom.run(function() {
    var sandbox = {
      __react_app_callback: promise.makeNodeResolver(),
      __react_app_source_map: null,
      console: console,
      XMLHttpRequest: makeXMLHttpRequest(location),
      location: location,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      setInterval: setInterval,
      clearInterval: clearInterval
    };

    if (opts.debug)
      sandbox.__react_app_source_map = bundle.sourceMap;

    sandbox.self = sandbox;
    sandbox.window = sandbox;
    sandbox.global = sandbox;

    var ctx = vm.createContext(sandbox);
    if (opts.debug) patchStackTraceScript.runInContext(ctx);
    bundle.script.runInContext(ctx);
    injectAssetsOnServer(opts.injectAssets).runInContext(ctx);
    generateMarkupOnServer(request).runInContext(ctx);
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

function makeLocation(req, origin) {
  var protocol = !!req.connection.verifyPeer ? 'https://' : 'http://',
      reqOrigin = origin || (protocol + req.headers.host);
  return url.parse(reqOrigin + req.originalUrl);
}

function scriptBuilder(bundler, opts) {
  var builder = {
    script: null,

    logger: opts.logger,

    onUpdate: function() {
      this.build();
    },

    build: measure(
      'script built:',
      function() {
        this.script = bundler.bundle
          .then(function(bundle) {return bundle['bundle.js']})
          .then(function(bundle) {
            return {
              script: vm.createScript(bundle),
              sourceMap: retrieveSourceMap(bundle)
            }
          });
        return this.script;
      })
  };

  bundler.on('update', builder.onUpdate.bind(builder));
  builder.build();

  return builder;
}

function compileToBrowser(func) {
  var code = func.toString();
  return function() {
    var args = utils.toArray(arguments);
    return "<script>(" + code + ").apply(this, " + JSON.stringify(args) + ")</script>";
  }
}

function compileToVM(func) {
  var code = func.toString();
  return function() {
    var args = utils.toArray(arguments);
    return vm.createScript("(" + code + ").apply(this, " + JSON.stringify(args) + ")");
  }
}

var patchStackTraceScript = vm.createScript(fs.readFileSync(
  path.join(__dirname, '../prepare-stack-trace.js'),
  'utf8'))

var generateMarkupOnServer = compileToVM(function(request, cb) {
  var runtime = require('react-app/runtime/server');
  runtime.generateMarkup(request, __react_app_callback);
});

var injectAssetsOnServer = compileToVM(function(assets) {
  var runtime = require('react-app/runtime/server');
  if (assets) runtime.injectAssets(assets);
});

var injectAssetsOnClient = compileToBrowser(function(assets) {
  global = self;
  var runtime = require('react-app/runtime/browser');
  runtime.injectAssets(assets);
});

var startAppOnClient = compileToBrowser(function(data) {
  var runtime = require('react-app/runtime/browser');
  runtime.app.start(data);
});

module.exports = function(id, opts) {
  var bundler = opts.bundler || createBundler(id, opts),
      builder = scriptBuilder(bundler, opts);

  return function(req, res, next) {
    var request = {path: req.path, query: req.query},
        loc = makeLocation(req, opts.origin);

    builder.script
      .then(function(script) {
        return generateMarkup(script, request, loc, opts);
      })
      .then(function(rendered) {
        if (rendered === null) return next();
        res.setHeader('Content-Type', 'text/html');
        res.write(rendered.markup);
        res.write(injectAssetsOnClient(opts.injectAssets));
        res.write(startAppOnClient(rendered.data));
        res.end();
      }).fail(next);
  };
}

