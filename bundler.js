var path          = require('path'),
    EventEmitter  = require('events').EventEmitter,
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
    this.bundle = this.composer.bundle().then(aggregateStreams);
  }
});

module.exports = function(id, opts) {
  return new Bundler(id, opts);
}
