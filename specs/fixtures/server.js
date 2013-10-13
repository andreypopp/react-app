var express = require('express'),
    ReactApp = require('../../index');

app = express();
app.get('/api/data', function(req, res) {
  res.send({message: 'Hey there!'});
});

app.use(ReactApp('./app.jsx', {debug: true}));
module.exports = app;
