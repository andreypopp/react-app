var React = require('react-tools/build/modules/React'),
    head = React.DOM.head;

React.DOM.head = React.createClass({
  render: function() {
    children = [].concat(__styles, __scripts, this.props.children);
    return head({}, children);
  }
});

var __styles = [];
var __scripts = [];

var AssetInjector = {
  addStylesheet: function(href) {
    __styles.push(React.DOM.link({rel: 'stylesheet', href: href}));
  },
  addScript: function(src) {
    __scripts.push(React.DOM.script({src: src}));
  },
  addCode: function(code) {
    __scripts.push(React.DOM.script({__dangerouslySetHTML: {__html: code}}));
  },
  injectAssets: function(assets) {
    if (assets.stylesheets) assets.stylesheets.forEach(AssetInjector.addStylesheet);
    if (assets.scripts) assets.scripts.forEach(AssetInjector.addScript);
    if (assets.codes) assets.codes.forEach(AssetInjector.addCode);
  }
};

module.exports = AssetInjector;
