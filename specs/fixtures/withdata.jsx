
/**
 *
 * @jsx React.DOM
 *
 */

require('./styles.css');

var React = require('react-tools/build/modules/React'),
    Boilerplate = require('./boilerplate.jsx'),
    createPage = require('../../page').createPage,
    DebugInfo = require('./debug_info.jsx');

function request(url, cb) {
  var xhr = new global.XMLHttpRequest(),
      twoHundred = /^20\d$/;

  xhr.onreadystatechange = function() {
    if (4 == xhr.readyState && 0 !== xhr.status) {
      if (twoHundred.test(xhr.status)) cb(null, JSON.parse(xhr.responseText));
      else {
        var err = new Error('error getting: ' + url);
        err.xhr = xhr;
        cb(err);
      }
    }
  };
  xhr.onerror = function(e) { return cb(e, null); };
  xhr.open('GET', url, true);
  xhr.send();
}

module.exports = createPage({
  render: function() {
    var debugInfo = DebugInfo({request: this.props.request});
    return (
      <Boilerplate title="With Data!">
        <h1>{this.props.data.message}</h1>
        <a href="/pages/about"><i className="icon icon-pencil"></i> About page</a>
        {debugInfo}
      </Boilerplate>
    );
  },

  getData: function(cb) {
    request('/api/data', cb);
  }
});
