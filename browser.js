"use strict";

var getReactRootElementInContainer = require(
      'react-tools/build/modules/getReactRootElementInContainer'),
    ReactMount = require('react-tools/build/modules/ReactMount'),
    bootstrap = require('./bootstrap'),
    createPage = require('./page'),
    createRouter = require('./router');

function currentPage() {
  var id = getReactRootElementInContainer(document);
  id = id && ReactMount.getID(id);
  return ReactMount._instancesByReactRootID[id];
}

module.exports = {
  createPage: createPage,
  createRouter: createRouter,
  renderPage: bootstrap.renderPage,
  renderPageToString: bootstrap.renderPageToString,
  currentPage: currentPage
};
