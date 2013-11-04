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


describe('ReactApp browser environment', function() {

  var doc, app;

  describe('navigation', function() {
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

    beforeEach(function() {
      doc = document.implementation.createHTMLDocument('');
      app = ReactApp.createApp(utils.assign({document: doc}, spec));
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

  describe('Page.isMounted()', function() {
    var isMounted;
    var spec = {
      routes: {
        '/': ReactApp.createPage({
          pageDidMount: function() {
            isMounted.push(this.isMounted());
          },
          render: function() {
            return <Boilerplate>index</Boilerplate>;
          }
        }),

        '/page': ReactApp.createPage({
          pageDidMount: function() {
            isMounted.push(this.isMounted());
          },
          render: function() {
            return <Boilerplate>page</Boilerplate>;
          }
        }),
      },
      forcePageRendering: true
    };

    beforeEach(function() {
      isMounted = [];
      doc = document.implementation.createHTMLDocument('');
      app = ReactApp.createApp(utils.assign({document: doc}, spec));
    });

    it('returns true on a mounted page component', function(done) {
      app.process({path: '/'}, function(err, result) {
        if (err) return done(err);
        assert.ok(app.page);
        assert.ok(app.page.isMounted());
        assert.equal(isMounted.length, 1)
        assert.ok(isMounted.every(function(m) { return m; }));
        done();
      });
    });

    it('returns true after page re-render on a nvaigation', function(done) {
      app.process({path: '/'}, function(err, result) {
        if (err) return done(err);
        assert.ok(app.page);
        assert.ok(app.page.isMounted());
        app.process({path: '/page'}, function(err, result) {
          assert.ok(app.page);
          assert.ok(app.page.isMounted());
          app.process({path: '/'}, function(err, result) {
            assert.ok(app.page.isMounted());
            assert.equal(isMounted.length, 3)
            assert.ok(isMounted.every(function(m) { return m; }));
            done();
          });
        });
      });
    });

  });

});
