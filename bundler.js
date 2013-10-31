"use strict";

var path          = require('path'),
    EventEmitter  = require('events').EventEmitter,
    q             = require('kew'),
    callsite      = require('callsite'),
    utils         = require('lodash'),
    dcompose      = require('dcompose'),
    reactify      = require('reactify'),
    measure       = require('./common').measure;

var SERVER_RUNTIME = {
  id: require.resolve('./runtime/server'),
  expose: 'react-app/runtime/server',
  entry: false
};

var RUNTIME = {
  id: require.resolve('./runtime/browser'),
  expose: 'react-app/runtime/browser',
  entry: false
};

function createComposer(id, opts) {
  var entry = {
    id: path.resolve(opts.root, id),
    expose: id,
    entry: false
  };
  var entries = [
    entry,
    utils.assign({deps: {app: entry.id}}, RUNTIME),
    utils.assign({}, SERVER_RUNTIME)
  ];
  opts.transform = [].concat(opts.transform, reactify);
  return dcompose(entries, opts);
}

function Bundler(id, opts) {
  this.composer = createComposer(id, opts);
  this.composer.on('update', this.onUpdate.bind(this));
  this.bundle = null;
  this.logger = opts.logger;
  this.build();
}

utils.assign(Bundler.prototype, EventEmitter.prototype, {
  onUpdate: function(filename) {
    if (this.logger)
      this.logger.info(
        'change detected in',
        path.relative(process.cwd(), filename));
    this.build();
  },

  build: measure(
    'bundle built:',
    function(filename) {
      var logger = this.logger;
      this.bundle = q.all([
          this.composer.bundleJS().asPromise(),
          this.composer.bundleCSS().asPromise()])
        .then(function(bundles) {
          return {'bundle.js': bundles[0], 'bundle.css': bundles[1]}
        })
        .fail(function(err) {
          if (logger) logger.error(err);
          throw err;
        });
      this.emit('update', filename);
      return this.bundle;
    })
});

module.exports = function(id, opts) {
  opts.root = opts.root || path.dirname(callsite()[1].getFileName());
  return new Bundler(id, opts);
}
