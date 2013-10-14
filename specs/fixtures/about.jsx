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
