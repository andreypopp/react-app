/**
 * Bootstrap code which initialise root component.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var ReactMount = require('react-tools/build/modules/ReactMount'),
    React = require('react-tools/build/modules/React'),
    Router = require('./router');

module.exports = function(Component, props, routes) {
  Component = Component.Component || Component;
  props.router = new Router(routes);
  ReactMount.allowFullPageRender = true;

  if (document.readyState == 'interactive') {
    React.renderComponent(Component(props), document);
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      React.renderComponent(Component(props), document);
    });
  }
}
