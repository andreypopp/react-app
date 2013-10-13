/**
 *
 * @jsx React.DOM
 *
 */

require('./styles.css');

var React = require('react-tools/build/modules/React'),
    createPage = require('../../page'),
    Boilerplate = require('./boilerplate.jsx'),
    DebugInfo = require('./debug_info.jsx');

module.exports = createPage({
  onClick: function() {
    console.log('x');
  },
  render: function() {
    var debugInfo = this.transferPropsTo(DebugInfo());
    return (
      <Boilerplate title="Index">
        <div onClick={this.onClick}>
          <h1>Hello, about!</h1>
          <a href="/">index</a>
          {debugInfo}
        </div>
      </Boilerplate>
    );
  }
});
