/**
 *
 * @jsx React.DOM
 *
 */

require('./styles.css');

var React = require('react-tools/build/modules/React'),
    createPage = require('../../page'),
    DebugInfo = require('./debug_info.jsx');

module.exports = createPage({
  onClick: function() {
    console.log('y');
  },
  pageDidMount: function() {
    console.log('mount');
  },
  pageWillUnmount: function() {
    console.log('unmount');
  },
  render: function() {
    var debugInfo = this.transferPropsTo(DebugInfo());
    return (
      <html>
        <head>
          <title>Index</title>
        </head>
        <body onClick={this.onClick}>
          <h1>Hello, index!</h1>
          <a href="/pages/about"><i className="icon icon-pencil"></i> About page</a>
          {debugInfo}
        </body>
      </html>
    );
  }
});
