###

  2013 (c) Andrey Popp <8mayday@gmail.com>

###
toPattern = require 'url-pattern'

module.exports = class Router

  constructor: (routes) ->
    this.routes = []
    if routes?
      for k, v of routes
        this.on k, v

  on: (pattern, handler, options) ->
    pattern = toPattern(pattern)
    this.routes.push {pattern, handler, options}

  match: (path) ->
    for {pattern, handler, options} in this.routes
      params = pattern.match path
      return {handler, params} if params?
