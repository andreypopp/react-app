var qs = require('querystring'),
    isEqual = require('underscore').isEqual,
    React = require('react-tools/build/modules/React');

module.exports = React.createClass({

  componentDidMount: function() {
    window.addEventListener('popstate', this.onPopState);
  },

  componentWillUnmount: function() {
    window.removeEventListener('popstate', this.onPopState);
  },

  activeContents: function(path, query) {
    var match = this.props.router.match(path);
    if (match) {
      request = {
        path: path,
        query: query,
        params: match.params
      }
      return match.handler(request).render().getInitialState().contents;
    }
  },

  loadURL: function(path, query) {
    if (path !== this.state.path || !isEqual(query, this.state.query)) {
      this.setState({
        path: path,
        query: query,
        contents: this.activeContents(path, query),
      });
    }
  },

  navigate: function(path, query) {
    var completeURL = path;
    if (query) {
      completeURL = completeURL + '?' + qs.stringify(query);
    }
    window.history.pushState(null, '', completeURL);
    this.loadURL(path, query);
  },

  onPopState: function(e) {
    e.preventDefault();
    this.loadURL(window.location.pathname, qs.parse(window.location.search.slice(1)));
  },

  onNavigate: function(e) {
    var href = e.target.attributes.href && e.target.attributes.href.value;
    if (href) {
      e.preventDefault();
      this.navigate(href);
    }
  },

  getInitialState: function() {
    return {
      path: this.props.path,
      query: this.props.query,
      contents: this.props.children
    };
  },

  render: function() {
    return React.DOM.html({onClick: this.onNavigate}, this.state.contents);
  }
});
