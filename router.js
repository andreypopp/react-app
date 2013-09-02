/*

  2013 (c) Andrey Popp <8mayday@gmail.com>
*/

var toPattern = require('url-pattern');

module.exports = function(routes) {
  var registered = [];

  if (routes) {
    for (var k in routes) {
      addRoute(k, routes[k]);
    }
  }

  function addRoute(pattern, handler) {
    registered.push({
      pattern: toPattern(pattern),
      handler: handler
    });
    return this;
  };

  function match(path) {
    var params;
    for (var i = 0, length = registered.length; i < length; i++) {
      params = registered[i].pattern.match(path);
      if (params != null) {
        return {handler: registered[i].handler, params: params};
      }
    }
  };

  return {addRoute: addRoute, match: match};
}
