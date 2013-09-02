module.exports = function(routes) {
  var qs = require('querystring'),
      ReactMount = require('react-tools/build/modules/ReactMount'),
      React = require('react-tools/build/modules/React'),
      Router = require('./router'),
      router = new Router(routes);

  ReactMount.allowFullPageRender = true;

  var TopLevelComponent = React.createClass({
    render: function() {
      return this.props.component;
    }
  });

  var topLevelComponent = null;

  function loadURL() {
    var match = router.match(window.location.pathname);
    if (match) {
      request = {
        path: window.location.pathname,
        query: qs.parse(window.location.search.slice(1)),
        params: match.params
      }
      var component = match.handler(request);
      if (topLevelComponent) {
        topLevelComponent.setProps({component: component});
      } else {
        topLevelComponent = React.renderComponent(
          TopLevelComponent({component: component}),
          document);
      }
    }
  }

  window.history.navigate = function(url) {
    window.history.pushState(null, '', url);
    loadURL();
  }

  window.addEventListener('popstate', loadURL);
};
