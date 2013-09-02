getCaller = ->
  stack = getStack()
  stack.shift()
  for frame in stack when frame.receiver?.filename
    return frame.receiver.filename

getStack = ->
  origPrepareStackTrace = Error.prepareStackTrace
  Error.prepareStackTrace = (_, stack) -> stack
  err = new Error()
  stack = err.stack
  Error.prepareStackTrace = origPrepareStackTrace
  stack

module.exports = {getStack, getCaller}
