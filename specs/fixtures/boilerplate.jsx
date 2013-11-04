var React = require('react-tools/build/modules/React');

module.exports = React.createClass({
  componentDidMount: function () {
    console.log('componentDidMount', 'boilerplate');
    this.interval = setInterval(function () {
      if (typeof this.props.callback === 'function') {
        this.props.callback();
      }
    }.bind(this), 1000);
  },

  componentWillUnmount: function () {
    console.log('componentWillUnmount', 'boilerplate');
    clearInterval(this.interval);
  },

  render: function() {
    return (
      <html>
        <head>
          <title>{this.props.title}</title>
        </head>
        <body>
          {this.props.children}
        </body>
      </html>
    );
  }
});
