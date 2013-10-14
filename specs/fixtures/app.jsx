var ReactApp = require('../../browser');

module.exports = ReactApp.createApp({
  routes: {
    '/': require('./index.jsx'),
    '/pages/withdata': require('./withdata.jsx'),
    '/pages/about': require('./about.jsx')
  }
});
