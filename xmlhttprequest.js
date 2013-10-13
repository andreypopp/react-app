"use strict";

var BaseXMLHttpRequest  = require('xhr2'),
    inherits            = require('util').inherits,
    resolve             = require('url').resolve;

function XMLHttpRequest(options, location) {
  BaseXMLHttpRequest.call(this, options);
  this.location = location;
}
inherits(XMLHttpRequest, BaseXMLHttpRequest);

XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
  if (!url.match(/^https?:\/\//))
    url = resolve(this.location.href, url);
  return BaseXMLHttpRequest.prototype.open.call(
      this, method, url, async, user, password);
}

module.exports = function(location) {
  var ctor = function(options) {
    XMLHttpRequest.call(this, options, location);
  }
  inherits(ctor, XMLHttpRequest);
  return ctor;
}
