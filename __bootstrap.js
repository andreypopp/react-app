module.exports = function(routes) {
  var qs = require('querystring'),
      ReactMount = require('react-tools/build/modules/ReactMount'),
      React = require('react-tools/build/modules/React'),
      Router = require('./router'),
      topLevelComponent = null;

  ReactMount.allowFullPageRender = true;

  var TopLevelComponent = React.createClass({

    componentDidMount: function() {
      window.addEventListener('popstate', this.loadURL);
    },

    componentWillUnmount: function() {
      window.removeEventListener('popstate', this.loadURL);
    },

    activeComponent: function() {
      var match = this.props.router.match(window.location.pathname);
      if (match) {
        request = {
          path: window.location.pathname,
          query: qs.parse(window.location.search.slice(1)),
          params: match.params
        }
        return match.handler(request);
      }
    },

    loadURL: function() {
      this.setState({component: this.activeComponent()});
    },

    getInitialState: function() {
      return {component: this.activeComponent()};
    },

    render: function() {
      return this.state.component;
    }
  });

  window.addEventListener('DOMContentLoaded', function() {
    topLevelComponent = React.renderComponent(
      TopLevelComponent({router: new Router(routes)}),
      document);
  });

  window.history.navigate = function(url) {
    window.history.pushState(null, '', url);
    topLevelComponent.loadURL();
  }

};
