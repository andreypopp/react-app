"use strict";

var getID = require('react-tools/build/modules/getReactRootElementInContainer'),
    ReactMount = require('react-tools/build/modules/ReactMount');

function currentApp(doc) {
  var id = getID(doc || document);
  id = id && ReactMount.getID(id);
  return ReactMount._instanceByReactRootID[id].props.app;
}

module.exports = {
  currentApp: currentApp,
  createApp: require('./app'),
  createPage: require('./page').createPage
};
