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
    console.log('x');
  },
  render: function() {
    var debugInfo = this.transferPropsTo(DebugInfo());
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
