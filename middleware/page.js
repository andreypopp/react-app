module.exports = function(id, opts) {
  return function(req, res, next) {
    res.setHeader('Content-type', 'text/html');
    res.send([
      '<html>',
      '  <head>',
      '    <link rel="stylesheet" href="' + opts.assetsUrl + '/bundle.css" />',
      '    <script src="' + opts.assetsUrl + '/bundle.js"></script>',
      '    <script>',
      '      require("react-app/runtime/browser").injectAssets(' + JSON.stringify(opts.injectAssets) + ');',
      '      require("' + id + '").start();',
      '    </script>',
      '  </head>',
      '  <body>',
      '  </body>',
      '</html>'
    ].join('\n'));
  }
}
