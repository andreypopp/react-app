var ok      = require('assert').ok,
    express = require('express'),
    request = require('supertest'),
    app     = require('./fixtures/server');

describe('ReactApp server middleware', function() {

  it('renders page with data', function(done) {
    request(app)
      .get('/pages/withdata')
      .expect(200)
      .end(function(err, res) {
        ok(!err);
        ok(res.text.indexOf('</html>') > -1);
        ok(res.text.indexOf('bundle.js') > -1);
        ok(res.text.indexOf('bundle.css') > -1);
        ok(res.text.indexOf('Hey there!') > -1);
        done()
      });
  });

  it('renders index page', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function(err, res) {
        ok(!err);
        ok(res.text.indexOf('</html>') > -1);
        ok(res.text.indexOf('bundle.js') > -1);
        ok(res.text.indexOf('bundle.css') > -1);
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
        ok(res.text.indexOf('bundle.js') > -1);
        ok(res.text.indexOf('bundle.css') > -1);
        ok(res.text.indexOf('Hello, about!') > -1);
        done()
      });
  });

  it('renders client side code', function(done) {
    request(app)
      .get('/assets/bundle.js')
      .expect(200)
      .end(function(err, res) {
        ok(!err);
        ok(res.text.indexOf('Hello, index!') > -1);
        ok(res.text.indexOf('Hello, about!') > -1);
        ok(res);
        done()
      });
  });

  it('renders styles', function(done) {
    request(app)
      .get('/assets/bundle.css')
      .expect(200)
      .end(function(err, res) {
        ok(!err);
        ok(res);
        done()
      });
  });

  it('returns 404 on no match', function(done) {
    request(app)
      .get('/somePage')
      .expect(404, done);
  });

});
