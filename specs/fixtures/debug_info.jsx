/**
 *
 * @jsx React.DOM
 *
 */

var React = require('react-tools/build/modules/React');

module.exports = React.createClass({

  render: function() {
    return (
      <ul>
        <li>path: {this.props.path}</li>
        <li>query: {JSON.stringify(this.props.query)}</li>
        <li>params: {JSON.stringify(this.props.params)}</li>
      </ul>
    );
  }
});
