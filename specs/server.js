var ok = require('assert').ok,
    request = require('supertest'),
    makeApp = require('../index');

describe('server rendering', function() {

  var app = makeApp({
    '/':            './fixtures/index.jsx',
    '/pages/about': './fixtures/about.jsx'
  });

  it('renders index page', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        ok(!err);
        ok(res.text.indexOf('</html>') > -1);
        ok(res.text.indexOf('/__script__') > -1);
        ok(res.text.indexOf('Hello, index!') > -1);
        done()
      });
  });

  it('renders about page', function(done) {
    request(app)
      .get('/pages/about')
      .expect(200)
      .end(function(err, res) {
        ok(!err);
        ok(res.text.indexOf('</h1>') > -1);
        ok(res.text.indexOf('/__script__') > -1);
        ok(res.text.indexOf('Hello, about!') > -1);
        done()
      });
  });

  it('renders client side code', function(done) {
    request(app)
      .get('/__script__')
      .expect(200)
      .end(function(err, res) {
        ok(!err);
        ok(res.text.indexOf('Hello, index!') > -1);
        ok(res.text.indexOf('Hello, about!') > -1);
        ok(res);
        done()
      });
  });

});
