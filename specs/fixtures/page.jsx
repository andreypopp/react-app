/**
 *
 * @jsx React.DOM
 *
 */

var React = require('react-tools/build/modules/React');

module.exports = React.createClass({

  onNavigate: function(e) {
    var href = e.target.attributes.href && e.target.attributes.href.value;
    if (href) {
      e.preventDefault(); 
      console.log('navigate to', href);
      window.history.navigate(href);
    }
  },

  render: function() {
    return (
      <html>
        <head>
          <meta 
            name="viewport"
            content="width=device-width, initial-scale=1.0, user-scalable=no"
            />
          <title>{this.props.title}</title>
        </head>
        <body onClick={this.onNavigate}>{this.props.children}</body>
      </html>
    );
  }
});
