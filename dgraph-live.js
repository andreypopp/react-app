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
    this.opts.delay || 200,
    {maxWait: 1000});
}

GraphLive.prototype = {

  update: function(detected, id) {
    this.emit('update', detected, id);
    this.watchModule(id);
  },

  onModule: function(mod) {
    if (this.watching[mod.id]) return;

    this.cache[mod.id] = mod;
    this.watchModule(mod.id);
  },

  watchModule: function(id) {
    this.watching[id] = fs.watch(id, function() {
      this.cache[id].source = undefined;
      this.watching[id].close();
      this.watching[id] = undefined;
      this.update(Date.now(), id);
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
      .on('error', function(err) { interceptor.emit('error', err); })
      .pipe(interceptor);
  }
};

utils.assign(GraphLive.prototype, EventEmitter.prototype);

module.exports = GraphLive;
