var React            = require('react-tools/build/modules/React');
var createController = require('../../controller');

var MainPage = React.createClass({
  fetchData: function(req, cb) {
    console.log('fetching data...');
    cb(null, {msg: 'Hello'});
  },

  render: function() {
    return (
      <div className="MainPage">
        <h1>Main page</h1>
        <p>state: {this.state}</p>
        <p>data: {this.props.request.data}</p>
        <a href="/about">about</a>
        <a href="/data">data</a>
        <a href="/data-state">data-state</a>
      </div>
    );
  }
});

var AboutPage = React.createClass({
  render: function() {
    return (
      <div className="AboutPage">
        <h1>About page</h1>
        <p>state: {this.state}</p>
        <a href="/">index</a>
        <a href="/data">data</a>
        <a href="/data-state">data-state</a>
      </div>
    );
  }
});

module.exports = createController({
  routes: {
    '/': MainPage,
    '/about': AboutPage
  },

  onClick: function(e) {
    if (e.target.tagName === 'A' && e.target.attributes.href) {
      e.preventDefault();
      this.navigate(e.target.attributes.href.value);
    }
  },

  componentDidMount: function() {
    window.addEventListener('click', this.onClick);
  },

  componentWillUnmount: function() {
    window.removeEventListener('click', this.onClick);
  }
});
