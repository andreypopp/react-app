/**
 *
 * @jsx React.DOM
 *
 */

var React = require('react-tools/build/modules/React'),
    Page = require('./page.jsx'),
    DebugInfo = require('./debug_info.jsx');

module.exports = React.createClass({
  render: function() {
    var debugInfo = this.transferPropsTo(DebugInfo());
    return (
      <Page title="About">
        <h1>Hello, about!</h1>
        <a href="/">index</a>
        {debugInfo}
      </Page>
    );
  }
});
