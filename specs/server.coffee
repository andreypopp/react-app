{ok}    = require 'assert'
request = require 'supertest'
makeApp = require '../index'

describe 'server rendering', ->

  app = makeApp
    '/':            './fixtures/index.jsx'
    '/pages/about': './fixtures/about.jsx'

  it 'renders index page', (done) ->
    request(app)
      .get('/')
      .expect(200)
      .end (err, res) ->
        ok not err
        ok res.text.indexOf('</html>') > -1
        ok res.text.indexOf('/__script__') > -1
        ok res.text.indexOf('Hello, index!') > -1
        done()

  it 'renders about page', (done) ->
    request(app)
      .get('/pages/about')
      .expect(200)
      .end (err, res) ->
        ok not err
        ok res.text.indexOf('</h1>') > -1
        ok res.text.indexOf('/__script__') > -1
        ok res.text.indexOf('Hello, about!') > -1
        done()

  it 'renders client side code', (done) ->
    request(app)
      .get('/__script__')
      .expect(200)
      .end (err, res) ->
        ok not err
        ok res.text.indexOf('Hello, index!') > -1
        ok res.text.indexOf('Hello, about!') > -1
        ok res
        done()
