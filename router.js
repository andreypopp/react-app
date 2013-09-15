/**
 * Basic router.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var toPattern = require('url-pattern');

module.exports = function(routes) {
  var registered = [];

  var self = {
    addRoute: function(pattern, handler) {
      registered.push({
        pattern: toPattern(pattern),
        handler: handler
      });
      return self;
    },

    match: function(path) {
      var params;
      for (var i = 0, length = registered.length; i < length; i++) {
        params = registered[i].pattern.match(path);
        if (params !== null) {
          return {handler: registered[i].handler, params: params};
        }
      }
    }
  }

  if (routes) {
    for (var k in routes) {
      self.addRoute(k, routes[k]);
    }
  }

  return self
}
