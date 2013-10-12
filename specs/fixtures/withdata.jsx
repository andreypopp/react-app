
/**
 *
 * @jsx React.DOM
 *
 */

require('./styles.css');

var React = require('react-tools/build/modules/React'),
    createPage = require('../../page'),
    DebugInfo = require('./debug_info.jsx');

function request(url, cb) {
  var xhr = new global.XMLHttpRequest(),
      twoHundred = /^20\d$/;

  xhr.onreadystatechange = function() {
    if (4 == xhr.readyState && 0 !== xhr.status) {
      if (twoHundred.test(xhr.status)) cb(null, JSON.parse(xhr.responseText));
      else cb(xhr, null);
    }
  };
  xhr.onerror = function(e) { return cb(e, null); };
  xhr.open('GET', url, true);
  xhr.send();
}

module.exports = createPage({
  render: function() {
    var debugInfo = this.transferPropsTo(DebugInfo());
    return this.transferPropsTo(
      <html>
        <head>
          <title>{this.props.message}</title>
        </head>
        <body>
          <h1>Hello, index!</h1>
          <a href="/pages/about"><i class="icon icon-pencil"></i> About page</a>
          {debugInfo}
        </body>
      </html>
    );
  },

  getData: function(cb) {
    request('/api/data', cb);
  }
});
