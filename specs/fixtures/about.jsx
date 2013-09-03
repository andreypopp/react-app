/**
 *
 * @jsx React.DOM
 *
 */

var React = require('react-tools/build/modules/React'),
    Page = require('../../page.js'),
    DebugInfo = require('./debug_info.jsx');

module.exports = React.createClass({
  render: function() {
    var debugInfo = this.transferPropsTo(DebugInfo());
    return this.transferPropsTo(
      <Page>
        <head>
          <title>About</title>
        </head>
        <body>
          <h1>Hello, about!</h1>
          <a href="/">index</a>
          {debugInfo}
        </body>
      </Page>
    );
  }
});
