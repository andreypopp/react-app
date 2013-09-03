var qs = require('querystring'),
    extend = require('underscore').extend,
    ReactMount = require('react-tools/build/modules/ReactMount'),
    React = require('react-tools/build/modules/React'),
    Router = require('./router');

module.exports = function(component, request, routes) {
  var topLevelComponent = null;

  ReactMount.allowFullPageRender = true;

  window.addEventListener('DOMContentLoaded', function() {
    var props = extend(request, {router: new Router(routes)});
    React.renderComponent(component(props), document);
  });
};
