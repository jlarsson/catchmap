[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![npm][license-image]][license-url]

[travis-image]: https://img.shields.io/travis/jlarsson/catchmap.svg?style=flat
[travis-url]: https://travis-ci.org/jlarsson/catchmap
[npm-image]: https://img.shields.io/npm/v/catchmap.svg?style=flat
[npm-url]: https://npmjs.org/package/catchmap
[license-image]: https://img.shields.io/npm/l/catchmap.svg?style=flat
[license-url]: LICENSE
# catchmap

Utility for removing tedious error checking.

Works great with promises and blends nicely with co and koa.

In short, ```catchmap(...errors)``` creates a ```function (err) {}``` that will swallow matching errors and re-throw the rest.

## Example
Error checking with promises can be hard on the eyes.

```js
// Yawn, do I have to read all this error checking?
readFile()
  .then(JSON.parse)
  .catch(function (err){
    if (err.code === 'ENOENT'){
      return
    }
    if (err instanceof SyntaxError){
      return
    }
    throw err
  })
  .then(function (){
    // do some business
  })
  ...

```

```catchmap(...)``` takes care of checking error types and ```Error.code``` for you.

```js
// Clear and readable
readFile()
  .then(JSON.parse)
  .catch(catchmap('ENOENT',SyntaxError))
  .then(function (){
    // do some business
  })
  ...
```

Errors can also be mapped to values using ```catchmap(...).to(value)```.
```js
somePromise()
  .catch(catchmap(Error).to(123))
  .then(function (v){
    // if Error was thrown, then v === 123
  })

```


Optimize it a bit by sharing instances of ```catchmap```.

```js

var allowAcceptableError = catchmap('ENOENT', SyntaxError)
// allowAcceptableError is equivalent with
// catchmap('ENOENT',SyntaxError).to(undefined)

somePromise()
  .catch(allowAcceptableError)
  .then(function (){
    // do some business
  })
  ...
```
