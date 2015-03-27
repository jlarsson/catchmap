var assert = require('assert')
var catchmap = require('../')
var Promise = require('native-or-bluebird')

describe('catchmap', function() {
  it('catchmap(<string>) matches Error.code', function(done) {
    var thrown = makeError(Error, 'badz')
    Promise
      .reject(thrown)
      .catch(catchmap('badz'))
      .then(done)

    .catch(assert.fail.bind(null, 'Error should be caught'))
      .catch(done)

  })
  it('catchmap(<class>) matches Error class', function(done) {
    Promise
      .reject(makeError(Error))
      .catch(catchmap(Error))
      .then(done)

    .catch(assert.fail.bind(null, 'Error should be caught'))
      .catch(done)
  })
  it('catchmap(...) matches a mix of codes and classes', function(done) {
    var cm = catchmap(Error, 'ENOENT')

    var errors = [makeError(Error), makeError(Error, 'ENOENT')]
    var promises = errors.map(function(e) {
      return Promise.reject(makeError()).catch(cm)
    })

    Promise.all(promises)
      .then(function() {
        done();
      })
      .catch(assert.fail.bind(null, 'Error should be caught'))
      .catch(done)
  })
  it('catchmap(...) only catches specified errors', function(done) {
    var errorWasUncaught = function() {
      return false;
    }
    Promise.reject(Error)
      .catch(catchmap('some other error'))
      .catch(function(err) {
        errorWasUncaught = true
      })
      .then(assert.ok.bind(null, function() {
        return errorWasUncaught
      }(), 'Expected error to slip through catchmap'))
      .then(done)
      .catch(done)
  })
  it('catchmap() only catches Errors', function (done){
    Promise.reject('error')
      .catch(catchmap(Error))
      .then(done.bind(null,assert.fail.bind(null,'string exception should not be caught')))
      .catch(assert.equal.bind(null,'error'))
      .then(done)
      .catch(done)
  })

  it('catchmap(...).to(<value>) settles a value', function (done){

    Promise.reject(makeError(SyntaxError))
      .catch(catchmap(SyntaxError).to(123))
      .then(function (v){
        assert.equal(123,v)
        done()
      })
      .catch(done)
  })
})

function makeError(type, code) {
  var err = new(type || Error)()
  if (code) {
    err.code = code;
  }
  return err;
}
