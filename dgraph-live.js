var fs            = require('fs'),
    path          = require('path'),
    EventEmitter  = require('events').EventEmitter,
    through       = require('through'),
    utils         = require('lodash'),
    DGraph        = require('dgraph').Graph;

function GraphLive(mains, opts) {
  this.mains = mains;
  this.opts = opts || {};
  this.watching = {};
  this.cache = opts.cache = {};
  this.update = utils.debounce(
    this.update,
    this.opts.delay || 100,
    {maxWait: 1000});
}

GraphLive.prototype = {

  update: function(detected) {
    this.emit('update', detected);
  },

  onModule: function(mod) {
    if (this.watching[mod.id]) return;

    this.cache[mod.id] = mod;
    this.watching[mod.id] = fs.watch(mod.id, function() {
      this.watching[mod.id].close();
      this.cache[mod.id].source = undefined;
      this.watching[mod.id] = undefined;
      this.update(Date.now());
    }.bind(this));
  },

  createGraph: function() {
    return new DGraph(this.mains, this.opts);
  },

  toStream: function() {
    var interceptor = through(function(mod) {
          this.onModule(mod);
          interceptor.queue(mod);
        }.bind(this));

    return this.createGraph().toStream()
      .on('error', interceptor.emit.bind(interceptor, 'error'))
      .pipe(interceptor);
  }
};

utils.assign(GraphLive.prototype, EventEmitter.prototype);

module.exports = GraphLive;
