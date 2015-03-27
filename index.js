'use strict'

var slice = Array.prototype.slice

module.exports = catchmap;


function catchmap(matchers) {
  var matchers = slice.call(arguments)
    .map(createMatcher)

  var cm = function(matchers, err) {
    return (err instanceof Error) && matchers.some(isMatch.bind(null, err)) ? undefined : thr()

    function thr(){
      throw err
    }

    function isMatch(err, matcher){
      return matcher(err)
    }
  }.bind(null, matchers)

  cm.to = function (value){
    var inner = this;
    return function (err){
      inner(err)
      return value
    }
  }
  return cm;

  function createMatcher(matcher) {
    if (typeof matcher === 'string') {
      return matchErrorCode.bind(null, matcher)
    }
    if (matcher instanceof Function) {
      return matchErrorClass.bind(null, matcher)
    }
    return matchNone
  }

  function matchNone() {
    return false
  }

  function matchErrorCode(errorCode, err) {
    return err.code === errorCode
  }

  function matchErrorClass(errorClass, err) {
    return err instanceof errorClass
  }
}
