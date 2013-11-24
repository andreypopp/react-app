"use strict";

var React           = require('react-tools/build/modules/React');
var invariant       = require('react-tools/build/modules/invariant');
var Base            = require('react-app-controller');
var request         = require('react-app-controller/request');
var cloneDeep       = require('lodash.clonedeep');
var assign          = require('lodash.assign');

var ControllerInterface = assign({}, Base.ControllerInterface, {

  /**
   * Override request process so it first fetches the data needed for a page
   * transition.
   */
  process: function(req, cb) {
    req = request.normalizeRequest(req);

    var page;
    try {
      page = this.createPageForRequest(req);
    } catch(err) {
      return cb(err);
    }

    var needData = typeof page.fetchData === 'function' && !req.data;

    if (request.isEqual(this.state.request, req) && !needData)
      return;

    fetchDataForRequest(this, page, req, function(err, req) {
      if (err) {
        throw err;
      }
      this.setState({request: req, page: page});
    }.bind(this));
  }
});

var ControllerRenderingInterface = assign({}, Base.ControllerRenderingInterface, {
  renderToString: function(req, cb) {
    invariant(
      typeof cb === 'function',
      'provide callback as a last argument to renderToString(...)'
    );

    req = request.normalizeRequest(req);

    var controller, page;
    try {
      controller = this({request: request.normalizeRequest(req)});
      page = controller.createPageForRequest(req);
    } catch(err) {
      return cb(err);
    }

    fetchDataForRequest(controller, page, req, function(err, req) {
      try {
        React.renderComponentToString(controller, function(markup) {
          cb(null, {markup: markup, request: req});
        });
      } catch (err) {
        console.log('oops', err);
        cb(err);
      }
    });
  }
});

function fetchDataForRequest(controller, page, req, cb) {
  if (req.data || typeof page.fetchData !== 'function') {
    cb(null, req, page);
  } else {
    page.fetchData(req, function(err, data) {
      if (err) return cb(err);
      req.data = cloneDeep(data);
      cb(null, req, page);
    });
  }
}

function createController(spec) {
  return Base.createController(spec,
    ControllerInterface,
    ControllerRenderingInterface);
}

module.exports = createController;
