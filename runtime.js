var AssetInjector = require('./asset-injector'),
    app = require('' + 'app');

module.exports = {
  injectAssets: AssetInjector.injectAssets,
  app: app,
  generateMarkup: function(request, cb) {
    app.generateMarkup(request, function(err, markup, data) {
      err ? cb(err) : cb(null, {markup: markup, data: data});
    });
  }
};
