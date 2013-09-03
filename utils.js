function getCaller() {
  var frame,
      stack = getStack();

  stack.shift();

  for (var i = 0, length = stack.length; i < length; i++) {
    frame = stack[i];
    if (frame.receiver && frame.receiver.filename) {
      return frame.receiver.filename;
    }
  }
};

function getStack() {
  var origPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack) { return stack; };
  var err = new Error();
  var stack = err.stack;
  Error.prepareStackTrace = origPrepareStackTrace;
  return stack;
};

module.exports = {
  getStack: getStack,
  getCaller: getCaller
};
