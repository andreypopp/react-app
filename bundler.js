var path = require('path'),
    DGraph = require('dgraph').Graph,
    bundler = require('dgraph-bundler'),
    reactify = require('reactify'),
    builtins = require('browser-builtins'),
    through = require('through')

function Bundler(opts) {
  this.opts = opts;
  this._entries = [];
  this._expose = {};
  this._transform = [];
}

Bundler.prototype.require = function(id, opts) {
  this._entries.push(id);
  if (opts.expose)
    this._expose[id] = (typeof opts.expose === 'string') ?  opts.expose : id
  return this;
}

Bundler.prototype.transform = function(tr) {
  this._transform.push(tr);
  return this
}

Bundler.prototype.bundle = function(opts) {
  var self = this,
      output = through(),
      graph = new DGraph([], {
        modules: builtins,
        transform: this._transform
      })

  graph.resolveMany(this._entries, {id: __filename})
    .then(function(resolved) {
      var expose = {};

      for (var id in resolved) {
        expose[resolved[id]] = self._expose[id];
        graph.addEntry(resolved[id])
      }

      bundler(graph.toStream(), {debug: opts.debug, expose: expose})
        .on('error', output.emit.bind(output, 'error'))
        .pipe(output);
    })
    .fail(output.emit.bind(output, 'error'));

  return output;
}

module.exports = Bundler;
