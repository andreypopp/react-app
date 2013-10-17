var utils         = require('lodash');

/**
 * Measure time of a async method
 *
 * @param {String} msg Message to emit at debug level
 * @param {Function} method Method which returns a promise
 */
function measure(msg, method) {
  return function() {
    var start = new Date();
    return method.apply(this, arguments).then(function(result) {
      if (this.logger)
        this.logger.debug(msg, new Date() - start, 'ms');
      return result;
    }.bind(this));
  }
}

/**
 * Create a logger
 *
 * @param {Options} opts - 'debug', 'quiet' and 'colors'
 */
function getLogger(opts) {
  if (opts.colors)
    require('colors');

  return {
    debug: function(msg) {
      if (!opts.quiet && opts.debug)
        this.log('[debug]', arguments);
    },

    info: function(msg) {
      if (!opts.quiet)
        this.log('[info]', arguments);
    },

    warning: function(msg) {
      this.log('[warning]', arguments);
    },

    error: function() {
      this.log('[error]', arguments);
    },

    log: function(level, msgs) {
      if (opts.colors)
        switch (level) {
          case '[debug]': level = level.grey; break;
          case '[info]': level = level.blue; break;
          case '[warning]': level = level.yellow; break;
          case '[error]': level = level.red; break;
        }
      args = [level].concat(utils.toArray(msgs));
      console.warn.apply(console, args);
    }
  };
}

module.exports = {
  measure: measure,
  getLogger: getLogger
};
