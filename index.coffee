###

  Express adapter for Router

  2013 (c) Andrey Popp <8mayday@gmail.com>

###

path                    = require 'path'
express                 = require 'express'

browserify              = require 'browserify'

_nowWeCanRequireJSX     = require './require_jsx'
Router                  = require './router'
{getCaller}             = require './utils'

_genServerRenderingCode = (module, props) ->
  """
  var React = require('react-tools/build/modules/React');
  var Component = require('#{module}');
  React.renderComponentToString(
    Component(#{JSON.stringify(props)}),
    function(str) { result = str; }
  );
  """

renderComponent = (module, props, root) ->
  module = path.resolve(root, module) if module[0] == '.'
  code = _genServerRenderingCode(module, props)
  context = {result: null, require: require}

  contextify  = require 'contextify'
  contextify(context)

  context.run(code)
  context.dispose()
  context.result

_insertScriptTag = (rendered, routes, src) ->
  script = """
    <script src="#{src}"></script>
    <script>
      var __reactAppRoutes = #{JSON.stringify(routes)};
      var __bootstrap = require('./bootstrap');
      for (var __bootstrapKey in __reactAppRoutes) {
        __reactAppRoutes[__bootstrapKey] = require(__reactAppRoutes[__bootstrapKey]);
      }
      __bootstrap(__reactAppRoutes);
    </script>
  """
  index = rendered.indexOf('</html>')
  if index > -1
    rendered.slice(0, index) + script + rendered.slice(index)
  else
    rendered + script

sendPage = (routes, {root}) ->
  (req, res, next) ->
    router = new Router(routes)
    match = router.match(req.path)
    return next() unless match?

    request =
      path: req.path
      query: req.query
      params: match.params

    try
      rendered = renderComponent(match.handler, request, root)
      rendered = _insertScriptTag rendered, routes, '/__script__'
      res.send rendered
    catch e
      next e

sendScript = (routes, {root}) ->
  (req, res, next) ->
    res.setHeader 'Content-Type', 'application/json'

    b = browserify()
      .transform('reactify')
      .require('./bootstrap')

    for _, module of routes
      filename = if module[0] == '.'
        path.resolve(root, module)
      else
        module
      b.require filename, {expose: module}

    b.bundle {debug: true}, (err, result) ->
      if err then next err else res.send result

module.exports = (routes) ->
  root = path.dirname getCaller()
  app = express()
  app.get '/__script__', sendScript(routes, {root})
  app.use sendPage(routes, {root})
  app
