"use strict";

var path                = require('path');
var express             = require('express');
var bundler             = require('react-app-bundler');
var xcss                = require('connect-xcss');
var getCallsiteDirname  = require('get-callsite-dirname');
var middleware          = require('react-app-middleware');

function createApp(entry, opts) {
  opts = Object.create(opts || {});

  var root = opts.root || getCallsiteDirname();

  var bundle = bundler.create(entry, opts);

  var app = express();

  if (opts.assets) {
    app.use('/assets', express.static(path.join(root, opts.assets)));
  }

  app.get('/assets/bundle.js', bundler.serve(bundle, opts));

  if (opts.styles) {
    app.get('/assets/bundle.css', xcss(opts.styles, {
      basedir: root,
      debug: opts.debug,
      transform: opts.cssTransform
    }));
    opts.link = {rel: 'stylesheet', href: '/assets/bundle.css'};
  }

  opts.meta = {charset: 'utf8'};
  opts.script = {src: '/assets/bundle.js'};

  if (opts.render) {
    app.use(middleware.serveRenderedPage(bundle, opts))
  } else {
    app.use(middleware.servePage(opts));
  }

  return app;
}

module.exports = createApp;
module.exports.createBundler = bundler.create;
module.exports.serveBundler = bundler.serve;
module.exports.servePage = middleware.servePage;
module.exports.serveRenderedPage = middleware.serveRenderedPage;
module.exports.serveStyles = xcss;
