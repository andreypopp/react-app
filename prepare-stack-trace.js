"use strict";

var __prepareStackTrace = Error.prepareStackTrace;

function prepareStackTrace(error, stack) {
  Error.prepareStackTrace = __prepareStackTrace;
  var stackTrace = error + '\n' + stack.map(function(frame) {
    var source = frame.getFileName() || frame.getScriptNameOrSourceURL(),
        name = frame.getMethodName() || frame.getFunctionName(),
        position = {
          source: source,
          line: frame.getLineNumber(),
          column: frame.getColumnNumber()
        };

    if (position.source === undefined || position.source === 'undefined') {
      if (__react_app_sourceMap)
        position = __react_app_sourceMap.map.originalPositionFor(position);
    }

    return '    at ' + name + ' (' + position.source + ':' + position.line + ':0)';

  }).join('\n');
  Error.prepareStackTrace = prepareStackTrace;
  return stackTrace;
}

Error.prepareStackTrace = prepareStackTrace;
