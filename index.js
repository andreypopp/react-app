"use strict";

var utils           = require('lodash'),
    path            = require('path'),
    callsite        = require('callsite'),
    express         = require('express'),
    createBundler   = require('./bundler'),
    serveAssets     = require('./middleware/assets');


module.exports = function(id, opts) {
  opts = utils.assign({
    origin: undefined,
    root: path.dirname(callsite()[1].getFileName()),
    assetsUrl: '/assets',
    transform: [],
    debug: false,
    render: false,
    pageOptions: undefined,
  }, opts);

  opts.injectAssets = {
    stylesheets: [opts.assetsUrl + '/bundle.css'],
    scripts: [opts.assetsUrl + '/bundle.js']
  };
  opts.bundler = createBundler(id, opts);

  var serveUI = require(opts.render ? './middleware/ui' : './middleware/page'),
      app = express();
  app.use(opts.assetsUrl, serveAssets(id, opts));
  app.use(serveUI(id, opts))
  return app;

};

