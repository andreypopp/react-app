var path          = require('path'),
    DGraph        = require('dgraph').Graph,
    DGraphBundler = require('dgraph-bundler').Bundler,
    reactify      = require('reactify'),
    aggregate     = require('stream-aggregate-promise'),
    builtins      = require('browser-builtins'),
    insertGlobals = require('insert-module-globals'),
    through       = require('through'),
    combine       = require('stream-combiner')

function Bundler(opts) {
  this.opts = opts;
  this._entries = [];
  this._expose = {};
  this._transform = [];
}

Bundler.prototype = {
  require: function(id, opts) {
    this._entries.push(id);
    if (opts.expose)
      this._expose[id] = (typeof opts.expose === 'string') ?  opts.expose : id
    return this;
  },

  transform: function(tr) {
    this._transform.push(tr);
    return this
  },

  toPromise: function(opts) {
    return aggregate(this.toStream(opts));
  },

  toStream: function(opts) {
    opts = opts || {};
    var self = this,
        output = through(),
        graph = new DGraph([], {
          modules: builtins,
          transform: this._transform
        });

    graph.resolveMany(this._entries, {id: __filename})
      .then(function(resolved) {
        var expose = {};

        for (var id in resolved) {
          expose[resolved[id]] = self._expose[id];
          graph.addEntry(resolved[id]);
        }

        var modules = combine(graph.toStream(), insertGlobals()),
            bundler = new DGraphBundler(modules, {
              debug: opts.debug,
              expose: expose
            });

        bundler.toStream()
          .on('error', function(x) { output.emit('error', x); })
          .pipe(output);
      })
      .fail(output.emit.bind(output, 'error'))
      .end();

    return output;
  }

}

module.exports = Bundler;
