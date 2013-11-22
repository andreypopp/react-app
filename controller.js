"use strict";

var basicController       = require('react-app-controller');
var cloneDeep             = require('lodash.clonedeep');
var assign                = require('lodash.assign');

function createController(routes, opts) {
  opts = opts || {};
  opts.renderComponent = renderComponent;
  opts.renderComponentToString = renderComponentToString;
  return basicController(routes, opts);
}

function wrapComponentWithData(component, data) {
  var getInitialState = component.getInitialState;
  component.getInitialState = function() {
    return getInitialState ?
      assign(getInitialState(), cloneDeep(data)) :
      cloneDeep(data);
  }
  return component;
}

/**
 * Bootstrap component with data it needs to fetch
 */
function bootstrapComponent(component, request, cb) {
  if (!component.fetchData)
    return cb(null, component, undefined);

  if (request.data)
    return cb(null, wrapComponentWithData(component, request.data), request.data);

  component.fetchData(function(err, data) {
    if (err) return cb(err);

    cb(null, wrapComponentWithData(component, data), data);
  });
}

function renderComponent(component, element, request, cb) {
  bootstrapComponent(component, request, function(err, component) {
    if (err) return cb(err);
    basicController.renderComponent(component, element, request, cb);
  });
}

function renderComponentToString(component, request, cb) {
  bootstrapComponent(component, request, function(err, component, data) {
    if (err) return cb(err);
    basicController.renderComponentToString(component, request, function(err, rendered) {
      if (err) return cb(err);
      rendered.data = data;
      rendered.title = component.getTitle ? component.getTitle() : undefined;
      cb(null, rendered);
    });
  });
}

module.exports = createController;
