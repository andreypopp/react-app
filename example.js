var makeApp = require('./index');

var app = makeApp({
  '/': './specs/fixtures/index.jsx',
  '/pages/about': './specs/fixtures/about.jsx'
});

app.listen(3000);
