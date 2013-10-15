"use strict";

var React = require('react-tools/build/modules/React'),
    head = React.DOM.head;

React.DOM.head = React.createClass({
  render: function() {
    var children = [].concat(__styles, __scripts, this.props.children);
    return head({}, children);
  }
});

var __styles = [];
var __scripts = [];

var AssetInjector = {
  addStylesheet: function(href, key) {
    __styles.push(React.DOM.link({rel: 'stylesheet', href: href, key: key}));
  },
  addScript: function(src, key) {
    __scripts.push(React.DOM.script({src: src, key: key + 100000}));
  },
  injectAssets: function(assets) {
    if (assets.stylesheets) assets.stylesheets.forEach(AssetInjector.addStylesheet);
    if (assets.scripts) assets.scripts.forEach(AssetInjector.addScript);
  }
};

module.exports = AssetInjector;
