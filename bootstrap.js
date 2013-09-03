var extend = require('underscore').extend,
    ReactMount = require('react-tools/build/modules/ReactMount'),
    React = require('react-tools/build/modules/React'),
    Router = require('./router');

module.exports = function(component, request, routes, DOMLoaded) {
  var topLevelComponent = null,
      props = extend(request, {router: new Router(routes)});

  ReactMount.allowFullPageRender = true;

  if (DOMLoaded) {
    React.renderComponent(component(props), document);
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      React.renderComponent(component(props), document);
    });
  }
};
