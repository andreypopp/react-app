require('es5-shim');

var assert    = require('assert'),
    utils     = require('lodash'),
    ReactApp  = require('../../browser'),
    React     = require('react-tools/build/modules/React');

var Boilerplate = React.createClass({
  render: function() {
    return (
      <html>
        <head>
        </head>
        <body>{this.props.children}</body>
      </html>
    );
  }
});

var spec = {
  routes: {
    '/': ReactApp.createPage({
      render: function() {
        return <Boilerplate>index</Boilerplate>;
      }
    }),

    '/page': ReactApp.createPage({
      render: function() {
        return <Boilerplate>page</Boilerplate>;
      }
    }),
  },
  forcePageRendering: true
};

describe('ReactApp browser environment', function() {

  var doc, app;

  beforeEach(function() {
    doc = window.doc = document.implementation.createHTMLDocument('<html><head></head><body></body></html>');
    app = window.app = ReactApp.createApp(utils.assign({document: doc}, spec));
  });

  it('navigates to a page', function(done) {
    app.process({path: '/'}, function(err, result) {
      if (err) return done(err);
      var markup = doc.documentElement.innerHTML;
      assert.ok(markup.match(/>index<\/body>/));
      done();
    });
  });

  it('re-renders page on successful navigation', function(done) {
    app.process({path: '/'}, function(err, result) {
      if (err) return done(err);
      var markup = doc.documentElement.innerHTML;
      assert.ok(markup.match(/>index<\/body>/));
      app.process({path: '/page'}, function(err, result) {
        var markup = doc.documentElement.innerHTML;
        assert.ok(markup.match(/>page<\/body>/));
        done();
      });
    });
  });
});
