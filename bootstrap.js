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

/**
 * Bootstrap a component by fetching all initial data if needed.
 *
 * @param {Object} Component can be a reference to react component or an object
 * of type {Component: ..., getData: ...} whete Component is a reference to
 * react component and getData is a function which fetches needed data from a
 * component.
 * @param {Object} props
 * @param {Callback} callback
 */
module.exports.bootstrapComponent = function(Component, props, callback) {
  if (typeof Component.getData === 'function') {
    var getData = Component.getData,
        Component = Component.Component;

    var onSuccess = function(data) {
      var newProps = {};
      for (var k in props) newProps[k] = props[k];
      if (data)
        for (var k in data) newProps[k] = data[k];
      callback(null, {Component: Component, props: newProps});
    }

    var onError = function(err) {
      callback(err);
    }

    if (getData.length === 1) {
      getData(props).then(onSuccess, onError).end();
    } else {
      getData(props, function(err, data) {
        err ? onError(err) : onSuccess(data);
      });
    }
  } else {
    callback(null, {Component: Component, props: props});
  }
}
