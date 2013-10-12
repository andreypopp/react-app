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
        <li>path: {this.props.request.path}</li>
        <li>query: {JSON.stringify(this.props.request.query)}</li>
        <li>params: {JSON.stringify(this.props.request.params)}</li>
      </ul>
    );
  }
});
