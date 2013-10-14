"use strict";

var mimetype      = require('mimetype'),
    createBundler = require('../bundler');

module.exports = function(id, opts) {
  var bundler = opts.bundler || createBundler(id, opts);

  return function(req, res, next) {
    bundler.bundle
      .then(function(bundles) {
        var bundleName = req.url.slice(1),
            bundle = bundles[bundleName];

        if (!bundle) return next();

        res.setHeader('Content-Type', mimetype.lookup(bundleName));
        return bundle;
      })
      .then(function(bundle) {
        res.send(bundle);
      })
      .fail(next);
  }
}

