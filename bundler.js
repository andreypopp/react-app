"use strict";

var path          = require('path'),
    EventEmitter  = require('events').EventEmitter,
    q             = require('kew'),
    callsite      = require('callsite'),
    utils         = require('lodash'),
    aggregate     = require('stream-aggregate-promise'),
    dcompose      = require('dcompose'),
    reactify      = require('reactify'),
    measure       = require('./common').measure;

function createComposer(id, opts) {
  var entry = {
    id: path.resolve(opts.root, id),
    expose: id,
    entry: false
  };
  var serverRuntime = {
    id: require.resolve('./runtime/server'),
    expose: 'react-app/runtime/server',
    entry: false
  };
  var runtime = {
    id: require.resolve('./runtime/browser'),
    expose: 'react-app/runtime/browser',
    entry: false,
    deps: {app: entry.id}
  };
  return dcompose([entry, runtime, serverRuntime], {
    transform: [].concat(opts.transform, reactify),
    debug: opts.debug
  });
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
      this.bundle = q.all([this.composer.js(), this.composer.css()])
        .then(function(bundles) { return bundles.map(aggregate) })
        .then(function(bundles) {
          return {'bundle.js': bundles[0], 'bundle.css': bundles[1]}
        });
      this.emit('update', filename);
      return this.bundle;
    })
});

module.exports = function(id, opts) {
  opts.root = opts.root || path.dirname(callsite()[1].getFileName());
  return new Bundler(id, opts);
}
