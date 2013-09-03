var makeApp = require('./index'),
    routes = {
      '/': './specs/fixtures/index.jsx',
      '/pages/about': './specs/fixtures/about.jsx'
    },
    app = makeApp(routes, {debug: true});

app.listen(3000);
