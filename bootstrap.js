/**
 * Bootstrap code which initialise root component.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var ReactMount = require('react-tools/build/modules/ReactMount'),
    React = require('react-tools/build/modules/React'),
    Router = require('./router');

ReactMount.allowFullPageRender = true;

function bootstrap(Component, props, routes) {
  if (routes) props.router = new Router(routes);
  if (document.readyState == 'interactive') {
    window.ReactAppPage = React.renderComponent(Component(props), document);
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      window.ReactAppPage = React.renderComponent(Component(props), document);
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
function bootstrapComponent(Component, props, callback) {
  if (typeof Component.spec.getData === 'function') {
    var getData = Component.spec.getData;

    var onSuccess = function(data) {
      var newProps = {};
      for (var x in props) newProps[x] = props[x];
      if (data)
        for (var y in data) newProps[y] = data[y];
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

module.exports = bootstrap;
bootstrap.bootstrapComponent = bootstrapComponent;
