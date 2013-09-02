module.exports = function(routes) {
  var qs = require('querystring'),
      isEqual = require('underscore').isEqual,
      ReactMount = require('react-tools/build/modules/ReactMount'),
      React = require('react-tools/build/modules/React'),
      Router = require('./router'),
      topLevelComponent = null;

  ReactMount.allowFullPageRender = true;

  var TopLevelComponent = React.createClass({

    componentDidMount: function() {
      window.addEventListener('popstate', this.onPopState);
    },

    componentWillUnmount: function() {
      window.removeEventListener('popstate', this.onPopState);
    },

    activeComponent: function(path, query) {
      var match = this.props.router.match(path);
      if (match) {
        request = {
          path: path,
          query: query,
          params: match.params
        }
        return match.handler(request);
      }
    },

    loadURL: function(path, query) {
      if (path !== this.state.path || !isEqual(query, this.state.query)) {
        this.setState({
          path: path,
          query: query,
          component: this.activeComponent(path, query)
        });
      }
    },

    onPopState: function(e) {
      e.preventDefault();
      var path = window.location.pathname,
          query = qs.parse(window.location.search.slice(1));
      this.loadURL(path, query);
    },

    getInitialState: function() {
      var path = window.location.pathname,
          query = qs.parse(window.location.search.slice(1));
      return {
        path: path,
        query: query,
        component: this.activeComponent(path, query)
      };
    },

    render: function() {
      return this.state.component;
    }
  });

  window.addEventListener('DOMContentLoaded', function() {
    topLevelComponent = React.renderComponent(
      TopLevelComponent({router: new Router(routes)}),
      document.body);
  });

  window.history.navigate = function(path, query) {
    var completeURL = path;
    if (query) {
      completeURL = completeURL + '?' + qs.stringify(query);
    }
    window.history.pushState(null, '', completeURL);
    topLevelComponent.loadURL(path, query);
  }

};
