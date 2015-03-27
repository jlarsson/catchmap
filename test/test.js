var assert = require('assert')
var catchmap = require('../')
var once = require('once')
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
    done = once(done)
    var thrown = new Error()
    Promise.reject(thrown)
      .catch(catchmap('some other error'))
      .catch(function(err) {
        assert.ok(thrown === err, 'Wrong error propagated')
        done();
      })
      .then(assert.fail.bind(null, 'Expected error to slip through catchmap'))
      .catch(done)
  })
  it('catchmap() only catches Errors', function(done) {
    Promise.reject('error')
      .catch(catchmap(Error))
      .then(done.bind(null, assert.fail.bind(null, 'string exception should not be caught')))
      .catch(assert.equal.bind(null, 'error'))
      .then(done)
      .catch(done)
  })

  it('catchmap(...).to(<value>) settles a value', function(done) {
    Promise.reject(makeError(SyntaxError))
      .catch(catchmap(SyntaxError).to(123))
      .then(function(v) {
        assert.equal(123, v)
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
