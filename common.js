var utils         = require('lodash');

function measure(msg, func) {
  return function() {
    var start = new Date();
    return func.apply(this, arguments).then(function(result) {
      if (this.logger)
        this.logger.debug(msg, new Date() - start, 'ms');
      return result;
    }.bind(this));
  }
}

function getLogger(opts) {
  if (opts.colors)
    require('colors');

  return {
    debug: function(msg) {
      if (!opts.quiet && opts.debug)
        this.log('[debug]'.grey, arguments);
    },

    info: function(msg) {
      if (!opts.quiet)
        this.log('[info]'.blue, arguments);
    },

    warning: function(msg) {
      this.log('[warning]'.yellow, arguments);
    },

    error: function() {
      this.log('[error]'.red, arguments);
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
