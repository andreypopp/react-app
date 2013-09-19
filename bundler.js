var q             = require('kew'),
    EventEmitter  = require('events').EventEmitter,

    DGraphLive    = require('./dgraph-live'),
    DGraph        = require('dgraph').Graph;
    DGraphBundler = require('dgraph-bundler').Bundler,
    cssImportTr   = require('dgraph-css-import'),
    cssInlineWoff = require('dgraph-css-inline-woff'),

    utils         = require('lodash'),
    through       = require('through'),
    asStream      = require('as-stream'),
    combine       = require('stream-combiner'),
    aggregate     = require('stream-aggregate-promise'),

    resolve       = require('browser-resolve'),
    builtins      = require('browser-builtins'),
    insertGlobals = require('insert-module-globals'),
    cssPack       = require('css-pack'),
    depsSort      = require('deps-sort');

function resolvePromise(id, parent) {
  var promise = q.defer();
  resolve(id, parent, promise.makeNodeResolver());
  return promise;
}

function Bundler(opts) {
  this.opts = opts || {};
  this._entries = [];
  this._expose = {};
  this._transform = [];

  this._resolvedExpose = {};
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

  resolveEntries: utils.memoize(function() {
    var resolutions = this._entries
      .map(function(id) { return resolvePromise(id, {filename: __filename}) });

    return q.all(resolutions).then(function(entries) {
      var resolved = utils.zipObject(this._entries, entries);
      for (var id in resolved)
        this._resolvedExpose[resolved[id]] = this._expose[id];
      return entries;
    }.bind(this));
  }),

  createGraph: utils.memoize(function() {
    return this.resolveEntries().then(function(entries) {
      var graph = new DGraphLive(entries, {
        noParse: RegExp.prototype.exec.bind(/\.css$/),
        transform: this._transform.concat(cssImportTr, cssInlineWoff),
        modules: builtins
      });
      if (this.opts.watch)
        graph.on('update', this.emit.bind(this, 'update'))
      return graph;
    }.bind(this));
  }),

  bundle: function(opts) {
    opts = opts || {};

    var js = through(), css = through();

    this.createGraph()
      .then(function(graph) {
        return aggregate(graph.toStream());
      })
      .then(function(modules) {
        var graph = {};
        modules.forEach(function(mod) { graph[mod.id] = mod; });
        return graph;
      })
      .then(function(graph) {
        var cssGraph = filter(graph, function(mod) {
              return mod.id.match(/\.css$/);
            }),
            jsGraph = except(graph, cssGraph);

        combine(
          new DGraphBundler(
            combine(indexToStream(jsGraph), insertGlobals()), {
              debug: opts.debug,
              expose: this._resolvedExpose
            }).toStream(),
          js);

        if (!utils.isEmpty(cssGraph)) {
          combine(
            indexToStream(cssGraph), depsSort(), cssPack(),
            css);
        } else {
          css.end();
        }
      }.bind(this))
      .fail(js.emit.bind(js, 'error'))
      .end();

    return {js: aggregate(js), css: aggregate(css)};
  }

}

function indexToStream(index) {
  var values = [];
  for (var k in index)
    values.push(index[k]);
  return asStream.apply(null, values);
}

function filter(graph, predicate) {
  var result = {};
  for (var id in graph)
    if (predicate(graph[id]))
      result[id] = graph[id];
  return result;
}

function except(a, b) {
  var result = {'react-app/dummy': {id: 'react-app/dummy', source: ''}};
  for (var id in a)
    if (!b[id]) {
      var mod = result[id] = utils.cloneDeep(a[id]);
      for (var depId in mod.deps)
        if (b[mod.deps[depId]])
          mod.deps[depId] = 'react-app/dummy';
    }
  return result;
}
utils.assign(Bundler.prototype, EventEmitter.prototype);

module.exports = Bundler;
