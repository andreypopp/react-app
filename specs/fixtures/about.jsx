/**
 *
 * @jsx React.DOM
 *
 */

var React = require('react-tools/build/modules/React'),
    Page = require('./page.jsx');

module.exports = React.createClass({
  render: function() {
    return (
      <Page title="About">
        <h1>Hello, about!</h1>
        <a href="/">index</a>
      </Page>
    );
  }
});
