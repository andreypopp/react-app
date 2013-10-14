"use strict";

module.exports = {
  getActiveApp: function() { return require('' + 'react-app/runtime/browser').app; },
  createApp: require('./app'),
  createPage: require('./page').createPage
};
