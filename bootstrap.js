/**
 * Bootstrap code which initialise root component.
 *
 * 2013 (c) Andrey Popp <8mayday@gmail.com>
 */
"use strict";

var ReactMount = require('react-tools/build/modules/ReactMount'),
    React = require('react-tools/build/modules/React');

ReactMount.allowFullPageRender = true;

function _renderPage(page, doc, cb) {
  if (doc.readyState === 'interactive' || doc.readyState === 'complete')
    cb(null, React.renderComponent(page, doc));
  else
    window.addEventListener('DOMContentLoaded', function() {
      cb(null, React.renderComponent(page, doc));
    });
}

function renderPage(page, doc, cb, dataReady) {
  if (dataReady)
    _renderPage(page, doc, cb)
  else
    page.bootstrap(function(err, data) {
      if (err) return cb(err);
      _renderPage(page, doc, cb);
    });
}

function _renderPageToString(page, cb) {
  React.renderComponentToString(page, cb.bind(null, null));
}

function renderPageToString(page, cb, dataReady) {
  if (dataReady)
    _renderPageToString(page, cb)
  else
    page.bootstrap(function(err, data) {
      if (err) return cb(err);
      _renderPageToString(page, cb);
    });
}

module.exports = {
  renderPage: renderPage,
  renderPageToString: renderPageToString
}
