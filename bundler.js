var path          = require('path'),
    EventEmitter  = require('events').EventEmitter,
    q             = require('kew'),
    callsite      = require('callsite'),
    utils         = require('lodash'),
    aggregate     = require('stream-aggregate-promise'),
    dcompose      = require('dcompose'),
    reactify      = require('reactify');

function aggregateStreams(streams) {
  var result = {};
  for (var k in streams)
    result[k] = aggregate(streams[k]);
  return result;
}

function createComposer(id, opts) {
  return dcompose(
    [
      {id: path.resolve(opts.root, id), expose: id, entry: false},
      {id: 'react-tools/build/modules/React', expose: true, entry: false},
      {id: 'react-tools/build/modules/ExecutionEnvironment', expose: true, entry: false},
      {id: require.resolve('./browser'), expose: 'react-app', entry: false}
    ],
    {
      transform: [].concat(opts.transform, reactify),
      debug: opts.debug
    });
}

function Bundler(id, opts) {
  this.composer = createComposer(id, opts);
  this.composer.on('update', this.build.bind(this));
  this.bundle = null;
  this.build();
}

utils.assign(Bundler.prototype, EventEmitter.prototype, {
  build: function() {
    this.emit('update');
    this.bundle = q.all([this.composer.js(), this.composer.css()])
      .then(function(bundles) { return bundles.map(aggregate) })
      .then(function(bundles) {
        return {'bundle.js': bundles[0], 'bundle.css': bundles[1]}
      });
  }
});

module.exports = function(id, opts) {
  opts.root = opts.root || path.dirname(callsite()[1].getFileName());
  return new Bundler(id, opts);
}
