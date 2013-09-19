var DGraph        = require('dgraph').Graph,
    DGraphBundler = require('dgraph-bundler').Bundler,
    aggregate     = require('stream-aggregate-promise'),
    builtins      = require('browser-builtins'),
    insertGlobals = require('insert-module-globals'),
    through       = require('through'),
    asStream      = require('as-stream'),
    combine       = require('stream-combiner'),
    cssImportTr   = require('dgraph-css-import'),
    cssInlineWoff = require('dgraph-css-inline-woff'),
    cssPack       = require('css-pack'),
    depsSort      = require('deps-sort'),
    utils         = require('lodash');

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

  bundle: function(opts) {
    opts = opts || {};
    var self = this,
        expose = {},
        js = through(),
        css = through(),
        graph = new DGraph([], {
          noParse: function(id) {
            return id.match(/\.css$/);
          },
          modules: builtins,
          transform: this._transform.concat(cssImportTr, cssInlineWoff)
        });

    graph.resolveMany(this._entries, {id: __filename})
      .then(function(resolved) {
        for (var id in resolved) {
          expose[resolved[id]] = self._expose[id];
          graph.addEntry(resolved[id]);
        }
        return graph.toPromise();
      })
      .then(function(graph) {
        var cssGraph = filter(graph, function(mod) {
              return mod.id.match(/\.css$/);
            }),
            jsGraph = except(graph, cssGraph),
            modules = combine(indexToStream(jsGraph), insertGlobals()),
            bundler = new DGraphBundler(modules, {
              debug: opts.debug,
              expose: expose
            });

        if (!utils.isEmpty(cssGraph)) {
          combine(indexToStream(cssGraph), depsSort(), cssPack(), css);
        } else {
          css.end();
        }

        combine(bundler.toStream(), js);
      })
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

module.exports = Bundler;
