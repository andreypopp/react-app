/**
 *
 * @jsx React.DOM
 *
 */

require('./styles.css');

var React = require('react-tools/build/modules/React'),
    Boilerplate = require('./boilerplate.jsx'),
    createPage = require('../../page').createPage,
    DebugInfo = require('./debug_info.jsx');

module.exports = createPage(function(props) {
  var debugInfo = DebugInfo({request: props.request});
  return (
    <Boilerplate title="Index">
      <div onClick={this.onClick}>
        <h1>Hello, about!</h1>
        <a href="/">index</a>
        {debugInfo}
      </div>
    </Boilerplate>
  );
});
