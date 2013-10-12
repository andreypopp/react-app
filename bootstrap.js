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

function renderPage(page, doc, cb) {
  if (page.props.data)
    _renderPage(page, doc, function(err, page) {
      cb(err, page, page.props.data);
    });
  else
    page.bootstrap(function(err, data) {
      if (err) return cb(err);
      _renderPage(page, doc, function(err, page) {
        cb(err, page, data); 
      });
    });
}

function _renderPageToString(page, cb) {
  React.renderComponentToString(page, cb.bind(null, null));
}

function renderPageToString(page, cb) {
  if (page.props.data)
    _renderPageToString(page, function(err, markup) {
        cb(err, markup, page.props.data);
    });
  else
    page.bootstrap(function(err, data) {
      if (err) return cb(err);
      _renderPageToString(page, function(err, markup) {
        cb(err, markup, data);
      });
    });
}

module.exports = {
  renderPage: renderPage,
  renderPageToString: renderPageToString
}
