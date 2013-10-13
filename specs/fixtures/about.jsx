/**
 *
 * @jsx React.DOM
 *
 */

require('./styles.css');

var React = require('react-tools/build/modules/React'),
    createPage = require('../../page').createPage,
    DebugInfo = require('./debug_info.jsx');

module.exports = createPage({
  onClick: function() {
    console.log('x');
  },
  pageDidMount: function() {
    console.log('mount', 'about');
  },
  pageWillUnmount: function() {
    console.log('unmount', 'about');
  },
  render: function() {
    var debugInfo = DebugInfo({request: this.props.request});
    return (
      <html>
        <head>
          <title>About</title>
        </head>
        <body onClick={this.onClick}>
          <h1>Hello, about!</h1>
          <a href="/">index</a>
          {debugInfo}
        </body>
      </html>
    );
  }
});
