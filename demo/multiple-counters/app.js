/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 112);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = __webpack_require__(47)
var ieee754 = __webpack_require__(75)
var isArray = __webpack_require__(36)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer, __webpack_require__(4)))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = __webpack_require__(20);
/*</replacement>*/

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(0);
/*</replacement>*/

var Readable = __webpack_require__(40);
var Writable = __webpack_require__(22);

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

/***/ },
/* 3 */
/***/ function(module, exports) {

module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}


/***/ },
/* 4 */
/***/ function(module, exports) {

var g;

// This works in non-strict mode
g = (function() { return this; })();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1).Buffer))

/***/ },
/* 6 */
/***/ function(module, exports) {

//Types of elements found in the DOM
module.exports = {
	Text: "text", //Text
	Directive: "directive", //<? ... ?>
	Comment: "comment", //<!-- ... -->
	Script: "script", //<script> tags
	Style: "style", //<style> tags
	Tag: "tag", //Any tag
	CDATA: "cdata", //<![CDATA[ ... ]]>
	Doctype: "doctype",

	isTag: function(elem){
		return elem.type === "tag" || elem.type === "script" || elem.type === "style";
	}
};


/***/ },
/* 7 */
/***/ function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

var Parser = __webpack_require__(32),
    DomHandler = __webpack_require__(51);

function defineProp(name, value){
	delete module.exports[name];
	module.exports[name] = value;
	return value;
}

module.exports = {
	Parser: Parser,
	Tokenizer: __webpack_require__(33),
	ElementType: __webpack_require__(6),
	DomHandler: DomHandler,
	get FeedHandler(){
		return defineProp("FeedHandler", __webpack_require__(72));
	},
	get Stream(){
		return defineProp("Stream", __webpack_require__(74));
	},
	get WritableStream(){
		return defineProp("WritableStream", __webpack_require__(34));
	},
	get ProxyHandler(){
		return defineProp("ProxyHandler", __webpack_require__(73));
	},
	get DomUtils(){
		return defineProp("DomUtils", __webpack_require__(53));
	},
	get CollectingHandler(){
		return defineProp("CollectingHandler", __webpack_require__(71));
	},
	// For legacy support
	DefaultHandler: DomHandler,
	get RssHandler(){
		return defineProp("RssHandler", this.FeedHandler);
	},
	//helper methods
	parseDOM: function(data, options){
		var handler = new DomHandler(options);
		new Parser(handler, options).end(data);
		return handler.dom;
	},
	parseFeed: function(feed, options){
		var handler = new module.exports.FeedHandler(options);
		new Parser(handler, options).end(feed);
		return handler.dom;
	},
	createDomStream: function(cb, options, elementCb){
		var handler = new DomHandler(cb, options, elementCb);
		return new Parser(handler, options);
	},
	// List of all events that the parser emits
	EVENTS: { /* Format: eventname: number of arguments */
		attribute: 2,
		cdatastart: 0,
		cdataend: 0,
		text: 1,
		processinginstruction: 2,
		comment: 1,
		commentend: 0,
		closetag: 1,
		opentag: 2,
		opentagname: 1,
		error: 1,
		end: 0
	}
};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

var version = __webpack_require__(10)

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}


/***/ },
/* 10 */
/***/ function(module, exports) {

module.exports = "2"


/***/ },
/* 11 */
/***/ function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = __webpack_require__(7).EventEmitter;
var inherits = __webpack_require__(0);

inherits(Stream, EE);
Stream.Readable = __webpack_require__(84);
Stream.Writable = __webpack_require__(86);
Stream.Duplex = __webpack_require__(81);
Stream.Transform = __webpack_require__(85);
Stream.PassThrough = __webpack_require__(83);

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};


/***/ },
/* 13 */
/***/ function(module, exports) {

"use strict";
"use strict";
var App = (function () {
    function App() {
        this._events = {};
    }
    App.prototype.on = function (name, fn, options) {
        if (options === void 0) { options = {}; }
        if (options.debug)
            console.debug('on: ' + name);
        this._events[name] = this._events[name] || [];
        this._events[name].push({ fn: fn, options: options });
    };
    App.prototype.run = function (name) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var subscribers = this._events[name];
        console.assert(!!subscribers, 'No subscriber for event: ' + name);
        if (subscribers)
            this._events[name] = subscribers.filter(function (sub) {
                var fn = sub.fn, options = sub.options;
                if (options.delay) {
                    _this.delay(name, fn, args, options);
                }
                else {
                    if (options.debug)
                        console.debug('run: ' + name, args);
                    fn.apply(_this, args);
                }
                return !sub.options.once;
            });
    };
    App.prototype.delay = function (name, fn, args, options) {
        var _this = this;
        if (options._t)
            clearTimeout(options._t);
        options._t = setTimeout(function () {
            clearTimeout(options._t);
            if (options.debug)
                console.debug("run-delay " + options.delay + ":" + name, args);
            fn.apply(_this, args);
        }, options.delay);
    };
    return App;
}());
exports.App = App;
var app = new App();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app;


/***/ },
/* 14 */
/***/ function(module, exports) {

module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}


/***/ },
/* 15 */
/***/ function(module, exports) {

module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

var version = __webpack_require__(10)

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {'use strict';

var buffer = __webpack_require__(1);
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 18 */
/***/ function(module, exports) {

module.exports = {
	"Aacute": "Á",
	"aacute": "á",
	"Abreve": "Ă",
	"abreve": "ă",
	"ac": "∾",
	"acd": "∿",
	"acE": "∾̳",
	"Acirc": "Â",
	"acirc": "â",
	"acute": "´",
	"Acy": "А",
	"acy": "а",
	"AElig": "Æ",
	"aelig": "æ",
	"af": "⁡",
	"Afr": "𝔄",
	"afr": "𝔞",
	"Agrave": "À",
	"agrave": "à",
	"alefsym": "ℵ",
	"aleph": "ℵ",
	"Alpha": "Α",
	"alpha": "α",
	"Amacr": "Ā",
	"amacr": "ā",
	"amalg": "⨿",
	"amp": "&",
	"AMP": "&",
	"andand": "⩕",
	"And": "⩓",
	"and": "∧",
	"andd": "⩜",
	"andslope": "⩘",
	"andv": "⩚",
	"ang": "∠",
	"ange": "⦤",
	"angle": "∠",
	"angmsdaa": "⦨",
	"angmsdab": "⦩",
	"angmsdac": "⦪",
	"angmsdad": "⦫",
	"angmsdae": "⦬",
	"angmsdaf": "⦭",
	"angmsdag": "⦮",
	"angmsdah": "⦯",
	"angmsd": "∡",
	"angrt": "∟",
	"angrtvb": "⊾",
	"angrtvbd": "⦝",
	"angsph": "∢",
	"angst": "Å",
	"angzarr": "⍼",
	"Aogon": "Ą",
	"aogon": "ą",
	"Aopf": "𝔸",
	"aopf": "𝕒",
	"apacir": "⩯",
	"ap": "≈",
	"apE": "⩰",
	"ape": "≊",
	"apid": "≋",
	"apos": "'",
	"ApplyFunction": "⁡",
	"approx": "≈",
	"approxeq": "≊",
	"Aring": "Å",
	"aring": "å",
	"Ascr": "𝒜",
	"ascr": "𝒶",
	"Assign": "≔",
	"ast": "*",
	"asymp": "≈",
	"asympeq": "≍",
	"Atilde": "Ã",
	"atilde": "ã",
	"Auml": "Ä",
	"auml": "ä",
	"awconint": "∳",
	"awint": "⨑",
	"backcong": "≌",
	"backepsilon": "϶",
	"backprime": "‵",
	"backsim": "∽",
	"backsimeq": "⋍",
	"Backslash": "∖",
	"Barv": "⫧",
	"barvee": "⊽",
	"barwed": "⌅",
	"Barwed": "⌆",
	"barwedge": "⌅",
	"bbrk": "⎵",
	"bbrktbrk": "⎶",
	"bcong": "≌",
	"Bcy": "Б",
	"bcy": "б",
	"bdquo": "„",
	"becaus": "∵",
	"because": "∵",
	"Because": "∵",
	"bemptyv": "⦰",
	"bepsi": "϶",
	"bernou": "ℬ",
	"Bernoullis": "ℬ",
	"Beta": "Β",
	"beta": "β",
	"beth": "ℶ",
	"between": "≬",
	"Bfr": "𝔅",
	"bfr": "𝔟",
	"bigcap": "⋂",
	"bigcirc": "◯",
	"bigcup": "⋃",
	"bigodot": "⨀",
	"bigoplus": "⨁",
	"bigotimes": "⨂",
	"bigsqcup": "⨆",
	"bigstar": "★",
	"bigtriangledown": "▽",
	"bigtriangleup": "△",
	"biguplus": "⨄",
	"bigvee": "⋁",
	"bigwedge": "⋀",
	"bkarow": "⤍",
	"blacklozenge": "⧫",
	"blacksquare": "▪",
	"blacktriangle": "▴",
	"blacktriangledown": "▾",
	"blacktriangleleft": "◂",
	"blacktriangleright": "▸",
	"blank": "␣",
	"blk12": "▒",
	"blk14": "░",
	"blk34": "▓",
	"block": "█",
	"bne": "=⃥",
	"bnequiv": "≡⃥",
	"bNot": "⫭",
	"bnot": "⌐",
	"Bopf": "𝔹",
	"bopf": "𝕓",
	"bot": "⊥",
	"bottom": "⊥",
	"bowtie": "⋈",
	"boxbox": "⧉",
	"boxdl": "┐",
	"boxdL": "╕",
	"boxDl": "╖",
	"boxDL": "╗",
	"boxdr": "┌",
	"boxdR": "╒",
	"boxDr": "╓",
	"boxDR": "╔",
	"boxh": "─",
	"boxH": "═",
	"boxhd": "┬",
	"boxHd": "╤",
	"boxhD": "╥",
	"boxHD": "╦",
	"boxhu": "┴",
	"boxHu": "╧",
	"boxhU": "╨",
	"boxHU": "╩",
	"boxminus": "⊟",
	"boxplus": "⊞",
	"boxtimes": "⊠",
	"boxul": "┘",
	"boxuL": "╛",
	"boxUl": "╜",
	"boxUL": "╝",
	"boxur": "└",
	"boxuR": "╘",
	"boxUr": "╙",
	"boxUR": "╚",
	"boxv": "│",
	"boxV": "║",
	"boxvh": "┼",
	"boxvH": "╪",
	"boxVh": "╫",
	"boxVH": "╬",
	"boxvl": "┤",
	"boxvL": "╡",
	"boxVl": "╢",
	"boxVL": "╣",
	"boxvr": "├",
	"boxvR": "╞",
	"boxVr": "╟",
	"boxVR": "╠",
	"bprime": "‵",
	"breve": "˘",
	"Breve": "˘",
	"brvbar": "¦",
	"bscr": "𝒷",
	"Bscr": "ℬ",
	"bsemi": "⁏",
	"bsim": "∽",
	"bsime": "⋍",
	"bsolb": "⧅",
	"bsol": "\\",
	"bsolhsub": "⟈",
	"bull": "•",
	"bullet": "•",
	"bump": "≎",
	"bumpE": "⪮",
	"bumpe": "≏",
	"Bumpeq": "≎",
	"bumpeq": "≏",
	"Cacute": "Ć",
	"cacute": "ć",
	"capand": "⩄",
	"capbrcup": "⩉",
	"capcap": "⩋",
	"cap": "∩",
	"Cap": "⋒",
	"capcup": "⩇",
	"capdot": "⩀",
	"CapitalDifferentialD": "ⅅ",
	"caps": "∩︀",
	"caret": "⁁",
	"caron": "ˇ",
	"Cayleys": "ℭ",
	"ccaps": "⩍",
	"Ccaron": "Č",
	"ccaron": "č",
	"Ccedil": "Ç",
	"ccedil": "ç",
	"Ccirc": "Ĉ",
	"ccirc": "ĉ",
	"Cconint": "∰",
	"ccups": "⩌",
	"ccupssm": "⩐",
	"Cdot": "Ċ",
	"cdot": "ċ",
	"cedil": "¸",
	"Cedilla": "¸",
	"cemptyv": "⦲",
	"cent": "¢",
	"centerdot": "·",
	"CenterDot": "·",
	"cfr": "𝔠",
	"Cfr": "ℭ",
	"CHcy": "Ч",
	"chcy": "ч",
	"check": "✓",
	"checkmark": "✓",
	"Chi": "Χ",
	"chi": "χ",
	"circ": "ˆ",
	"circeq": "≗",
	"circlearrowleft": "↺",
	"circlearrowright": "↻",
	"circledast": "⊛",
	"circledcirc": "⊚",
	"circleddash": "⊝",
	"CircleDot": "⊙",
	"circledR": "®",
	"circledS": "Ⓢ",
	"CircleMinus": "⊖",
	"CirclePlus": "⊕",
	"CircleTimes": "⊗",
	"cir": "○",
	"cirE": "⧃",
	"cire": "≗",
	"cirfnint": "⨐",
	"cirmid": "⫯",
	"cirscir": "⧂",
	"ClockwiseContourIntegral": "∲",
	"CloseCurlyDoubleQuote": "”",
	"CloseCurlyQuote": "’",
	"clubs": "♣",
	"clubsuit": "♣",
	"colon": ":",
	"Colon": "∷",
	"Colone": "⩴",
	"colone": "≔",
	"coloneq": "≔",
	"comma": ",",
	"commat": "@",
	"comp": "∁",
	"compfn": "∘",
	"complement": "∁",
	"complexes": "ℂ",
	"cong": "≅",
	"congdot": "⩭",
	"Congruent": "≡",
	"conint": "∮",
	"Conint": "∯",
	"ContourIntegral": "∮",
	"copf": "𝕔",
	"Copf": "ℂ",
	"coprod": "∐",
	"Coproduct": "∐",
	"copy": "©",
	"COPY": "©",
	"copysr": "℗",
	"CounterClockwiseContourIntegral": "∳",
	"crarr": "↵",
	"cross": "✗",
	"Cross": "⨯",
	"Cscr": "𝒞",
	"cscr": "𝒸",
	"csub": "⫏",
	"csube": "⫑",
	"csup": "⫐",
	"csupe": "⫒",
	"ctdot": "⋯",
	"cudarrl": "⤸",
	"cudarrr": "⤵",
	"cuepr": "⋞",
	"cuesc": "⋟",
	"cularr": "↶",
	"cularrp": "⤽",
	"cupbrcap": "⩈",
	"cupcap": "⩆",
	"CupCap": "≍",
	"cup": "∪",
	"Cup": "⋓",
	"cupcup": "⩊",
	"cupdot": "⊍",
	"cupor": "⩅",
	"cups": "∪︀",
	"curarr": "↷",
	"curarrm": "⤼",
	"curlyeqprec": "⋞",
	"curlyeqsucc": "⋟",
	"curlyvee": "⋎",
	"curlywedge": "⋏",
	"curren": "¤",
	"curvearrowleft": "↶",
	"curvearrowright": "↷",
	"cuvee": "⋎",
	"cuwed": "⋏",
	"cwconint": "∲",
	"cwint": "∱",
	"cylcty": "⌭",
	"dagger": "†",
	"Dagger": "‡",
	"daleth": "ℸ",
	"darr": "↓",
	"Darr": "↡",
	"dArr": "⇓",
	"dash": "‐",
	"Dashv": "⫤",
	"dashv": "⊣",
	"dbkarow": "⤏",
	"dblac": "˝",
	"Dcaron": "Ď",
	"dcaron": "ď",
	"Dcy": "Д",
	"dcy": "д",
	"ddagger": "‡",
	"ddarr": "⇊",
	"DD": "ⅅ",
	"dd": "ⅆ",
	"DDotrahd": "⤑",
	"ddotseq": "⩷",
	"deg": "°",
	"Del": "∇",
	"Delta": "Δ",
	"delta": "δ",
	"demptyv": "⦱",
	"dfisht": "⥿",
	"Dfr": "𝔇",
	"dfr": "𝔡",
	"dHar": "⥥",
	"dharl": "⇃",
	"dharr": "⇂",
	"DiacriticalAcute": "´",
	"DiacriticalDot": "˙",
	"DiacriticalDoubleAcute": "˝",
	"DiacriticalGrave": "`",
	"DiacriticalTilde": "˜",
	"diam": "⋄",
	"diamond": "⋄",
	"Diamond": "⋄",
	"diamondsuit": "♦",
	"diams": "♦",
	"die": "¨",
	"DifferentialD": "ⅆ",
	"digamma": "ϝ",
	"disin": "⋲",
	"div": "÷",
	"divide": "÷",
	"divideontimes": "⋇",
	"divonx": "⋇",
	"DJcy": "Ђ",
	"djcy": "ђ",
	"dlcorn": "⌞",
	"dlcrop": "⌍",
	"dollar": "$",
	"Dopf": "𝔻",
	"dopf": "𝕕",
	"Dot": "¨",
	"dot": "˙",
	"DotDot": "⃜",
	"doteq": "≐",
	"doteqdot": "≑",
	"DotEqual": "≐",
	"dotminus": "∸",
	"dotplus": "∔",
	"dotsquare": "⊡",
	"doublebarwedge": "⌆",
	"DoubleContourIntegral": "∯",
	"DoubleDot": "¨",
	"DoubleDownArrow": "⇓",
	"DoubleLeftArrow": "⇐",
	"DoubleLeftRightArrow": "⇔",
	"DoubleLeftTee": "⫤",
	"DoubleLongLeftArrow": "⟸",
	"DoubleLongLeftRightArrow": "⟺",
	"DoubleLongRightArrow": "⟹",
	"DoubleRightArrow": "⇒",
	"DoubleRightTee": "⊨",
	"DoubleUpArrow": "⇑",
	"DoubleUpDownArrow": "⇕",
	"DoubleVerticalBar": "∥",
	"DownArrowBar": "⤓",
	"downarrow": "↓",
	"DownArrow": "↓",
	"Downarrow": "⇓",
	"DownArrowUpArrow": "⇵",
	"DownBreve": "̑",
	"downdownarrows": "⇊",
	"downharpoonleft": "⇃",
	"downharpoonright": "⇂",
	"DownLeftRightVector": "⥐",
	"DownLeftTeeVector": "⥞",
	"DownLeftVectorBar": "⥖",
	"DownLeftVector": "↽",
	"DownRightTeeVector": "⥟",
	"DownRightVectorBar": "⥗",
	"DownRightVector": "⇁",
	"DownTeeArrow": "↧",
	"DownTee": "⊤",
	"drbkarow": "⤐",
	"drcorn": "⌟",
	"drcrop": "⌌",
	"Dscr": "𝒟",
	"dscr": "𝒹",
	"DScy": "Ѕ",
	"dscy": "ѕ",
	"dsol": "⧶",
	"Dstrok": "Đ",
	"dstrok": "đ",
	"dtdot": "⋱",
	"dtri": "▿",
	"dtrif": "▾",
	"duarr": "⇵",
	"duhar": "⥯",
	"dwangle": "⦦",
	"DZcy": "Џ",
	"dzcy": "џ",
	"dzigrarr": "⟿",
	"Eacute": "É",
	"eacute": "é",
	"easter": "⩮",
	"Ecaron": "Ě",
	"ecaron": "ě",
	"Ecirc": "Ê",
	"ecirc": "ê",
	"ecir": "≖",
	"ecolon": "≕",
	"Ecy": "Э",
	"ecy": "э",
	"eDDot": "⩷",
	"Edot": "Ė",
	"edot": "ė",
	"eDot": "≑",
	"ee": "ⅇ",
	"efDot": "≒",
	"Efr": "𝔈",
	"efr": "𝔢",
	"eg": "⪚",
	"Egrave": "È",
	"egrave": "è",
	"egs": "⪖",
	"egsdot": "⪘",
	"el": "⪙",
	"Element": "∈",
	"elinters": "⏧",
	"ell": "ℓ",
	"els": "⪕",
	"elsdot": "⪗",
	"Emacr": "Ē",
	"emacr": "ē",
	"empty": "∅",
	"emptyset": "∅",
	"EmptySmallSquare": "◻",
	"emptyv": "∅",
	"EmptyVerySmallSquare": "▫",
	"emsp13": " ",
	"emsp14": " ",
	"emsp": " ",
	"ENG": "Ŋ",
	"eng": "ŋ",
	"ensp": " ",
	"Eogon": "Ę",
	"eogon": "ę",
	"Eopf": "𝔼",
	"eopf": "𝕖",
	"epar": "⋕",
	"eparsl": "⧣",
	"eplus": "⩱",
	"epsi": "ε",
	"Epsilon": "Ε",
	"epsilon": "ε",
	"epsiv": "ϵ",
	"eqcirc": "≖",
	"eqcolon": "≕",
	"eqsim": "≂",
	"eqslantgtr": "⪖",
	"eqslantless": "⪕",
	"Equal": "⩵",
	"equals": "=",
	"EqualTilde": "≂",
	"equest": "≟",
	"Equilibrium": "⇌",
	"equiv": "≡",
	"equivDD": "⩸",
	"eqvparsl": "⧥",
	"erarr": "⥱",
	"erDot": "≓",
	"escr": "ℯ",
	"Escr": "ℰ",
	"esdot": "≐",
	"Esim": "⩳",
	"esim": "≂",
	"Eta": "Η",
	"eta": "η",
	"ETH": "Ð",
	"eth": "ð",
	"Euml": "Ë",
	"euml": "ë",
	"euro": "€",
	"excl": "!",
	"exist": "∃",
	"Exists": "∃",
	"expectation": "ℰ",
	"exponentiale": "ⅇ",
	"ExponentialE": "ⅇ",
	"fallingdotseq": "≒",
	"Fcy": "Ф",
	"fcy": "ф",
	"female": "♀",
	"ffilig": "ﬃ",
	"fflig": "ﬀ",
	"ffllig": "ﬄ",
	"Ffr": "𝔉",
	"ffr": "𝔣",
	"filig": "ﬁ",
	"FilledSmallSquare": "◼",
	"FilledVerySmallSquare": "▪",
	"fjlig": "fj",
	"flat": "♭",
	"fllig": "ﬂ",
	"fltns": "▱",
	"fnof": "ƒ",
	"Fopf": "𝔽",
	"fopf": "𝕗",
	"forall": "∀",
	"ForAll": "∀",
	"fork": "⋔",
	"forkv": "⫙",
	"Fouriertrf": "ℱ",
	"fpartint": "⨍",
	"frac12": "½",
	"frac13": "⅓",
	"frac14": "¼",
	"frac15": "⅕",
	"frac16": "⅙",
	"frac18": "⅛",
	"frac23": "⅔",
	"frac25": "⅖",
	"frac34": "¾",
	"frac35": "⅗",
	"frac38": "⅜",
	"frac45": "⅘",
	"frac56": "⅚",
	"frac58": "⅝",
	"frac78": "⅞",
	"frasl": "⁄",
	"frown": "⌢",
	"fscr": "𝒻",
	"Fscr": "ℱ",
	"gacute": "ǵ",
	"Gamma": "Γ",
	"gamma": "γ",
	"Gammad": "Ϝ",
	"gammad": "ϝ",
	"gap": "⪆",
	"Gbreve": "Ğ",
	"gbreve": "ğ",
	"Gcedil": "Ģ",
	"Gcirc": "Ĝ",
	"gcirc": "ĝ",
	"Gcy": "Г",
	"gcy": "г",
	"Gdot": "Ġ",
	"gdot": "ġ",
	"ge": "≥",
	"gE": "≧",
	"gEl": "⪌",
	"gel": "⋛",
	"geq": "≥",
	"geqq": "≧",
	"geqslant": "⩾",
	"gescc": "⪩",
	"ges": "⩾",
	"gesdot": "⪀",
	"gesdoto": "⪂",
	"gesdotol": "⪄",
	"gesl": "⋛︀",
	"gesles": "⪔",
	"Gfr": "𝔊",
	"gfr": "𝔤",
	"gg": "≫",
	"Gg": "⋙",
	"ggg": "⋙",
	"gimel": "ℷ",
	"GJcy": "Ѓ",
	"gjcy": "ѓ",
	"gla": "⪥",
	"gl": "≷",
	"glE": "⪒",
	"glj": "⪤",
	"gnap": "⪊",
	"gnapprox": "⪊",
	"gne": "⪈",
	"gnE": "≩",
	"gneq": "⪈",
	"gneqq": "≩",
	"gnsim": "⋧",
	"Gopf": "𝔾",
	"gopf": "𝕘",
	"grave": "`",
	"GreaterEqual": "≥",
	"GreaterEqualLess": "⋛",
	"GreaterFullEqual": "≧",
	"GreaterGreater": "⪢",
	"GreaterLess": "≷",
	"GreaterSlantEqual": "⩾",
	"GreaterTilde": "≳",
	"Gscr": "𝒢",
	"gscr": "ℊ",
	"gsim": "≳",
	"gsime": "⪎",
	"gsiml": "⪐",
	"gtcc": "⪧",
	"gtcir": "⩺",
	"gt": ">",
	"GT": ">",
	"Gt": "≫",
	"gtdot": "⋗",
	"gtlPar": "⦕",
	"gtquest": "⩼",
	"gtrapprox": "⪆",
	"gtrarr": "⥸",
	"gtrdot": "⋗",
	"gtreqless": "⋛",
	"gtreqqless": "⪌",
	"gtrless": "≷",
	"gtrsim": "≳",
	"gvertneqq": "≩︀",
	"gvnE": "≩︀",
	"Hacek": "ˇ",
	"hairsp": " ",
	"half": "½",
	"hamilt": "ℋ",
	"HARDcy": "Ъ",
	"hardcy": "ъ",
	"harrcir": "⥈",
	"harr": "↔",
	"hArr": "⇔",
	"harrw": "↭",
	"Hat": "^",
	"hbar": "ℏ",
	"Hcirc": "Ĥ",
	"hcirc": "ĥ",
	"hearts": "♥",
	"heartsuit": "♥",
	"hellip": "…",
	"hercon": "⊹",
	"hfr": "𝔥",
	"Hfr": "ℌ",
	"HilbertSpace": "ℋ",
	"hksearow": "⤥",
	"hkswarow": "⤦",
	"hoarr": "⇿",
	"homtht": "∻",
	"hookleftarrow": "↩",
	"hookrightarrow": "↪",
	"hopf": "𝕙",
	"Hopf": "ℍ",
	"horbar": "―",
	"HorizontalLine": "─",
	"hscr": "𝒽",
	"Hscr": "ℋ",
	"hslash": "ℏ",
	"Hstrok": "Ħ",
	"hstrok": "ħ",
	"HumpDownHump": "≎",
	"HumpEqual": "≏",
	"hybull": "⁃",
	"hyphen": "‐",
	"Iacute": "Í",
	"iacute": "í",
	"ic": "⁣",
	"Icirc": "Î",
	"icirc": "î",
	"Icy": "И",
	"icy": "и",
	"Idot": "İ",
	"IEcy": "Е",
	"iecy": "е",
	"iexcl": "¡",
	"iff": "⇔",
	"ifr": "𝔦",
	"Ifr": "ℑ",
	"Igrave": "Ì",
	"igrave": "ì",
	"ii": "ⅈ",
	"iiiint": "⨌",
	"iiint": "∭",
	"iinfin": "⧜",
	"iiota": "℩",
	"IJlig": "Ĳ",
	"ijlig": "ĳ",
	"Imacr": "Ī",
	"imacr": "ī",
	"image": "ℑ",
	"ImaginaryI": "ⅈ",
	"imagline": "ℐ",
	"imagpart": "ℑ",
	"imath": "ı",
	"Im": "ℑ",
	"imof": "⊷",
	"imped": "Ƶ",
	"Implies": "⇒",
	"incare": "℅",
	"in": "∈",
	"infin": "∞",
	"infintie": "⧝",
	"inodot": "ı",
	"intcal": "⊺",
	"int": "∫",
	"Int": "∬",
	"integers": "ℤ",
	"Integral": "∫",
	"intercal": "⊺",
	"Intersection": "⋂",
	"intlarhk": "⨗",
	"intprod": "⨼",
	"InvisibleComma": "⁣",
	"InvisibleTimes": "⁢",
	"IOcy": "Ё",
	"iocy": "ё",
	"Iogon": "Į",
	"iogon": "į",
	"Iopf": "𝕀",
	"iopf": "𝕚",
	"Iota": "Ι",
	"iota": "ι",
	"iprod": "⨼",
	"iquest": "¿",
	"iscr": "𝒾",
	"Iscr": "ℐ",
	"isin": "∈",
	"isindot": "⋵",
	"isinE": "⋹",
	"isins": "⋴",
	"isinsv": "⋳",
	"isinv": "∈",
	"it": "⁢",
	"Itilde": "Ĩ",
	"itilde": "ĩ",
	"Iukcy": "І",
	"iukcy": "і",
	"Iuml": "Ï",
	"iuml": "ï",
	"Jcirc": "Ĵ",
	"jcirc": "ĵ",
	"Jcy": "Й",
	"jcy": "й",
	"Jfr": "𝔍",
	"jfr": "𝔧",
	"jmath": "ȷ",
	"Jopf": "𝕁",
	"jopf": "𝕛",
	"Jscr": "𝒥",
	"jscr": "𝒿",
	"Jsercy": "Ј",
	"jsercy": "ј",
	"Jukcy": "Є",
	"jukcy": "є",
	"Kappa": "Κ",
	"kappa": "κ",
	"kappav": "ϰ",
	"Kcedil": "Ķ",
	"kcedil": "ķ",
	"Kcy": "К",
	"kcy": "к",
	"Kfr": "𝔎",
	"kfr": "𝔨",
	"kgreen": "ĸ",
	"KHcy": "Х",
	"khcy": "х",
	"KJcy": "Ќ",
	"kjcy": "ќ",
	"Kopf": "𝕂",
	"kopf": "𝕜",
	"Kscr": "𝒦",
	"kscr": "𝓀",
	"lAarr": "⇚",
	"Lacute": "Ĺ",
	"lacute": "ĺ",
	"laemptyv": "⦴",
	"lagran": "ℒ",
	"Lambda": "Λ",
	"lambda": "λ",
	"lang": "⟨",
	"Lang": "⟪",
	"langd": "⦑",
	"langle": "⟨",
	"lap": "⪅",
	"Laplacetrf": "ℒ",
	"laquo": "«",
	"larrb": "⇤",
	"larrbfs": "⤟",
	"larr": "←",
	"Larr": "↞",
	"lArr": "⇐",
	"larrfs": "⤝",
	"larrhk": "↩",
	"larrlp": "↫",
	"larrpl": "⤹",
	"larrsim": "⥳",
	"larrtl": "↢",
	"latail": "⤙",
	"lAtail": "⤛",
	"lat": "⪫",
	"late": "⪭",
	"lates": "⪭︀",
	"lbarr": "⤌",
	"lBarr": "⤎",
	"lbbrk": "❲",
	"lbrace": "{",
	"lbrack": "[",
	"lbrke": "⦋",
	"lbrksld": "⦏",
	"lbrkslu": "⦍",
	"Lcaron": "Ľ",
	"lcaron": "ľ",
	"Lcedil": "Ļ",
	"lcedil": "ļ",
	"lceil": "⌈",
	"lcub": "{",
	"Lcy": "Л",
	"lcy": "л",
	"ldca": "⤶",
	"ldquo": "“",
	"ldquor": "„",
	"ldrdhar": "⥧",
	"ldrushar": "⥋",
	"ldsh": "↲",
	"le": "≤",
	"lE": "≦",
	"LeftAngleBracket": "⟨",
	"LeftArrowBar": "⇤",
	"leftarrow": "←",
	"LeftArrow": "←",
	"Leftarrow": "⇐",
	"LeftArrowRightArrow": "⇆",
	"leftarrowtail": "↢",
	"LeftCeiling": "⌈",
	"LeftDoubleBracket": "⟦",
	"LeftDownTeeVector": "⥡",
	"LeftDownVectorBar": "⥙",
	"LeftDownVector": "⇃",
	"LeftFloor": "⌊",
	"leftharpoondown": "↽",
	"leftharpoonup": "↼",
	"leftleftarrows": "⇇",
	"leftrightarrow": "↔",
	"LeftRightArrow": "↔",
	"Leftrightarrow": "⇔",
	"leftrightarrows": "⇆",
	"leftrightharpoons": "⇋",
	"leftrightsquigarrow": "↭",
	"LeftRightVector": "⥎",
	"LeftTeeArrow": "↤",
	"LeftTee": "⊣",
	"LeftTeeVector": "⥚",
	"leftthreetimes": "⋋",
	"LeftTriangleBar": "⧏",
	"LeftTriangle": "⊲",
	"LeftTriangleEqual": "⊴",
	"LeftUpDownVector": "⥑",
	"LeftUpTeeVector": "⥠",
	"LeftUpVectorBar": "⥘",
	"LeftUpVector": "↿",
	"LeftVectorBar": "⥒",
	"LeftVector": "↼",
	"lEg": "⪋",
	"leg": "⋚",
	"leq": "≤",
	"leqq": "≦",
	"leqslant": "⩽",
	"lescc": "⪨",
	"les": "⩽",
	"lesdot": "⩿",
	"lesdoto": "⪁",
	"lesdotor": "⪃",
	"lesg": "⋚︀",
	"lesges": "⪓",
	"lessapprox": "⪅",
	"lessdot": "⋖",
	"lesseqgtr": "⋚",
	"lesseqqgtr": "⪋",
	"LessEqualGreater": "⋚",
	"LessFullEqual": "≦",
	"LessGreater": "≶",
	"lessgtr": "≶",
	"LessLess": "⪡",
	"lesssim": "≲",
	"LessSlantEqual": "⩽",
	"LessTilde": "≲",
	"lfisht": "⥼",
	"lfloor": "⌊",
	"Lfr": "𝔏",
	"lfr": "𝔩",
	"lg": "≶",
	"lgE": "⪑",
	"lHar": "⥢",
	"lhard": "↽",
	"lharu": "↼",
	"lharul": "⥪",
	"lhblk": "▄",
	"LJcy": "Љ",
	"ljcy": "љ",
	"llarr": "⇇",
	"ll": "≪",
	"Ll": "⋘",
	"llcorner": "⌞",
	"Lleftarrow": "⇚",
	"llhard": "⥫",
	"lltri": "◺",
	"Lmidot": "Ŀ",
	"lmidot": "ŀ",
	"lmoustache": "⎰",
	"lmoust": "⎰",
	"lnap": "⪉",
	"lnapprox": "⪉",
	"lne": "⪇",
	"lnE": "≨",
	"lneq": "⪇",
	"lneqq": "≨",
	"lnsim": "⋦",
	"loang": "⟬",
	"loarr": "⇽",
	"lobrk": "⟦",
	"longleftarrow": "⟵",
	"LongLeftArrow": "⟵",
	"Longleftarrow": "⟸",
	"longleftrightarrow": "⟷",
	"LongLeftRightArrow": "⟷",
	"Longleftrightarrow": "⟺",
	"longmapsto": "⟼",
	"longrightarrow": "⟶",
	"LongRightArrow": "⟶",
	"Longrightarrow": "⟹",
	"looparrowleft": "↫",
	"looparrowright": "↬",
	"lopar": "⦅",
	"Lopf": "𝕃",
	"lopf": "𝕝",
	"loplus": "⨭",
	"lotimes": "⨴",
	"lowast": "∗",
	"lowbar": "_",
	"LowerLeftArrow": "↙",
	"LowerRightArrow": "↘",
	"loz": "◊",
	"lozenge": "◊",
	"lozf": "⧫",
	"lpar": "(",
	"lparlt": "⦓",
	"lrarr": "⇆",
	"lrcorner": "⌟",
	"lrhar": "⇋",
	"lrhard": "⥭",
	"lrm": "‎",
	"lrtri": "⊿",
	"lsaquo": "‹",
	"lscr": "𝓁",
	"Lscr": "ℒ",
	"lsh": "↰",
	"Lsh": "↰",
	"lsim": "≲",
	"lsime": "⪍",
	"lsimg": "⪏",
	"lsqb": "[",
	"lsquo": "‘",
	"lsquor": "‚",
	"Lstrok": "Ł",
	"lstrok": "ł",
	"ltcc": "⪦",
	"ltcir": "⩹",
	"lt": "<",
	"LT": "<",
	"Lt": "≪",
	"ltdot": "⋖",
	"lthree": "⋋",
	"ltimes": "⋉",
	"ltlarr": "⥶",
	"ltquest": "⩻",
	"ltri": "◃",
	"ltrie": "⊴",
	"ltrif": "◂",
	"ltrPar": "⦖",
	"lurdshar": "⥊",
	"luruhar": "⥦",
	"lvertneqq": "≨︀",
	"lvnE": "≨︀",
	"macr": "¯",
	"male": "♂",
	"malt": "✠",
	"maltese": "✠",
	"Map": "⤅",
	"map": "↦",
	"mapsto": "↦",
	"mapstodown": "↧",
	"mapstoleft": "↤",
	"mapstoup": "↥",
	"marker": "▮",
	"mcomma": "⨩",
	"Mcy": "М",
	"mcy": "м",
	"mdash": "—",
	"mDDot": "∺",
	"measuredangle": "∡",
	"MediumSpace": " ",
	"Mellintrf": "ℳ",
	"Mfr": "𝔐",
	"mfr": "𝔪",
	"mho": "℧",
	"micro": "µ",
	"midast": "*",
	"midcir": "⫰",
	"mid": "∣",
	"middot": "·",
	"minusb": "⊟",
	"minus": "−",
	"minusd": "∸",
	"minusdu": "⨪",
	"MinusPlus": "∓",
	"mlcp": "⫛",
	"mldr": "…",
	"mnplus": "∓",
	"models": "⊧",
	"Mopf": "𝕄",
	"mopf": "𝕞",
	"mp": "∓",
	"mscr": "𝓂",
	"Mscr": "ℳ",
	"mstpos": "∾",
	"Mu": "Μ",
	"mu": "μ",
	"multimap": "⊸",
	"mumap": "⊸",
	"nabla": "∇",
	"Nacute": "Ń",
	"nacute": "ń",
	"nang": "∠⃒",
	"nap": "≉",
	"napE": "⩰̸",
	"napid": "≋̸",
	"napos": "ŉ",
	"napprox": "≉",
	"natural": "♮",
	"naturals": "ℕ",
	"natur": "♮",
	"nbsp": " ",
	"nbump": "≎̸",
	"nbumpe": "≏̸",
	"ncap": "⩃",
	"Ncaron": "Ň",
	"ncaron": "ň",
	"Ncedil": "Ņ",
	"ncedil": "ņ",
	"ncong": "≇",
	"ncongdot": "⩭̸",
	"ncup": "⩂",
	"Ncy": "Н",
	"ncy": "н",
	"ndash": "–",
	"nearhk": "⤤",
	"nearr": "↗",
	"neArr": "⇗",
	"nearrow": "↗",
	"ne": "≠",
	"nedot": "≐̸",
	"NegativeMediumSpace": "​",
	"NegativeThickSpace": "​",
	"NegativeThinSpace": "​",
	"NegativeVeryThinSpace": "​",
	"nequiv": "≢",
	"nesear": "⤨",
	"nesim": "≂̸",
	"NestedGreaterGreater": "≫",
	"NestedLessLess": "≪",
	"NewLine": "\n",
	"nexist": "∄",
	"nexists": "∄",
	"Nfr": "𝔑",
	"nfr": "𝔫",
	"ngE": "≧̸",
	"nge": "≱",
	"ngeq": "≱",
	"ngeqq": "≧̸",
	"ngeqslant": "⩾̸",
	"nges": "⩾̸",
	"nGg": "⋙̸",
	"ngsim": "≵",
	"nGt": "≫⃒",
	"ngt": "≯",
	"ngtr": "≯",
	"nGtv": "≫̸",
	"nharr": "↮",
	"nhArr": "⇎",
	"nhpar": "⫲",
	"ni": "∋",
	"nis": "⋼",
	"nisd": "⋺",
	"niv": "∋",
	"NJcy": "Њ",
	"njcy": "њ",
	"nlarr": "↚",
	"nlArr": "⇍",
	"nldr": "‥",
	"nlE": "≦̸",
	"nle": "≰",
	"nleftarrow": "↚",
	"nLeftarrow": "⇍",
	"nleftrightarrow": "↮",
	"nLeftrightarrow": "⇎",
	"nleq": "≰",
	"nleqq": "≦̸",
	"nleqslant": "⩽̸",
	"nles": "⩽̸",
	"nless": "≮",
	"nLl": "⋘̸",
	"nlsim": "≴",
	"nLt": "≪⃒",
	"nlt": "≮",
	"nltri": "⋪",
	"nltrie": "⋬",
	"nLtv": "≪̸",
	"nmid": "∤",
	"NoBreak": "⁠",
	"NonBreakingSpace": " ",
	"nopf": "𝕟",
	"Nopf": "ℕ",
	"Not": "⫬",
	"not": "¬",
	"NotCongruent": "≢",
	"NotCupCap": "≭",
	"NotDoubleVerticalBar": "∦",
	"NotElement": "∉",
	"NotEqual": "≠",
	"NotEqualTilde": "≂̸",
	"NotExists": "∄",
	"NotGreater": "≯",
	"NotGreaterEqual": "≱",
	"NotGreaterFullEqual": "≧̸",
	"NotGreaterGreater": "≫̸",
	"NotGreaterLess": "≹",
	"NotGreaterSlantEqual": "⩾̸",
	"NotGreaterTilde": "≵",
	"NotHumpDownHump": "≎̸",
	"NotHumpEqual": "≏̸",
	"notin": "∉",
	"notindot": "⋵̸",
	"notinE": "⋹̸",
	"notinva": "∉",
	"notinvb": "⋷",
	"notinvc": "⋶",
	"NotLeftTriangleBar": "⧏̸",
	"NotLeftTriangle": "⋪",
	"NotLeftTriangleEqual": "⋬",
	"NotLess": "≮",
	"NotLessEqual": "≰",
	"NotLessGreater": "≸",
	"NotLessLess": "≪̸",
	"NotLessSlantEqual": "⩽̸",
	"NotLessTilde": "≴",
	"NotNestedGreaterGreater": "⪢̸",
	"NotNestedLessLess": "⪡̸",
	"notni": "∌",
	"notniva": "∌",
	"notnivb": "⋾",
	"notnivc": "⋽",
	"NotPrecedes": "⊀",
	"NotPrecedesEqual": "⪯̸",
	"NotPrecedesSlantEqual": "⋠",
	"NotReverseElement": "∌",
	"NotRightTriangleBar": "⧐̸",
	"NotRightTriangle": "⋫",
	"NotRightTriangleEqual": "⋭",
	"NotSquareSubset": "⊏̸",
	"NotSquareSubsetEqual": "⋢",
	"NotSquareSuperset": "⊐̸",
	"NotSquareSupersetEqual": "⋣",
	"NotSubset": "⊂⃒",
	"NotSubsetEqual": "⊈",
	"NotSucceeds": "⊁",
	"NotSucceedsEqual": "⪰̸",
	"NotSucceedsSlantEqual": "⋡",
	"NotSucceedsTilde": "≿̸",
	"NotSuperset": "⊃⃒",
	"NotSupersetEqual": "⊉",
	"NotTilde": "≁",
	"NotTildeEqual": "≄",
	"NotTildeFullEqual": "≇",
	"NotTildeTilde": "≉",
	"NotVerticalBar": "∤",
	"nparallel": "∦",
	"npar": "∦",
	"nparsl": "⫽⃥",
	"npart": "∂̸",
	"npolint": "⨔",
	"npr": "⊀",
	"nprcue": "⋠",
	"nprec": "⊀",
	"npreceq": "⪯̸",
	"npre": "⪯̸",
	"nrarrc": "⤳̸",
	"nrarr": "↛",
	"nrArr": "⇏",
	"nrarrw": "↝̸",
	"nrightarrow": "↛",
	"nRightarrow": "⇏",
	"nrtri": "⋫",
	"nrtrie": "⋭",
	"nsc": "⊁",
	"nsccue": "⋡",
	"nsce": "⪰̸",
	"Nscr": "𝒩",
	"nscr": "𝓃",
	"nshortmid": "∤",
	"nshortparallel": "∦",
	"nsim": "≁",
	"nsime": "≄",
	"nsimeq": "≄",
	"nsmid": "∤",
	"nspar": "∦",
	"nsqsube": "⋢",
	"nsqsupe": "⋣",
	"nsub": "⊄",
	"nsubE": "⫅̸",
	"nsube": "⊈",
	"nsubset": "⊂⃒",
	"nsubseteq": "⊈",
	"nsubseteqq": "⫅̸",
	"nsucc": "⊁",
	"nsucceq": "⪰̸",
	"nsup": "⊅",
	"nsupE": "⫆̸",
	"nsupe": "⊉",
	"nsupset": "⊃⃒",
	"nsupseteq": "⊉",
	"nsupseteqq": "⫆̸",
	"ntgl": "≹",
	"Ntilde": "Ñ",
	"ntilde": "ñ",
	"ntlg": "≸",
	"ntriangleleft": "⋪",
	"ntrianglelefteq": "⋬",
	"ntriangleright": "⋫",
	"ntrianglerighteq": "⋭",
	"Nu": "Ν",
	"nu": "ν",
	"num": "#",
	"numero": "№",
	"numsp": " ",
	"nvap": "≍⃒",
	"nvdash": "⊬",
	"nvDash": "⊭",
	"nVdash": "⊮",
	"nVDash": "⊯",
	"nvge": "≥⃒",
	"nvgt": ">⃒",
	"nvHarr": "⤄",
	"nvinfin": "⧞",
	"nvlArr": "⤂",
	"nvle": "≤⃒",
	"nvlt": "<⃒",
	"nvltrie": "⊴⃒",
	"nvrArr": "⤃",
	"nvrtrie": "⊵⃒",
	"nvsim": "∼⃒",
	"nwarhk": "⤣",
	"nwarr": "↖",
	"nwArr": "⇖",
	"nwarrow": "↖",
	"nwnear": "⤧",
	"Oacute": "Ó",
	"oacute": "ó",
	"oast": "⊛",
	"Ocirc": "Ô",
	"ocirc": "ô",
	"ocir": "⊚",
	"Ocy": "О",
	"ocy": "о",
	"odash": "⊝",
	"Odblac": "Ő",
	"odblac": "ő",
	"odiv": "⨸",
	"odot": "⊙",
	"odsold": "⦼",
	"OElig": "Œ",
	"oelig": "œ",
	"ofcir": "⦿",
	"Ofr": "𝔒",
	"ofr": "𝔬",
	"ogon": "˛",
	"Ograve": "Ò",
	"ograve": "ò",
	"ogt": "⧁",
	"ohbar": "⦵",
	"ohm": "Ω",
	"oint": "∮",
	"olarr": "↺",
	"olcir": "⦾",
	"olcross": "⦻",
	"oline": "‾",
	"olt": "⧀",
	"Omacr": "Ō",
	"omacr": "ō",
	"Omega": "Ω",
	"omega": "ω",
	"Omicron": "Ο",
	"omicron": "ο",
	"omid": "⦶",
	"ominus": "⊖",
	"Oopf": "𝕆",
	"oopf": "𝕠",
	"opar": "⦷",
	"OpenCurlyDoubleQuote": "“",
	"OpenCurlyQuote": "‘",
	"operp": "⦹",
	"oplus": "⊕",
	"orarr": "↻",
	"Or": "⩔",
	"or": "∨",
	"ord": "⩝",
	"order": "ℴ",
	"orderof": "ℴ",
	"ordf": "ª",
	"ordm": "º",
	"origof": "⊶",
	"oror": "⩖",
	"orslope": "⩗",
	"orv": "⩛",
	"oS": "Ⓢ",
	"Oscr": "𝒪",
	"oscr": "ℴ",
	"Oslash": "Ø",
	"oslash": "ø",
	"osol": "⊘",
	"Otilde": "Õ",
	"otilde": "õ",
	"otimesas": "⨶",
	"Otimes": "⨷",
	"otimes": "⊗",
	"Ouml": "Ö",
	"ouml": "ö",
	"ovbar": "⌽",
	"OverBar": "‾",
	"OverBrace": "⏞",
	"OverBracket": "⎴",
	"OverParenthesis": "⏜",
	"para": "¶",
	"parallel": "∥",
	"par": "∥",
	"parsim": "⫳",
	"parsl": "⫽",
	"part": "∂",
	"PartialD": "∂",
	"Pcy": "П",
	"pcy": "п",
	"percnt": "%",
	"period": ".",
	"permil": "‰",
	"perp": "⊥",
	"pertenk": "‱",
	"Pfr": "𝔓",
	"pfr": "𝔭",
	"Phi": "Φ",
	"phi": "φ",
	"phiv": "ϕ",
	"phmmat": "ℳ",
	"phone": "☎",
	"Pi": "Π",
	"pi": "π",
	"pitchfork": "⋔",
	"piv": "ϖ",
	"planck": "ℏ",
	"planckh": "ℎ",
	"plankv": "ℏ",
	"plusacir": "⨣",
	"plusb": "⊞",
	"pluscir": "⨢",
	"plus": "+",
	"plusdo": "∔",
	"plusdu": "⨥",
	"pluse": "⩲",
	"PlusMinus": "±",
	"plusmn": "±",
	"plussim": "⨦",
	"plustwo": "⨧",
	"pm": "±",
	"Poincareplane": "ℌ",
	"pointint": "⨕",
	"popf": "𝕡",
	"Popf": "ℙ",
	"pound": "£",
	"prap": "⪷",
	"Pr": "⪻",
	"pr": "≺",
	"prcue": "≼",
	"precapprox": "⪷",
	"prec": "≺",
	"preccurlyeq": "≼",
	"Precedes": "≺",
	"PrecedesEqual": "⪯",
	"PrecedesSlantEqual": "≼",
	"PrecedesTilde": "≾",
	"preceq": "⪯",
	"precnapprox": "⪹",
	"precneqq": "⪵",
	"precnsim": "⋨",
	"pre": "⪯",
	"prE": "⪳",
	"precsim": "≾",
	"prime": "′",
	"Prime": "″",
	"primes": "ℙ",
	"prnap": "⪹",
	"prnE": "⪵",
	"prnsim": "⋨",
	"prod": "∏",
	"Product": "∏",
	"profalar": "⌮",
	"profline": "⌒",
	"profsurf": "⌓",
	"prop": "∝",
	"Proportional": "∝",
	"Proportion": "∷",
	"propto": "∝",
	"prsim": "≾",
	"prurel": "⊰",
	"Pscr": "𝒫",
	"pscr": "𝓅",
	"Psi": "Ψ",
	"psi": "ψ",
	"puncsp": " ",
	"Qfr": "𝔔",
	"qfr": "𝔮",
	"qint": "⨌",
	"qopf": "𝕢",
	"Qopf": "ℚ",
	"qprime": "⁗",
	"Qscr": "𝒬",
	"qscr": "𝓆",
	"quaternions": "ℍ",
	"quatint": "⨖",
	"quest": "?",
	"questeq": "≟",
	"quot": "\"",
	"QUOT": "\"",
	"rAarr": "⇛",
	"race": "∽̱",
	"Racute": "Ŕ",
	"racute": "ŕ",
	"radic": "√",
	"raemptyv": "⦳",
	"rang": "⟩",
	"Rang": "⟫",
	"rangd": "⦒",
	"range": "⦥",
	"rangle": "⟩",
	"raquo": "»",
	"rarrap": "⥵",
	"rarrb": "⇥",
	"rarrbfs": "⤠",
	"rarrc": "⤳",
	"rarr": "→",
	"Rarr": "↠",
	"rArr": "⇒",
	"rarrfs": "⤞",
	"rarrhk": "↪",
	"rarrlp": "↬",
	"rarrpl": "⥅",
	"rarrsim": "⥴",
	"Rarrtl": "⤖",
	"rarrtl": "↣",
	"rarrw": "↝",
	"ratail": "⤚",
	"rAtail": "⤜",
	"ratio": "∶",
	"rationals": "ℚ",
	"rbarr": "⤍",
	"rBarr": "⤏",
	"RBarr": "⤐",
	"rbbrk": "❳",
	"rbrace": "}",
	"rbrack": "]",
	"rbrke": "⦌",
	"rbrksld": "⦎",
	"rbrkslu": "⦐",
	"Rcaron": "Ř",
	"rcaron": "ř",
	"Rcedil": "Ŗ",
	"rcedil": "ŗ",
	"rceil": "⌉",
	"rcub": "}",
	"Rcy": "Р",
	"rcy": "р",
	"rdca": "⤷",
	"rdldhar": "⥩",
	"rdquo": "”",
	"rdquor": "”",
	"rdsh": "↳",
	"real": "ℜ",
	"realine": "ℛ",
	"realpart": "ℜ",
	"reals": "ℝ",
	"Re": "ℜ",
	"rect": "▭",
	"reg": "®",
	"REG": "®",
	"ReverseElement": "∋",
	"ReverseEquilibrium": "⇋",
	"ReverseUpEquilibrium": "⥯",
	"rfisht": "⥽",
	"rfloor": "⌋",
	"rfr": "𝔯",
	"Rfr": "ℜ",
	"rHar": "⥤",
	"rhard": "⇁",
	"rharu": "⇀",
	"rharul": "⥬",
	"Rho": "Ρ",
	"rho": "ρ",
	"rhov": "ϱ",
	"RightAngleBracket": "⟩",
	"RightArrowBar": "⇥",
	"rightarrow": "→",
	"RightArrow": "→",
	"Rightarrow": "⇒",
	"RightArrowLeftArrow": "⇄",
	"rightarrowtail": "↣",
	"RightCeiling": "⌉",
	"RightDoubleBracket": "⟧",
	"RightDownTeeVector": "⥝",
	"RightDownVectorBar": "⥕",
	"RightDownVector": "⇂",
	"RightFloor": "⌋",
	"rightharpoondown": "⇁",
	"rightharpoonup": "⇀",
	"rightleftarrows": "⇄",
	"rightleftharpoons": "⇌",
	"rightrightarrows": "⇉",
	"rightsquigarrow": "↝",
	"RightTeeArrow": "↦",
	"RightTee": "⊢",
	"RightTeeVector": "⥛",
	"rightthreetimes": "⋌",
	"RightTriangleBar": "⧐",
	"RightTriangle": "⊳",
	"RightTriangleEqual": "⊵",
	"RightUpDownVector": "⥏",
	"RightUpTeeVector": "⥜",
	"RightUpVectorBar": "⥔",
	"RightUpVector": "↾",
	"RightVectorBar": "⥓",
	"RightVector": "⇀",
	"ring": "˚",
	"risingdotseq": "≓",
	"rlarr": "⇄",
	"rlhar": "⇌",
	"rlm": "‏",
	"rmoustache": "⎱",
	"rmoust": "⎱",
	"rnmid": "⫮",
	"roang": "⟭",
	"roarr": "⇾",
	"robrk": "⟧",
	"ropar": "⦆",
	"ropf": "𝕣",
	"Ropf": "ℝ",
	"roplus": "⨮",
	"rotimes": "⨵",
	"RoundImplies": "⥰",
	"rpar": ")",
	"rpargt": "⦔",
	"rppolint": "⨒",
	"rrarr": "⇉",
	"Rrightarrow": "⇛",
	"rsaquo": "›",
	"rscr": "𝓇",
	"Rscr": "ℛ",
	"rsh": "↱",
	"Rsh": "↱",
	"rsqb": "]",
	"rsquo": "’",
	"rsquor": "’",
	"rthree": "⋌",
	"rtimes": "⋊",
	"rtri": "▹",
	"rtrie": "⊵",
	"rtrif": "▸",
	"rtriltri": "⧎",
	"RuleDelayed": "⧴",
	"ruluhar": "⥨",
	"rx": "℞",
	"Sacute": "Ś",
	"sacute": "ś",
	"sbquo": "‚",
	"scap": "⪸",
	"Scaron": "Š",
	"scaron": "š",
	"Sc": "⪼",
	"sc": "≻",
	"sccue": "≽",
	"sce": "⪰",
	"scE": "⪴",
	"Scedil": "Ş",
	"scedil": "ş",
	"Scirc": "Ŝ",
	"scirc": "ŝ",
	"scnap": "⪺",
	"scnE": "⪶",
	"scnsim": "⋩",
	"scpolint": "⨓",
	"scsim": "≿",
	"Scy": "С",
	"scy": "с",
	"sdotb": "⊡",
	"sdot": "⋅",
	"sdote": "⩦",
	"searhk": "⤥",
	"searr": "↘",
	"seArr": "⇘",
	"searrow": "↘",
	"sect": "§",
	"semi": ";",
	"seswar": "⤩",
	"setminus": "∖",
	"setmn": "∖",
	"sext": "✶",
	"Sfr": "𝔖",
	"sfr": "𝔰",
	"sfrown": "⌢",
	"sharp": "♯",
	"SHCHcy": "Щ",
	"shchcy": "щ",
	"SHcy": "Ш",
	"shcy": "ш",
	"ShortDownArrow": "↓",
	"ShortLeftArrow": "←",
	"shortmid": "∣",
	"shortparallel": "∥",
	"ShortRightArrow": "→",
	"ShortUpArrow": "↑",
	"shy": "­",
	"Sigma": "Σ",
	"sigma": "σ",
	"sigmaf": "ς",
	"sigmav": "ς",
	"sim": "∼",
	"simdot": "⩪",
	"sime": "≃",
	"simeq": "≃",
	"simg": "⪞",
	"simgE": "⪠",
	"siml": "⪝",
	"simlE": "⪟",
	"simne": "≆",
	"simplus": "⨤",
	"simrarr": "⥲",
	"slarr": "←",
	"SmallCircle": "∘",
	"smallsetminus": "∖",
	"smashp": "⨳",
	"smeparsl": "⧤",
	"smid": "∣",
	"smile": "⌣",
	"smt": "⪪",
	"smte": "⪬",
	"smtes": "⪬︀",
	"SOFTcy": "Ь",
	"softcy": "ь",
	"solbar": "⌿",
	"solb": "⧄",
	"sol": "/",
	"Sopf": "𝕊",
	"sopf": "𝕤",
	"spades": "♠",
	"spadesuit": "♠",
	"spar": "∥",
	"sqcap": "⊓",
	"sqcaps": "⊓︀",
	"sqcup": "⊔",
	"sqcups": "⊔︀",
	"Sqrt": "√",
	"sqsub": "⊏",
	"sqsube": "⊑",
	"sqsubset": "⊏",
	"sqsubseteq": "⊑",
	"sqsup": "⊐",
	"sqsupe": "⊒",
	"sqsupset": "⊐",
	"sqsupseteq": "⊒",
	"square": "□",
	"Square": "□",
	"SquareIntersection": "⊓",
	"SquareSubset": "⊏",
	"SquareSubsetEqual": "⊑",
	"SquareSuperset": "⊐",
	"SquareSupersetEqual": "⊒",
	"SquareUnion": "⊔",
	"squarf": "▪",
	"squ": "□",
	"squf": "▪",
	"srarr": "→",
	"Sscr": "𝒮",
	"sscr": "𝓈",
	"ssetmn": "∖",
	"ssmile": "⌣",
	"sstarf": "⋆",
	"Star": "⋆",
	"star": "☆",
	"starf": "★",
	"straightepsilon": "ϵ",
	"straightphi": "ϕ",
	"strns": "¯",
	"sub": "⊂",
	"Sub": "⋐",
	"subdot": "⪽",
	"subE": "⫅",
	"sube": "⊆",
	"subedot": "⫃",
	"submult": "⫁",
	"subnE": "⫋",
	"subne": "⊊",
	"subplus": "⪿",
	"subrarr": "⥹",
	"subset": "⊂",
	"Subset": "⋐",
	"subseteq": "⊆",
	"subseteqq": "⫅",
	"SubsetEqual": "⊆",
	"subsetneq": "⊊",
	"subsetneqq": "⫋",
	"subsim": "⫇",
	"subsub": "⫕",
	"subsup": "⫓",
	"succapprox": "⪸",
	"succ": "≻",
	"succcurlyeq": "≽",
	"Succeeds": "≻",
	"SucceedsEqual": "⪰",
	"SucceedsSlantEqual": "≽",
	"SucceedsTilde": "≿",
	"succeq": "⪰",
	"succnapprox": "⪺",
	"succneqq": "⪶",
	"succnsim": "⋩",
	"succsim": "≿",
	"SuchThat": "∋",
	"sum": "∑",
	"Sum": "∑",
	"sung": "♪",
	"sup1": "¹",
	"sup2": "²",
	"sup3": "³",
	"sup": "⊃",
	"Sup": "⋑",
	"supdot": "⪾",
	"supdsub": "⫘",
	"supE": "⫆",
	"supe": "⊇",
	"supedot": "⫄",
	"Superset": "⊃",
	"SupersetEqual": "⊇",
	"suphsol": "⟉",
	"suphsub": "⫗",
	"suplarr": "⥻",
	"supmult": "⫂",
	"supnE": "⫌",
	"supne": "⊋",
	"supplus": "⫀",
	"supset": "⊃",
	"Supset": "⋑",
	"supseteq": "⊇",
	"supseteqq": "⫆",
	"supsetneq": "⊋",
	"supsetneqq": "⫌",
	"supsim": "⫈",
	"supsub": "⫔",
	"supsup": "⫖",
	"swarhk": "⤦",
	"swarr": "↙",
	"swArr": "⇙",
	"swarrow": "↙",
	"swnwar": "⤪",
	"szlig": "ß",
	"Tab": "\t",
	"target": "⌖",
	"Tau": "Τ",
	"tau": "τ",
	"tbrk": "⎴",
	"Tcaron": "Ť",
	"tcaron": "ť",
	"Tcedil": "Ţ",
	"tcedil": "ţ",
	"Tcy": "Т",
	"tcy": "т",
	"tdot": "⃛",
	"telrec": "⌕",
	"Tfr": "𝔗",
	"tfr": "𝔱",
	"there4": "∴",
	"therefore": "∴",
	"Therefore": "∴",
	"Theta": "Θ",
	"theta": "θ",
	"thetasym": "ϑ",
	"thetav": "ϑ",
	"thickapprox": "≈",
	"thicksim": "∼",
	"ThickSpace": "  ",
	"ThinSpace": " ",
	"thinsp": " ",
	"thkap": "≈",
	"thksim": "∼",
	"THORN": "Þ",
	"thorn": "þ",
	"tilde": "˜",
	"Tilde": "∼",
	"TildeEqual": "≃",
	"TildeFullEqual": "≅",
	"TildeTilde": "≈",
	"timesbar": "⨱",
	"timesb": "⊠",
	"times": "×",
	"timesd": "⨰",
	"tint": "∭",
	"toea": "⤨",
	"topbot": "⌶",
	"topcir": "⫱",
	"top": "⊤",
	"Topf": "𝕋",
	"topf": "𝕥",
	"topfork": "⫚",
	"tosa": "⤩",
	"tprime": "‴",
	"trade": "™",
	"TRADE": "™",
	"triangle": "▵",
	"triangledown": "▿",
	"triangleleft": "◃",
	"trianglelefteq": "⊴",
	"triangleq": "≜",
	"triangleright": "▹",
	"trianglerighteq": "⊵",
	"tridot": "◬",
	"trie": "≜",
	"triminus": "⨺",
	"TripleDot": "⃛",
	"triplus": "⨹",
	"trisb": "⧍",
	"tritime": "⨻",
	"trpezium": "⏢",
	"Tscr": "𝒯",
	"tscr": "𝓉",
	"TScy": "Ц",
	"tscy": "ц",
	"TSHcy": "Ћ",
	"tshcy": "ћ",
	"Tstrok": "Ŧ",
	"tstrok": "ŧ",
	"twixt": "≬",
	"twoheadleftarrow": "↞",
	"twoheadrightarrow": "↠",
	"Uacute": "Ú",
	"uacute": "ú",
	"uarr": "↑",
	"Uarr": "↟",
	"uArr": "⇑",
	"Uarrocir": "⥉",
	"Ubrcy": "Ў",
	"ubrcy": "ў",
	"Ubreve": "Ŭ",
	"ubreve": "ŭ",
	"Ucirc": "Û",
	"ucirc": "û",
	"Ucy": "У",
	"ucy": "у",
	"udarr": "⇅",
	"Udblac": "Ű",
	"udblac": "ű",
	"udhar": "⥮",
	"ufisht": "⥾",
	"Ufr": "𝔘",
	"ufr": "𝔲",
	"Ugrave": "Ù",
	"ugrave": "ù",
	"uHar": "⥣",
	"uharl": "↿",
	"uharr": "↾",
	"uhblk": "▀",
	"ulcorn": "⌜",
	"ulcorner": "⌜",
	"ulcrop": "⌏",
	"ultri": "◸",
	"Umacr": "Ū",
	"umacr": "ū",
	"uml": "¨",
	"UnderBar": "_",
	"UnderBrace": "⏟",
	"UnderBracket": "⎵",
	"UnderParenthesis": "⏝",
	"Union": "⋃",
	"UnionPlus": "⊎",
	"Uogon": "Ų",
	"uogon": "ų",
	"Uopf": "𝕌",
	"uopf": "𝕦",
	"UpArrowBar": "⤒",
	"uparrow": "↑",
	"UpArrow": "↑",
	"Uparrow": "⇑",
	"UpArrowDownArrow": "⇅",
	"updownarrow": "↕",
	"UpDownArrow": "↕",
	"Updownarrow": "⇕",
	"UpEquilibrium": "⥮",
	"upharpoonleft": "↿",
	"upharpoonright": "↾",
	"uplus": "⊎",
	"UpperLeftArrow": "↖",
	"UpperRightArrow": "↗",
	"upsi": "υ",
	"Upsi": "ϒ",
	"upsih": "ϒ",
	"Upsilon": "Υ",
	"upsilon": "υ",
	"UpTeeArrow": "↥",
	"UpTee": "⊥",
	"upuparrows": "⇈",
	"urcorn": "⌝",
	"urcorner": "⌝",
	"urcrop": "⌎",
	"Uring": "Ů",
	"uring": "ů",
	"urtri": "◹",
	"Uscr": "𝒰",
	"uscr": "𝓊",
	"utdot": "⋰",
	"Utilde": "Ũ",
	"utilde": "ũ",
	"utri": "▵",
	"utrif": "▴",
	"uuarr": "⇈",
	"Uuml": "Ü",
	"uuml": "ü",
	"uwangle": "⦧",
	"vangrt": "⦜",
	"varepsilon": "ϵ",
	"varkappa": "ϰ",
	"varnothing": "∅",
	"varphi": "ϕ",
	"varpi": "ϖ",
	"varpropto": "∝",
	"varr": "↕",
	"vArr": "⇕",
	"varrho": "ϱ",
	"varsigma": "ς",
	"varsubsetneq": "⊊︀",
	"varsubsetneqq": "⫋︀",
	"varsupsetneq": "⊋︀",
	"varsupsetneqq": "⫌︀",
	"vartheta": "ϑ",
	"vartriangleleft": "⊲",
	"vartriangleright": "⊳",
	"vBar": "⫨",
	"Vbar": "⫫",
	"vBarv": "⫩",
	"Vcy": "В",
	"vcy": "в",
	"vdash": "⊢",
	"vDash": "⊨",
	"Vdash": "⊩",
	"VDash": "⊫",
	"Vdashl": "⫦",
	"veebar": "⊻",
	"vee": "∨",
	"Vee": "⋁",
	"veeeq": "≚",
	"vellip": "⋮",
	"verbar": "|",
	"Verbar": "‖",
	"vert": "|",
	"Vert": "‖",
	"VerticalBar": "∣",
	"VerticalLine": "|",
	"VerticalSeparator": "❘",
	"VerticalTilde": "≀",
	"VeryThinSpace": " ",
	"Vfr": "𝔙",
	"vfr": "𝔳",
	"vltri": "⊲",
	"vnsub": "⊂⃒",
	"vnsup": "⊃⃒",
	"Vopf": "𝕍",
	"vopf": "𝕧",
	"vprop": "∝",
	"vrtri": "⊳",
	"Vscr": "𝒱",
	"vscr": "𝓋",
	"vsubnE": "⫋︀",
	"vsubne": "⊊︀",
	"vsupnE": "⫌︀",
	"vsupne": "⊋︀",
	"Vvdash": "⊪",
	"vzigzag": "⦚",
	"Wcirc": "Ŵ",
	"wcirc": "ŵ",
	"wedbar": "⩟",
	"wedge": "∧",
	"Wedge": "⋀",
	"wedgeq": "≙",
	"weierp": "℘",
	"Wfr": "𝔚",
	"wfr": "𝔴",
	"Wopf": "𝕎",
	"wopf": "𝕨",
	"wp": "℘",
	"wr": "≀",
	"wreath": "≀",
	"Wscr": "𝒲",
	"wscr": "𝓌",
	"xcap": "⋂",
	"xcirc": "◯",
	"xcup": "⋃",
	"xdtri": "▽",
	"Xfr": "𝔛",
	"xfr": "𝔵",
	"xharr": "⟷",
	"xhArr": "⟺",
	"Xi": "Ξ",
	"xi": "ξ",
	"xlarr": "⟵",
	"xlArr": "⟸",
	"xmap": "⟼",
	"xnis": "⋻",
	"xodot": "⨀",
	"Xopf": "𝕏",
	"xopf": "𝕩",
	"xoplus": "⨁",
	"xotime": "⨂",
	"xrarr": "⟶",
	"xrArr": "⟹",
	"Xscr": "𝒳",
	"xscr": "𝓍",
	"xsqcup": "⨆",
	"xuplus": "⨄",
	"xutri": "△",
	"xvee": "⋁",
	"xwedge": "⋀",
	"Yacute": "Ý",
	"yacute": "ý",
	"YAcy": "Я",
	"yacy": "я",
	"Ycirc": "Ŷ",
	"ycirc": "ŷ",
	"Ycy": "Ы",
	"ycy": "ы",
	"yen": "¥",
	"Yfr": "𝔜",
	"yfr": "𝔶",
	"YIcy": "Ї",
	"yicy": "ї",
	"Yopf": "𝕐",
	"yopf": "𝕪",
	"Yscr": "𝒴",
	"yscr": "𝓎",
	"YUcy": "Ю",
	"yucy": "ю",
	"yuml": "ÿ",
	"Yuml": "Ÿ",
	"Zacute": "Ź",
	"zacute": "ź",
	"Zcaron": "Ž",
	"zcaron": "ž",
	"Zcy": "З",
	"zcy": "з",
	"Zdot": "Ż",
	"zdot": "ż",
	"zeetrf": "ℨ",
	"ZeroWidthSpace": "​",
	"Zeta": "Ζ",
	"zeta": "ζ",
	"zfr": "𝔷",
	"Zfr": "ℨ",
	"ZHcy": "Ж",
	"zhcy": "ж",
	"zigrarr": "⇝",
	"zopf": "𝕫",
	"Zopf": "ℤ",
	"Zscr": "𝒵",
	"zscr": "𝓏",
	"zwj": "‍",
	"zwnj": "‌"
};

/***/ },
/* 19 */
/***/ function(module, exports) {

module.exports = {
	"amp": "&",
	"apos": "'",
	"gt": ">",
	"lt": "<",
	"quot": "\""
};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = __webpack_require__(2);

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(0);
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er) {
      done(stream, er);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('Not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er) {
  if (er) return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

module.exports = Writable;

/*<replacement>*/
var processNextTick = __webpack_require__(20);
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(0);
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: __webpack_require__(91)
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = __webpack_require__(12);
  } catch (_) {} finally {
    if (!Stream) Stream = __webpack_require__(7).EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = __webpack_require__(1).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(17);
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

var Duplex;
function WritableState(options, stream) {
  Duplex = Duplex || __webpack_require__(2);

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

var Duplex;
function Writable(options) {
  Duplex = Duplex || __webpack_require__(2);

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), __webpack_require__(24).setImmediate))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = __webpack_require__(1).Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(87).nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(24).setImmediate, __webpack_require__(24).clearImmediate))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

var version = __webpack_require__(10)
var isVNode = __webpack_require__(9)
var isWidget = __webpack_require__(3)
var isThunk = __webpack_require__(14)
var isVHook = __webpack_require__(15)

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

var version = __webpack_require__(10)

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"


/***/ },
/* 27 */
/***/ function(module, exports) {

var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}


/***/ },
/* 28 */
/***/ function(module, exports) {

// This object will be used as the prototype for Nodes when creating a
// DOM-Level-1-compliant structure.
var NodePrototype = module.exports = {
	get firstChild() {
		var children = this.children;
		return children && children[0] || null;
	},
	get lastChild() {
		var children = this.children;
		return children && children[children.length - 1] || null;
	},
	get nodeType() {
		return nodeTypes[this.type] || nodeTypes.element;
	}
};

var domLvl1 = {
	tagName: "name",
	childNodes: "children",
	parentNode: "parent",
	previousSibling: "prev",
	nextSibling: "next",
	nodeValue: "data"
};

var nodeTypes = {
	element: 1,
	text: 3,
	cdata: 4,
	comment: 8
};

Object.keys(domLvl1).forEach(function(key) {
	var shorthand = domLvl1[key];
	Object.defineProperty(NodePrototype, key, {
		get: function() {
			return this[shorthand] || null;
		},
		set: function(val) {
			this[shorthand] = val;
			return val;
		}
	});
});


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

exports.encode = __webpack_require__(61);
exports.decode = __webpack_require__(60);


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

var decodeMap = __webpack_require__(80);

module.exports = decodeCodePoint;

// modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
function decodeCodePoint(codePoint){

	if((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF){
		return "\uFFFD";
	}

	if(codePoint in decodeMap){
		codePoint = decodeMap[codePoint];
	}

	var output = "";

	if(codePoint > 0xFFFF){
		codePoint -= 0x10000;
		output += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
		codePoint = 0xDC00 | codePoint & 0x3FF;
	}

	output += String.fromCharCode(codePoint);
	return output;
}


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = __webpack_require__(109);

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

var Tokenizer = __webpack_require__(33);

/*
	Options:

	xmlMode: Disables the special behavior for script/style tags (false by default)
	lowerCaseAttributeNames: call .toLowerCase for each attribute name (true if xmlMode is `false`)
	lowerCaseTags: call .toLowerCase for each tag name (true if xmlMode is `false`)
*/

/*
	Callbacks:

	oncdataend,
	oncdatastart,
	onclosetag,
	oncomment,
	oncommentend,
	onerror,
	onopentag,
	onprocessinginstruction,
	onreset,
	ontext
*/

var formTags = {
	input: true,
	option: true,
	optgroup: true,
	select: true,
	button: true,
	datalist: true,
	textarea: true
};

var openImpliesClose = {
	tr      : { tr:true, th:true, td:true },
	th      : { th:true },
	td      : { thead:true, th:true, td:true },
	body    : { head:true, link:true, script:true },
	li      : { li:true },
	p       : { p:true },
	h1      : { p:true },
	h2      : { p:true },
	h3      : { p:true },
	h4      : { p:true },
	h5      : { p:true },
	h6      : { p:true },
	select  : formTags,
	input   : formTags,
	output  : formTags,
	button  : formTags,
	datalist: formTags,
	textarea: formTags,
	option  : { option:true },
	optgroup: { optgroup:true }
};

var voidElements = {
	__proto__: null,
	area: true,
	base: true,
	basefont: true,
	br: true,
	col: true,
	command: true,
	embed: true,
	frame: true,
	hr: true,
	img: true,
	input: true,
	isindex: true,
	keygen: true,
	link: true,
	meta: true,
	param: true,
	source: true,
	track: true,
	wbr: true,

	//common self closing svg elements
	path: true,
	circle: true,
	ellipse: true,
	line: true,
	rect: true,
	use: true,
	stop: true,
	polyline: true,
	polygon: true
};

var re_nameEnd = /\s|\//;

function Parser(cbs, options){
	this._options = options || {};
	this._cbs = cbs || {};

	this._tagname = "";
	this._attribname = "";
	this._attribvalue = "";
	this._attribs = null;
	this._stack = [];

	this.startIndex = 0;
	this.endIndex = null;

	this._lowerCaseTagNames = "lowerCaseTags" in this._options ?
									!!this._options.lowerCaseTags :
									!this._options.xmlMode;
	this._lowerCaseAttributeNames = "lowerCaseAttributeNames" in this._options ?
									!!this._options.lowerCaseAttributeNames :
									!this._options.xmlMode;

	if(this._options.Tokenizer) {
		Tokenizer = this._options.Tokenizer;
	}
	this._tokenizer = new Tokenizer(this._options, this);

	if(this._cbs.onparserinit) this._cbs.onparserinit(this);
}

__webpack_require__(0)(Parser, __webpack_require__(7).EventEmitter);

Parser.prototype._updatePosition = function(initialOffset){
	if(this.endIndex === null){
		if(this._tokenizer._sectionStart <= initialOffset){
			this.startIndex = 0;
		} else {
			this.startIndex = this._tokenizer._sectionStart - initialOffset;
		}
	}
	else this.startIndex = this.endIndex + 1;
	this.endIndex = this._tokenizer.getAbsoluteIndex();
};

//Tokenizer event handlers
Parser.prototype.ontext = function(data){
	this._updatePosition(1);
	this.endIndex--;

	if(this._cbs.ontext) this._cbs.ontext(data);
};

Parser.prototype.onopentagname = function(name){
	if(this._lowerCaseTagNames){
		name = name.toLowerCase();
	}

	this._tagname = name;

	if(!this._options.xmlMode && name in openImpliesClose) {
		for(
			var el;
			(el = this._stack[this._stack.length - 1]) in openImpliesClose[name];
			this.onclosetag(el)
		);
	}

	if(this._options.xmlMode || !(name in voidElements)){
		this._stack.push(name);
	}

	if(this._cbs.onopentagname) this._cbs.onopentagname(name);
	if(this._cbs.onopentag) this._attribs = {};
};

Parser.prototype.onopentagend = function(){
	this._updatePosition(1);

	if(this._attribs){
		if(this._cbs.onopentag) this._cbs.onopentag(this._tagname, this._attribs);
		this._attribs = null;
	}

	if(!this._options.xmlMode && this._cbs.onclosetag && this._tagname in voidElements){
		this._cbs.onclosetag(this._tagname);
	}

	this._tagname = "";
};

Parser.prototype.onclosetag = function(name){
	this._updatePosition(1);

	if(this._lowerCaseTagNames){
		name = name.toLowerCase();
	}

	if(this._stack.length && (!(name in voidElements) || this._options.xmlMode)){
		var pos = this._stack.lastIndexOf(name);
		if(pos !== -1){
			if(this._cbs.onclosetag){
				pos = this._stack.length - pos;
				while(pos--) this._cbs.onclosetag(this._stack.pop());
			}
			else this._stack.length = pos;
		} else if(name === "p" && !this._options.xmlMode){
			this.onopentagname(name);
			this._closeCurrentTag();
		}
	} else if(!this._options.xmlMode && (name === "br" || name === "p")){
		this.onopentagname(name);
		this._closeCurrentTag();
	}
};

Parser.prototype.onselfclosingtag = function(){
	if(this._options.xmlMode || this._options.recognizeSelfClosing){
		this._closeCurrentTag();
	} else {
		this.onopentagend();
	}
};

Parser.prototype._closeCurrentTag = function(){
	var name = this._tagname;

	this.onopentagend();

	//self-closing tags will be on the top of the stack
	//(cheaper check than in onclosetag)
	if(this._stack[this._stack.length - 1] === name){
		if(this._cbs.onclosetag){
			this._cbs.onclosetag(name);
		}
		this._stack.pop();
	}
};

Parser.prototype.onattribname = function(name){
	if(this._lowerCaseAttributeNames){
		name = name.toLowerCase();
	}
	this._attribname = name;
};

Parser.prototype.onattribdata = function(value){
	this._attribvalue += value;
};

Parser.prototype.onattribend = function(){
	if(this._cbs.onattribute) this._cbs.onattribute(this._attribname, this._attribvalue);
	if(
		this._attribs &&
		!Object.prototype.hasOwnProperty.call(this._attribs, this._attribname)
	){
		this._attribs[this._attribname] = this._attribvalue;
	}
	this._attribname = "";
	this._attribvalue = "";
};

Parser.prototype._getInstructionName = function(value){
	var idx = value.search(re_nameEnd),
	    name = idx < 0 ? value : value.substr(0, idx);

	if(this._lowerCaseTagNames){
		name = name.toLowerCase();
	}

	return name;
};

Parser.prototype.ondeclaration = function(value){
	if(this._cbs.onprocessinginstruction){
		var name = this._getInstructionName(value);
		this._cbs.onprocessinginstruction("!" + name, "!" + value);
	}
};

Parser.prototype.onprocessinginstruction = function(value){
	if(this._cbs.onprocessinginstruction){
		var name = this._getInstructionName(value);
		this._cbs.onprocessinginstruction("?" + name, "?" + value);
	}
};

Parser.prototype.oncomment = function(value){
	this._updatePosition(4);

	if(this._cbs.oncomment) this._cbs.oncomment(value);
	if(this._cbs.oncommentend) this._cbs.oncommentend();
};

Parser.prototype.oncdata = function(value){
	this._updatePosition(1);

	if(this._options.xmlMode || this._options.recognizeCDATA){
		if(this._cbs.oncdatastart) this._cbs.oncdatastart();
		if(this._cbs.ontext) this._cbs.ontext(value);
		if(this._cbs.oncdataend) this._cbs.oncdataend();
	} else {
		this.oncomment("[CDATA[" + value + "]]");
	}
};

Parser.prototype.onerror = function(err){
	if(this._cbs.onerror) this._cbs.onerror(err);
};

Parser.prototype.onend = function(){
	if(this._cbs.onclosetag){
		for(
			var i = this._stack.length;
			i > 0;
			this._cbs.onclosetag(this._stack[--i])
		);
	}
	if(this._cbs.onend) this._cbs.onend();
};


//Resets the parser to a blank state, ready to parse a new HTML document
Parser.prototype.reset = function(){
	if(this._cbs.onreset) this._cbs.onreset();
	this._tokenizer.reset();

	this._tagname = "";
	this._attribname = "";
	this._attribs = null;
	this._stack = [];

	if(this._cbs.onparserinit) this._cbs.onparserinit(this);
};

//Parses a complete HTML document and pushes it to the handler
Parser.prototype.parseComplete = function(data){
	this.reset();
	this.end(data);
};

Parser.prototype.write = function(chunk){
	this._tokenizer.write(chunk);
};

Parser.prototype.end = function(chunk){
	this._tokenizer.end(chunk);
};

Parser.prototype.pause = function(){
	this._tokenizer.pause();
};

Parser.prototype.resume = function(){
	this._tokenizer.resume();
};

//alias for backwards compat
Parser.prototype.parseChunk = Parser.prototype.write;
Parser.prototype.done = Parser.prototype.end;

module.exports = Parser;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

module.exports = Tokenizer;

var decodeCodePoint = __webpack_require__(30),
    entityMap = __webpack_require__(18),
    legacyMap = __webpack_require__(37),
    xmlMap    = __webpack_require__(19),

    i = 0,

    TEXT                      = i++,
    BEFORE_TAG_NAME           = i++, //after <
    IN_TAG_NAME               = i++,
    IN_SELF_CLOSING_TAG       = i++,
    BEFORE_CLOSING_TAG_NAME   = i++,
    IN_CLOSING_TAG_NAME       = i++,
    AFTER_CLOSING_TAG_NAME    = i++,

    //attributes
    BEFORE_ATTRIBUTE_NAME     = i++,
    IN_ATTRIBUTE_NAME         = i++,
    AFTER_ATTRIBUTE_NAME      = i++,
    BEFORE_ATTRIBUTE_VALUE    = i++,
    IN_ATTRIBUTE_VALUE_DQ     = i++, // "
    IN_ATTRIBUTE_VALUE_SQ     = i++, // '
    IN_ATTRIBUTE_VALUE_NQ     = i++,

    //declarations
    BEFORE_DECLARATION        = i++, // !
    IN_DECLARATION            = i++,

    //processing instructions
    IN_PROCESSING_INSTRUCTION = i++, // ?

    //comments
    BEFORE_COMMENT            = i++,
    IN_COMMENT                = i++,
    AFTER_COMMENT_1           = i++,
    AFTER_COMMENT_2           = i++,

    //cdata
    BEFORE_CDATA_1            = i++, // [
    BEFORE_CDATA_2            = i++, // C
    BEFORE_CDATA_3            = i++, // D
    BEFORE_CDATA_4            = i++, // A
    BEFORE_CDATA_5            = i++, // T
    BEFORE_CDATA_6            = i++, // A
    IN_CDATA                  = i++, // [
    AFTER_CDATA_1             = i++, // ]
    AFTER_CDATA_2             = i++, // ]

    //special tags
    BEFORE_SPECIAL            = i++, //S
    BEFORE_SPECIAL_END        = i++,   //S

    BEFORE_SCRIPT_1           = i++, //C
    BEFORE_SCRIPT_2           = i++, //R
    BEFORE_SCRIPT_3           = i++, //I
    BEFORE_SCRIPT_4           = i++, //P
    BEFORE_SCRIPT_5           = i++, //T
    AFTER_SCRIPT_1            = i++, //C
    AFTER_SCRIPT_2            = i++, //R
    AFTER_SCRIPT_3            = i++, //I
    AFTER_SCRIPT_4            = i++, //P
    AFTER_SCRIPT_5            = i++, //T

    BEFORE_STYLE_1            = i++, //T
    BEFORE_STYLE_2            = i++, //Y
    BEFORE_STYLE_3            = i++, //L
    BEFORE_STYLE_4            = i++, //E
    AFTER_STYLE_1             = i++, //T
    AFTER_STYLE_2             = i++, //Y
    AFTER_STYLE_3             = i++, //L
    AFTER_STYLE_4             = i++, //E

    BEFORE_ENTITY             = i++, //&
    BEFORE_NUMERIC_ENTITY     = i++, //#
    IN_NAMED_ENTITY           = i++,
    IN_NUMERIC_ENTITY         = i++,
    IN_HEX_ENTITY             = i++, //X

    j = 0,

    SPECIAL_NONE              = j++,
    SPECIAL_SCRIPT            = j++,
    SPECIAL_STYLE             = j++;

function whitespace(c){
	return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
}

function characterState(char, SUCCESS){
	return function(c){
		if(c === char) this._state = SUCCESS;
	};
}

function ifElseState(upper, SUCCESS, FAILURE){
	var lower = upper.toLowerCase();

	if(upper === lower){
		return function(c){
			if(c === lower){
				this._state = SUCCESS;
			} else {
				this._state = FAILURE;
				this._index--;
			}
		};
	} else {
		return function(c){
			if(c === lower || c === upper){
				this._state = SUCCESS;
			} else {
				this._state = FAILURE;
				this._index--;
			}
		};
	}
}

function consumeSpecialNameChar(upper, NEXT_STATE){
	var lower = upper.toLowerCase();

	return function(c){
		if(c === lower || c === upper){
			this._state = NEXT_STATE;
		} else {
			this._state = IN_TAG_NAME;
			this._index--; //consume the token again
		}
	};
}

function Tokenizer(options, cbs){
	this._state = TEXT;
	this._buffer = "";
	this._sectionStart = 0;
	this._index = 0;
	this._bufferOffset = 0; //chars removed from _buffer
	this._baseState = TEXT;
	this._special = SPECIAL_NONE;
	this._cbs = cbs;
	this._running = true;
	this._ended = false;
	this._xmlMode = !!(options && options.xmlMode);
	this._decodeEntities = !!(options && options.decodeEntities);
}

Tokenizer.prototype._stateText = function(c){
	if(c === "<"){
		if(this._index > this._sectionStart){
			this._cbs.ontext(this._getSection());
		}
		this._state = BEFORE_TAG_NAME;
		this._sectionStart = this._index;
	} else if(this._decodeEntities && this._special === SPECIAL_NONE && c === "&"){
		if(this._index > this._sectionStart){
			this._cbs.ontext(this._getSection());
		}
		this._baseState = TEXT;
		this._state = BEFORE_ENTITY;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateBeforeTagName = function(c){
	if(c === "/"){
		this._state = BEFORE_CLOSING_TAG_NAME;
	} else if(c === "<"){
		this._cbs.ontext(this._getSection());
		this._sectionStart = this._index;
	} else if(c === ">" || this._special !== SPECIAL_NONE || whitespace(c)) {
		this._state = TEXT;
	} else if(c === "!"){
		this._state = BEFORE_DECLARATION;
		this._sectionStart = this._index + 1;
	} else if(c === "?"){
		this._state = IN_PROCESSING_INSTRUCTION;
		this._sectionStart = this._index + 1;
	} else {
		this._state = (!this._xmlMode && (c === "s" || c === "S")) ?
						BEFORE_SPECIAL : IN_TAG_NAME;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInTagName = function(c){
	if(c === "/" || c === ">" || whitespace(c)){
		this._emitToken("onopentagname");
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	}
};

Tokenizer.prototype._stateBeforeCloseingTagName = function(c){
	if(whitespace(c));
	else if(c === ">"){
		this._state = TEXT;
	} else if(this._special !== SPECIAL_NONE){
		if(c === "s" || c === "S"){
			this._state = BEFORE_SPECIAL_END;
		} else {
			this._state = TEXT;
			this._index--;
		}
	} else {
		this._state = IN_CLOSING_TAG_NAME;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInCloseingTagName = function(c){
	if(c === ">" || whitespace(c)){
		this._emitToken("onclosetag");
		this._state = AFTER_CLOSING_TAG_NAME;
		this._index--;
	}
};

Tokenizer.prototype._stateAfterCloseingTagName = function(c){
	//skip everything until ">"
	if(c === ">"){
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	}
};

Tokenizer.prototype._stateBeforeAttributeName = function(c){
	if(c === ">"){
		this._cbs.onopentagend();
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	} else if(c === "/"){
		this._state = IN_SELF_CLOSING_TAG;
	} else if(!whitespace(c)){
		this._state = IN_ATTRIBUTE_NAME;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInSelfClosingTag = function(c){
	if(c === ">"){
		this._cbs.onselfclosingtag();
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	} else if(!whitespace(c)){
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	}
};

Tokenizer.prototype._stateInAttributeName = function(c){
	if(c === "=" || c === "/" || c === ">" || whitespace(c)){
		this._cbs.onattribname(this._getSection());
		this._sectionStart = -1;
		this._state = AFTER_ATTRIBUTE_NAME;
		this._index--;
	}
};

Tokenizer.prototype._stateAfterAttributeName = function(c){
	if(c === "="){
		this._state = BEFORE_ATTRIBUTE_VALUE;
	} else if(c === "/" || c === ">"){
		this._cbs.onattribend();
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	} else if(!whitespace(c)){
		this._cbs.onattribend();
		this._state = IN_ATTRIBUTE_NAME;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateBeforeAttributeValue = function(c){
	if(c === "\""){
		this._state = IN_ATTRIBUTE_VALUE_DQ;
		this._sectionStart = this._index + 1;
	} else if(c === "'"){
		this._state = IN_ATTRIBUTE_VALUE_SQ;
		this._sectionStart = this._index + 1;
	} else if(!whitespace(c)){
		this._state = IN_ATTRIBUTE_VALUE_NQ;
		this._sectionStart = this._index;
		this._index--; //reconsume token
	}
};

Tokenizer.prototype._stateInAttributeValueDoubleQuotes = function(c){
	if(c === "\""){
		this._emitToken("onattribdata");
		this._cbs.onattribend();
		this._state = BEFORE_ATTRIBUTE_NAME;
	} else if(this._decodeEntities && c === "&"){
		this._emitToken("onattribdata");
		this._baseState = this._state;
		this._state = BEFORE_ENTITY;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInAttributeValueSingleQuotes = function(c){
	if(c === "'"){
		this._emitToken("onattribdata");
		this._cbs.onattribend();
		this._state = BEFORE_ATTRIBUTE_NAME;
	} else if(this._decodeEntities && c === "&"){
		this._emitToken("onattribdata");
		this._baseState = this._state;
		this._state = BEFORE_ENTITY;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateInAttributeValueNoQuotes = function(c){
	if(whitespace(c) || c === ">"){
		this._emitToken("onattribdata");
		this._cbs.onattribend();
		this._state = BEFORE_ATTRIBUTE_NAME;
		this._index--;
	} else if(this._decodeEntities && c === "&"){
		this._emitToken("onattribdata");
		this._baseState = this._state;
		this._state = BEFORE_ENTITY;
		this._sectionStart = this._index;
	}
};

Tokenizer.prototype._stateBeforeDeclaration = function(c){
	this._state = c === "[" ? BEFORE_CDATA_1 :
					c === "-" ? BEFORE_COMMENT :
						IN_DECLARATION;
};

Tokenizer.prototype._stateInDeclaration = function(c){
	if(c === ">"){
		this._cbs.ondeclaration(this._getSection());
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	}
};

Tokenizer.prototype._stateInProcessingInstruction = function(c){
	if(c === ">"){
		this._cbs.onprocessinginstruction(this._getSection());
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	}
};

Tokenizer.prototype._stateBeforeComment = function(c){
	if(c === "-"){
		this._state = IN_COMMENT;
		this._sectionStart = this._index + 1;
	} else {
		this._state = IN_DECLARATION;
	}
};

Tokenizer.prototype._stateInComment = function(c){
	if(c === "-") this._state = AFTER_COMMENT_1;
};

Tokenizer.prototype._stateAfterComment1 = function(c){
	if(c === "-"){
		this._state = AFTER_COMMENT_2;
	} else {
		this._state = IN_COMMENT;
	}
};

Tokenizer.prototype._stateAfterComment2 = function(c){
	if(c === ">"){
		//remove 2 trailing chars
		this._cbs.oncomment(this._buffer.substring(this._sectionStart, this._index - 2));
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	} else if(c !== "-"){
		this._state = IN_COMMENT;
	}
	// else: stay in AFTER_COMMENT_2 (`--->`)
};

Tokenizer.prototype._stateBeforeCdata1 = ifElseState("C", BEFORE_CDATA_2, IN_DECLARATION);
Tokenizer.prototype._stateBeforeCdata2 = ifElseState("D", BEFORE_CDATA_3, IN_DECLARATION);
Tokenizer.prototype._stateBeforeCdata3 = ifElseState("A", BEFORE_CDATA_4, IN_DECLARATION);
Tokenizer.prototype._stateBeforeCdata4 = ifElseState("T", BEFORE_CDATA_5, IN_DECLARATION);
Tokenizer.prototype._stateBeforeCdata5 = ifElseState("A", BEFORE_CDATA_6, IN_DECLARATION);

Tokenizer.prototype._stateBeforeCdata6 = function(c){
	if(c === "["){
		this._state = IN_CDATA;
		this._sectionStart = this._index + 1;
	} else {
		this._state = IN_DECLARATION;
		this._index--;
	}
};

Tokenizer.prototype._stateInCdata = function(c){
	if(c === "]") this._state = AFTER_CDATA_1;
};

Tokenizer.prototype._stateAfterCdata1 = characterState("]", AFTER_CDATA_2);

Tokenizer.prototype._stateAfterCdata2 = function(c){
	if(c === ">"){
		//remove 2 trailing chars
		this._cbs.oncdata(this._buffer.substring(this._sectionStart, this._index - 2));
		this._state = TEXT;
		this._sectionStart = this._index + 1;
	} else if(c !== "]") {
		this._state = IN_CDATA;
	}
	//else: stay in AFTER_CDATA_2 (`]]]>`)
};

Tokenizer.prototype._stateBeforeSpecial = function(c){
	if(c === "c" || c === "C"){
		this._state = BEFORE_SCRIPT_1;
	} else if(c === "t" || c === "T"){
		this._state = BEFORE_STYLE_1;
	} else {
		this._state = IN_TAG_NAME;
		this._index--; //consume the token again
	}
};

Tokenizer.prototype._stateBeforeSpecialEnd = function(c){
	if(this._special === SPECIAL_SCRIPT && (c === "c" || c === "C")){
		this._state = AFTER_SCRIPT_1;
	} else if(this._special === SPECIAL_STYLE && (c === "t" || c === "T")){
		this._state = AFTER_STYLE_1;
	}
	else this._state = TEXT;
};

Tokenizer.prototype._stateBeforeScript1 = consumeSpecialNameChar("R", BEFORE_SCRIPT_2);
Tokenizer.prototype._stateBeforeScript2 = consumeSpecialNameChar("I", BEFORE_SCRIPT_3);
Tokenizer.prototype._stateBeforeScript3 = consumeSpecialNameChar("P", BEFORE_SCRIPT_4);
Tokenizer.prototype._stateBeforeScript4 = consumeSpecialNameChar("T", BEFORE_SCRIPT_5);

Tokenizer.prototype._stateBeforeScript5 = function(c){
	if(c === "/" || c === ">" || whitespace(c)){
		this._special = SPECIAL_SCRIPT;
	}
	this._state = IN_TAG_NAME;
	this._index--; //consume the token again
};

Tokenizer.prototype._stateAfterScript1 = ifElseState("R", AFTER_SCRIPT_2, TEXT);
Tokenizer.prototype._stateAfterScript2 = ifElseState("I", AFTER_SCRIPT_3, TEXT);
Tokenizer.prototype._stateAfterScript3 = ifElseState("P", AFTER_SCRIPT_4, TEXT);
Tokenizer.prototype._stateAfterScript4 = ifElseState("T", AFTER_SCRIPT_5, TEXT);

Tokenizer.prototype._stateAfterScript5 = function(c){
	if(c === ">" || whitespace(c)){
		this._special = SPECIAL_NONE;
		this._state = IN_CLOSING_TAG_NAME;
		this._sectionStart = this._index - 6;
		this._index--; //reconsume the token
	}
	else this._state = TEXT;
};

Tokenizer.prototype._stateBeforeStyle1 = consumeSpecialNameChar("Y", BEFORE_STYLE_2);
Tokenizer.prototype._stateBeforeStyle2 = consumeSpecialNameChar("L", BEFORE_STYLE_3);
Tokenizer.prototype._stateBeforeStyle3 = consumeSpecialNameChar("E", BEFORE_STYLE_4);

Tokenizer.prototype._stateBeforeStyle4 = function(c){
	if(c === "/" || c === ">" || whitespace(c)){
		this._special = SPECIAL_STYLE;
	}
	this._state = IN_TAG_NAME;
	this._index--; //consume the token again
};

Tokenizer.prototype._stateAfterStyle1 = ifElseState("Y", AFTER_STYLE_2, TEXT);
Tokenizer.prototype._stateAfterStyle2 = ifElseState("L", AFTER_STYLE_3, TEXT);
Tokenizer.prototype._stateAfterStyle3 = ifElseState("E", AFTER_STYLE_4, TEXT);

Tokenizer.prototype._stateAfterStyle4 = function(c){
	if(c === ">" || whitespace(c)){
		this._special = SPECIAL_NONE;
		this._state = IN_CLOSING_TAG_NAME;
		this._sectionStart = this._index - 5;
		this._index--; //reconsume the token
	}
	else this._state = TEXT;
};

Tokenizer.prototype._stateBeforeEntity = ifElseState("#", BEFORE_NUMERIC_ENTITY, IN_NAMED_ENTITY);
Tokenizer.prototype._stateBeforeNumericEntity = ifElseState("X", IN_HEX_ENTITY, IN_NUMERIC_ENTITY);

//for entities terminated with a semicolon
Tokenizer.prototype._parseNamedEntityStrict = function(){
	//offset = 1
	if(this._sectionStart + 1 < this._index){
		var entity = this._buffer.substring(this._sectionStart + 1, this._index),
		    map = this._xmlMode ? xmlMap : entityMap;

		if(map.hasOwnProperty(entity)){
			this._emitPartial(map[entity]);
			this._sectionStart = this._index + 1;
		}
	}
};


//parses legacy entities (without trailing semicolon)
Tokenizer.prototype._parseLegacyEntity = function(){
	var start = this._sectionStart + 1,
	    limit = this._index - start;

	if(limit > 6) limit = 6; //the max length of legacy entities is 6

	while(limit >= 2){ //the min length of legacy entities is 2
		var entity = this._buffer.substr(start, limit);

		if(legacyMap.hasOwnProperty(entity)){
			this._emitPartial(legacyMap[entity]);
			this._sectionStart += limit + 1;
			return;
		} else {
			limit--;
		}
	}
};

Tokenizer.prototype._stateInNamedEntity = function(c){
	if(c === ";"){
		this._parseNamedEntityStrict();
		if(this._sectionStart + 1 < this._index && !this._xmlMode){
			this._parseLegacyEntity();
		}
		this._state = this._baseState;
	} else if((c < "a" || c > "z") && (c < "A" || c > "Z") && (c < "0" || c > "9")){
		if(this._xmlMode);
		else if(this._sectionStart + 1 === this._index);
		else if(this._baseState !== TEXT){
			if(c !== "="){
				this._parseNamedEntityStrict();
			}
		} else {
			this._parseLegacyEntity();
		}

		this._state = this._baseState;
		this._index--;
	}
};

Tokenizer.prototype._decodeNumericEntity = function(offset, base){
	var sectionStart = this._sectionStart + offset;

	if(sectionStart !== this._index){
		//parse entity
		var entity = this._buffer.substring(sectionStart, this._index);
		var parsed = parseInt(entity, base);

		this._emitPartial(decodeCodePoint(parsed));
		this._sectionStart = this._index;
	} else {
		this._sectionStart--;
	}

	this._state = this._baseState;
};

Tokenizer.prototype._stateInNumericEntity = function(c){
	if(c === ";"){
		this._decodeNumericEntity(2, 10);
		this._sectionStart++;
	} else if(c < "0" || c > "9"){
		if(!this._xmlMode){
			this._decodeNumericEntity(2, 10);
		} else {
			this._state = this._baseState;
		}
		this._index--;
	}
};

Tokenizer.prototype._stateInHexEntity = function(c){
	if(c === ";"){
		this._decodeNumericEntity(3, 16);
		this._sectionStart++;
	} else if((c < "a" || c > "f") && (c < "A" || c > "F") && (c < "0" || c > "9")){
		if(!this._xmlMode){
			this._decodeNumericEntity(3, 16);
		} else {
			this._state = this._baseState;
		}
		this._index--;
	}
};

Tokenizer.prototype._cleanup = function (){
	if(this._sectionStart < 0){
		this._buffer = "";
		this._index = 0;
		this._bufferOffset += this._index;
	} else if(this._running){
		if(this._state === TEXT){
			if(this._sectionStart !== this._index){
				this._cbs.ontext(this._buffer.substr(this._sectionStart));
			}
			this._buffer = "";
			this._bufferOffset += this._index;
			this._index = 0;
		} else if(this._sectionStart === this._index){
			//the section just started
			this._buffer = "";
			this._bufferOffset += this._index;
			this._index = 0;
		} else {
			//remove everything unnecessary
			this._buffer = this._buffer.substr(this._sectionStart);
			this._index -= this._sectionStart;
			this._bufferOffset += this._sectionStart;
		}

		this._sectionStart = 0;
	}
};

//TODO make events conditional
Tokenizer.prototype.write = function(chunk){
	if(this._ended) this._cbs.onerror(Error(".write() after done!"));

	this._buffer += chunk;
	this._parse();
};

Tokenizer.prototype._parse = function(){
	while(this._index < this._buffer.length && this._running){
		var c = this._buffer.charAt(this._index);
		if(this._state === TEXT) {
			this._stateText(c);
		} else if(this._state === BEFORE_TAG_NAME){
			this._stateBeforeTagName(c);
		} else if(this._state === IN_TAG_NAME) {
			this._stateInTagName(c);
		} else if(this._state === BEFORE_CLOSING_TAG_NAME){
			this._stateBeforeCloseingTagName(c);
		} else if(this._state === IN_CLOSING_TAG_NAME){
			this._stateInCloseingTagName(c);
		} else if(this._state === AFTER_CLOSING_TAG_NAME){
			this._stateAfterCloseingTagName(c);
		} else if(this._state === IN_SELF_CLOSING_TAG){
			this._stateInSelfClosingTag(c);
		}

		/*
		*	attributes
		*/
		else if(this._state === BEFORE_ATTRIBUTE_NAME){
			this._stateBeforeAttributeName(c);
		} else if(this._state === IN_ATTRIBUTE_NAME){
			this._stateInAttributeName(c);
		} else if(this._state === AFTER_ATTRIBUTE_NAME){
			this._stateAfterAttributeName(c);
		} else if(this._state === BEFORE_ATTRIBUTE_VALUE){
			this._stateBeforeAttributeValue(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_DQ){
			this._stateInAttributeValueDoubleQuotes(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_SQ){
			this._stateInAttributeValueSingleQuotes(c);
		} else if(this._state === IN_ATTRIBUTE_VALUE_NQ){
			this._stateInAttributeValueNoQuotes(c);
		}

		/*
		*	declarations
		*/
		else if(this._state === BEFORE_DECLARATION){
			this._stateBeforeDeclaration(c);
		} else if(this._state === IN_DECLARATION){
			this._stateInDeclaration(c);
		}

		/*
		*	processing instructions
		*/
		else if(this._state === IN_PROCESSING_INSTRUCTION){
			this._stateInProcessingInstruction(c);
		}

		/*
		*	comments
		*/
		else if(this._state === BEFORE_COMMENT){
			this._stateBeforeComment(c);
		} else if(this._state === IN_COMMENT){
			this._stateInComment(c);
		} else if(this._state === AFTER_COMMENT_1){
			this._stateAfterComment1(c);
		} else if(this._state === AFTER_COMMENT_2){
			this._stateAfterComment2(c);
		}

		/*
		*	cdata
		*/
		else if(this._state === BEFORE_CDATA_1){
			this._stateBeforeCdata1(c);
		} else if(this._state === BEFORE_CDATA_2){
			this._stateBeforeCdata2(c);
		} else if(this._state === BEFORE_CDATA_3){
			this._stateBeforeCdata3(c);
		} else if(this._state === BEFORE_CDATA_4){
			this._stateBeforeCdata4(c);
		} else if(this._state === BEFORE_CDATA_5){
			this._stateBeforeCdata5(c);
		} else if(this._state === BEFORE_CDATA_6){
			this._stateBeforeCdata6(c);
		} else if(this._state === IN_CDATA){
			this._stateInCdata(c);
		} else if(this._state === AFTER_CDATA_1){
			this._stateAfterCdata1(c);
		} else if(this._state === AFTER_CDATA_2){
			this._stateAfterCdata2(c);
		}

		/*
		* special tags
		*/
		else if(this._state === BEFORE_SPECIAL){
			this._stateBeforeSpecial(c);
		} else if(this._state === BEFORE_SPECIAL_END){
			this._stateBeforeSpecialEnd(c);
		}

		/*
		* script
		*/
		else if(this._state === BEFORE_SCRIPT_1){
			this._stateBeforeScript1(c);
		} else if(this._state === BEFORE_SCRIPT_2){
			this._stateBeforeScript2(c);
		} else if(this._state === BEFORE_SCRIPT_3){
			this._stateBeforeScript3(c);
		} else if(this._state === BEFORE_SCRIPT_4){
			this._stateBeforeScript4(c);
		} else if(this._state === BEFORE_SCRIPT_5){
			this._stateBeforeScript5(c);
		}

		else if(this._state === AFTER_SCRIPT_1){
			this._stateAfterScript1(c);
		} else if(this._state === AFTER_SCRIPT_2){
			this._stateAfterScript2(c);
		} else if(this._state === AFTER_SCRIPT_3){
			this._stateAfterScript3(c);
		} else if(this._state === AFTER_SCRIPT_4){
			this._stateAfterScript4(c);
		} else if(this._state === AFTER_SCRIPT_5){
			this._stateAfterScript5(c);
		}

		/*
		* style
		*/
		else if(this._state === BEFORE_STYLE_1){
			this._stateBeforeStyle1(c);
		} else if(this._state === BEFORE_STYLE_2){
			this._stateBeforeStyle2(c);
		} else if(this._state === BEFORE_STYLE_3){
			this._stateBeforeStyle3(c);
		} else if(this._state === BEFORE_STYLE_4){
			this._stateBeforeStyle4(c);
		}

		else if(this._state === AFTER_STYLE_1){
			this._stateAfterStyle1(c);
		} else if(this._state === AFTER_STYLE_2){
			this._stateAfterStyle2(c);
		} else if(this._state === AFTER_STYLE_3){
			this._stateAfterStyle3(c);
		} else if(this._state === AFTER_STYLE_4){
			this._stateAfterStyle4(c);
		}

		/*
		* entities
		*/
		else if(this._state === BEFORE_ENTITY){
			this._stateBeforeEntity(c);
		} else if(this._state === BEFORE_NUMERIC_ENTITY){
			this._stateBeforeNumericEntity(c);
		} else if(this._state === IN_NAMED_ENTITY){
			this._stateInNamedEntity(c);
		} else if(this._state === IN_NUMERIC_ENTITY){
			this._stateInNumericEntity(c);
		} else if(this._state === IN_HEX_ENTITY){
			this._stateInHexEntity(c);
		}

		else {
			this._cbs.onerror(Error("unknown _state"), this._state);
		}

		this._index++;
	}

	this._cleanup();
};

Tokenizer.prototype.pause = function(){
	this._running = false;
};
Tokenizer.prototype.resume = function(){
	this._running = true;

	if(this._index < this._buffer.length){
		this._parse();
	}
	if(this._ended){
		this._finish();
	}
};

Tokenizer.prototype.end = function(chunk){
	if(this._ended) this._cbs.onerror(Error(".end() after done!"));
	if(chunk) this.write(chunk);

	this._ended = true;

	if(this._running) this._finish();
};

Tokenizer.prototype._finish = function(){
	//if there is remaining data, emit it in a reasonable way
	if(this._sectionStart < this._index){
		this._handleTrailingData();
	}

	this._cbs.onend();
};

Tokenizer.prototype._handleTrailingData = function(){
	var data = this._buffer.substr(this._sectionStart);

	if(this._state === IN_CDATA || this._state === AFTER_CDATA_1 || this._state === AFTER_CDATA_2){
		this._cbs.oncdata(data);
	} else if(this._state === IN_COMMENT || this._state === AFTER_COMMENT_1 || this._state === AFTER_COMMENT_2){
		this._cbs.oncomment(data);
	} else if(this._state === IN_NAMED_ENTITY && !this._xmlMode){
		this._parseLegacyEntity();
		if(this._sectionStart < this._index){
			this._state = this._baseState;
			this._handleTrailingData();
		}
	} else if(this._state === IN_NUMERIC_ENTITY && !this._xmlMode){
		this._decodeNumericEntity(2, 10);
		if(this._sectionStart < this._index){
			this._state = this._baseState;
			this._handleTrailingData();
		}
	} else if(this._state === IN_HEX_ENTITY && !this._xmlMode){
		this._decodeNumericEntity(3, 16);
		if(this._sectionStart < this._index){
			this._state = this._baseState;
			this._handleTrailingData();
		}
	} else if(
		this._state !== IN_TAG_NAME &&
		this._state !== BEFORE_ATTRIBUTE_NAME &&
		this._state !== BEFORE_ATTRIBUTE_VALUE &&
		this._state !== AFTER_ATTRIBUTE_NAME &&
		this._state !== IN_ATTRIBUTE_NAME &&
		this._state !== IN_ATTRIBUTE_VALUE_SQ &&
		this._state !== IN_ATTRIBUTE_VALUE_DQ &&
		this._state !== IN_ATTRIBUTE_VALUE_NQ &&
		this._state !== IN_CLOSING_TAG_NAME
	){
		this._cbs.ontext(data);
	}
	//else, ignore remaining data
	//TODO add a way to remove current tag
};

Tokenizer.prototype.reset = function(){
	Tokenizer.call(this, {xmlMode: this._xmlMode, decodeEntities: this._decodeEntities}, this._cbs);
};

Tokenizer.prototype.getAbsoluteIndex = function(){
	return this._bufferOffset + this._index;
};

Tokenizer.prototype._getSection = function(){
	return this._buffer.substring(this._sectionStart, this._index);
};

Tokenizer.prototype._emitToken = function(name){
	this._cbs[name](this._getSection());
	this._sectionStart = -1;
};

Tokenizer.prototype._emitPartial = function(value){
	if(this._baseState !== TEXT){
		this._cbs.onattribdata(value); //TODO implement the new event
	} else {
		this._cbs.ontext(value);
	}
};


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

module.exports = Stream;

var Parser = __webpack_require__(32),
    WritableStream = __webpack_require__(12).Writable || __webpack_require__(110).Writable,
    StringDecoder = __webpack_require__(23).StringDecoder,
    Buffer = __webpack_require__(1).Buffer;

function Stream(cbs, options){
	var parser = this._parser = new Parser(cbs, options);
	var decoder = this._decoder = new StringDecoder();

	WritableStream.call(this, {decodeStrings: false});

	this.once("finish", function(){
		parser.end(decoder.end());
	});
}

__webpack_require__(0)(Stream, WritableStream);

WritableStream.prototype._write = function(chunk, encoding, cb){
	if(chunk instanceof Buffer) chunk = this._decoder.write(chunk);
	this._parser.write(chunk);
	cb();
};

/***/ },
/* 35 */
/***/ function(module, exports) {

"use strict";
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};


/***/ },
/* 36 */
/***/ function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ },
/* 37 */
/***/ function(module, exports) {

module.exports = {
	"Aacute": "Á",
	"aacute": "á",
	"Acirc": "Â",
	"acirc": "â",
	"acute": "´",
	"AElig": "Æ",
	"aelig": "æ",
	"Agrave": "À",
	"agrave": "à",
	"amp": "&",
	"AMP": "&",
	"Aring": "Å",
	"aring": "å",
	"Atilde": "Ã",
	"atilde": "ã",
	"Auml": "Ä",
	"auml": "ä",
	"brvbar": "¦",
	"Ccedil": "Ç",
	"ccedil": "ç",
	"cedil": "¸",
	"cent": "¢",
	"copy": "©",
	"COPY": "©",
	"curren": "¤",
	"deg": "°",
	"divide": "÷",
	"Eacute": "É",
	"eacute": "é",
	"Ecirc": "Ê",
	"ecirc": "ê",
	"Egrave": "È",
	"egrave": "è",
	"ETH": "Ð",
	"eth": "ð",
	"Euml": "Ë",
	"euml": "ë",
	"frac12": "½",
	"frac14": "¼",
	"frac34": "¾",
	"gt": ">",
	"GT": ">",
	"Iacute": "Í",
	"iacute": "í",
	"Icirc": "Î",
	"icirc": "î",
	"iexcl": "¡",
	"Igrave": "Ì",
	"igrave": "ì",
	"iquest": "¿",
	"Iuml": "Ï",
	"iuml": "ï",
	"laquo": "«",
	"lt": "<",
	"LT": "<",
	"macr": "¯",
	"micro": "µ",
	"middot": "·",
	"nbsp": " ",
	"not": "¬",
	"Ntilde": "Ñ",
	"ntilde": "ñ",
	"Oacute": "Ó",
	"oacute": "ó",
	"Ocirc": "Ô",
	"ocirc": "ô",
	"Ograve": "Ò",
	"ograve": "ò",
	"ordf": "ª",
	"ordm": "º",
	"Oslash": "Ø",
	"oslash": "ø",
	"Otilde": "Õ",
	"otilde": "õ",
	"Ouml": "Ö",
	"ouml": "ö",
	"para": "¶",
	"plusmn": "±",
	"pound": "£",
	"quot": "\"",
	"QUOT": "\"",
	"raquo": "»",
	"reg": "®",
	"REG": "®",
	"sect": "§",
	"shy": "­",
	"sup1": "¹",
	"sup2": "²",
	"sup3": "³",
	"szlig": "ß",
	"THORN": "Þ",
	"thorn": "þ",
	"times": "×",
	"Uacute": "Ú",
	"uacute": "ú",
	"Ucirc": "Û",
	"ucirc": "û",
	"Ugrave": "Ù",
	"ugrave": "ù",
	"uml": "¨",
	"Uuml": "Ü",
	"uuml": "ü",
	"Yacute": "Ý",
	"yacute": "ý",
	"yen": "¥",
	"yuml": "ÿ"
};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return punycode;
		}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(108)(module), __webpack_require__(4)))

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = __webpack_require__(21);

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(0);
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {'use strict';

module.exports = Readable;

/*<replacement>*/
var processNextTick = __webpack_require__(20);
/*</replacement>*/

/*<replacement>*/
var isArray = __webpack_require__(36);
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = __webpack_require__(7).EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream;
(function () {
  try {
    Stream = __webpack_require__(12);
  } catch (_) {} finally {
    if (!Stream) Stream = __webpack_require__(7).EventEmitter;
  }
})();
/*</replacement>*/

var Buffer = __webpack_require__(1).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(17);
/*</replacement>*/

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(0);
/*</replacement>*/

/*<replacement>*/
var debugUtil = __webpack_require__(111);
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = __webpack_require__(82);
var StringDecoder;

util.inherits(Readable, Stream);

function prependListener(emitter, event, fn) {
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

var Duplex;
function ReadableState(options, stream) {
  Duplex = Duplex || __webpack_require__(2);

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = __webpack_require__(23).StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

var Duplex;
function Readable(options) {
  Duplex = Duplex || __webpack_require__(2);

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = __webpack_require__(23).StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var _i = 0; _i < len; _i++) {
      dests[_i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1) return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = bufferShim.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var app_1 = __webpack_require__(13);
var ComponentBase = (function () {
    function ComponentBase(element, state, view, update, options) {
        if (update === void 0) { update = {}; }
        var _this = this;
        this.element = element;
        this.state = state;
        this.view = view;
        this._history = [];
        this._history_idx = -1;
        this.initVdom();
        console.assert(!!element);
        options = options || {};
        this.enable_history = !!options.history;
        if (this.enable_history) {
            app_1.default.on(options.history.prev || 'history-prev', function () {
                _this._history_idx--;
                if (_this._history_idx >= 0) {
                    _this.set_state(_this._history[_this._history_idx]);
                }
                else {
                    _this._history_idx = 0;
                }
            });
            app_1.default.on(options.history.next || 'history-next', function () {
                _this._history_idx++;
                if (_this._history_idx < _this._history.length) {
                    _this.set_state(_this._history[_this._history_idx]);
                }
                else {
                    _this._history_idx = _this._history.length - 1;
                }
            });
        }
        this.state_changed = options.event && (options.event.name || 'state_changed');
        this.view = view;
        this.add_actions(update);
        this.push_state(state);
    }
    ComponentBase.prototype.initVdom = function () {
    };
    Object.defineProperty(ComponentBase.prototype, "State", {
        get: function () {
            return this.state;
        },
        enumerable: true,
        configurable: true
    });
    ComponentBase.prototype.set_state = function (state) {
        this.state = state;
        if (state && state.view && typeof state.view === 'function') {
            state.view(this.state);
            state.view = undefined;
            if (this.element.firstChild && this.updateElementVtree)
                this.updateElementVtree(this.element);
        }
        else if (this.view) {
            var html = this.view(this.state);
            if (html && this.updateElement)
                this.updateElement(this.element, html);
        }
    };
    ComponentBase.prototype.push_state = function (state) {
        this.set_state(state);
        if (this.enable_history) {
            this._history = this._history.concat([state]);
            this._history_idx = this._history.length - 1;
        }
        if (this.state_changed) {
            app_1.default.run(this.state_changed, this.state);
        }
    };
    ComponentBase.prototype.add_actions = function (actions) {
        var _this = this;
        Object.keys(actions).forEach(function (action) {
            app_1.default.on(action, function () {
                var p = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    p[_i - 0] = arguments[_i];
                }
                _this.push_state(actions[action].apply(actions, [_this.State].concat(p)));
            });
        });
    };
    return ComponentBase;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ComponentBase;
;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(35)
var isHook = __webpack_require__(15)

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

var document = __webpack_require__(31)

var applyProperties = __webpack_require__(42)

var isVNode = __webpack_require__(9)
var isVText = __webpack_require__(16)
var isWidget = __webpack_require__(3)
var handleThunk = __webpack_require__(44)

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

var isVNode = __webpack_require__(9)
var isVText = __webpack_require__(16)
var isWidget = __webpack_require__(3)
var isThunk = __webpack_require__(14)

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

var version = __webpack_require__(10)

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_zero_1 = __webpack_require__(88);
var vdom_1 = __webpack_require__(90);
var component_1 = __webpack_require__(41);
var Component = (function (_super) {
    __extends(Component, _super);
    function Component() {
        return _super.apply(this, arguments) || this;
    }
    Component.prototype.initVdom = function () {
        this.updateElement = vdom_1.updateElement.bind(this);
        this.updateElementVtree = vdom_1.updateElementVtree(this);
    };
    return Component;
}(component_1.default));
exports.Component = Component;
index_zero_1.default.start = function (element, model, view, update, options) {
    return new Component(element, model, view, update, options);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = index_zero_1.default;


/***/ },
/* 47 */
/***/ function(module, exports) {

"use strict";
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ },
/* 48 */
/***/ function(module, exports) {

/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

/*
  Module dependencies
*/
var ElementType = __webpack_require__(50);
var entities = __webpack_require__(62);

/*
  Boolean Attributes
*/
var booleanAttributes = {
  __proto__: null,
  allowfullscreen: true,
  async: true,
  autofocus: true,
  autoplay: true,
  checked: true,
  controls: true,
  default: true,
  defer: true,
  disabled: true,
  hidden: true,
  ismap: true,
  loop: true,
  multiple: true,
  muted: true,
  open: true,
  readonly: true,
  required: true,
  reversed: true,
  scoped: true,
  seamless: true,
  selected: true,
  typemustmatch: true
};

var unencodedElements = {
  __proto__: null,
  style: true,
  script: true,
  xmp: true,
  iframe: true,
  noembed: true,
  noframes: true,
  plaintext: true,
  noscript: true
};

/*
  Format attributes
*/
function formatAttrs(attributes, opts) {
  if (!attributes) return;

  var output = '',
      value;

  // Loop through the attributes
  for (var key in attributes) {
    value = attributes[key];
    if (output) {
      output += ' ';
    }

    if (!value && booleanAttributes[key]) {
      output += key;
    } else {
      output += key + '="' + (opts.decodeEntities ? entities.encodeXML(value) : value) + '"';
    }
  }

  return output;
}

/*
  Self-enclosing tags (stolen from node-htmlparser)
*/
var singleTag = {
  __proto__: null,
  area: true,
  base: true,
  basefont: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  isindex: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
};


var render = module.exports = function(dom, opts) {
  if (!Array.isArray(dom) && !dom.cheerio) dom = [dom];
  opts = opts || {};

  var output = '';

  for(var i = 0; i < dom.length; i++){
    var elem = dom[i];

    if (elem.type === 'root')
      output += render(elem.children, opts);
    else if (ElementType.isTag(elem))
      output += renderTag(elem, opts);
    else if (elem.type === ElementType.Directive)
      output += renderDirective(elem);
    else if (elem.type === ElementType.Comment)
      output += renderComment(elem);
    else if (elem.type === ElementType.CDATA)
      output += renderCdata(elem);
    else
      output += renderText(elem, opts);
  }

  return output;
};

function renderTag(elem, opts) {
  // Handle SVG
  if (elem.name === "svg") opts = {decodeEntities: opts.decodeEntities, xmlMode: true};

  var tag = '<' + elem.name,
      attribs = formatAttrs(elem.attribs, opts);

  if (attribs) {
    tag += ' ' + attribs;
  }

  if (
    opts.xmlMode
    && (!elem.children || elem.children.length === 0)
  ) {
    tag += '/>';
  } else {
    tag += '>';
    if (elem.children) {
      tag += render(elem.children, opts);
    }

    if (!singleTag[elem.name] || opts.xmlMode) {
      tag += '</' + elem.name + '>';
    }
  }

  return tag;
}

function renderDirective(elem) {
  return '<' + elem.data + '>';
}

function renderText(elem, opts) {
  var data = elem.data || '';

  // if entities weren't decoded, no need to encode them back
  if (opts.decodeEntities && !(elem.parent && elem.parent.name in unencodedElements)) {
    data = entities.encodeXML(data);
  }

  return data;
}

function renderCdata(elem) {
  return '<![CDATA[' + elem.children[0].data + ']]>';
}

function renderComment(elem) {
  return '<!--' + elem.data + '-->';
}


/***/ },
/* 50 */
/***/ function(module, exports) {

//Types of elements found in the DOM
module.exports = {
	Text: "text", //Text
	Directive: "directive", //<? ... ?>
	Comment: "comment", //<!-- ... -->
	Script: "script", //<script> tags
	Style: "style", //<style> tags
	Tag: "tag", //Any tag
	CDATA: "cdata", //<![CDATA[ ... ]]>

	isTag: function(elem){
		return elem.type === "tag" || elem.type === "script" || elem.type === "style";
	}
};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

var ElementType = __webpack_require__(6);

var re_whitespace = /\s+/g;
var NodePrototype = __webpack_require__(28);
var ElementPrototype = __webpack_require__(52);

function DomHandler(callback, options, elementCB){
	if(typeof callback === "object"){
		elementCB = options;
		options = callback;
		callback = null;
	} else if(typeof options === "function"){
		elementCB = options;
		options = defaultOpts;
	}
	this._callback = callback;
	this._options = options || defaultOpts;
	this._elementCB = elementCB;
	this.dom = [];
	this._done = false;
	this._tagStack = [];
	this._parser = this._parser || null;
}

//default options
var defaultOpts = {
	normalizeWhitespace: false, //Replace all whitespace with single spaces
	withStartIndices: false, //Add startIndex properties to nodes
};

DomHandler.prototype.onparserinit = function(parser){
	this._parser = parser;
};

//Resets the handler back to starting state
DomHandler.prototype.onreset = function(){
	DomHandler.call(this, this._callback, this._options, this._elementCB);
};

//Signals the handler that parsing is done
DomHandler.prototype.onend = function(){
	if(this._done) return;
	this._done = true;
	this._parser = null;
	this._handleCallback(null);
};

DomHandler.prototype._handleCallback =
DomHandler.prototype.onerror = function(error){
	if(typeof this._callback === "function"){
		this._callback(error, this.dom);
	} else {
		if(error) throw error;
	}
};

DomHandler.prototype.onclosetag = function(){
	//if(this._tagStack.pop().name !== name) this._handleCallback(Error("Tagname didn't match!"));
	var elem = this._tagStack.pop();
	if(this._elementCB) this._elementCB(elem);
};

DomHandler.prototype._addDomElement = function(element){
	var parent = this._tagStack[this._tagStack.length - 1];
	var siblings = parent ? parent.children : this.dom;
	var previousSibling = siblings[siblings.length - 1];

	element.next = null;

	if(this._options.withStartIndices){
		element.startIndex = this._parser.startIndex;
	}

	if (this._options.withDomLvl1) {
		element.__proto__ = element.type === "tag" ? ElementPrototype : NodePrototype;
	}

	if(previousSibling){
		element.prev = previousSibling;
		previousSibling.next = element;
	} else {
		element.prev = null;
	}

	siblings.push(element);
	element.parent = parent || null;
};

DomHandler.prototype.onopentag = function(name, attribs){
	var element = {
		type: name === "script" ? ElementType.Script : name === "style" ? ElementType.Style : ElementType.Tag,
		name: name,
		attribs: attribs,
		children: []
	};

	this._addDomElement(element);

	this._tagStack.push(element);
};

DomHandler.prototype.ontext = function(data){
	//the ignoreWhitespace is officially dropped, but for now,
	//it's an alias for normalizeWhitespace
	var normalize = this._options.normalizeWhitespace || this._options.ignoreWhitespace;

	var lastTag;

	if(!this._tagStack.length && this.dom.length && (lastTag = this.dom[this.dom.length-1]).type === ElementType.Text){
		if(normalize){
			lastTag.data = (lastTag.data + data).replace(re_whitespace, " ");
		} else {
			lastTag.data += data;
		}
	} else {
		if(
			this._tagStack.length &&
			(lastTag = this._tagStack[this._tagStack.length - 1]) &&
			(lastTag = lastTag.children[lastTag.children.length - 1]) &&
			lastTag.type === ElementType.Text
		){
			if(normalize){
				lastTag.data = (lastTag.data + data).replace(re_whitespace, " ");
			} else {
				lastTag.data += data;
			}
		} else {
			if(normalize){
				data = data.replace(re_whitespace, " ");
			}

			this._addDomElement({
				data: data,
				type: ElementType.Text
			});
		}
	}
};

DomHandler.prototype.oncomment = function(data){
	var lastTag = this._tagStack[this._tagStack.length - 1];

	if(lastTag && lastTag.type === ElementType.Comment){
		lastTag.data += data;
		return;
	}

	var element = {
		data: data,
		type: ElementType.Comment
	};

	this._addDomElement(element);
	this._tagStack.push(element);
};

DomHandler.prototype.oncdatastart = function(){
	var element = {
		children: [{
			data: "",
			type: ElementType.Text
		}],
		type: ElementType.CDATA
	};

	this._addDomElement(element);
	this._tagStack.push(element);
};

DomHandler.prototype.oncommentend = DomHandler.prototype.oncdataend = function(){
	this._tagStack.pop();
};

DomHandler.prototype.onprocessinginstruction = function(name, data){
	this._addDomElement({
		name: name,
		data: data,
		type: ElementType.Directive
	});
};

module.exports = DomHandler;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

// DOM-Level-1-compliant structure
var NodePrototype = __webpack_require__(28);
var ElementPrototype = module.exports = Object.create(NodePrototype);

var domLvl1 = {
	tagName: "name"
};

Object.keys(domLvl1).forEach(function(key) {
	var shorthand = domLvl1[key];
	Object.defineProperty(ElementPrototype, key, {
		get: function() {
			return this[shorthand] || null;
		},
		set: function(val) {
			this[shorthand] = val;
			return val;
		}
	});
});


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

var DomUtils = module.exports;

[
	__webpack_require__(58),
	__webpack_require__(59),
	__webpack_require__(56),
	__webpack_require__(57),
	__webpack_require__(55),
	__webpack_require__(54)
].forEach(function(ext){
	Object.keys(ext).forEach(function(key){
		DomUtils[key] = ext[key].bind(DomUtils);
	});
});


/***/ },
/* 54 */
/***/ function(module, exports) {

// removeSubsets
// Given an array of nodes, remove any member that is contained by another.
exports.removeSubsets = function(nodes) {
	var idx = nodes.length, node, ancestor, replace;

	// Check if each node (or one of its ancestors) is already contained in the
	// array.
	while (--idx > -1) {
		node = ancestor = nodes[idx];

		// Temporarily remove the node under consideration
		nodes[idx] = null;
		replace = true;

		while (ancestor) {
			if (nodes.indexOf(ancestor) > -1) {
				replace = false;
				nodes.splice(idx, 1);
				break;
			}
			ancestor = ancestor.parent;
		}

		// If the node has been found to be unique, re-insert it.
		if (replace) {
			nodes[idx] = node;
		}
	}

	return nodes;
};

// Source: http://dom.spec.whatwg.org/#dom-node-comparedocumentposition
var POSITION = {
	DISCONNECTED: 1,
	PRECEDING: 2,
	FOLLOWING: 4,
	CONTAINS: 8,
	CONTAINED_BY: 16
};

// Compare the position of one node against another node in any other document.
// The return value is a bitmask with the following values:
//
// document order:
// > There is an ordering, document order, defined on all the nodes in the
// > document corresponding to the order in which the first character of the
// > XML representation of each node occurs in the XML representation of the
// > document after expansion of general entities. Thus, the document element
// > node will be the first node. Element nodes occur before their children.
// > Thus, document order orders element nodes in order of the occurrence of
// > their start-tag in the XML (after expansion of entities). The attribute
// > nodes of an element occur after the element and before its children. The
// > relative order of attribute nodes is implementation-dependent./
// Source:
// http://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-document-order
//
// @argument {Node} nodaA The first node to use in the comparison
// @argument {Node} nodeB The second node to use in the comparison
//
// @return {Number} A bitmask describing the input nodes' relative position.
//         See http://dom.spec.whatwg.org/#dom-node-comparedocumentposition for
//         a description of these values.
var comparePos = exports.compareDocumentPosition = function(nodeA, nodeB) {
	var aParents = [];
	var bParents = [];
	var current, sharedParent, siblings, aSibling, bSibling, idx;

	if (nodeA === nodeB) {
		return 0;
	}

	current = nodeA;
	while (current) {
		aParents.unshift(current);
		current = current.parent;
	}
	current = nodeB;
	while (current) {
		bParents.unshift(current);
		current = current.parent;
	}

	idx = 0;
	while (aParents[idx] === bParents[idx]) {
		idx++;
	}

	if (idx === 0) {
		return POSITION.DISCONNECTED;
	}

	sharedParent = aParents[idx - 1];
	siblings = sharedParent.children;
	aSibling = aParents[idx];
	bSibling = bParents[idx];

	if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
		if (sharedParent === nodeB) {
			return POSITION.FOLLOWING | POSITION.CONTAINED_BY;
		}
		return POSITION.FOLLOWING;
	} else {
		if (sharedParent === nodeA) {
			return POSITION.PRECEDING | POSITION.CONTAINS;
		}
		return POSITION.PRECEDING;
	}
};

// Sort an array of nodes based on their relative position in the document and
// remove any duplicate nodes. If the array contains nodes that do not belong
// to the same document, sort order is unspecified.
//
// @argument {Array} nodes Array of DOM nodes
//
// @returns {Array} collection of unique nodes, sorted in document order
exports.uniqueSort = function(nodes) {
	var idx = nodes.length, node, position;

	nodes = nodes.slice();

	while (--idx > -1) {
		node = nodes[idx];
		position = nodes.indexOf(node);
		if (position > -1 && position < idx) {
			nodes.splice(idx, 1);
		}
	}
	nodes.sort(function(a, b) {
		var relative = comparePos(a, b);
		if (relative & POSITION.PRECEDING) {
			return -1;
		} else if (relative & POSITION.FOLLOWING) {
			return 1;
		}
		return 0;
	});

	return nodes;
};


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

var ElementType = __webpack_require__(6);
var isTag = exports.isTag = ElementType.isTag;

exports.testElement = function(options, element){
	for(var key in options){
		if(!options.hasOwnProperty(key));
		else if(key === "tag_name"){
			if(!isTag(element) || !options.tag_name(element.name)){
				return false;
			}
		} else if(key === "tag_type"){
			if(!options.tag_type(element.type)) return false;
		} else if(key === "tag_contains"){
			if(isTag(element) || !options.tag_contains(element.data)){
				return false;
			}
		} else if(!element.attribs || !options[key](element.attribs[key])){
			return false;
		}
	}
	return true;
};

var Checks = {
	tag_name: function(name){
		if(typeof name === "function"){
			return function(elem){ return isTag(elem) && name(elem.name); };
		} else if(name === "*"){
			return isTag;
		} else {
			return function(elem){ return isTag(elem) && elem.name === name; };
		}
	},
	tag_type: function(type){
		if(typeof type === "function"){
			return function(elem){ return type(elem.type); };
		} else {
			return function(elem){ return elem.type === type; };
		}
	},
	tag_contains: function(data){
		if(typeof data === "function"){
			return function(elem){ return !isTag(elem) && data(elem.data); };
		} else {
			return function(elem){ return !isTag(elem) && elem.data === data; };
		}
	}
};

function getAttribCheck(attrib, value){
	if(typeof value === "function"){
		return function(elem){ return elem.attribs && value(elem.attribs[attrib]); };
	} else {
		return function(elem){ return elem.attribs && elem.attribs[attrib] === value; };
	}
}

function combineFuncs(a, b){
	return function(elem){
		return a(elem) || b(elem);
	};
}

exports.getElements = function(options, element, recurse, limit){
	var funcs = Object.keys(options).map(function(key){
		var value = options[key];
		return key in Checks ? Checks[key](value) : getAttribCheck(key, value);
	});

	return funcs.length === 0 ? [] : this.filter(
		funcs.reduce(combineFuncs),
		element, recurse, limit
	);
};

exports.getElementById = function(id, element, recurse){
	if(!Array.isArray(element)) element = [element];
	return this.findOne(getAttribCheck("id", id), element, recurse !== false);
};

exports.getElementsByTagName = function(name, element, recurse, limit){
	return this.filter(Checks.tag_name(name), element, recurse, limit);
};

exports.getElementsByTagType = function(type, element, recurse, limit){
	return this.filter(Checks.tag_type(type), element, recurse, limit);
};


/***/ },
/* 56 */
/***/ function(module, exports) {

exports.removeElement = function(elem){
	if(elem.prev) elem.prev.next = elem.next;
	if(elem.next) elem.next.prev = elem.prev;

	if(elem.parent){
		var childs = elem.parent.children;
		childs.splice(childs.lastIndexOf(elem), 1);
	}
};

exports.replaceElement = function(elem, replacement){
	var prev = replacement.prev = elem.prev;
	if(prev){
		prev.next = replacement;
	}

	var next = replacement.next = elem.next;
	if(next){
		next.prev = replacement;
	}

	var parent = replacement.parent = elem.parent;
	if(parent){
		var childs = parent.children;
		childs[childs.lastIndexOf(elem)] = replacement;
	}
};

exports.appendChild = function(elem, child){
	child.parent = elem;

	if(elem.children.push(child) !== 1){
		var sibling = elem.children[elem.children.length - 2];
		sibling.next = child;
		child.prev = sibling;
		child.next = null;
	}
};

exports.append = function(elem, next){
	var parent = elem.parent,
		currNext = elem.next;

	next.next = currNext;
	next.prev = elem;
	elem.next = next;
	next.parent = parent;

	if(currNext){
		currNext.prev = next;
		if(parent){
			var childs = parent.children;
			childs.splice(childs.lastIndexOf(currNext), 0, next);
		}
	} else if(parent){
		parent.children.push(next);
	}
};

exports.prepend = function(elem, prev){
	var parent = elem.parent;
	if(parent){
		var childs = parent.children;
		childs.splice(childs.lastIndexOf(elem), 0, prev);
	}

	if(elem.prev){
		elem.prev.next = prev;
	}
	
	prev.parent = parent;
	prev.prev = elem.prev;
	prev.next = elem;
	elem.prev = prev;
};




/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

var isTag = __webpack_require__(6).isTag;

module.exports = {
	filter: filter,
	find: find,
	findOneChild: findOneChild,
	findOne: findOne,
	existsOne: existsOne,
	findAll: findAll
};

function filter(test, element, recurse, limit){
	if(!Array.isArray(element)) element = [element];

	if(typeof limit !== "number" || !isFinite(limit)){
		limit = Infinity;
	}
	return find(test, element, recurse !== false, limit);
}

function find(test, elems, recurse, limit){
	var result = [], childs;

	for(var i = 0, j = elems.length; i < j; i++){
		if(test(elems[i])){
			result.push(elems[i]);
			if(--limit <= 0) break;
		}

		childs = elems[i].children;
		if(recurse && childs && childs.length > 0){
			childs = find(test, childs, recurse, limit);
			result = result.concat(childs);
			limit -= childs.length;
			if(limit <= 0) break;
		}
	}

	return result;
}

function findOneChild(test, elems){
	for(var i = 0, l = elems.length; i < l; i++){
		if(test(elems[i])) return elems[i];
	}

	return null;
}

function findOne(test, elems){
	var elem = null;

	for(var i = 0, l = elems.length; i < l && !elem; i++){
		if(!isTag(elems[i])){
			continue;
		} else if(test(elems[i])){
			elem = elems[i];
		} else if(elems[i].children.length > 0){
			elem = findOne(test, elems[i].children);
		}
	}

	return elem;
}

function existsOne(test, elems){
	for(var i = 0, l = elems.length; i < l; i++){
		if(
			isTag(elems[i]) && (
				test(elems[i]) || (
					elems[i].children.length > 0 &&
					existsOne(test, elems[i].children)
				)
			)
		){
			return true;
		}
	}

	return false;
}

function findAll(test, elems){
	var result = [];
	for(var i = 0, j = elems.length; i < j; i++){
		if(!isTag(elems[i])) continue;
		if(test(elems[i])) result.push(elems[i]);

		if(elems[i].children.length > 0){
			result = result.concat(findAll(test, elems[i].children));
		}
	}
	return result;
}


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

var ElementType = __webpack_require__(6),
    getOuterHTML = __webpack_require__(49),
    isTag = ElementType.isTag;

module.exports = {
	getInnerHTML: getInnerHTML,
	getOuterHTML: getOuterHTML,
	getText: getText
};

function getInnerHTML(elem, opts){
	return elem.children ? elem.children.map(function(elem){
		return getOuterHTML(elem, opts);
	}).join("") : "";
}

function getText(elem){
	if(Array.isArray(elem)) return elem.map(getText).join("");
	if(isTag(elem) || elem.type === ElementType.CDATA) return getText(elem.children);
	if(elem.type === ElementType.Text) return elem.data;
	return "";
}


/***/ },
/* 59 */
/***/ function(module, exports) {

var getChildren = exports.getChildren = function(elem){
	return elem.children;
};

var getParent = exports.getParent = function(elem){
	return elem.parent;
};

exports.getSiblings = function(elem){
	var parent = getParent(elem);
	return parent ? getChildren(parent) : [elem];
};

exports.getAttributeValue = function(elem, name){
	return elem.attribs && elem.attribs[name];
};

exports.hasAttrib = function(elem, name){
	return !!elem.attribs && hasOwnProperty.call(elem.attribs, name);
};

exports.getName = function(elem){
	return elem.name;
};


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

var punycode = __webpack_require__(38);
var entities = __webpack_require__(78);

module.exports = decode;

function decode (str) {
    if (typeof str !== 'string') {
        throw new TypeError('Expected a String');
    }

    return str.replace(/&(#?[^;\W]+;?)/g, function (_, match) {
        var m;
        if (m = /^#(\d+);?$/.exec(match)) {
            return punycode.ucs2.encode([ parseInt(m[1], 10) ]);
        } else if (m = /^#[Xx]([A-Fa-f0-9]+);?/.exec(match)) {
            return punycode.ucs2.encode([ parseInt(m[1], 16) ]);
        } else {
            // named entity
            var hasSemi = /;$/.test(match);
            var withoutSemi = hasSemi ? match.replace(/;$/, '') : match;
            var target = entities[withoutSemi] || (hasSemi && entities[match]);

            if (typeof target === 'number') {
                return punycode.ucs2.encode([ target ]);
            } else if (typeof target === 'string') {
                return target;
            } else {
                return '&' + match;
            }
        }
    });
}


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

var punycode = __webpack_require__(38);
var revEntities = __webpack_require__(79);

module.exports = encode;

function encode (str, opts) {
    if (typeof str !== 'string') {
        throw new TypeError('Expected a String');
    }
    if (!opts) opts = {};

    var numeric = true;
    if (opts.named) numeric = false;
    if (opts.numeric !== undefined) numeric = opts.numeric;

    var special = opts.special || {
        '"': true, "'": true,
        '<': true, '>': true,
        '&': true
    };

    var codePoints = punycode.ucs2.decode(str);
    var chars = [];
    for (var i = 0; i < codePoints.length; i++) {
        var cc = codePoints[i];
        var c = punycode.ucs2.encode([ cc ]);
        var e = revEntities[cc];
        if (e && (cc >= 127 || special[c]) && !numeric) {
            chars.push('&' + (/;$/.test(e) ? e : e + ';'));
        }
        else if (cc < 32 || cc >= 127 || special[c]) {
            chars.push('&#' + cc + ';');
        }
        else {
            chars.push(c);
        }
    }
    return chars.join('');
}


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

var encode = __webpack_require__(64),
    decode = __webpack_require__(63);

exports.decode = function(data, level){
	return (!level || level <= 0 ? decode.XML : decode.HTML)(data);
};

exports.decodeStrict = function(data, level){
	return (!level || level <= 0 ? decode.XML : decode.HTMLStrict)(data);
};

exports.encode = function(data, level){
	return (!level || level <= 0 ? encode.XML : encode.HTML)(data);
};

exports.encodeXML = encode.XML;

exports.encodeHTML4 =
exports.encodeHTML5 =
exports.encodeHTML  = encode.HTML;

exports.decodeXML =
exports.decodeXMLStrict = decode.XML;

exports.decodeHTML4 =
exports.decodeHTML5 =
exports.decodeHTML = decode.HTML;

exports.decodeHTML4Strict =
exports.decodeHTML5Strict =
exports.decodeHTMLStrict = decode.HTMLStrict;

exports.escape = encode.escape;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

var entityMap = __webpack_require__(18),
    legacyMap = __webpack_require__(37),
    xmlMap    = __webpack_require__(19),
    decodeCodePoint = __webpack_require__(30);

var decodeXMLStrict  = getStrictDecoder(xmlMap),
    decodeHTMLStrict = getStrictDecoder(entityMap);

function getStrictDecoder(map){
	var keys = Object.keys(map).join("|"),
	    replace = getReplacer(map);

	keys += "|#[xX][\\da-fA-F]+|#\\d+";

	var re = new RegExp("&(?:" + keys + ");", "g");

	return function(str){
		return String(str).replace(re, replace);
	};
}

var decodeHTML = (function(){
	var legacy = Object.keys(legacyMap)
		.sort(sorter);

	var keys = Object.keys(entityMap)
		.sort(sorter);

	for(var i = 0, j = 0; i < keys.length; i++){
		if(legacy[j] === keys[i]){
			keys[i] += ";?";
			j++;
		} else {
			keys[i] += ";";
		}
	}

	var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g"),
	    replace = getReplacer(entityMap);

	function replacer(str){
		if(str.substr(-1) !== ";") str += ";";
		return replace(str);
	}

	//TODO consider creating a merged map
	return function(str){
		return String(str).replace(re, replacer);
	};
}());

function sorter(a, b){
	return a < b ? 1 : -1;
}

function getReplacer(map){
	return function replace(str){
		if(str.charAt(1) === "#"){
			if(str.charAt(2) === "X" || str.charAt(2) === "x"){
				return decodeCodePoint(parseInt(str.substr(3), 16));
			}
			return decodeCodePoint(parseInt(str.substr(2), 10));
		}
		return map[str.slice(1, -1)];
	};
}

module.exports = {
	XML: decodeXMLStrict,
	HTML: decodeHTML,
	HTMLStrict: decodeHTMLStrict
};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

var inverseXML = getInverseObj(__webpack_require__(19)),
    xmlReplacer = getInverseReplacer(inverseXML);

exports.XML = getInverse(inverseXML, xmlReplacer);

var inverseHTML = getInverseObj(__webpack_require__(18)),
    htmlReplacer = getInverseReplacer(inverseHTML);

exports.HTML = getInverse(inverseHTML, htmlReplacer);

function getInverseObj(obj){
	return Object.keys(obj).sort().reduce(function(inverse, name){
		inverse[obj[name]] = "&" + name + ";";
		return inverse;
	}, {});
}

function getInverseReplacer(inverse){
	var single = [],
	    multiple = [];

	Object.keys(inverse).forEach(function(k){
		if(k.length === 1){
			single.push("\\" + k);
		} else {
			multiple.push(k);
		}
	});

	//TODO add ranges
	multiple.unshift("[" + single.join("") + "]");

	return new RegExp(multiple.join("|"), "g");
}

var re_nonASCII = /[^\0-\x7F]/g,
    re_astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

function singleCharReplacer(c){
	return "&#x" + c.charCodeAt(0).toString(16).toUpperCase() + ";";
}

function astralReplacer(c){
	// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
	var high = c.charCodeAt(0);
	var low  = c.charCodeAt(1);
	var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
	return "&#x" + codePoint.toString(16).toUpperCase() + ";";
}

function getInverse(inverse, re){
	function func(name){
		return inverse[name];
	}

	return function(data){
		return data
				.replace(re, func)
				.replace(re_astralSymbols, astralReplacer)
				.replace(re_nonASCII, singleCharReplacer);
	};
}

var re_xmlChars = getInverseReplacer(inverseXML);

function escapeXML(data){
	return data
			.replace(re_xmlChars, singleCharReplacer)
			.replace(re_astralSymbols, astralReplacer)
			.replace(re_nonASCII, singleCharReplacer);
}

exports.escape = escapeXML;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var OneVersionConstraint = __webpack_require__(77);

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

var convertHTML = __webpack_require__(68);
module.exports = function initializeConverter (dependencies) {
    if (!dependencies.VNode || !dependencies.VText) {
        throw new Error('html-to-vdom needs to be initialized with VNode and VText');
    }
    return convertHTML(dependencies.VNode, dependencies.VText);
};


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

/*
    Adapted from https://github.com/facebook/react/blob/c265504fe2fdeadf0e5358879a3c141628b37a23/src/renderers/dom/shared/HTMLDOMPropertyConfig.js
 */
var decode = __webpack_require__(29).decode;

var MUST_USE_ATTRIBUTE = 0x1;
var MUST_USE_PROPERTY = 0x2;
var HAS_BOOLEAN_VALUE = 0x8;
var HAS_NUMERIC_VALUE = 0x10;
var HAS_POSITIVE_NUMERIC_VALUE = 0x20 | 0x10;
var HAS_OVERLOADED_BOOLEAN_VALUE = 0x40;

function checkMask(value, bitmask) {
  return (value & bitmask) === bitmask;
}

var isCustomAttribute = RegExp.prototype.test.bind(
    /^(data|aria)-[a-z_][a-z\d_.\-]*$/
);

var HTMLDOMPropertyConfig = {
  
  Properties: {
    /**
     * Standard Properties
     */
    accept: null,
    acceptCharset: null,
    accessKey: null,
    action: null,
    allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    allowTransparency: MUST_USE_ATTRIBUTE,
    alt: null,
    async: HAS_BOOLEAN_VALUE,
    autoComplete: null,
    autoFocus: HAS_BOOLEAN_VALUE,
    autoPlay: HAS_BOOLEAN_VALUE,
    capture: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    cellPadding: null,
    cellSpacing: null,
    charSet: MUST_USE_ATTRIBUTE,
    challenge: MUST_USE_ATTRIBUTE,
    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    classID: MUST_USE_ATTRIBUTE,
    // To set className on SVG elements, it's necessary to use .setAttribute;
    // this works on HTML elements too in all browsers except IE8.
    className: MUST_USE_ATTRIBUTE,
    cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    colSpan: null,
    content: null,
    contentEditable: null,
    contextMenu: MUST_USE_ATTRIBUTE,
    controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    coords: null,
    crossOrigin: null,
    data: null, // For `<object />` acts as `src`.
    dateTime: MUST_USE_ATTRIBUTE,
    defer: HAS_BOOLEAN_VALUE,
    dir: null,
    disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    download: HAS_OVERLOADED_BOOLEAN_VALUE,
    draggable: null,
    encType: null,
    form: MUST_USE_ATTRIBUTE,
    formAction: MUST_USE_ATTRIBUTE,
    formEncType: MUST_USE_ATTRIBUTE,
    formMethod: MUST_USE_ATTRIBUTE,
    formNoValidate: HAS_BOOLEAN_VALUE,
    formTarget: MUST_USE_ATTRIBUTE,
    frameBorder: MUST_USE_ATTRIBUTE,
    headers: null,
    height: MUST_USE_ATTRIBUTE,
    hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    high: null,
    href: null,
    hrefLang: null,
    htmlFor: null,
    httpEquiv: null,
    icon: null,
    id: MUST_USE_PROPERTY,
    is: MUST_USE_ATTRIBUTE,
    keyParams: MUST_USE_ATTRIBUTE,
    keyType: MUST_USE_ATTRIBUTE,
    label: null,
    lang: null,
    list: MUST_USE_ATTRIBUTE,
    loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    low: null,
    manifest: MUST_USE_ATTRIBUTE,
    marginHeight: null,
    marginWidth: null,
    max: null,
    maxLength: MUST_USE_ATTRIBUTE,
    media: MUST_USE_ATTRIBUTE,
    mediaGroup: null,
    method: null,
    min: null,
    minLength: MUST_USE_ATTRIBUTE,
    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    name: null,
    noValidate: HAS_BOOLEAN_VALUE,
    open: HAS_BOOLEAN_VALUE,
    optimum: null,
    pattern: null,
    placeholder: null,
    poster: null,
    preload: null,
    radioGroup: null,
    readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    rel: null,
    required: HAS_BOOLEAN_VALUE,
    role: MUST_USE_ATTRIBUTE,
    rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    rowSpan: null,
    sandbox: null,
    scope: null,
    scoped: HAS_BOOLEAN_VALUE,
    scrolling: null,
    seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
    shape: null,
    size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
    sizes: MUST_USE_ATTRIBUTE,
    span: HAS_POSITIVE_NUMERIC_VALUE,
    spellCheck: null,
    src: null,
    srcDoc: MUST_USE_PROPERTY,
    srcSet: MUST_USE_ATTRIBUTE,
    start: HAS_NUMERIC_VALUE,
    step: null,
    style: null,
    tabIndex: null,
    target: null,
    title: null,
    type: null,
    useMap: null,
    value: MUST_USE_PROPERTY,
    width: MUST_USE_ATTRIBUTE,
    wmode: MUST_USE_ATTRIBUTE,

    /**
     * Non-standard Properties
     */
    // autoCapitalize and autoCorrect are supported in Mobile Safari for
    // keyboard hints.
    autoCapitalize: null,
    autoCorrect: null,
    // itemProp, itemScope, itemType are for
    // Microdata support. See http://schema.org/docs/gs.html
    itemProp: MUST_USE_ATTRIBUTE,
    itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
    itemType: MUST_USE_ATTRIBUTE,
    // itemID and itemRef are for Microdata support as well but
    // only specified in the the WHATWG spec document. See
    // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
    itemID: MUST_USE_ATTRIBUTE,
    itemRef: MUST_USE_ATTRIBUTE,
    // property is supported for OpenGraph in meta tags.
    property: null,
    // IE-only attribute that controls focus behavior
    unselectable: MUST_USE_ATTRIBUTE
  }
};

var parseStyles = function(input) {
    var attributes = input.split(';');
    var styles = attributes.reduce(function(object, attribute){
        var entry = attribute.split(/:(.+)/);
        if (entry[0] && entry[1]) {
            object[entry[0].trim()] = entry[1].trim();
        }
        return object;
    },{});
    return styles;
};

var propertyToAttributeMapping = {
    'className': 'class',
    'htmlFor': 'for',
    'httpEquiv': 'http-equiv',
    'acceptCharset': 'accept-charset'
};

var propertyValueConversions = {
    'style': parseStyles,
    'placeholder': decode,
    'title': decode,
    'alt': decode
};

var getPropertyInfo = (function () {
    var propInfoByAttributeName = {};

    Object.keys(HTMLDOMPropertyConfig.Properties).forEach(function (propName) {
        var propConfig = HTMLDOMPropertyConfig.Properties[propName];
        var attributeName = propertyToAttributeMapping[propName] || propName.toLowerCase();

        var propertyInfo = {
            attributeName: attributeName,
            propertyName: propName,

            mustUseAttribute: checkMask(propConfig, MUST_USE_ATTRIBUTE),
            mustUseProperty: checkMask(propConfig, MUST_USE_PROPERTY),
            hasBooleanValue: checkMask(propConfig, HAS_BOOLEAN_VALUE),
            hasNumericValue: checkMask(propConfig, HAS_NUMERIC_VALUE),
            hasPositiveNumericValue:
            checkMask(propConfig, HAS_POSITIVE_NUMERIC_VALUE),
            hasOverloadedBooleanValue:
            checkMask(propConfig, HAS_OVERLOADED_BOOLEAN_VALUE),
        };

        propInfoByAttributeName[attributeName] = propertyInfo;
    });

    return function (attributeName) {
        return propInfoByAttributeName[attributeName];
    };
})();


var convertTagAttributes = function (tag) {
    var attributes = tag.attribs;

    var vdomProperties = {
        attributes: {}
    };

    Object.keys(attributes).forEach(function (attributeName) {
        var lowerCased = attributeName.toLowerCase();
        var propInfo = getPropertyInfo(lowerCased);

        var value = attributes[attributeName];
        if (isCustomAttribute(attributeName) || !propInfo) {
            vdomProperties.attributes[attributeName] = value;
            return;
        }
        
        var valueConverter = propertyValueConversions[propInfo.propertyName];
        if (valueConverter) {
            value = valueConverter(value);
        }

        if (propInfo.mustUseAttribute) {
            if (propInfo.hasBooleanValue) {
                // Boolean attributes come in as an empty string or the 
                vdomProperties.attributes[propInfo.attributeName] = '';
            }
            else {
                vdomProperties.attributes[propInfo.attributeName] = value;
            }
        }
        // Anything we don't set as an attribute is treated as a property
        else {
            var isTrue;
            if (propInfo.hasBooleanValue) {
                isTrue = (value === '' || value.toLowerCase() === propInfo.attributeName);
                vdomProperties[propInfo.propertyName] = isTrue ? true : false;
            }
            else if (propInfo.hasOverloadedBooleanValue) {
                isTrue = (value === '');
                vdomProperties[propInfo.propertyName] = isTrue ? true : value;
            }
            else if (propInfo.hasNumericValue || propInfo.hasPositiveNumericValue) {
                vdomProperties[propInfo.propertyName] = Number(value);
            }
            else {
                vdomProperties[propInfo.propertyName] = value;
            }
        }

    });

    return vdomProperties;
};

module.exports = convertTagAttributes;


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

var createConverter = __webpack_require__(69);
var parseHTML = __webpack_require__(70);

module.exports = function initializeHtmlToVdom (VTree, VText) {
    var htmlparserToVdom = createConverter(VTree, VText);
    return function convertHTML(options, html) {
        var noOptions = typeof html === 'undefined' && typeof options === 'string';
        var hasOptions = !noOptions;

        // was html supplied as the only argument?
        var htmlToConvert = noOptions ? options : html;
        var getVNodeKey = hasOptions ? options.getVNodeKey : undefined;

        var tags = parseHTML(htmlToConvert);

        var convertedHTML;
        if (tags.length > 1) {
            convertedHTML = tags.map(function (tag) {
                return htmlparserToVdom.convert(tag, getVNodeKey);
            });
        }
        else {
            convertedHTML = htmlparserToVdom.convert(tags[0], getVNodeKey);
        }
        
        return convertedHTML;
    };
};


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

var decode = __webpack_require__(29).decode;
var convertTagAttributes = __webpack_require__(67);

module.exports = function createConverter (VNode, VText) {
    var converter = {
        convert: function (node, getVNodeKey) {
            if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {
                return converter.convertTag(node, getVNodeKey);
            } else if (node.type === 'text') {
                return new VText(decode(node.data));
            } else {
                // converting an unsupported node, return an empty text node instead.
                return new VText('');
            }
        },
        convertTag: function (tag, getVNodeKey) {
            var attributes = convertTagAttributes(tag);
            var key;

            if (getVNodeKey) {
                key = getVNodeKey(attributes);
            }

            var children = Array.prototype.map.call(tag.children || [], function(node) {
                return converter.convert(node, getVNodeKey);
            });

            return new VNode(tag.name, attributes, children, key);
        }
    };
    return converter;
};


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

var htmlparser = __webpack_require__(8);

var parseHTML = function parseHTML (html) {
    var handler = new htmlparser.DomHandler();

    var parser = new htmlparser.Parser(handler, {
        lowerCaseAttributeNames: false
    });
    parser.parseComplete(html);
    return handler.dom;
};

module.exports = parseHTML;


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

module.exports = CollectingHandler;

function CollectingHandler(cbs){
	this._cbs = cbs || {};
	this.events = [];
}

var EVENTS = __webpack_require__(8).EVENTS;
Object.keys(EVENTS).forEach(function(name){
	if(EVENTS[name] === 0){
		name = "on" + name;
		CollectingHandler.prototype[name] = function(){
			this.events.push([name]);
			if(this._cbs[name]) this._cbs[name]();
		};
	} else if(EVENTS[name] === 1){
		name = "on" + name;
		CollectingHandler.prototype[name] = function(a){
			this.events.push([name, a]);
			if(this._cbs[name]) this._cbs[name](a);
		};
	} else if(EVENTS[name] === 2){
		name = "on" + name;
		CollectingHandler.prototype[name] = function(a, b){
			this.events.push([name, a, b]);
			if(this._cbs[name]) this._cbs[name](a, b);
		};
	} else {
		throw Error("wrong number of arguments");
	}
});

CollectingHandler.prototype.onreset = function(){
	this.events = [];
	if(this._cbs.onreset) this._cbs.onreset();
};

CollectingHandler.prototype.restart = function(){
	if(this._cbs.onreset) this._cbs.onreset();

	for(var i = 0, len = this.events.length; i < len; i++){
		if(this._cbs[this.events[i][0]]){

			var num = this.events[i].length;

			if(num === 1){
				this._cbs[this.events[i][0]]();
			} else if(num === 2){
				this._cbs[this.events[i][0]](this.events[i][1]);
			} else {
				this._cbs[this.events[i][0]](this.events[i][1], this.events[i][2]);
			}
		}
	}
};


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

var index = __webpack_require__(8),
    DomHandler = index.DomHandler,
    DomUtils = index.DomUtils;

//TODO: make this a streamable handler
function FeedHandler(callback, options){
	this.init(callback, options);
}

__webpack_require__(0)(FeedHandler, DomHandler);

FeedHandler.prototype.init = DomHandler;

function getElements(what, where){
	return DomUtils.getElementsByTagName(what, where, true);
}
function getOneElement(what, where){
	return DomUtils.getElementsByTagName(what, where, true, 1)[0];
}
function fetch(what, where, recurse){
	return DomUtils.getText(
		DomUtils.getElementsByTagName(what, where, recurse, 1)
	).trim();
}

function addConditionally(obj, prop, what, where, recurse){
	var tmp = fetch(what, where, recurse);
	if(tmp) obj[prop] = tmp;
}

var isValidFeed = function(value){
	return value === "rss" || value === "feed" || value === "rdf:RDF";
};

FeedHandler.prototype.onend = function(){
	var feed = {},
	    feedRoot = getOneElement(isValidFeed, this.dom),
	    tmp, childs;

	if(feedRoot){
		if(feedRoot.name === "feed"){
			childs = feedRoot.children;

			feed.type = "atom";
			addConditionally(feed, "id", "id", childs);
			addConditionally(feed, "title", "title", childs);
			if((tmp = getOneElement("link", childs)) && (tmp = tmp.attribs) && (tmp = tmp.href)) feed.link = tmp;
			addConditionally(feed, "description", "subtitle", childs);
			if((tmp = fetch("updated", childs))) feed.updated = new Date(tmp);
			addConditionally(feed, "author", "email", childs, true);

			feed.items = getElements("entry", childs).map(function(item){
				var entry = {}, tmp;

				item = item.children;

				addConditionally(entry, "id", "id", item);
				addConditionally(entry, "title", "title", item);
				if((tmp = getOneElement("link", item)) && (tmp = tmp.attribs) && (tmp = tmp.href)) entry.link = tmp;
				if((tmp = fetch("summary", item) || fetch("content", item))) entry.description = tmp;
				if((tmp = fetch("updated", item))) entry.pubDate = new Date(tmp);
				return entry;
			});
		} else {
			childs = getOneElement("channel", feedRoot.children).children;

			feed.type = feedRoot.name.substr(0, 3);
			feed.id = "";
			addConditionally(feed, "title", "title", childs);
			addConditionally(feed, "link", "link", childs);
			addConditionally(feed, "description", "description", childs);
			if((tmp = fetch("lastBuildDate", childs))) feed.updated = new Date(tmp);
			addConditionally(feed, "author", "managingEditor", childs, true);

			feed.items = getElements("item", feedRoot.children).map(function(item){
				var entry = {}, tmp;

				item = item.children;

				addConditionally(entry, "id", "guid", item);
				addConditionally(entry, "title", "title", item);
				addConditionally(entry, "link", "link", item);
				addConditionally(entry, "description", "description", item);
				if((tmp = fetch("pubDate", item))) entry.pubDate = new Date(tmp);
				return entry;
			});
		}
	}
	this.dom = feed;
	DomHandler.prototype._handleCallback.call(
		this, feedRoot ? null : Error("couldn't find root of feed")
	);
};

module.exports = FeedHandler;


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

module.exports = ProxyHandler;

function ProxyHandler(cbs){
	this._cbs = cbs || {};
}

var EVENTS = __webpack_require__(8).EVENTS;
Object.keys(EVENTS).forEach(function(name){
	if(EVENTS[name] === 0){
		name = "on" + name;
		ProxyHandler.prototype[name] = function(){
			if(this._cbs[name]) this._cbs[name]();
		};
	} else if(EVENTS[name] === 1){
		name = "on" + name;
		ProxyHandler.prototype[name] = function(a){
			if(this._cbs[name]) this._cbs[name](a);
		};
	} else if(EVENTS[name] === 2){
		name = "on" + name;
		ProxyHandler.prototype[name] = function(a, b){
			if(this._cbs[name]) this._cbs[name](a, b);
		};
	} else {
		throw Error("wrong number of arguments");
	}
});

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

module.exports = Stream;

var Parser = __webpack_require__(34);

function Stream(options){
	Parser.call(this, new Cbs(this), options);
}

__webpack_require__(0)(Stream, Parser);

Stream.prototype.readable = true;

function Cbs(scope){
	this.scope = scope;
}

var EVENTS = __webpack_require__(8).EVENTS;

Object.keys(EVENTS).forEach(function(name){
	if(EVENTS[name] === 0){
		Cbs.prototype["on" + name] = function(){
			this.scope.emit(name);
		};
	} else if(EVENTS[name] === 1){
		Cbs.prototype["on" + name] = function(a){
			this.scope.emit(name, a);
		};
	} else if(EVENTS[name] === 2){
		Cbs.prototype["on" + name] = function(a, b){
			this.scope.emit(name, a, b);
		};
	} else {
		throw Error("wrong number of arguments!");
	}
});

/***/ },
/* 75 */
/***/ function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var Individual = __webpack_require__(76);

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}


/***/ },
/* 78 */
/***/ function(module, exports) {

module.exports = {
	"Aacute;": "Á",
	"Aacute": "Á",
	"aacute;": "á",
	"aacute": "á",
	"Abreve;": "Ă",
	"abreve;": "ă",
	"ac;": "∾",
	"acd;": "∿",
	"acE;": "∾̳",
	"Acirc;": "Â",
	"Acirc": "Â",
	"acirc;": "â",
	"acirc": "â",
	"acute;": "´",
	"acute": "´",
	"Acy;": "А",
	"acy;": "а",
	"AElig;": "Æ",
	"AElig": "Æ",
	"aelig;": "æ",
	"aelig": "æ",
	"af;": "⁡",
	"Afr;": "𝔄",
	"afr;": "𝔞",
	"Agrave;": "À",
	"Agrave": "À",
	"agrave;": "à",
	"agrave": "à",
	"alefsym;": "ℵ",
	"aleph;": "ℵ",
	"Alpha;": "Α",
	"alpha;": "α",
	"Amacr;": "Ā",
	"amacr;": "ā",
	"amalg;": "⨿",
	"AMP;": "&",
	"AMP": "&",
	"amp;": "&",
	"amp": "&",
	"And;": "⩓",
	"and;": "∧",
	"andand;": "⩕",
	"andd;": "⩜",
	"andslope;": "⩘",
	"andv;": "⩚",
	"ang;": "∠",
	"ange;": "⦤",
	"angle;": "∠",
	"angmsd;": "∡",
	"angmsdaa;": "⦨",
	"angmsdab;": "⦩",
	"angmsdac;": "⦪",
	"angmsdad;": "⦫",
	"angmsdae;": "⦬",
	"angmsdaf;": "⦭",
	"angmsdag;": "⦮",
	"angmsdah;": "⦯",
	"angrt;": "∟",
	"angrtvb;": "⊾",
	"angrtvbd;": "⦝",
	"angsph;": "∢",
	"angst;": "Å",
	"angzarr;": "⍼",
	"Aogon;": "Ą",
	"aogon;": "ą",
	"Aopf;": "𝔸",
	"aopf;": "𝕒",
	"ap;": "≈",
	"apacir;": "⩯",
	"apE;": "⩰",
	"ape;": "≊",
	"apid;": "≋",
	"apos;": "'",
	"ApplyFunction;": "⁡",
	"approx;": "≈",
	"approxeq;": "≊",
	"Aring;": "Å",
	"Aring": "Å",
	"aring;": "å",
	"aring": "å",
	"Ascr;": "𝒜",
	"ascr;": "𝒶",
	"Assign;": "≔",
	"ast;": "*",
	"asymp;": "≈",
	"asympeq;": "≍",
	"Atilde;": "Ã",
	"Atilde": "Ã",
	"atilde;": "ã",
	"atilde": "ã",
	"Auml;": "Ä",
	"Auml": "Ä",
	"auml;": "ä",
	"auml": "ä",
	"awconint;": "∳",
	"awint;": "⨑",
	"backcong;": "≌",
	"backepsilon;": "϶",
	"backprime;": "‵",
	"backsim;": "∽",
	"backsimeq;": "⋍",
	"Backslash;": "∖",
	"Barv;": "⫧",
	"barvee;": "⊽",
	"Barwed;": "⌆",
	"barwed;": "⌅",
	"barwedge;": "⌅",
	"bbrk;": "⎵",
	"bbrktbrk;": "⎶",
	"bcong;": "≌",
	"Bcy;": "Б",
	"bcy;": "б",
	"bdquo;": "„",
	"becaus;": "∵",
	"Because;": "∵",
	"because;": "∵",
	"bemptyv;": "⦰",
	"bepsi;": "϶",
	"bernou;": "ℬ",
	"Bernoullis;": "ℬ",
	"Beta;": "Β",
	"beta;": "β",
	"beth;": "ℶ",
	"between;": "≬",
	"Bfr;": "𝔅",
	"bfr;": "𝔟",
	"bigcap;": "⋂",
	"bigcirc;": "◯",
	"bigcup;": "⋃",
	"bigodot;": "⨀",
	"bigoplus;": "⨁",
	"bigotimes;": "⨂",
	"bigsqcup;": "⨆",
	"bigstar;": "★",
	"bigtriangledown;": "▽",
	"bigtriangleup;": "△",
	"biguplus;": "⨄",
	"bigvee;": "⋁",
	"bigwedge;": "⋀",
	"bkarow;": "⤍",
	"blacklozenge;": "⧫",
	"blacksquare;": "▪",
	"blacktriangle;": "▴",
	"blacktriangledown;": "▾",
	"blacktriangleleft;": "◂",
	"blacktriangleright;": "▸",
	"blank;": "␣",
	"blk12;": "▒",
	"blk14;": "░",
	"blk34;": "▓",
	"block;": "█",
	"bne;": "=⃥",
	"bnequiv;": "≡⃥",
	"bNot;": "⫭",
	"bnot;": "⌐",
	"Bopf;": "𝔹",
	"bopf;": "𝕓",
	"bot;": "⊥",
	"bottom;": "⊥",
	"bowtie;": "⋈",
	"boxbox;": "⧉",
	"boxDL;": "╗",
	"boxDl;": "╖",
	"boxdL;": "╕",
	"boxdl;": "┐",
	"boxDR;": "╔",
	"boxDr;": "╓",
	"boxdR;": "╒",
	"boxdr;": "┌",
	"boxH;": "═",
	"boxh;": "─",
	"boxHD;": "╦",
	"boxHd;": "╤",
	"boxhD;": "╥",
	"boxhd;": "┬",
	"boxHU;": "╩",
	"boxHu;": "╧",
	"boxhU;": "╨",
	"boxhu;": "┴",
	"boxminus;": "⊟",
	"boxplus;": "⊞",
	"boxtimes;": "⊠",
	"boxUL;": "╝",
	"boxUl;": "╜",
	"boxuL;": "╛",
	"boxul;": "┘",
	"boxUR;": "╚",
	"boxUr;": "╙",
	"boxuR;": "╘",
	"boxur;": "└",
	"boxV;": "║",
	"boxv;": "│",
	"boxVH;": "╬",
	"boxVh;": "╫",
	"boxvH;": "╪",
	"boxvh;": "┼",
	"boxVL;": "╣",
	"boxVl;": "╢",
	"boxvL;": "╡",
	"boxvl;": "┤",
	"boxVR;": "╠",
	"boxVr;": "╟",
	"boxvR;": "╞",
	"boxvr;": "├",
	"bprime;": "‵",
	"Breve;": "˘",
	"breve;": "˘",
	"brvbar;": "¦",
	"brvbar": "¦",
	"Bscr;": "ℬ",
	"bscr;": "𝒷",
	"bsemi;": "⁏",
	"bsim;": "∽",
	"bsime;": "⋍",
	"bsol;": "\\",
	"bsolb;": "⧅",
	"bsolhsub;": "⟈",
	"bull;": "•",
	"bullet;": "•",
	"bump;": "≎",
	"bumpE;": "⪮",
	"bumpe;": "≏",
	"Bumpeq;": "≎",
	"bumpeq;": "≏",
	"Cacute;": "Ć",
	"cacute;": "ć",
	"Cap;": "⋒",
	"cap;": "∩",
	"capand;": "⩄",
	"capbrcup;": "⩉",
	"capcap;": "⩋",
	"capcup;": "⩇",
	"capdot;": "⩀",
	"CapitalDifferentialD;": "ⅅ",
	"caps;": "∩︀",
	"caret;": "⁁",
	"caron;": "ˇ",
	"Cayleys;": "ℭ",
	"ccaps;": "⩍",
	"Ccaron;": "Č",
	"ccaron;": "č",
	"Ccedil;": "Ç",
	"Ccedil": "Ç",
	"ccedil;": "ç",
	"ccedil": "ç",
	"Ccirc;": "Ĉ",
	"ccirc;": "ĉ",
	"Cconint;": "∰",
	"ccups;": "⩌",
	"ccupssm;": "⩐",
	"Cdot;": "Ċ",
	"cdot;": "ċ",
	"cedil;": "¸",
	"cedil": "¸",
	"Cedilla;": "¸",
	"cemptyv;": "⦲",
	"cent;": "¢",
	"cent": "¢",
	"CenterDot;": "·",
	"centerdot;": "·",
	"Cfr;": "ℭ",
	"cfr;": "𝔠",
	"CHcy;": "Ч",
	"chcy;": "ч",
	"check;": "✓",
	"checkmark;": "✓",
	"Chi;": "Χ",
	"chi;": "χ",
	"cir;": "○",
	"circ;": "ˆ",
	"circeq;": "≗",
	"circlearrowleft;": "↺",
	"circlearrowright;": "↻",
	"circledast;": "⊛",
	"circledcirc;": "⊚",
	"circleddash;": "⊝",
	"CircleDot;": "⊙",
	"circledR;": "®",
	"circledS;": "Ⓢ",
	"CircleMinus;": "⊖",
	"CirclePlus;": "⊕",
	"CircleTimes;": "⊗",
	"cirE;": "⧃",
	"cire;": "≗",
	"cirfnint;": "⨐",
	"cirmid;": "⫯",
	"cirscir;": "⧂",
	"ClockwiseContourIntegral;": "∲",
	"CloseCurlyDoubleQuote;": "”",
	"CloseCurlyQuote;": "’",
	"clubs;": "♣",
	"clubsuit;": "♣",
	"Colon;": "∷",
	"colon;": ":",
	"Colone;": "⩴",
	"colone;": "≔",
	"coloneq;": "≔",
	"comma;": ",",
	"commat;": "@",
	"comp;": "∁",
	"compfn;": "∘",
	"complement;": "∁",
	"complexes;": "ℂ",
	"cong;": "≅",
	"congdot;": "⩭",
	"Congruent;": "≡",
	"Conint;": "∯",
	"conint;": "∮",
	"ContourIntegral;": "∮",
	"Copf;": "ℂ",
	"copf;": "𝕔",
	"coprod;": "∐",
	"Coproduct;": "∐",
	"COPY;": "©",
	"COPY": "©",
	"copy;": "©",
	"copy": "©",
	"copysr;": "℗",
	"CounterClockwiseContourIntegral;": "∳",
	"crarr;": "↵",
	"Cross;": "⨯",
	"cross;": "✗",
	"Cscr;": "𝒞",
	"cscr;": "𝒸",
	"csub;": "⫏",
	"csube;": "⫑",
	"csup;": "⫐",
	"csupe;": "⫒",
	"ctdot;": "⋯",
	"cudarrl;": "⤸",
	"cudarrr;": "⤵",
	"cuepr;": "⋞",
	"cuesc;": "⋟",
	"cularr;": "↶",
	"cularrp;": "⤽",
	"Cup;": "⋓",
	"cup;": "∪",
	"cupbrcap;": "⩈",
	"CupCap;": "≍",
	"cupcap;": "⩆",
	"cupcup;": "⩊",
	"cupdot;": "⊍",
	"cupor;": "⩅",
	"cups;": "∪︀",
	"curarr;": "↷",
	"curarrm;": "⤼",
	"curlyeqprec;": "⋞",
	"curlyeqsucc;": "⋟",
	"curlyvee;": "⋎",
	"curlywedge;": "⋏",
	"curren;": "¤",
	"curren": "¤",
	"curvearrowleft;": "↶",
	"curvearrowright;": "↷",
	"cuvee;": "⋎",
	"cuwed;": "⋏",
	"cwconint;": "∲",
	"cwint;": "∱",
	"cylcty;": "⌭",
	"Dagger;": "‡",
	"dagger;": "†",
	"daleth;": "ℸ",
	"Darr;": "↡",
	"dArr;": "⇓",
	"darr;": "↓",
	"dash;": "‐",
	"Dashv;": "⫤",
	"dashv;": "⊣",
	"dbkarow;": "⤏",
	"dblac;": "˝",
	"Dcaron;": "Ď",
	"dcaron;": "ď",
	"Dcy;": "Д",
	"dcy;": "д",
	"DD;": "ⅅ",
	"dd;": "ⅆ",
	"ddagger;": "‡",
	"ddarr;": "⇊",
	"DDotrahd;": "⤑",
	"ddotseq;": "⩷",
	"deg;": "°",
	"deg": "°",
	"Del;": "∇",
	"Delta;": "Δ",
	"delta;": "δ",
	"demptyv;": "⦱",
	"dfisht;": "⥿",
	"Dfr;": "𝔇",
	"dfr;": "𝔡",
	"dHar;": "⥥",
	"dharl;": "⇃",
	"dharr;": "⇂",
	"DiacriticalAcute;": "´",
	"DiacriticalDot;": "˙",
	"DiacriticalDoubleAcute;": "˝",
	"DiacriticalGrave;": "`",
	"DiacriticalTilde;": "˜",
	"diam;": "⋄",
	"Diamond;": "⋄",
	"diamond;": "⋄",
	"diamondsuit;": "♦",
	"diams;": "♦",
	"die;": "¨",
	"DifferentialD;": "ⅆ",
	"digamma;": "ϝ",
	"disin;": "⋲",
	"div;": "÷",
	"divide;": "÷",
	"divide": "÷",
	"divideontimes;": "⋇",
	"divonx;": "⋇",
	"DJcy;": "Ђ",
	"djcy;": "ђ",
	"dlcorn;": "⌞",
	"dlcrop;": "⌍",
	"dollar;": "$",
	"Dopf;": "𝔻",
	"dopf;": "𝕕",
	"Dot;": "¨",
	"dot;": "˙",
	"DotDot;": "⃜",
	"doteq;": "≐",
	"doteqdot;": "≑",
	"DotEqual;": "≐",
	"dotminus;": "∸",
	"dotplus;": "∔",
	"dotsquare;": "⊡",
	"doublebarwedge;": "⌆",
	"DoubleContourIntegral;": "∯",
	"DoubleDot;": "¨",
	"DoubleDownArrow;": "⇓",
	"DoubleLeftArrow;": "⇐",
	"DoubleLeftRightArrow;": "⇔",
	"DoubleLeftTee;": "⫤",
	"DoubleLongLeftArrow;": "⟸",
	"DoubleLongLeftRightArrow;": "⟺",
	"DoubleLongRightArrow;": "⟹",
	"DoubleRightArrow;": "⇒",
	"DoubleRightTee;": "⊨",
	"DoubleUpArrow;": "⇑",
	"DoubleUpDownArrow;": "⇕",
	"DoubleVerticalBar;": "∥",
	"DownArrow;": "↓",
	"Downarrow;": "⇓",
	"downarrow;": "↓",
	"DownArrowBar;": "⤓",
	"DownArrowUpArrow;": "⇵",
	"DownBreve;": "̑",
	"downdownarrows;": "⇊",
	"downharpoonleft;": "⇃",
	"downharpoonright;": "⇂",
	"DownLeftRightVector;": "⥐",
	"DownLeftTeeVector;": "⥞",
	"DownLeftVector;": "↽",
	"DownLeftVectorBar;": "⥖",
	"DownRightTeeVector;": "⥟",
	"DownRightVector;": "⇁",
	"DownRightVectorBar;": "⥗",
	"DownTee;": "⊤",
	"DownTeeArrow;": "↧",
	"drbkarow;": "⤐",
	"drcorn;": "⌟",
	"drcrop;": "⌌",
	"Dscr;": "𝒟",
	"dscr;": "𝒹",
	"DScy;": "Ѕ",
	"dscy;": "ѕ",
	"dsol;": "⧶",
	"Dstrok;": "Đ",
	"dstrok;": "đ",
	"dtdot;": "⋱",
	"dtri;": "▿",
	"dtrif;": "▾",
	"duarr;": "⇵",
	"duhar;": "⥯",
	"dwangle;": "⦦",
	"DZcy;": "Џ",
	"dzcy;": "џ",
	"dzigrarr;": "⟿",
	"Eacute;": "É",
	"Eacute": "É",
	"eacute;": "é",
	"eacute": "é",
	"easter;": "⩮",
	"Ecaron;": "Ě",
	"ecaron;": "ě",
	"ecir;": "≖",
	"Ecirc;": "Ê",
	"Ecirc": "Ê",
	"ecirc;": "ê",
	"ecirc": "ê",
	"ecolon;": "≕",
	"Ecy;": "Э",
	"ecy;": "э",
	"eDDot;": "⩷",
	"Edot;": "Ė",
	"eDot;": "≑",
	"edot;": "ė",
	"ee;": "ⅇ",
	"efDot;": "≒",
	"Efr;": "𝔈",
	"efr;": "𝔢",
	"eg;": "⪚",
	"Egrave;": "È",
	"Egrave": "È",
	"egrave;": "è",
	"egrave": "è",
	"egs;": "⪖",
	"egsdot;": "⪘",
	"el;": "⪙",
	"Element;": "∈",
	"elinters;": "⏧",
	"ell;": "ℓ",
	"els;": "⪕",
	"elsdot;": "⪗",
	"Emacr;": "Ē",
	"emacr;": "ē",
	"empty;": "∅",
	"emptyset;": "∅",
	"EmptySmallSquare;": "◻",
	"emptyv;": "∅",
	"EmptyVerySmallSquare;": "▫",
	"emsp;": " ",
	"emsp13;": " ",
	"emsp14;": " ",
	"ENG;": "Ŋ",
	"eng;": "ŋ",
	"ensp;": " ",
	"Eogon;": "Ę",
	"eogon;": "ę",
	"Eopf;": "𝔼",
	"eopf;": "𝕖",
	"epar;": "⋕",
	"eparsl;": "⧣",
	"eplus;": "⩱",
	"epsi;": "ε",
	"Epsilon;": "Ε",
	"epsilon;": "ε",
	"epsiv;": "ϵ",
	"eqcirc;": "≖",
	"eqcolon;": "≕",
	"eqsim;": "≂",
	"eqslantgtr;": "⪖",
	"eqslantless;": "⪕",
	"Equal;": "⩵",
	"equals;": "=",
	"EqualTilde;": "≂",
	"equest;": "≟",
	"Equilibrium;": "⇌",
	"equiv;": "≡",
	"equivDD;": "⩸",
	"eqvparsl;": "⧥",
	"erarr;": "⥱",
	"erDot;": "≓",
	"Escr;": "ℰ",
	"escr;": "ℯ",
	"esdot;": "≐",
	"Esim;": "⩳",
	"esim;": "≂",
	"Eta;": "Η",
	"eta;": "η",
	"ETH;": "Ð",
	"ETH": "Ð",
	"eth;": "ð",
	"eth": "ð",
	"Euml;": "Ë",
	"Euml": "Ë",
	"euml;": "ë",
	"euml": "ë",
	"euro;": "€",
	"excl;": "!",
	"exist;": "∃",
	"Exists;": "∃",
	"expectation;": "ℰ",
	"ExponentialE;": "ⅇ",
	"exponentiale;": "ⅇ",
	"fallingdotseq;": "≒",
	"Fcy;": "Ф",
	"fcy;": "ф",
	"female;": "♀",
	"ffilig;": "ﬃ",
	"fflig;": "ﬀ",
	"ffllig;": "ﬄ",
	"Ffr;": "𝔉",
	"ffr;": "𝔣",
	"filig;": "ﬁ",
	"FilledSmallSquare;": "◼",
	"FilledVerySmallSquare;": "▪",
	"fjlig;": "fj",
	"flat;": "♭",
	"fllig;": "ﬂ",
	"fltns;": "▱",
	"fnof;": "ƒ",
	"Fopf;": "𝔽",
	"fopf;": "𝕗",
	"ForAll;": "∀",
	"forall;": "∀",
	"fork;": "⋔",
	"forkv;": "⫙",
	"Fouriertrf;": "ℱ",
	"fpartint;": "⨍",
	"frac12;": "½",
	"frac12": "½",
	"frac13;": "⅓",
	"frac14;": "¼",
	"frac14": "¼",
	"frac15;": "⅕",
	"frac16;": "⅙",
	"frac18;": "⅛",
	"frac23;": "⅔",
	"frac25;": "⅖",
	"frac34;": "¾",
	"frac34": "¾",
	"frac35;": "⅗",
	"frac38;": "⅜",
	"frac45;": "⅘",
	"frac56;": "⅚",
	"frac58;": "⅝",
	"frac78;": "⅞",
	"frasl;": "⁄",
	"frown;": "⌢",
	"Fscr;": "ℱ",
	"fscr;": "𝒻",
	"gacute;": "ǵ",
	"Gamma;": "Γ",
	"gamma;": "γ",
	"Gammad;": "Ϝ",
	"gammad;": "ϝ",
	"gap;": "⪆",
	"Gbreve;": "Ğ",
	"gbreve;": "ğ",
	"Gcedil;": "Ģ",
	"Gcirc;": "Ĝ",
	"gcirc;": "ĝ",
	"Gcy;": "Г",
	"gcy;": "г",
	"Gdot;": "Ġ",
	"gdot;": "ġ",
	"gE;": "≧",
	"ge;": "≥",
	"gEl;": "⪌",
	"gel;": "⋛",
	"geq;": "≥",
	"geqq;": "≧",
	"geqslant;": "⩾",
	"ges;": "⩾",
	"gescc;": "⪩",
	"gesdot;": "⪀",
	"gesdoto;": "⪂",
	"gesdotol;": "⪄",
	"gesl;": "⋛︀",
	"gesles;": "⪔",
	"Gfr;": "𝔊",
	"gfr;": "𝔤",
	"Gg;": "⋙",
	"gg;": "≫",
	"ggg;": "⋙",
	"gimel;": "ℷ",
	"GJcy;": "Ѓ",
	"gjcy;": "ѓ",
	"gl;": "≷",
	"gla;": "⪥",
	"glE;": "⪒",
	"glj;": "⪤",
	"gnap;": "⪊",
	"gnapprox;": "⪊",
	"gnE;": "≩",
	"gne;": "⪈",
	"gneq;": "⪈",
	"gneqq;": "≩",
	"gnsim;": "⋧",
	"Gopf;": "𝔾",
	"gopf;": "𝕘",
	"grave;": "`",
	"GreaterEqual;": "≥",
	"GreaterEqualLess;": "⋛",
	"GreaterFullEqual;": "≧",
	"GreaterGreater;": "⪢",
	"GreaterLess;": "≷",
	"GreaterSlantEqual;": "⩾",
	"GreaterTilde;": "≳",
	"Gscr;": "𝒢",
	"gscr;": "ℊ",
	"gsim;": "≳",
	"gsime;": "⪎",
	"gsiml;": "⪐",
	"GT;": ">",
	"GT": ">",
	"Gt;": "≫",
	"gt;": ">",
	"gt": ">",
	"gtcc;": "⪧",
	"gtcir;": "⩺",
	"gtdot;": "⋗",
	"gtlPar;": "⦕",
	"gtquest;": "⩼",
	"gtrapprox;": "⪆",
	"gtrarr;": "⥸",
	"gtrdot;": "⋗",
	"gtreqless;": "⋛",
	"gtreqqless;": "⪌",
	"gtrless;": "≷",
	"gtrsim;": "≳",
	"gvertneqq;": "≩︀",
	"gvnE;": "≩︀",
	"Hacek;": "ˇ",
	"hairsp;": " ",
	"half;": "½",
	"hamilt;": "ℋ",
	"HARDcy;": "Ъ",
	"hardcy;": "ъ",
	"hArr;": "⇔",
	"harr;": "↔",
	"harrcir;": "⥈",
	"harrw;": "↭",
	"Hat;": "^",
	"hbar;": "ℏ",
	"Hcirc;": "Ĥ",
	"hcirc;": "ĥ",
	"hearts;": "♥",
	"heartsuit;": "♥",
	"hellip;": "…",
	"hercon;": "⊹",
	"Hfr;": "ℌ",
	"hfr;": "𝔥",
	"HilbertSpace;": "ℋ",
	"hksearow;": "⤥",
	"hkswarow;": "⤦",
	"hoarr;": "⇿",
	"homtht;": "∻",
	"hookleftarrow;": "↩",
	"hookrightarrow;": "↪",
	"Hopf;": "ℍ",
	"hopf;": "𝕙",
	"horbar;": "―",
	"HorizontalLine;": "─",
	"Hscr;": "ℋ",
	"hscr;": "𝒽",
	"hslash;": "ℏ",
	"Hstrok;": "Ħ",
	"hstrok;": "ħ",
	"HumpDownHump;": "≎",
	"HumpEqual;": "≏",
	"hybull;": "⁃",
	"hyphen;": "‐",
	"Iacute;": "Í",
	"Iacute": "Í",
	"iacute;": "í",
	"iacute": "í",
	"ic;": "⁣",
	"Icirc;": "Î",
	"Icirc": "Î",
	"icirc;": "î",
	"icirc": "î",
	"Icy;": "И",
	"icy;": "и",
	"Idot;": "İ",
	"IEcy;": "Е",
	"iecy;": "е",
	"iexcl;": "¡",
	"iexcl": "¡",
	"iff;": "⇔",
	"Ifr;": "ℑ",
	"ifr;": "𝔦",
	"Igrave;": "Ì",
	"Igrave": "Ì",
	"igrave;": "ì",
	"igrave": "ì",
	"ii;": "ⅈ",
	"iiiint;": "⨌",
	"iiint;": "∭",
	"iinfin;": "⧜",
	"iiota;": "℩",
	"IJlig;": "Ĳ",
	"ijlig;": "ĳ",
	"Im;": "ℑ",
	"Imacr;": "Ī",
	"imacr;": "ī",
	"image;": "ℑ",
	"ImaginaryI;": "ⅈ",
	"imagline;": "ℐ",
	"imagpart;": "ℑ",
	"imath;": "ı",
	"imof;": "⊷",
	"imped;": "Ƶ",
	"Implies;": "⇒",
	"in;": "∈",
	"incare;": "℅",
	"infin;": "∞",
	"infintie;": "⧝",
	"inodot;": "ı",
	"Int;": "∬",
	"int;": "∫",
	"intcal;": "⊺",
	"integers;": "ℤ",
	"Integral;": "∫",
	"intercal;": "⊺",
	"Intersection;": "⋂",
	"intlarhk;": "⨗",
	"intprod;": "⨼",
	"InvisibleComma;": "⁣",
	"InvisibleTimes;": "⁢",
	"IOcy;": "Ё",
	"iocy;": "ё",
	"Iogon;": "Į",
	"iogon;": "į",
	"Iopf;": "𝕀",
	"iopf;": "𝕚",
	"Iota;": "Ι",
	"iota;": "ι",
	"iprod;": "⨼",
	"iquest;": "¿",
	"iquest": "¿",
	"Iscr;": "ℐ",
	"iscr;": "𝒾",
	"isin;": "∈",
	"isindot;": "⋵",
	"isinE;": "⋹",
	"isins;": "⋴",
	"isinsv;": "⋳",
	"isinv;": "∈",
	"it;": "⁢",
	"Itilde;": "Ĩ",
	"itilde;": "ĩ",
	"Iukcy;": "І",
	"iukcy;": "і",
	"Iuml;": "Ï",
	"Iuml": "Ï",
	"iuml;": "ï",
	"iuml": "ï",
	"Jcirc;": "Ĵ",
	"jcirc;": "ĵ",
	"Jcy;": "Й",
	"jcy;": "й",
	"Jfr;": "𝔍",
	"jfr;": "𝔧",
	"jmath;": "ȷ",
	"Jopf;": "𝕁",
	"jopf;": "𝕛",
	"Jscr;": "𝒥",
	"jscr;": "𝒿",
	"Jsercy;": "Ј",
	"jsercy;": "ј",
	"Jukcy;": "Є",
	"jukcy;": "є",
	"Kappa;": "Κ",
	"kappa;": "κ",
	"kappav;": "ϰ",
	"Kcedil;": "Ķ",
	"kcedil;": "ķ",
	"Kcy;": "К",
	"kcy;": "к",
	"Kfr;": "𝔎",
	"kfr;": "𝔨",
	"kgreen;": "ĸ",
	"KHcy;": "Х",
	"khcy;": "х",
	"KJcy;": "Ќ",
	"kjcy;": "ќ",
	"Kopf;": "𝕂",
	"kopf;": "𝕜",
	"Kscr;": "𝒦",
	"kscr;": "𝓀",
	"lAarr;": "⇚",
	"Lacute;": "Ĺ",
	"lacute;": "ĺ",
	"laemptyv;": "⦴",
	"lagran;": "ℒ",
	"Lambda;": "Λ",
	"lambda;": "λ",
	"Lang;": "⟪",
	"lang;": "⟨",
	"langd;": "⦑",
	"langle;": "⟨",
	"lap;": "⪅",
	"Laplacetrf;": "ℒ",
	"laquo;": "«",
	"laquo": "«",
	"Larr;": "↞",
	"lArr;": "⇐",
	"larr;": "←",
	"larrb;": "⇤",
	"larrbfs;": "⤟",
	"larrfs;": "⤝",
	"larrhk;": "↩",
	"larrlp;": "↫",
	"larrpl;": "⤹",
	"larrsim;": "⥳",
	"larrtl;": "↢",
	"lat;": "⪫",
	"lAtail;": "⤛",
	"latail;": "⤙",
	"late;": "⪭",
	"lates;": "⪭︀",
	"lBarr;": "⤎",
	"lbarr;": "⤌",
	"lbbrk;": "❲",
	"lbrace;": "{",
	"lbrack;": "[",
	"lbrke;": "⦋",
	"lbrksld;": "⦏",
	"lbrkslu;": "⦍",
	"Lcaron;": "Ľ",
	"lcaron;": "ľ",
	"Lcedil;": "Ļ",
	"lcedil;": "ļ",
	"lceil;": "⌈",
	"lcub;": "{",
	"Lcy;": "Л",
	"lcy;": "л",
	"ldca;": "⤶",
	"ldquo;": "“",
	"ldquor;": "„",
	"ldrdhar;": "⥧",
	"ldrushar;": "⥋",
	"ldsh;": "↲",
	"lE;": "≦",
	"le;": "≤",
	"LeftAngleBracket;": "⟨",
	"LeftArrow;": "←",
	"Leftarrow;": "⇐",
	"leftarrow;": "←",
	"LeftArrowBar;": "⇤",
	"LeftArrowRightArrow;": "⇆",
	"leftarrowtail;": "↢",
	"LeftCeiling;": "⌈",
	"LeftDoubleBracket;": "⟦",
	"LeftDownTeeVector;": "⥡",
	"LeftDownVector;": "⇃",
	"LeftDownVectorBar;": "⥙",
	"LeftFloor;": "⌊",
	"leftharpoondown;": "↽",
	"leftharpoonup;": "↼",
	"leftleftarrows;": "⇇",
	"LeftRightArrow;": "↔",
	"Leftrightarrow;": "⇔",
	"leftrightarrow;": "↔",
	"leftrightarrows;": "⇆",
	"leftrightharpoons;": "⇋",
	"leftrightsquigarrow;": "↭",
	"LeftRightVector;": "⥎",
	"LeftTee;": "⊣",
	"LeftTeeArrow;": "↤",
	"LeftTeeVector;": "⥚",
	"leftthreetimes;": "⋋",
	"LeftTriangle;": "⊲",
	"LeftTriangleBar;": "⧏",
	"LeftTriangleEqual;": "⊴",
	"LeftUpDownVector;": "⥑",
	"LeftUpTeeVector;": "⥠",
	"LeftUpVector;": "↿",
	"LeftUpVectorBar;": "⥘",
	"LeftVector;": "↼",
	"LeftVectorBar;": "⥒",
	"lEg;": "⪋",
	"leg;": "⋚",
	"leq;": "≤",
	"leqq;": "≦",
	"leqslant;": "⩽",
	"les;": "⩽",
	"lescc;": "⪨",
	"lesdot;": "⩿",
	"lesdoto;": "⪁",
	"lesdotor;": "⪃",
	"lesg;": "⋚︀",
	"lesges;": "⪓",
	"lessapprox;": "⪅",
	"lessdot;": "⋖",
	"lesseqgtr;": "⋚",
	"lesseqqgtr;": "⪋",
	"LessEqualGreater;": "⋚",
	"LessFullEqual;": "≦",
	"LessGreater;": "≶",
	"lessgtr;": "≶",
	"LessLess;": "⪡",
	"lesssim;": "≲",
	"LessSlantEqual;": "⩽",
	"LessTilde;": "≲",
	"lfisht;": "⥼",
	"lfloor;": "⌊",
	"Lfr;": "𝔏",
	"lfr;": "𝔩",
	"lg;": "≶",
	"lgE;": "⪑",
	"lHar;": "⥢",
	"lhard;": "↽",
	"lharu;": "↼",
	"lharul;": "⥪",
	"lhblk;": "▄",
	"LJcy;": "Љ",
	"ljcy;": "љ",
	"Ll;": "⋘",
	"ll;": "≪",
	"llarr;": "⇇",
	"llcorner;": "⌞",
	"Lleftarrow;": "⇚",
	"llhard;": "⥫",
	"lltri;": "◺",
	"Lmidot;": "Ŀ",
	"lmidot;": "ŀ",
	"lmoust;": "⎰",
	"lmoustache;": "⎰",
	"lnap;": "⪉",
	"lnapprox;": "⪉",
	"lnE;": "≨",
	"lne;": "⪇",
	"lneq;": "⪇",
	"lneqq;": "≨",
	"lnsim;": "⋦",
	"loang;": "⟬",
	"loarr;": "⇽",
	"lobrk;": "⟦",
	"LongLeftArrow;": "⟵",
	"Longleftarrow;": "⟸",
	"longleftarrow;": "⟵",
	"LongLeftRightArrow;": "⟷",
	"Longleftrightarrow;": "⟺",
	"longleftrightarrow;": "⟷",
	"longmapsto;": "⟼",
	"LongRightArrow;": "⟶",
	"Longrightarrow;": "⟹",
	"longrightarrow;": "⟶",
	"looparrowleft;": "↫",
	"looparrowright;": "↬",
	"lopar;": "⦅",
	"Lopf;": "𝕃",
	"lopf;": "𝕝",
	"loplus;": "⨭",
	"lotimes;": "⨴",
	"lowast;": "∗",
	"lowbar;": "_",
	"LowerLeftArrow;": "↙",
	"LowerRightArrow;": "↘",
	"loz;": "◊",
	"lozenge;": "◊",
	"lozf;": "⧫",
	"lpar;": "(",
	"lparlt;": "⦓",
	"lrarr;": "⇆",
	"lrcorner;": "⌟",
	"lrhar;": "⇋",
	"lrhard;": "⥭",
	"lrm;": "‎",
	"lrtri;": "⊿",
	"lsaquo;": "‹",
	"Lscr;": "ℒ",
	"lscr;": "𝓁",
	"Lsh;": "↰",
	"lsh;": "↰",
	"lsim;": "≲",
	"lsime;": "⪍",
	"lsimg;": "⪏",
	"lsqb;": "[",
	"lsquo;": "‘",
	"lsquor;": "‚",
	"Lstrok;": "Ł",
	"lstrok;": "ł",
	"LT;": "<",
	"LT": "<",
	"Lt;": "≪",
	"lt;": "<",
	"lt": "<",
	"ltcc;": "⪦",
	"ltcir;": "⩹",
	"ltdot;": "⋖",
	"lthree;": "⋋",
	"ltimes;": "⋉",
	"ltlarr;": "⥶",
	"ltquest;": "⩻",
	"ltri;": "◃",
	"ltrie;": "⊴",
	"ltrif;": "◂",
	"ltrPar;": "⦖",
	"lurdshar;": "⥊",
	"luruhar;": "⥦",
	"lvertneqq;": "≨︀",
	"lvnE;": "≨︀",
	"macr;": "¯",
	"macr": "¯",
	"male;": "♂",
	"malt;": "✠",
	"maltese;": "✠",
	"Map;": "⤅",
	"map;": "↦",
	"mapsto;": "↦",
	"mapstodown;": "↧",
	"mapstoleft;": "↤",
	"mapstoup;": "↥",
	"marker;": "▮",
	"mcomma;": "⨩",
	"Mcy;": "М",
	"mcy;": "м",
	"mdash;": "—",
	"mDDot;": "∺",
	"measuredangle;": "∡",
	"MediumSpace;": " ",
	"Mellintrf;": "ℳ",
	"Mfr;": "𝔐",
	"mfr;": "𝔪",
	"mho;": "℧",
	"micro;": "µ",
	"micro": "µ",
	"mid;": "∣",
	"midast;": "*",
	"midcir;": "⫰",
	"middot;": "·",
	"middot": "·",
	"minus;": "−",
	"minusb;": "⊟",
	"minusd;": "∸",
	"minusdu;": "⨪",
	"MinusPlus;": "∓",
	"mlcp;": "⫛",
	"mldr;": "…",
	"mnplus;": "∓",
	"models;": "⊧",
	"Mopf;": "𝕄",
	"mopf;": "𝕞",
	"mp;": "∓",
	"Mscr;": "ℳ",
	"mscr;": "𝓂",
	"mstpos;": "∾",
	"Mu;": "Μ",
	"mu;": "μ",
	"multimap;": "⊸",
	"mumap;": "⊸",
	"nabla;": "∇",
	"Nacute;": "Ń",
	"nacute;": "ń",
	"nang;": "∠⃒",
	"nap;": "≉",
	"napE;": "⩰̸",
	"napid;": "≋̸",
	"napos;": "ŉ",
	"napprox;": "≉",
	"natur;": "♮",
	"natural;": "♮",
	"naturals;": "ℕ",
	"nbsp;": " ",
	"nbsp": " ",
	"nbump;": "≎̸",
	"nbumpe;": "≏̸",
	"ncap;": "⩃",
	"Ncaron;": "Ň",
	"ncaron;": "ň",
	"Ncedil;": "Ņ",
	"ncedil;": "ņ",
	"ncong;": "≇",
	"ncongdot;": "⩭̸",
	"ncup;": "⩂",
	"Ncy;": "Н",
	"ncy;": "н",
	"ndash;": "–",
	"ne;": "≠",
	"nearhk;": "⤤",
	"neArr;": "⇗",
	"nearr;": "↗",
	"nearrow;": "↗",
	"nedot;": "≐̸",
	"NegativeMediumSpace;": "​",
	"NegativeThickSpace;": "​",
	"NegativeThinSpace;": "​",
	"NegativeVeryThinSpace;": "​",
	"nequiv;": "≢",
	"nesear;": "⤨",
	"nesim;": "≂̸",
	"NestedGreaterGreater;": "≫",
	"NestedLessLess;": "≪",
	"NewLine;": "\n",
	"nexist;": "∄",
	"nexists;": "∄",
	"Nfr;": "𝔑",
	"nfr;": "𝔫",
	"ngE;": "≧̸",
	"nge;": "≱",
	"ngeq;": "≱",
	"ngeqq;": "≧̸",
	"ngeqslant;": "⩾̸",
	"nges;": "⩾̸",
	"nGg;": "⋙̸",
	"ngsim;": "≵",
	"nGt;": "≫⃒",
	"ngt;": "≯",
	"ngtr;": "≯",
	"nGtv;": "≫̸",
	"nhArr;": "⇎",
	"nharr;": "↮",
	"nhpar;": "⫲",
	"ni;": "∋",
	"nis;": "⋼",
	"nisd;": "⋺",
	"niv;": "∋",
	"NJcy;": "Њ",
	"njcy;": "њ",
	"nlArr;": "⇍",
	"nlarr;": "↚",
	"nldr;": "‥",
	"nlE;": "≦̸",
	"nle;": "≰",
	"nLeftarrow;": "⇍",
	"nleftarrow;": "↚",
	"nLeftrightarrow;": "⇎",
	"nleftrightarrow;": "↮",
	"nleq;": "≰",
	"nleqq;": "≦̸",
	"nleqslant;": "⩽̸",
	"nles;": "⩽̸",
	"nless;": "≮",
	"nLl;": "⋘̸",
	"nlsim;": "≴",
	"nLt;": "≪⃒",
	"nlt;": "≮",
	"nltri;": "⋪",
	"nltrie;": "⋬",
	"nLtv;": "≪̸",
	"nmid;": "∤",
	"NoBreak;": "⁠",
	"NonBreakingSpace;": " ",
	"Nopf;": "ℕ",
	"nopf;": "𝕟",
	"Not;": "⫬",
	"not;": "¬",
	"not": "¬",
	"NotCongruent;": "≢",
	"NotCupCap;": "≭",
	"NotDoubleVerticalBar;": "∦",
	"NotElement;": "∉",
	"NotEqual;": "≠",
	"NotEqualTilde;": "≂̸",
	"NotExists;": "∄",
	"NotGreater;": "≯",
	"NotGreaterEqual;": "≱",
	"NotGreaterFullEqual;": "≧̸",
	"NotGreaterGreater;": "≫̸",
	"NotGreaterLess;": "≹",
	"NotGreaterSlantEqual;": "⩾̸",
	"NotGreaterTilde;": "≵",
	"NotHumpDownHump;": "≎̸",
	"NotHumpEqual;": "≏̸",
	"notin;": "∉",
	"notindot;": "⋵̸",
	"notinE;": "⋹̸",
	"notinva;": "∉",
	"notinvb;": "⋷",
	"notinvc;": "⋶",
	"NotLeftTriangle;": "⋪",
	"NotLeftTriangleBar;": "⧏̸",
	"NotLeftTriangleEqual;": "⋬",
	"NotLess;": "≮",
	"NotLessEqual;": "≰",
	"NotLessGreater;": "≸",
	"NotLessLess;": "≪̸",
	"NotLessSlantEqual;": "⩽̸",
	"NotLessTilde;": "≴",
	"NotNestedGreaterGreater;": "⪢̸",
	"NotNestedLessLess;": "⪡̸",
	"notni;": "∌",
	"notniva;": "∌",
	"notnivb;": "⋾",
	"notnivc;": "⋽",
	"NotPrecedes;": "⊀",
	"NotPrecedesEqual;": "⪯̸",
	"NotPrecedesSlantEqual;": "⋠",
	"NotReverseElement;": "∌",
	"NotRightTriangle;": "⋫",
	"NotRightTriangleBar;": "⧐̸",
	"NotRightTriangleEqual;": "⋭",
	"NotSquareSubset;": "⊏̸",
	"NotSquareSubsetEqual;": "⋢",
	"NotSquareSuperset;": "⊐̸",
	"NotSquareSupersetEqual;": "⋣",
	"NotSubset;": "⊂⃒",
	"NotSubsetEqual;": "⊈",
	"NotSucceeds;": "⊁",
	"NotSucceedsEqual;": "⪰̸",
	"NotSucceedsSlantEqual;": "⋡",
	"NotSucceedsTilde;": "≿̸",
	"NotSuperset;": "⊃⃒",
	"NotSupersetEqual;": "⊉",
	"NotTilde;": "≁",
	"NotTildeEqual;": "≄",
	"NotTildeFullEqual;": "≇",
	"NotTildeTilde;": "≉",
	"NotVerticalBar;": "∤",
	"npar;": "∦",
	"nparallel;": "∦",
	"nparsl;": "⫽⃥",
	"npart;": "∂̸",
	"npolint;": "⨔",
	"npr;": "⊀",
	"nprcue;": "⋠",
	"npre;": "⪯̸",
	"nprec;": "⊀",
	"npreceq;": "⪯̸",
	"nrArr;": "⇏",
	"nrarr;": "↛",
	"nrarrc;": "⤳̸",
	"nrarrw;": "↝̸",
	"nRightarrow;": "⇏",
	"nrightarrow;": "↛",
	"nrtri;": "⋫",
	"nrtrie;": "⋭",
	"nsc;": "⊁",
	"nsccue;": "⋡",
	"nsce;": "⪰̸",
	"Nscr;": "𝒩",
	"nscr;": "𝓃",
	"nshortmid;": "∤",
	"nshortparallel;": "∦",
	"nsim;": "≁",
	"nsime;": "≄",
	"nsimeq;": "≄",
	"nsmid;": "∤",
	"nspar;": "∦",
	"nsqsube;": "⋢",
	"nsqsupe;": "⋣",
	"nsub;": "⊄",
	"nsubE;": "⫅̸",
	"nsube;": "⊈",
	"nsubset;": "⊂⃒",
	"nsubseteq;": "⊈",
	"nsubseteqq;": "⫅̸",
	"nsucc;": "⊁",
	"nsucceq;": "⪰̸",
	"nsup;": "⊅",
	"nsupE;": "⫆̸",
	"nsupe;": "⊉",
	"nsupset;": "⊃⃒",
	"nsupseteq;": "⊉",
	"nsupseteqq;": "⫆̸",
	"ntgl;": "≹",
	"Ntilde;": "Ñ",
	"Ntilde": "Ñ",
	"ntilde;": "ñ",
	"ntilde": "ñ",
	"ntlg;": "≸",
	"ntriangleleft;": "⋪",
	"ntrianglelefteq;": "⋬",
	"ntriangleright;": "⋫",
	"ntrianglerighteq;": "⋭",
	"Nu;": "Ν",
	"nu;": "ν",
	"num;": "#",
	"numero;": "№",
	"numsp;": " ",
	"nvap;": "≍⃒",
	"nVDash;": "⊯",
	"nVdash;": "⊮",
	"nvDash;": "⊭",
	"nvdash;": "⊬",
	"nvge;": "≥⃒",
	"nvgt;": ">⃒",
	"nvHarr;": "⤄",
	"nvinfin;": "⧞",
	"nvlArr;": "⤂",
	"nvle;": "≤⃒",
	"nvlt;": "<⃒",
	"nvltrie;": "⊴⃒",
	"nvrArr;": "⤃",
	"nvrtrie;": "⊵⃒",
	"nvsim;": "∼⃒",
	"nwarhk;": "⤣",
	"nwArr;": "⇖",
	"nwarr;": "↖",
	"nwarrow;": "↖",
	"nwnear;": "⤧",
	"Oacute;": "Ó",
	"Oacute": "Ó",
	"oacute;": "ó",
	"oacute": "ó",
	"oast;": "⊛",
	"ocir;": "⊚",
	"Ocirc;": "Ô",
	"Ocirc": "Ô",
	"ocirc;": "ô",
	"ocirc": "ô",
	"Ocy;": "О",
	"ocy;": "о",
	"odash;": "⊝",
	"Odblac;": "Ő",
	"odblac;": "ő",
	"odiv;": "⨸",
	"odot;": "⊙",
	"odsold;": "⦼",
	"OElig;": "Œ",
	"oelig;": "œ",
	"ofcir;": "⦿",
	"Ofr;": "𝔒",
	"ofr;": "𝔬",
	"ogon;": "˛",
	"Ograve;": "Ò",
	"Ograve": "Ò",
	"ograve;": "ò",
	"ograve": "ò",
	"ogt;": "⧁",
	"ohbar;": "⦵",
	"ohm;": "Ω",
	"oint;": "∮",
	"olarr;": "↺",
	"olcir;": "⦾",
	"olcross;": "⦻",
	"oline;": "‾",
	"olt;": "⧀",
	"Omacr;": "Ō",
	"omacr;": "ō",
	"Omega;": "Ω",
	"omega;": "ω",
	"Omicron;": "Ο",
	"omicron;": "ο",
	"omid;": "⦶",
	"ominus;": "⊖",
	"Oopf;": "𝕆",
	"oopf;": "𝕠",
	"opar;": "⦷",
	"OpenCurlyDoubleQuote;": "“",
	"OpenCurlyQuote;": "‘",
	"operp;": "⦹",
	"oplus;": "⊕",
	"Or;": "⩔",
	"or;": "∨",
	"orarr;": "↻",
	"ord;": "⩝",
	"order;": "ℴ",
	"orderof;": "ℴ",
	"ordf;": "ª",
	"ordf": "ª",
	"ordm;": "º",
	"ordm": "º",
	"origof;": "⊶",
	"oror;": "⩖",
	"orslope;": "⩗",
	"orv;": "⩛",
	"oS;": "Ⓢ",
	"Oscr;": "𝒪",
	"oscr;": "ℴ",
	"Oslash;": "Ø",
	"Oslash": "Ø",
	"oslash;": "ø",
	"oslash": "ø",
	"osol;": "⊘",
	"Otilde;": "Õ",
	"Otilde": "Õ",
	"otilde;": "õ",
	"otilde": "õ",
	"Otimes;": "⨷",
	"otimes;": "⊗",
	"otimesas;": "⨶",
	"Ouml;": "Ö",
	"Ouml": "Ö",
	"ouml;": "ö",
	"ouml": "ö",
	"ovbar;": "⌽",
	"OverBar;": "‾",
	"OverBrace;": "⏞",
	"OverBracket;": "⎴",
	"OverParenthesis;": "⏜",
	"par;": "∥",
	"para;": "¶",
	"para": "¶",
	"parallel;": "∥",
	"parsim;": "⫳",
	"parsl;": "⫽",
	"part;": "∂",
	"PartialD;": "∂",
	"Pcy;": "П",
	"pcy;": "п",
	"percnt;": "%",
	"period;": ".",
	"permil;": "‰",
	"perp;": "⊥",
	"pertenk;": "‱",
	"Pfr;": "𝔓",
	"pfr;": "𝔭",
	"Phi;": "Φ",
	"phi;": "φ",
	"phiv;": "ϕ",
	"phmmat;": "ℳ",
	"phone;": "☎",
	"Pi;": "Π",
	"pi;": "π",
	"pitchfork;": "⋔",
	"piv;": "ϖ",
	"planck;": "ℏ",
	"planckh;": "ℎ",
	"plankv;": "ℏ",
	"plus;": "+",
	"plusacir;": "⨣",
	"plusb;": "⊞",
	"pluscir;": "⨢",
	"plusdo;": "∔",
	"plusdu;": "⨥",
	"pluse;": "⩲",
	"PlusMinus;": "±",
	"plusmn;": "±",
	"plusmn": "±",
	"plussim;": "⨦",
	"plustwo;": "⨧",
	"pm;": "±",
	"Poincareplane;": "ℌ",
	"pointint;": "⨕",
	"Popf;": "ℙ",
	"popf;": "𝕡",
	"pound;": "£",
	"pound": "£",
	"Pr;": "⪻",
	"pr;": "≺",
	"prap;": "⪷",
	"prcue;": "≼",
	"prE;": "⪳",
	"pre;": "⪯",
	"prec;": "≺",
	"precapprox;": "⪷",
	"preccurlyeq;": "≼",
	"Precedes;": "≺",
	"PrecedesEqual;": "⪯",
	"PrecedesSlantEqual;": "≼",
	"PrecedesTilde;": "≾",
	"preceq;": "⪯",
	"precnapprox;": "⪹",
	"precneqq;": "⪵",
	"precnsim;": "⋨",
	"precsim;": "≾",
	"Prime;": "″",
	"prime;": "′",
	"primes;": "ℙ",
	"prnap;": "⪹",
	"prnE;": "⪵",
	"prnsim;": "⋨",
	"prod;": "∏",
	"Product;": "∏",
	"profalar;": "⌮",
	"profline;": "⌒",
	"profsurf;": "⌓",
	"prop;": "∝",
	"Proportion;": "∷",
	"Proportional;": "∝",
	"propto;": "∝",
	"prsim;": "≾",
	"prurel;": "⊰",
	"Pscr;": "𝒫",
	"pscr;": "𝓅",
	"Psi;": "Ψ",
	"psi;": "ψ",
	"puncsp;": " ",
	"Qfr;": "𝔔",
	"qfr;": "𝔮",
	"qint;": "⨌",
	"Qopf;": "ℚ",
	"qopf;": "𝕢",
	"qprime;": "⁗",
	"Qscr;": "𝒬",
	"qscr;": "𝓆",
	"quaternions;": "ℍ",
	"quatint;": "⨖",
	"quest;": "?",
	"questeq;": "≟",
	"QUOT;": "\"",
	"QUOT": "\"",
	"quot;": "\"",
	"quot": "\"",
	"rAarr;": "⇛",
	"race;": "∽̱",
	"Racute;": "Ŕ",
	"racute;": "ŕ",
	"radic;": "√",
	"raemptyv;": "⦳",
	"Rang;": "⟫",
	"rang;": "⟩",
	"rangd;": "⦒",
	"range;": "⦥",
	"rangle;": "⟩",
	"raquo;": "»",
	"raquo": "»",
	"Rarr;": "↠",
	"rArr;": "⇒",
	"rarr;": "→",
	"rarrap;": "⥵",
	"rarrb;": "⇥",
	"rarrbfs;": "⤠",
	"rarrc;": "⤳",
	"rarrfs;": "⤞",
	"rarrhk;": "↪",
	"rarrlp;": "↬",
	"rarrpl;": "⥅",
	"rarrsim;": "⥴",
	"Rarrtl;": "⤖",
	"rarrtl;": "↣",
	"rarrw;": "↝",
	"rAtail;": "⤜",
	"ratail;": "⤚",
	"ratio;": "∶",
	"rationals;": "ℚ",
	"RBarr;": "⤐",
	"rBarr;": "⤏",
	"rbarr;": "⤍",
	"rbbrk;": "❳",
	"rbrace;": "}",
	"rbrack;": "]",
	"rbrke;": "⦌",
	"rbrksld;": "⦎",
	"rbrkslu;": "⦐",
	"Rcaron;": "Ř",
	"rcaron;": "ř",
	"Rcedil;": "Ŗ",
	"rcedil;": "ŗ",
	"rceil;": "⌉",
	"rcub;": "}",
	"Rcy;": "Р",
	"rcy;": "р",
	"rdca;": "⤷",
	"rdldhar;": "⥩",
	"rdquo;": "”",
	"rdquor;": "”",
	"rdsh;": "↳",
	"Re;": "ℜ",
	"real;": "ℜ",
	"realine;": "ℛ",
	"realpart;": "ℜ",
	"reals;": "ℝ",
	"rect;": "▭",
	"REG;": "®",
	"REG": "®",
	"reg;": "®",
	"reg": "®",
	"ReverseElement;": "∋",
	"ReverseEquilibrium;": "⇋",
	"ReverseUpEquilibrium;": "⥯",
	"rfisht;": "⥽",
	"rfloor;": "⌋",
	"Rfr;": "ℜ",
	"rfr;": "𝔯",
	"rHar;": "⥤",
	"rhard;": "⇁",
	"rharu;": "⇀",
	"rharul;": "⥬",
	"Rho;": "Ρ",
	"rho;": "ρ",
	"rhov;": "ϱ",
	"RightAngleBracket;": "⟩",
	"RightArrow;": "→",
	"Rightarrow;": "⇒",
	"rightarrow;": "→",
	"RightArrowBar;": "⇥",
	"RightArrowLeftArrow;": "⇄",
	"rightarrowtail;": "↣",
	"RightCeiling;": "⌉",
	"RightDoubleBracket;": "⟧",
	"RightDownTeeVector;": "⥝",
	"RightDownVector;": "⇂",
	"RightDownVectorBar;": "⥕",
	"RightFloor;": "⌋",
	"rightharpoondown;": "⇁",
	"rightharpoonup;": "⇀",
	"rightleftarrows;": "⇄",
	"rightleftharpoons;": "⇌",
	"rightrightarrows;": "⇉",
	"rightsquigarrow;": "↝",
	"RightTee;": "⊢",
	"RightTeeArrow;": "↦",
	"RightTeeVector;": "⥛",
	"rightthreetimes;": "⋌",
	"RightTriangle;": "⊳",
	"RightTriangleBar;": "⧐",
	"RightTriangleEqual;": "⊵",
	"RightUpDownVector;": "⥏",
	"RightUpTeeVector;": "⥜",
	"RightUpVector;": "↾",
	"RightUpVectorBar;": "⥔",
	"RightVector;": "⇀",
	"RightVectorBar;": "⥓",
	"ring;": "˚",
	"risingdotseq;": "≓",
	"rlarr;": "⇄",
	"rlhar;": "⇌",
	"rlm;": "‏",
	"rmoust;": "⎱",
	"rmoustache;": "⎱",
	"rnmid;": "⫮",
	"roang;": "⟭",
	"roarr;": "⇾",
	"robrk;": "⟧",
	"ropar;": "⦆",
	"Ropf;": "ℝ",
	"ropf;": "𝕣",
	"roplus;": "⨮",
	"rotimes;": "⨵",
	"RoundImplies;": "⥰",
	"rpar;": ")",
	"rpargt;": "⦔",
	"rppolint;": "⨒",
	"rrarr;": "⇉",
	"Rrightarrow;": "⇛",
	"rsaquo;": "›",
	"Rscr;": "ℛ",
	"rscr;": "𝓇",
	"Rsh;": "↱",
	"rsh;": "↱",
	"rsqb;": "]",
	"rsquo;": "’",
	"rsquor;": "’",
	"rthree;": "⋌",
	"rtimes;": "⋊",
	"rtri;": "▹",
	"rtrie;": "⊵",
	"rtrif;": "▸",
	"rtriltri;": "⧎",
	"RuleDelayed;": "⧴",
	"ruluhar;": "⥨",
	"rx;": "℞",
	"Sacute;": "Ś",
	"sacute;": "ś",
	"sbquo;": "‚",
	"Sc;": "⪼",
	"sc;": "≻",
	"scap;": "⪸",
	"Scaron;": "Š",
	"scaron;": "š",
	"sccue;": "≽",
	"scE;": "⪴",
	"sce;": "⪰",
	"Scedil;": "Ş",
	"scedil;": "ş",
	"Scirc;": "Ŝ",
	"scirc;": "ŝ",
	"scnap;": "⪺",
	"scnE;": "⪶",
	"scnsim;": "⋩",
	"scpolint;": "⨓",
	"scsim;": "≿",
	"Scy;": "С",
	"scy;": "с",
	"sdot;": "⋅",
	"sdotb;": "⊡",
	"sdote;": "⩦",
	"searhk;": "⤥",
	"seArr;": "⇘",
	"searr;": "↘",
	"searrow;": "↘",
	"sect;": "§",
	"sect": "§",
	"semi;": ";",
	"seswar;": "⤩",
	"setminus;": "∖",
	"setmn;": "∖",
	"sext;": "✶",
	"Sfr;": "𝔖",
	"sfr;": "𝔰",
	"sfrown;": "⌢",
	"sharp;": "♯",
	"SHCHcy;": "Щ",
	"shchcy;": "щ",
	"SHcy;": "Ш",
	"shcy;": "ш",
	"ShortDownArrow;": "↓",
	"ShortLeftArrow;": "←",
	"shortmid;": "∣",
	"shortparallel;": "∥",
	"ShortRightArrow;": "→",
	"ShortUpArrow;": "↑",
	"shy;": "­",
	"shy": "­",
	"Sigma;": "Σ",
	"sigma;": "σ",
	"sigmaf;": "ς",
	"sigmav;": "ς",
	"sim;": "∼",
	"simdot;": "⩪",
	"sime;": "≃",
	"simeq;": "≃",
	"simg;": "⪞",
	"simgE;": "⪠",
	"siml;": "⪝",
	"simlE;": "⪟",
	"simne;": "≆",
	"simplus;": "⨤",
	"simrarr;": "⥲",
	"slarr;": "←",
	"SmallCircle;": "∘",
	"smallsetminus;": "∖",
	"smashp;": "⨳",
	"smeparsl;": "⧤",
	"smid;": "∣",
	"smile;": "⌣",
	"smt;": "⪪",
	"smte;": "⪬",
	"smtes;": "⪬︀",
	"SOFTcy;": "Ь",
	"softcy;": "ь",
	"sol;": "/",
	"solb;": "⧄",
	"solbar;": "⌿",
	"Sopf;": "𝕊",
	"sopf;": "𝕤",
	"spades;": "♠",
	"spadesuit;": "♠",
	"spar;": "∥",
	"sqcap;": "⊓",
	"sqcaps;": "⊓︀",
	"sqcup;": "⊔",
	"sqcups;": "⊔︀",
	"Sqrt;": "√",
	"sqsub;": "⊏",
	"sqsube;": "⊑",
	"sqsubset;": "⊏",
	"sqsubseteq;": "⊑",
	"sqsup;": "⊐",
	"sqsupe;": "⊒",
	"sqsupset;": "⊐",
	"sqsupseteq;": "⊒",
	"squ;": "□",
	"Square;": "□",
	"square;": "□",
	"SquareIntersection;": "⊓",
	"SquareSubset;": "⊏",
	"SquareSubsetEqual;": "⊑",
	"SquareSuperset;": "⊐",
	"SquareSupersetEqual;": "⊒",
	"SquareUnion;": "⊔",
	"squarf;": "▪",
	"squf;": "▪",
	"srarr;": "→",
	"Sscr;": "𝒮",
	"sscr;": "𝓈",
	"ssetmn;": "∖",
	"ssmile;": "⌣",
	"sstarf;": "⋆",
	"Star;": "⋆",
	"star;": "☆",
	"starf;": "★",
	"straightepsilon;": "ϵ",
	"straightphi;": "ϕ",
	"strns;": "¯",
	"Sub;": "⋐",
	"sub;": "⊂",
	"subdot;": "⪽",
	"subE;": "⫅",
	"sube;": "⊆",
	"subedot;": "⫃",
	"submult;": "⫁",
	"subnE;": "⫋",
	"subne;": "⊊",
	"subplus;": "⪿",
	"subrarr;": "⥹",
	"Subset;": "⋐",
	"subset;": "⊂",
	"subseteq;": "⊆",
	"subseteqq;": "⫅",
	"SubsetEqual;": "⊆",
	"subsetneq;": "⊊",
	"subsetneqq;": "⫋",
	"subsim;": "⫇",
	"subsub;": "⫕",
	"subsup;": "⫓",
	"succ;": "≻",
	"succapprox;": "⪸",
	"succcurlyeq;": "≽",
	"Succeeds;": "≻",
	"SucceedsEqual;": "⪰",
	"SucceedsSlantEqual;": "≽",
	"SucceedsTilde;": "≿",
	"succeq;": "⪰",
	"succnapprox;": "⪺",
	"succneqq;": "⪶",
	"succnsim;": "⋩",
	"succsim;": "≿",
	"SuchThat;": "∋",
	"Sum;": "∑",
	"sum;": "∑",
	"sung;": "♪",
	"Sup;": "⋑",
	"sup;": "⊃",
	"sup1;": "¹",
	"sup1": "¹",
	"sup2;": "²",
	"sup2": "²",
	"sup3;": "³",
	"sup3": "³",
	"supdot;": "⪾",
	"supdsub;": "⫘",
	"supE;": "⫆",
	"supe;": "⊇",
	"supedot;": "⫄",
	"Superset;": "⊃",
	"SupersetEqual;": "⊇",
	"suphsol;": "⟉",
	"suphsub;": "⫗",
	"suplarr;": "⥻",
	"supmult;": "⫂",
	"supnE;": "⫌",
	"supne;": "⊋",
	"supplus;": "⫀",
	"Supset;": "⋑",
	"supset;": "⊃",
	"supseteq;": "⊇",
	"supseteqq;": "⫆",
	"supsetneq;": "⊋",
	"supsetneqq;": "⫌",
	"supsim;": "⫈",
	"supsub;": "⫔",
	"supsup;": "⫖",
	"swarhk;": "⤦",
	"swArr;": "⇙",
	"swarr;": "↙",
	"swarrow;": "↙",
	"swnwar;": "⤪",
	"szlig;": "ß",
	"szlig": "ß",
	"Tab;": "\t",
	"target;": "⌖",
	"Tau;": "Τ",
	"tau;": "τ",
	"tbrk;": "⎴",
	"Tcaron;": "Ť",
	"tcaron;": "ť",
	"Tcedil;": "Ţ",
	"tcedil;": "ţ",
	"Tcy;": "Т",
	"tcy;": "т",
	"tdot;": "⃛",
	"telrec;": "⌕",
	"Tfr;": "𝔗",
	"tfr;": "𝔱",
	"there4;": "∴",
	"Therefore;": "∴",
	"therefore;": "∴",
	"Theta;": "Θ",
	"theta;": "θ",
	"thetasym;": "ϑ",
	"thetav;": "ϑ",
	"thickapprox;": "≈",
	"thicksim;": "∼",
	"ThickSpace;": "  ",
	"thinsp;": " ",
	"ThinSpace;": " ",
	"thkap;": "≈",
	"thksim;": "∼",
	"THORN;": "Þ",
	"THORN": "Þ",
	"thorn;": "þ",
	"thorn": "þ",
	"Tilde;": "∼",
	"tilde;": "˜",
	"TildeEqual;": "≃",
	"TildeFullEqual;": "≅",
	"TildeTilde;": "≈",
	"times;": "×",
	"times": "×",
	"timesb;": "⊠",
	"timesbar;": "⨱",
	"timesd;": "⨰",
	"tint;": "∭",
	"toea;": "⤨",
	"top;": "⊤",
	"topbot;": "⌶",
	"topcir;": "⫱",
	"Topf;": "𝕋",
	"topf;": "𝕥",
	"topfork;": "⫚",
	"tosa;": "⤩",
	"tprime;": "‴",
	"TRADE;": "™",
	"trade;": "™",
	"triangle;": "▵",
	"triangledown;": "▿",
	"triangleleft;": "◃",
	"trianglelefteq;": "⊴",
	"triangleq;": "≜",
	"triangleright;": "▹",
	"trianglerighteq;": "⊵",
	"tridot;": "◬",
	"trie;": "≜",
	"triminus;": "⨺",
	"TripleDot;": "⃛",
	"triplus;": "⨹",
	"trisb;": "⧍",
	"tritime;": "⨻",
	"trpezium;": "⏢",
	"Tscr;": "𝒯",
	"tscr;": "𝓉",
	"TScy;": "Ц",
	"tscy;": "ц",
	"TSHcy;": "Ћ",
	"tshcy;": "ћ",
	"Tstrok;": "Ŧ",
	"tstrok;": "ŧ",
	"twixt;": "≬",
	"twoheadleftarrow;": "↞",
	"twoheadrightarrow;": "↠",
	"Uacute;": "Ú",
	"Uacute": "Ú",
	"uacute;": "ú",
	"uacute": "ú",
	"Uarr;": "↟",
	"uArr;": "⇑",
	"uarr;": "↑",
	"Uarrocir;": "⥉",
	"Ubrcy;": "Ў",
	"ubrcy;": "ў",
	"Ubreve;": "Ŭ",
	"ubreve;": "ŭ",
	"Ucirc;": "Û",
	"Ucirc": "Û",
	"ucirc;": "û",
	"ucirc": "û",
	"Ucy;": "У",
	"ucy;": "у",
	"udarr;": "⇅",
	"Udblac;": "Ű",
	"udblac;": "ű",
	"udhar;": "⥮",
	"ufisht;": "⥾",
	"Ufr;": "𝔘",
	"ufr;": "𝔲",
	"Ugrave;": "Ù",
	"Ugrave": "Ù",
	"ugrave;": "ù",
	"ugrave": "ù",
	"uHar;": "⥣",
	"uharl;": "↿",
	"uharr;": "↾",
	"uhblk;": "▀",
	"ulcorn;": "⌜",
	"ulcorner;": "⌜",
	"ulcrop;": "⌏",
	"ultri;": "◸",
	"Umacr;": "Ū",
	"umacr;": "ū",
	"uml;": "¨",
	"uml": "¨",
	"UnderBar;": "_",
	"UnderBrace;": "⏟",
	"UnderBracket;": "⎵",
	"UnderParenthesis;": "⏝",
	"Union;": "⋃",
	"UnionPlus;": "⊎",
	"Uogon;": "Ų",
	"uogon;": "ų",
	"Uopf;": "𝕌",
	"uopf;": "𝕦",
	"UpArrow;": "↑",
	"Uparrow;": "⇑",
	"uparrow;": "↑",
	"UpArrowBar;": "⤒",
	"UpArrowDownArrow;": "⇅",
	"UpDownArrow;": "↕",
	"Updownarrow;": "⇕",
	"updownarrow;": "↕",
	"UpEquilibrium;": "⥮",
	"upharpoonleft;": "↿",
	"upharpoonright;": "↾",
	"uplus;": "⊎",
	"UpperLeftArrow;": "↖",
	"UpperRightArrow;": "↗",
	"Upsi;": "ϒ",
	"upsi;": "υ",
	"upsih;": "ϒ",
	"Upsilon;": "Υ",
	"upsilon;": "υ",
	"UpTee;": "⊥",
	"UpTeeArrow;": "↥",
	"upuparrows;": "⇈",
	"urcorn;": "⌝",
	"urcorner;": "⌝",
	"urcrop;": "⌎",
	"Uring;": "Ů",
	"uring;": "ů",
	"urtri;": "◹",
	"Uscr;": "𝒰",
	"uscr;": "𝓊",
	"utdot;": "⋰",
	"Utilde;": "Ũ",
	"utilde;": "ũ",
	"utri;": "▵",
	"utrif;": "▴",
	"uuarr;": "⇈",
	"Uuml;": "Ü",
	"Uuml": "Ü",
	"uuml;": "ü",
	"uuml": "ü",
	"uwangle;": "⦧",
	"vangrt;": "⦜",
	"varepsilon;": "ϵ",
	"varkappa;": "ϰ",
	"varnothing;": "∅",
	"varphi;": "ϕ",
	"varpi;": "ϖ",
	"varpropto;": "∝",
	"vArr;": "⇕",
	"varr;": "↕",
	"varrho;": "ϱ",
	"varsigma;": "ς",
	"varsubsetneq;": "⊊︀",
	"varsubsetneqq;": "⫋︀",
	"varsupsetneq;": "⊋︀",
	"varsupsetneqq;": "⫌︀",
	"vartheta;": "ϑ",
	"vartriangleleft;": "⊲",
	"vartriangleright;": "⊳",
	"Vbar;": "⫫",
	"vBar;": "⫨",
	"vBarv;": "⫩",
	"Vcy;": "В",
	"vcy;": "в",
	"VDash;": "⊫",
	"Vdash;": "⊩",
	"vDash;": "⊨",
	"vdash;": "⊢",
	"Vdashl;": "⫦",
	"Vee;": "⋁",
	"vee;": "∨",
	"veebar;": "⊻",
	"veeeq;": "≚",
	"vellip;": "⋮",
	"Verbar;": "‖",
	"verbar;": "|",
	"Vert;": "‖",
	"vert;": "|",
	"VerticalBar;": "∣",
	"VerticalLine;": "|",
	"VerticalSeparator;": "❘",
	"VerticalTilde;": "≀",
	"VeryThinSpace;": " ",
	"Vfr;": "𝔙",
	"vfr;": "𝔳",
	"vltri;": "⊲",
	"vnsub;": "⊂⃒",
	"vnsup;": "⊃⃒",
	"Vopf;": "𝕍",
	"vopf;": "𝕧",
	"vprop;": "∝",
	"vrtri;": "⊳",
	"Vscr;": "𝒱",
	"vscr;": "𝓋",
	"vsubnE;": "⫋︀",
	"vsubne;": "⊊︀",
	"vsupnE;": "⫌︀",
	"vsupne;": "⊋︀",
	"Vvdash;": "⊪",
	"vzigzag;": "⦚",
	"Wcirc;": "Ŵ",
	"wcirc;": "ŵ",
	"wedbar;": "⩟",
	"Wedge;": "⋀",
	"wedge;": "∧",
	"wedgeq;": "≙",
	"weierp;": "℘",
	"Wfr;": "𝔚",
	"wfr;": "𝔴",
	"Wopf;": "𝕎",
	"wopf;": "𝕨",
	"wp;": "℘",
	"wr;": "≀",
	"wreath;": "≀",
	"Wscr;": "𝒲",
	"wscr;": "𝓌",
	"xcap;": "⋂",
	"xcirc;": "◯",
	"xcup;": "⋃",
	"xdtri;": "▽",
	"Xfr;": "𝔛",
	"xfr;": "𝔵",
	"xhArr;": "⟺",
	"xharr;": "⟷",
	"Xi;": "Ξ",
	"xi;": "ξ",
	"xlArr;": "⟸",
	"xlarr;": "⟵",
	"xmap;": "⟼",
	"xnis;": "⋻",
	"xodot;": "⨀",
	"Xopf;": "𝕏",
	"xopf;": "𝕩",
	"xoplus;": "⨁",
	"xotime;": "⨂",
	"xrArr;": "⟹",
	"xrarr;": "⟶",
	"Xscr;": "𝒳",
	"xscr;": "𝓍",
	"xsqcup;": "⨆",
	"xuplus;": "⨄",
	"xutri;": "△",
	"xvee;": "⋁",
	"xwedge;": "⋀",
	"Yacute;": "Ý",
	"Yacute": "Ý",
	"yacute;": "ý",
	"yacute": "ý",
	"YAcy;": "Я",
	"yacy;": "я",
	"Ycirc;": "Ŷ",
	"ycirc;": "ŷ",
	"Ycy;": "Ы",
	"ycy;": "ы",
	"yen;": "¥",
	"yen": "¥",
	"Yfr;": "𝔜",
	"yfr;": "𝔶",
	"YIcy;": "Ї",
	"yicy;": "ї",
	"Yopf;": "𝕐",
	"yopf;": "𝕪",
	"Yscr;": "𝒴",
	"yscr;": "𝓎",
	"YUcy;": "Ю",
	"yucy;": "ю",
	"Yuml;": "Ÿ",
	"yuml;": "ÿ",
	"yuml": "ÿ",
	"Zacute;": "Ź",
	"zacute;": "ź",
	"Zcaron;": "Ž",
	"zcaron;": "ž",
	"Zcy;": "З",
	"zcy;": "з",
	"Zdot;": "Ż",
	"zdot;": "ż",
	"zeetrf;": "ℨ",
	"ZeroWidthSpace;": "​",
	"Zeta;": "Ζ",
	"zeta;": "ζ",
	"Zfr;": "ℨ",
	"zfr;": "𝔷",
	"ZHcy;": "Ж",
	"zhcy;": "ж",
	"zigrarr;": "⇝",
	"Zopf;": "ℤ",
	"zopf;": "𝕫",
	"Zscr;": "𝒵",
	"zscr;": "𝓏",
	"zwj;": "‍",
	"zwnj;": "‌"
};

/***/ },
/* 79 */
/***/ function(module, exports) {

module.exports = {
	"9": "Tab;",
	"10": "NewLine;",
	"33": "excl;",
	"34": "quot;",
	"35": "num;",
	"36": "dollar;",
	"37": "percnt;",
	"38": "amp;",
	"39": "apos;",
	"40": "lpar;",
	"41": "rpar;",
	"42": "midast;",
	"43": "plus;",
	"44": "comma;",
	"46": "period;",
	"47": "sol;",
	"58": "colon;",
	"59": "semi;",
	"60": "lt;",
	"61": "equals;",
	"62": "gt;",
	"63": "quest;",
	"64": "commat;",
	"91": "lsqb;",
	"92": "bsol;",
	"93": "rsqb;",
	"94": "Hat;",
	"95": "UnderBar;",
	"96": "grave;",
	"123": "lcub;",
	"124": "VerticalLine;",
	"125": "rcub;",
	"160": "NonBreakingSpace;",
	"161": "iexcl;",
	"162": "cent;",
	"163": "pound;",
	"164": "curren;",
	"165": "yen;",
	"166": "brvbar;",
	"167": "sect;",
	"168": "uml;",
	"169": "copy;",
	"170": "ordf;",
	"171": "laquo;",
	"172": "not;",
	"173": "shy;",
	"174": "reg;",
	"175": "strns;",
	"176": "deg;",
	"177": "pm;",
	"178": "sup2;",
	"179": "sup3;",
	"180": "DiacriticalAcute;",
	"181": "micro;",
	"182": "para;",
	"183": "middot;",
	"184": "Cedilla;",
	"185": "sup1;",
	"186": "ordm;",
	"187": "raquo;",
	"188": "frac14;",
	"189": "half;",
	"190": "frac34;",
	"191": "iquest;",
	"192": "Agrave;",
	"193": "Aacute;",
	"194": "Acirc;",
	"195": "Atilde;",
	"196": "Auml;",
	"197": "Aring;",
	"198": "AElig;",
	"199": "Ccedil;",
	"200": "Egrave;",
	"201": "Eacute;",
	"202": "Ecirc;",
	"203": "Euml;",
	"204": "Igrave;",
	"205": "Iacute;",
	"206": "Icirc;",
	"207": "Iuml;",
	"208": "ETH;",
	"209": "Ntilde;",
	"210": "Ograve;",
	"211": "Oacute;",
	"212": "Ocirc;",
	"213": "Otilde;",
	"214": "Ouml;",
	"215": "times;",
	"216": "Oslash;",
	"217": "Ugrave;",
	"218": "Uacute;",
	"219": "Ucirc;",
	"220": "Uuml;",
	"221": "Yacute;",
	"222": "THORN;",
	"223": "szlig;",
	"224": "agrave;",
	"225": "aacute;",
	"226": "acirc;",
	"227": "atilde;",
	"228": "auml;",
	"229": "aring;",
	"230": "aelig;",
	"231": "ccedil;",
	"232": "egrave;",
	"233": "eacute;",
	"234": "ecirc;",
	"235": "euml;",
	"236": "igrave;",
	"237": "iacute;",
	"238": "icirc;",
	"239": "iuml;",
	"240": "eth;",
	"241": "ntilde;",
	"242": "ograve;",
	"243": "oacute;",
	"244": "ocirc;",
	"245": "otilde;",
	"246": "ouml;",
	"247": "divide;",
	"248": "oslash;",
	"249": "ugrave;",
	"250": "uacute;",
	"251": "ucirc;",
	"252": "uuml;",
	"253": "yacute;",
	"254": "thorn;",
	"255": "yuml;",
	"256": "Amacr;",
	"257": "amacr;",
	"258": "Abreve;",
	"259": "abreve;",
	"260": "Aogon;",
	"261": "aogon;",
	"262": "Cacute;",
	"263": "cacute;",
	"264": "Ccirc;",
	"265": "ccirc;",
	"266": "Cdot;",
	"267": "cdot;",
	"268": "Ccaron;",
	"269": "ccaron;",
	"270": "Dcaron;",
	"271": "dcaron;",
	"272": "Dstrok;",
	"273": "dstrok;",
	"274": "Emacr;",
	"275": "emacr;",
	"278": "Edot;",
	"279": "edot;",
	"280": "Eogon;",
	"281": "eogon;",
	"282": "Ecaron;",
	"283": "ecaron;",
	"284": "Gcirc;",
	"285": "gcirc;",
	"286": "Gbreve;",
	"287": "gbreve;",
	"288": "Gdot;",
	"289": "gdot;",
	"290": "Gcedil;",
	"292": "Hcirc;",
	"293": "hcirc;",
	"294": "Hstrok;",
	"295": "hstrok;",
	"296": "Itilde;",
	"297": "itilde;",
	"298": "Imacr;",
	"299": "imacr;",
	"302": "Iogon;",
	"303": "iogon;",
	"304": "Idot;",
	"305": "inodot;",
	"306": "IJlig;",
	"307": "ijlig;",
	"308": "Jcirc;",
	"309": "jcirc;",
	"310": "Kcedil;",
	"311": "kcedil;",
	"312": "kgreen;",
	"313": "Lacute;",
	"314": "lacute;",
	"315": "Lcedil;",
	"316": "lcedil;",
	"317": "Lcaron;",
	"318": "lcaron;",
	"319": "Lmidot;",
	"320": "lmidot;",
	"321": "Lstrok;",
	"322": "lstrok;",
	"323": "Nacute;",
	"324": "nacute;",
	"325": "Ncedil;",
	"326": "ncedil;",
	"327": "Ncaron;",
	"328": "ncaron;",
	"329": "napos;",
	"330": "ENG;",
	"331": "eng;",
	"332": "Omacr;",
	"333": "omacr;",
	"336": "Odblac;",
	"337": "odblac;",
	"338": "OElig;",
	"339": "oelig;",
	"340": "Racute;",
	"341": "racute;",
	"342": "Rcedil;",
	"343": "rcedil;",
	"344": "Rcaron;",
	"345": "rcaron;",
	"346": "Sacute;",
	"347": "sacute;",
	"348": "Scirc;",
	"349": "scirc;",
	"350": "Scedil;",
	"351": "scedil;",
	"352": "Scaron;",
	"353": "scaron;",
	"354": "Tcedil;",
	"355": "tcedil;",
	"356": "Tcaron;",
	"357": "tcaron;",
	"358": "Tstrok;",
	"359": "tstrok;",
	"360": "Utilde;",
	"361": "utilde;",
	"362": "Umacr;",
	"363": "umacr;",
	"364": "Ubreve;",
	"365": "ubreve;",
	"366": "Uring;",
	"367": "uring;",
	"368": "Udblac;",
	"369": "udblac;",
	"370": "Uogon;",
	"371": "uogon;",
	"372": "Wcirc;",
	"373": "wcirc;",
	"374": "Ycirc;",
	"375": "ycirc;",
	"376": "Yuml;",
	"377": "Zacute;",
	"378": "zacute;",
	"379": "Zdot;",
	"380": "zdot;",
	"381": "Zcaron;",
	"382": "zcaron;",
	"402": "fnof;",
	"437": "imped;",
	"501": "gacute;",
	"567": "jmath;",
	"710": "circ;",
	"711": "Hacek;",
	"728": "breve;",
	"729": "dot;",
	"730": "ring;",
	"731": "ogon;",
	"732": "tilde;",
	"733": "DiacriticalDoubleAcute;",
	"785": "DownBreve;",
	"913": "Alpha;",
	"914": "Beta;",
	"915": "Gamma;",
	"916": "Delta;",
	"917": "Epsilon;",
	"918": "Zeta;",
	"919": "Eta;",
	"920": "Theta;",
	"921": "Iota;",
	"922": "Kappa;",
	"923": "Lambda;",
	"924": "Mu;",
	"925": "Nu;",
	"926": "Xi;",
	"927": "Omicron;",
	"928": "Pi;",
	"929": "Rho;",
	"931": "Sigma;",
	"932": "Tau;",
	"933": "Upsilon;",
	"934": "Phi;",
	"935": "Chi;",
	"936": "Psi;",
	"937": "Omega;",
	"945": "alpha;",
	"946": "beta;",
	"947": "gamma;",
	"948": "delta;",
	"949": "epsilon;",
	"950": "zeta;",
	"951": "eta;",
	"952": "theta;",
	"953": "iota;",
	"954": "kappa;",
	"955": "lambda;",
	"956": "mu;",
	"957": "nu;",
	"958": "xi;",
	"959": "omicron;",
	"960": "pi;",
	"961": "rho;",
	"962": "varsigma;",
	"963": "sigma;",
	"964": "tau;",
	"965": "upsilon;",
	"966": "phi;",
	"967": "chi;",
	"968": "psi;",
	"969": "omega;",
	"977": "vartheta;",
	"978": "upsih;",
	"981": "varphi;",
	"982": "varpi;",
	"988": "Gammad;",
	"989": "gammad;",
	"1008": "varkappa;",
	"1009": "varrho;",
	"1013": "varepsilon;",
	"1014": "bepsi;",
	"1025": "IOcy;",
	"1026": "DJcy;",
	"1027": "GJcy;",
	"1028": "Jukcy;",
	"1029": "DScy;",
	"1030": "Iukcy;",
	"1031": "YIcy;",
	"1032": "Jsercy;",
	"1033": "LJcy;",
	"1034": "NJcy;",
	"1035": "TSHcy;",
	"1036": "KJcy;",
	"1038": "Ubrcy;",
	"1039": "DZcy;",
	"1040": "Acy;",
	"1041": "Bcy;",
	"1042": "Vcy;",
	"1043": "Gcy;",
	"1044": "Dcy;",
	"1045": "IEcy;",
	"1046": "ZHcy;",
	"1047": "Zcy;",
	"1048": "Icy;",
	"1049": "Jcy;",
	"1050": "Kcy;",
	"1051": "Lcy;",
	"1052": "Mcy;",
	"1053": "Ncy;",
	"1054": "Ocy;",
	"1055": "Pcy;",
	"1056": "Rcy;",
	"1057": "Scy;",
	"1058": "Tcy;",
	"1059": "Ucy;",
	"1060": "Fcy;",
	"1061": "KHcy;",
	"1062": "TScy;",
	"1063": "CHcy;",
	"1064": "SHcy;",
	"1065": "SHCHcy;",
	"1066": "HARDcy;",
	"1067": "Ycy;",
	"1068": "SOFTcy;",
	"1069": "Ecy;",
	"1070": "YUcy;",
	"1071": "YAcy;",
	"1072": "acy;",
	"1073": "bcy;",
	"1074": "vcy;",
	"1075": "gcy;",
	"1076": "dcy;",
	"1077": "iecy;",
	"1078": "zhcy;",
	"1079": "zcy;",
	"1080": "icy;",
	"1081": "jcy;",
	"1082": "kcy;",
	"1083": "lcy;",
	"1084": "mcy;",
	"1085": "ncy;",
	"1086": "ocy;",
	"1087": "pcy;",
	"1088": "rcy;",
	"1089": "scy;",
	"1090": "tcy;",
	"1091": "ucy;",
	"1092": "fcy;",
	"1093": "khcy;",
	"1094": "tscy;",
	"1095": "chcy;",
	"1096": "shcy;",
	"1097": "shchcy;",
	"1098": "hardcy;",
	"1099": "ycy;",
	"1100": "softcy;",
	"1101": "ecy;",
	"1102": "yucy;",
	"1103": "yacy;",
	"1105": "iocy;",
	"1106": "djcy;",
	"1107": "gjcy;",
	"1108": "jukcy;",
	"1109": "dscy;",
	"1110": "iukcy;",
	"1111": "yicy;",
	"1112": "jsercy;",
	"1113": "ljcy;",
	"1114": "njcy;",
	"1115": "tshcy;",
	"1116": "kjcy;",
	"1118": "ubrcy;",
	"1119": "dzcy;",
	"8194": "ensp;",
	"8195": "emsp;",
	"8196": "emsp13;",
	"8197": "emsp14;",
	"8199": "numsp;",
	"8200": "puncsp;",
	"8201": "ThinSpace;",
	"8202": "VeryThinSpace;",
	"8203": "ZeroWidthSpace;",
	"8204": "zwnj;",
	"8205": "zwj;",
	"8206": "lrm;",
	"8207": "rlm;",
	"8208": "hyphen;",
	"8211": "ndash;",
	"8212": "mdash;",
	"8213": "horbar;",
	"8214": "Vert;",
	"8216": "OpenCurlyQuote;",
	"8217": "rsquor;",
	"8218": "sbquo;",
	"8220": "OpenCurlyDoubleQuote;",
	"8221": "rdquor;",
	"8222": "ldquor;",
	"8224": "dagger;",
	"8225": "ddagger;",
	"8226": "bullet;",
	"8229": "nldr;",
	"8230": "mldr;",
	"8240": "permil;",
	"8241": "pertenk;",
	"8242": "prime;",
	"8243": "Prime;",
	"8244": "tprime;",
	"8245": "bprime;",
	"8249": "lsaquo;",
	"8250": "rsaquo;",
	"8254": "OverBar;",
	"8257": "caret;",
	"8259": "hybull;",
	"8260": "frasl;",
	"8271": "bsemi;",
	"8279": "qprime;",
	"8287": "MediumSpace;",
	"8288": "NoBreak;",
	"8289": "ApplyFunction;",
	"8290": "it;",
	"8291": "InvisibleComma;",
	"8364": "euro;",
	"8411": "TripleDot;",
	"8412": "DotDot;",
	"8450": "Copf;",
	"8453": "incare;",
	"8458": "gscr;",
	"8459": "Hscr;",
	"8460": "Poincareplane;",
	"8461": "quaternions;",
	"8462": "planckh;",
	"8463": "plankv;",
	"8464": "Iscr;",
	"8465": "imagpart;",
	"8466": "Lscr;",
	"8467": "ell;",
	"8469": "Nopf;",
	"8470": "numero;",
	"8471": "copysr;",
	"8472": "wp;",
	"8473": "primes;",
	"8474": "rationals;",
	"8475": "Rscr;",
	"8476": "Rfr;",
	"8477": "Ropf;",
	"8478": "rx;",
	"8482": "trade;",
	"8484": "Zopf;",
	"8487": "mho;",
	"8488": "Zfr;",
	"8489": "iiota;",
	"8492": "Bscr;",
	"8493": "Cfr;",
	"8495": "escr;",
	"8496": "expectation;",
	"8497": "Fscr;",
	"8499": "phmmat;",
	"8500": "oscr;",
	"8501": "aleph;",
	"8502": "beth;",
	"8503": "gimel;",
	"8504": "daleth;",
	"8517": "DD;",
	"8518": "DifferentialD;",
	"8519": "exponentiale;",
	"8520": "ImaginaryI;",
	"8531": "frac13;",
	"8532": "frac23;",
	"8533": "frac15;",
	"8534": "frac25;",
	"8535": "frac35;",
	"8536": "frac45;",
	"8537": "frac16;",
	"8538": "frac56;",
	"8539": "frac18;",
	"8540": "frac38;",
	"8541": "frac58;",
	"8542": "frac78;",
	"8592": "slarr;",
	"8593": "uparrow;",
	"8594": "srarr;",
	"8595": "ShortDownArrow;",
	"8596": "leftrightarrow;",
	"8597": "varr;",
	"8598": "UpperLeftArrow;",
	"8599": "UpperRightArrow;",
	"8600": "searrow;",
	"8601": "swarrow;",
	"8602": "nleftarrow;",
	"8603": "nrightarrow;",
	"8605": "rightsquigarrow;",
	"8606": "twoheadleftarrow;",
	"8607": "Uarr;",
	"8608": "twoheadrightarrow;",
	"8609": "Darr;",
	"8610": "leftarrowtail;",
	"8611": "rightarrowtail;",
	"8612": "mapstoleft;",
	"8613": "UpTeeArrow;",
	"8614": "RightTeeArrow;",
	"8615": "mapstodown;",
	"8617": "larrhk;",
	"8618": "rarrhk;",
	"8619": "looparrowleft;",
	"8620": "rarrlp;",
	"8621": "leftrightsquigarrow;",
	"8622": "nleftrightarrow;",
	"8624": "lsh;",
	"8625": "rsh;",
	"8626": "ldsh;",
	"8627": "rdsh;",
	"8629": "crarr;",
	"8630": "curvearrowleft;",
	"8631": "curvearrowright;",
	"8634": "olarr;",
	"8635": "orarr;",
	"8636": "lharu;",
	"8637": "lhard;",
	"8638": "upharpoonright;",
	"8639": "upharpoonleft;",
	"8640": "RightVector;",
	"8641": "rightharpoondown;",
	"8642": "RightDownVector;",
	"8643": "LeftDownVector;",
	"8644": "rlarr;",
	"8645": "UpArrowDownArrow;",
	"8646": "lrarr;",
	"8647": "llarr;",
	"8648": "uuarr;",
	"8649": "rrarr;",
	"8650": "downdownarrows;",
	"8651": "ReverseEquilibrium;",
	"8652": "rlhar;",
	"8653": "nLeftarrow;",
	"8654": "nLeftrightarrow;",
	"8655": "nRightarrow;",
	"8656": "Leftarrow;",
	"8657": "Uparrow;",
	"8658": "Rightarrow;",
	"8659": "Downarrow;",
	"8660": "Leftrightarrow;",
	"8661": "vArr;",
	"8662": "nwArr;",
	"8663": "neArr;",
	"8664": "seArr;",
	"8665": "swArr;",
	"8666": "Lleftarrow;",
	"8667": "Rrightarrow;",
	"8669": "zigrarr;",
	"8676": "LeftArrowBar;",
	"8677": "RightArrowBar;",
	"8693": "duarr;",
	"8701": "loarr;",
	"8702": "roarr;",
	"8703": "hoarr;",
	"8704": "forall;",
	"8705": "complement;",
	"8706": "PartialD;",
	"8707": "Exists;",
	"8708": "NotExists;",
	"8709": "varnothing;",
	"8711": "nabla;",
	"8712": "isinv;",
	"8713": "notinva;",
	"8715": "SuchThat;",
	"8716": "NotReverseElement;",
	"8719": "Product;",
	"8720": "Coproduct;",
	"8721": "sum;",
	"8722": "minus;",
	"8723": "mp;",
	"8724": "plusdo;",
	"8726": "ssetmn;",
	"8727": "lowast;",
	"8728": "SmallCircle;",
	"8730": "Sqrt;",
	"8733": "vprop;",
	"8734": "infin;",
	"8735": "angrt;",
	"8736": "angle;",
	"8737": "measuredangle;",
	"8738": "angsph;",
	"8739": "VerticalBar;",
	"8740": "nsmid;",
	"8741": "spar;",
	"8742": "nspar;",
	"8743": "wedge;",
	"8744": "vee;",
	"8745": "cap;",
	"8746": "cup;",
	"8747": "Integral;",
	"8748": "Int;",
	"8749": "tint;",
	"8750": "oint;",
	"8751": "DoubleContourIntegral;",
	"8752": "Cconint;",
	"8753": "cwint;",
	"8754": "cwconint;",
	"8755": "CounterClockwiseContourIntegral;",
	"8756": "therefore;",
	"8757": "because;",
	"8758": "ratio;",
	"8759": "Proportion;",
	"8760": "minusd;",
	"8762": "mDDot;",
	"8763": "homtht;",
	"8764": "Tilde;",
	"8765": "bsim;",
	"8766": "mstpos;",
	"8767": "acd;",
	"8768": "wreath;",
	"8769": "nsim;",
	"8770": "esim;",
	"8771": "TildeEqual;",
	"8772": "nsimeq;",
	"8773": "TildeFullEqual;",
	"8774": "simne;",
	"8775": "NotTildeFullEqual;",
	"8776": "TildeTilde;",
	"8777": "NotTildeTilde;",
	"8778": "approxeq;",
	"8779": "apid;",
	"8780": "bcong;",
	"8781": "CupCap;",
	"8782": "HumpDownHump;",
	"8783": "HumpEqual;",
	"8784": "esdot;",
	"8785": "eDot;",
	"8786": "fallingdotseq;",
	"8787": "risingdotseq;",
	"8788": "coloneq;",
	"8789": "eqcolon;",
	"8790": "eqcirc;",
	"8791": "cire;",
	"8793": "wedgeq;",
	"8794": "veeeq;",
	"8796": "trie;",
	"8799": "questeq;",
	"8800": "NotEqual;",
	"8801": "equiv;",
	"8802": "NotCongruent;",
	"8804": "leq;",
	"8805": "GreaterEqual;",
	"8806": "LessFullEqual;",
	"8807": "GreaterFullEqual;",
	"8808": "lneqq;",
	"8809": "gneqq;",
	"8810": "NestedLessLess;",
	"8811": "NestedGreaterGreater;",
	"8812": "twixt;",
	"8813": "NotCupCap;",
	"8814": "NotLess;",
	"8815": "NotGreater;",
	"8816": "NotLessEqual;",
	"8817": "NotGreaterEqual;",
	"8818": "lsim;",
	"8819": "gtrsim;",
	"8820": "NotLessTilde;",
	"8821": "NotGreaterTilde;",
	"8822": "lg;",
	"8823": "gtrless;",
	"8824": "ntlg;",
	"8825": "ntgl;",
	"8826": "Precedes;",
	"8827": "Succeeds;",
	"8828": "PrecedesSlantEqual;",
	"8829": "SucceedsSlantEqual;",
	"8830": "prsim;",
	"8831": "succsim;",
	"8832": "nprec;",
	"8833": "nsucc;",
	"8834": "subset;",
	"8835": "supset;",
	"8836": "nsub;",
	"8837": "nsup;",
	"8838": "SubsetEqual;",
	"8839": "supseteq;",
	"8840": "nsubseteq;",
	"8841": "nsupseteq;",
	"8842": "subsetneq;",
	"8843": "supsetneq;",
	"8845": "cupdot;",
	"8846": "uplus;",
	"8847": "SquareSubset;",
	"8848": "SquareSuperset;",
	"8849": "SquareSubsetEqual;",
	"8850": "SquareSupersetEqual;",
	"8851": "SquareIntersection;",
	"8852": "SquareUnion;",
	"8853": "oplus;",
	"8854": "ominus;",
	"8855": "otimes;",
	"8856": "osol;",
	"8857": "odot;",
	"8858": "ocir;",
	"8859": "oast;",
	"8861": "odash;",
	"8862": "plusb;",
	"8863": "minusb;",
	"8864": "timesb;",
	"8865": "sdotb;",
	"8866": "vdash;",
	"8867": "LeftTee;",
	"8868": "top;",
	"8869": "UpTee;",
	"8871": "models;",
	"8872": "vDash;",
	"8873": "Vdash;",
	"8874": "Vvdash;",
	"8875": "VDash;",
	"8876": "nvdash;",
	"8877": "nvDash;",
	"8878": "nVdash;",
	"8879": "nVDash;",
	"8880": "prurel;",
	"8882": "vltri;",
	"8883": "vrtri;",
	"8884": "trianglelefteq;",
	"8885": "trianglerighteq;",
	"8886": "origof;",
	"8887": "imof;",
	"8888": "mumap;",
	"8889": "hercon;",
	"8890": "intercal;",
	"8891": "veebar;",
	"8893": "barvee;",
	"8894": "angrtvb;",
	"8895": "lrtri;",
	"8896": "xwedge;",
	"8897": "xvee;",
	"8898": "xcap;",
	"8899": "xcup;",
	"8900": "diamond;",
	"8901": "sdot;",
	"8902": "Star;",
	"8903": "divonx;",
	"8904": "bowtie;",
	"8905": "ltimes;",
	"8906": "rtimes;",
	"8907": "lthree;",
	"8908": "rthree;",
	"8909": "bsime;",
	"8910": "cuvee;",
	"8911": "cuwed;",
	"8912": "Subset;",
	"8913": "Supset;",
	"8914": "Cap;",
	"8915": "Cup;",
	"8916": "pitchfork;",
	"8917": "epar;",
	"8918": "ltdot;",
	"8919": "gtrdot;",
	"8920": "Ll;",
	"8921": "ggg;",
	"8922": "LessEqualGreater;",
	"8923": "gtreqless;",
	"8926": "curlyeqprec;",
	"8927": "curlyeqsucc;",
	"8928": "nprcue;",
	"8929": "nsccue;",
	"8930": "nsqsube;",
	"8931": "nsqsupe;",
	"8934": "lnsim;",
	"8935": "gnsim;",
	"8936": "prnsim;",
	"8937": "succnsim;",
	"8938": "ntriangleleft;",
	"8939": "ntriangleright;",
	"8940": "ntrianglelefteq;",
	"8941": "ntrianglerighteq;",
	"8942": "vellip;",
	"8943": "ctdot;",
	"8944": "utdot;",
	"8945": "dtdot;",
	"8946": "disin;",
	"8947": "isinsv;",
	"8948": "isins;",
	"8949": "isindot;",
	"8950": "notinvc;",
	"8951": "notinvb;",
	"8953": "isinE;",
	"8954": "nisd;",
	"8955": "xnis;",
	"8956": "nis;",
	"8957": "notnivc;",
	"8958": "notnivb;",
	"8965": "barwedge;",
	"8966": "doublebarwedge;",
	"8968": "LeftCeiling;",
	"8969": "RightCeiling;",
	"8970": "lfloor;",
	"8971": "RightFloor;",
	"8972": "drcrop;",
	"8973": "dlcrop;",
	"8974": "urcrop;",
	"8975": "ulcrop;",
	"8976": "bnot;",
	"8978": "profline;",
	"8979": "profsurf;",
	"8981": "telrec;",
	"8982": "target;",
	"8988": "ulcorner;",
	"8989": "urcorner;",
	"8990": "llcorner;",
	"8991": "lrcorner;",
	"8994": "sfrown;",
	"8995": "ssmile;",
	"9005": "cylcty;",
	"9006": "profalar;",
	"9014": "topbot;",
	"9021": "ovbar;",
	"9023": "solbar;",
	"9084": "angzarr;",
	"9136": "lmoustache;",
	"9137": "rmoustache;",
	"9140": "tbrk;",
	"9141": "UnderBracket;",
	"9142": "bbrktbrk;",
	"9180": "OverParenthesis;",
	"9181": "UnderParenthesis;",
	"9182": "OverBrace;",
	"9183": "UnderBrace;",
	"9186": "trpezium;",
	"9191": "elinters;",
	"9251": "blank;",
	"9416": "oS;",
	"9472": "HorizontalLine;",
	"9474": "boxv;",
	"9484": "boxdr;",
	"9488": "boxdl;",
	"9492": "boxur;",
	"9496": "boxul;",
	"9500": "boxvr;",
	"9508": "boxvl;",
	"9516": "boxhd;",
	"9524": "boxhu;",
	"9532": "boxvh;",
	"9552": "boxH;",
	"9553": "boxV;",
	"9554": "boxdR;",
	"9555": "boxDr;",
	"9556": "boxDR;",
	"9557": "boxdL;",
	"9558": "boxDl;",
	"9559": "boxDL;",
	"9560": "boxuR;",
	"9561": "boxUr;",
	"9562": "boxUR;",
	"9563": "boxuL;",
	"9564": "boxUl;",
	"9565": "boxUL;",
	"9566": "boxvR;",
	"9567": "boxVr;",
	"9568": "boxVR;",
	"9569": "boxvL;",
	"9570": "boxVl;",
	"9571": "boxVL;",
	"9572": "boxHd;",
	"9573": "boxhD;",
	"9574": "boxHD;",
	"9575": "boxHu;",
	"9576": "boxhU;",
	"9577": "boxHU;",
	"9578": "boxvH;",
	"9579": "boxVh;",
	"9580": "boxVH;",
	"9600": "uhblk;",
	"9604": "lhblk;",
	"9608": "block;",
	"9617": "blk14;",
	"9618": "blk12;",
	"9619": "blk34;",
	"9633": "square;",
	"9642": "squf;",
	"9643": "EmptyVerySmallSquare;",
	"9645": "rect;",
	"9646": "marker;",
	"9649": "fltns;",
	"9651": "xutri;",
	"9652": "utrif;",
	"9653": "utri;",
	"9656": "rtrif;",
	"9657": "triangleright;",
	"9661": "xdtri;",
	"9662": "dtrif;",
	"9663": "triangledown;",
	"9666": "ltrif;",
	"9667": "triangleleft;",
	"9674": "lozenge;",
	"9675": "cir;",
	"9708": "tridot;",
	"9711": "xcirc;",
	"9720": "ultri;",
	"9721": "urtri;",
	"9722": "lltri;",
	"9723": "EmptySmallSquare;",
	"9724": "FilledSmallSquare;",
	"9733": "starf;",
	"9734": "star;",
	"9742": "phone;",
	"9792": "female;",
	"9794": "male;",
	"9824": "spadesuit;",
	"9827": "clubsuit;",
	"9829": "heartsuit;",
	"9830": "diams;",
	"9834": "sung;",
	"9837": "flat;",
	"9838": "natural;",
	"9839": "sharp;",
	"10003": "checkmark;",
	"10007": "cross;",
	"10016": "maltese;",
	"10038": "sext;",
	"10072": "VerticalSeparator;",
	"10098": "lbbrk;",
	"10099": "rbbrk;",
	"10184": "bsolhsub;",
	"10185": "suphsol;",
	"10214": "lobrk;",
	"10215": "robrk;",
	"10216": "LeftAngleBracket;",
	"10217": "RightAngleBracket;",
	"10218": "Lang;",
	"10219": "Rang;",
	"10220": "loang;",
	"10221": "roang;",
	"10229": "xlarr;",
	"10230": "xrarr;",
	"10231": "xharr;",
	"10232": "xlArr;",
	"10233": "xrArr;",
	"10234": "xhArr;",
	"10236": "xmap;",
	"10239": "dzigrarr;",
	"10498": "nvlArr;",
	"10499": "nvrArr;",
	"10500": "nvHarr;",
	"10501": "Map;",
	"10508": "lbarr;",
	"10509": "rbarr;",
	"10510": "lBarr;",
	"10511": "rBarr;",
	"10512": "RBarr;",
	"10513": "DDotrahd;",
	"10514": "UpArrowBar;",
	"10515": "DownArrowBar;",
	"10518": "Rarrtl;",
	"10521": "latail;",
	"10522": "ratail;",
	"10523": "lAtail;",
	"10524": "rAtail;",
	"10525": "larrfs;",
	"10526": "rarrfs;",
	"10527": "larrbfs;",
	"10528": "rarrbfs;",
	"10531": "nwarhk;",
	"10532": "nearhk;",
	"10533": "searhk;",
	"10534": "swarhk;",
	"10535": "nwnear;",
	"10536": "toea;",
	"10537": "tosa;",
	"10538": "swnwar;",
	"10547": "rarrc;",
	"10549": "cudarrr;",
	"10550": "ldca;",
	"10551": "rdca;",
	"10552": "cudarrl;",
	"10553": "larrpl;",
	"10556": "curarrm;",
	"10557": "cularrp;",
	"10565": "rarrpl;",
	"10568": "harrcir;",
	"10569": "Uarrocir;",
	"10570": "lurdshar;",
	"10571": "ldrushar;",
	"10574": "LeftRightVector;",
	"10575": "RightUpDownVector;",
	"10576": "DownLeftRightVector;",
	"10577": "LeftUpDownVector;",
	"10578": "LeftVectorBar;",
	"10579": "RightVectorBar;",
	"10580": "RightUpVectorBar;",
	"10581": "RightDownVectorBar;",
	"10582": "DownLeftVectorBar;",
	"10583": "DownRightVectorBar;",
	"10584": "LeftUpVectorBar;",
	"10585": "LeftDownVectorBar;",
	"10586": "LeftTeeVector;",
	"10587": "RightTeeVector;",
	"10588": "RightUpTeeVector;",
	"10589": "RightDownTeeVector;",
	"10590": "DownLeftTeeVector;",
	"10591": "DownRightTeeVector;",
	"10592": "LeftUpTeeVector;",
	"10593": "LeftDownTeeVector;",
	"10594": "lHar;",
	"10595": "uHar;",
	"10596": "rHar;",
	"10597": "dHar;",
	"10598": "luruhar;",
	"10599": "ldrdhar;",
	"10600": "ruluhar;",
	"10601": "rdldhar;",
	"10602": "lharul;",
	"10603": "llhard;",
	"10604": "rharul;",
	"10605": "lrhard;",
	"10606": "UpEquilibrium;",
	"10607": "ReverseUpEquilibrium;",
	"10608": "RoundImplies;",
	"10609": "erarr;",
	"10610": "simrarr;",
	"10611": "larrsim;",
	"10612": "rarrsim;",
	"10613": "rarrap;",
	"10614": "ltlarr;",
	"10616": "gtrarr;",
	"10617": "subrarr;",
	"10619": "suplarr;",
	"10620": "lfisht;",
	"10621": "rfisht;",
	"10622": "ufisht;",
	"10623": "dfisht;",
	"10629": "lopar;",
	"10630": "ropar;",
	"10635": "lbrke;",
	"10636": "rbrke;",
	"10637": "lbrkslu;",
	"10638": "rbrksld;",
	"10639": "lbrksld;",
	"10640": "rbrkslu;",
	"10641": "langd;",
	"10642": "rangd;",
	"10643": "lparlt;",
	"10644": "rpargt;",
	"10645": "gtlPar;",
	"10646": "ltrPar;",
	"10650": "vzigzag;",
	"10652": "vangrt;",
	"10653": "angrtvbd;",
	"10660": "ange;",
	"10661": "range;",
	"10662": "dwangle;",
	"10663": "uwangle;",
	"10664": "angmsdaa;",
	"10665": "angmsdab;",
	"10666": "angmsdac;",
	"10667": "angmsdad;",
	"10668": "angmsdae;",
	"10669": "angmsdaf;",
	"10670": "angmsdag;",
	"10671": "angmsdah;",
	"10672": "bemptyv;",
	"10673": "demptyv;",
	"10674": "cemptyv;",
	"10675": "raemptyv;",
	"10676": "laemptyv;",
	"10677": "ohbar;",
	"10678": "omid;",
	"10679": "opar;",
	"10681": "operp;",
	"10683": "olcross;",
	"10684": "odsold;",
	"10686": "olcir;",
	"10687": "ofcir;",
	"10688": "olt;",
	"10689": "ogt;",
	"10690": "cirscir;",
	"10691": "cirE;",
	"10692": "solb;",
	"10693": "bsolb;",
	"10697": "boxbox;",
	"10701": "trisb;",
	"10702": "rtriltri;",
	"10703": "LeftTriangleBar;",
	"10704": "RightTriangleBar;",
	"10716": "iinfin;",
	"10717": "infintie;",
	"10718": "nvinfin;",
	"10723": "eparsl;",
	"10724": "smeparsl;",
	"10725": "eqvparsl;",
	"10731": "lozf;",
	"10740": "RuleDelayed;",
	"10742": "dsol;",
	"10752": "xodot;",
	"10753": "xoplus;",
	"10754": "xotime;",
	"10756": "xuplus;",
	"10758": "xsqcup;",
	"10764": "qint;",
	"10765": "fpartint;",
	"10768": "cirfnint;",
	"10769": "awint;",
	"10770": "rppolint;",
	"10771": "scpolint;",
	"10772": "npolint;",
	"10773": "pointint;",
	"10774": "quatint;",
	"10775": "intlarhk;",
	"10786": "pluscir;",
	"10787": "plusacir;",
	"10788": "simplus;",
	"10789": "plusdu;",
	"10790": "plussim;",
	"10791": "plustwo;",
	"10793": "mcomma;",
	"10794": "minusdu;",
	"10797": "loplus;",
	"10798": "roplus;",
	"10799": "Cross;",
	"10800": "timesd;",
	"10801": "timesbar;",
	"10803": "smashp;",
	"10804": "lotimes;",
	"10805": "rotimes;",
	"10806": "otimesas;",
	"10807": "Otimes;",
	"10808": "odiv;",
	"10809": "triplus;",
	"10810": "triminus;",
	"10811": "tritime;",
	"10812": "iprod;",
	"10815": "amalg;",
	"10816": "capdot;",
	"10818": "ncup;",
	"10819": "ncap;",
	"10820": "capand;",
	"10821": "cupor;",
	"10822": "cupcap;",
	"10823": "capcup;",
	"10824": "cupbrcap;",
	"10825": "capbrcup;",
	"10826": "cupcup;",
	"10827": "capcap;",
	"10828": "ccups;",
	"10829": "ccaps;",
	"10832": "ccupssm;",
	"10835": "And;",
	"10836": "Or;",
	"10837": "andand;",
	"10838": "oror;",
	"10839": "orslope;",
	"10840": "andslope;",
	"10842": "andv;",
	"10843": "orv;",
	"10844": "andd;",
	"10845": "ord;",
	"10847": "wedbar;",
	"10854": "sdote;",
	"10858": "simdot;",
	"10861": "congdot;",
	"10862": "easter;",
	"10863": "apacir;",
	"10864": "apE;",
	"10865": "eplus;",
	"10866": "pluse;",
	"10867": "Esim;",
	"10868": "Colone;",
	"10869": "Equal;",
	"10871": "eDDot;",
	"10872": "equivDD;",
	"10873": "ltcir;",
	"10874": "gtcir;",
	"10875": "ltquest;",
	"10876": "gtquest;",
	"10877": "LessSlantEqual;",
	"10878": "GreaterSlantEqual;",
	"10879": "lesdot;",
	"10880": "gesdot;",
	"10881": "lesdoto;",
	"10882": "gesdoto;",
	"10883": "lesdotor;",
	"10884": "gesdotol;",
	"10885": "lessapprox;",
	"10886": "gtrapprox;",
	"10887": "lneq;",
	"10888": "gneq;",
	"10889": "lnapprox;",
	"10890": "gnapprox;",
	"10891": "lesseqqgtr;",
	"10892": "gtreqqless;",
	"10893": "lsime;",
	"10894": "gsime;",
	"10895": "lsimg;",
	"10896": "gsiml;",
	"10897": "lgE;",
	"10898": "glE;",
	"10899": "lesges;",
	"10900": "gesles;",
	"10901": "eqslantless;",
	"10902": "eqslantgtr;",
	"10903": "elsdot;",
	"10904": "egsdot;",
	"10905": "el;",
	"10906": "eg;",
	"10909": "siml;",
	"10910": "simg;",
	"10911": "simlE;",
	"10912": "simgE;",
	"10913": "LessLess;",
	"10914": "GreaterGreater;",
	"10916": "glj;",
	"10917": "gla;",
	"10918": "ltcc;",
	"10919": "gtcc;",
	"10920": "lescc;",
	"10921": "gescc;",
	"10922": "smt;",
	"10923": "lat;",
	"10924": "smte;",
	"10925": "late;",
	"10926": "bumpE;",
	"10927": "preceq;",
	"10928": "succeq;",
	"10931": "prE;",
	"10932": "scE;",
	"10933": "prnE;",
	"10934": "succneqq;",
	"10935": "precapprox;",
	"10936": "succapprox;",
	"10937": "prnap;",
	"10938": "succnapprox;",
	"10939": "Pr;",
	"10940": "Sc;",
	"10941": "subdot;",
	"10942": "supdot;",
	"10943": "subplus;",
	"10944": "supplus;",
	"10945": "submult;",
	"10946": "supmult;",
	"10947": "subedot;",
	"10948": "supedot;",
	"10949": "subseteqq;",
	"10950": "supseteqq;",
	"10951": "subsim;",
	"10952": "supsim;",
	"10955": "subsetneqq;",
	"10956": "supsetneqq;",
	"10959": "csub;",
	"10960": "csup;",
	"10961": "csube;",
	"10962": "csupe;",
	"10963": "subsup;",
	"10964": "supsub;",
	"10965": "subsub;",
	"10966": "supsup;",
	"10967": "suphsub;",
	"10968": "supdsub;",
	"10969": "forkv;",
	"10970": "topfork;",
	"10971": "mlcp;",
	"10980": "DoubleLeftTee;",
	"10982": "Vdashl;",
	"10983": "Barv;",
	"10984": "vBar;",
	"10985": "vBarv;",
	"10987": "Vbar;",
	"10988": "Not;",
	"10989": "bNot;",
	"10990": "rnmid;",
	"10991": "cirmid;",
	"10992": "midcir;",
	"10993": "topcir;",
	"10994": "nhpar;",
	"10995": "parsim;",
	"11005": "parsl;",
	"64256": "fflig;",
	"64257": "filig;",
	"64258": "fllig;",
	"64259": "ffilig;",
	"64260": "ffllig;"
};

/***/ },
/* 80 */
/***/ function(module, exports) {

module.exports = {
	"0": 65533,
	"128": 8364,
	"130": 8218,
	"131": 402,
	"132": 8222,
	"133": 8230,
	"134": 8224,
	"135": 8225,
	"136": 710,
	"137": 8240,
	"138": 352,
	"139": 8249,
	"140": 338,
	"142": 381,
	"145": 8216,
	"146": 8217,
	"147": 8220,
	"148": 8221,
	"149": 8226,
	"150": 8211,
	"151": 8212,
	"152": 732,
	"153": 8482,
	"154": 353,
	"155": 8250,
	"156": 339,
	"158": 382,
	"159": 376
};

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2)


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var Buffer = __webpack_require__(1).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(17);
/*</replacement>*/

module.exports = BufferList;

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return bufferShim.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = bufferShim.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(39)


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var Stream = (function (){
  try {
    return __webpack_require__(12); // hack to fix a circular dependency issue when used with browserify
  } catch(_){}
}());
exports = module.exports = __webpack_require__(40);
exports.Stream = Stream || exports;
exports.Readable = exports;
exports.Writable = __webpack_require__(22);
exports.Duplex = __webpack_require__(2);
exports.Transform = __webpack_require__(21);
exports.PassThrough = __webpack_require__(39);

if (!process.browser && process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(21)


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(22)


/***/ },
/* 87 */
/***/ function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var app_1 = __webpack_require__(13);
var router_1 = __webpack_require__(89);
var component_1 = __webpack_require__(41);
exports.Component = component_1.default;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app_1.default;
app_1.default.start = function (element, model, view, update, options) {
    return new component_1.default(element, model, view, update, options);
};
app_1.default.router = function (element, components, home) {
    if (home === void 0) { home = '/'; }
    return router_1.default(element, components, home);
};
if (typeof window === 'object') {
    window['app'] = app_1.default;
}


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var app_1 = __webpack_require__(13);
var route = function (url) {
    if (url && url.indexOf('/') > 0) {
        var ss = url.split('/');
        app_1.default.run(ss[0], ss[1]);
    }
    else {
        app_1.default.run(url);
    }
};
exports.router = function (element, components, home) {
    if (home === void 0) { home = '/'; }
    components.forEach(function (c) { return c(element); });
    window.onpopstate = function (e) {
        element.removeChild(element.firstElementChild);
        route(location.hash || home);
    };
    route(location.hash || home);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.router;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/// <reference path="./virtual-dom.d.ts" />
"use strict";
var h = __webpack_require__(96);
var patch = __webpack_require__(97);
var diff = __webpack_require__(95);
var VNode = __webpack_require__(25);
var VText = __webpack_require__(26);
var createElement = __webpack_require__(94);
var virtualize = __webpack_require__(92);
var html2vdom = __webpack_require__(66);
var convertHTML = html2vdom({ VNode: VNode, VText: VText });
var convertHTMLWithKey = convertHTML.bind(null, {
    getVNodeKey: function (attributes) {
        return attributes.id;
    }
});
function updateElement(element, html) {
    console.assert(!!element);
    var vtree = (typeof html === 'string') ? convertHTMLWithKey(html) : html;
    if (element.firstChild) {
        var prev = element.firstChild.vtree || virtualize(element.firstChild);
        var patches = diff(prev, vtree);
        patch(element.firstChild, patches);
    }
    else {
        var node = createElement(vtree);
        element.appendChild(node);
    }
    element.firstChild.vtree = vtree;
}
exports.updateElement = updateElement;
function updateElementVtree(element) {
    console.assert(!!element);
    if (element.firstChild) {
        element.firstChild.vtree = virtualize(element.firstChild);
    }
}
exports.updateElementVtree = updateElementVtree;
var app_1 = __webpack_require__(13);
app_1.default.h = function (el, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return (typeof el === 'string') ?
        h(el, props, children) : el(props, children);
};
app_1.default.createElement = app_1.default.h;


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

/*!
* vdom-virtualize
* Copyright 2014 by Marcel Klehr <mklehr@gmx.net>
*
* (MIT LICENSE)
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
var VNode = __webpack_require__(25)
  , VText = __webpack_require__(26)
  , VComment = __webpack_require__(93)

module.exports = createVNode

function createVNode(domNode, key) {
  key = key || null // XXX: Leave out `key` for now... merely used for (re-)ordering

  if(domNode.nodeType == 1) return createFromElement(domNode, key)
  if(domNode.nodeType == 3) return createFromTextNode(domNode, key)
  if(domNode.nodeType == 8) return createFromCommentNode(domNode, key)
  return
}

function createFromTextNode(tNode) {
  return new VText(tNode.nodeValue)
}


function createFromCommentNode(cNode) {
  return new VComment(cNode.nodeValue)
}


function createFromElement(el) {
  var tagName = el.tagName
  , namespace = el.namespaceURI == 'http://www.w3.org/1999/xhtml'? null : el.namespaceURI
  , properties = getElementProperties(el)
  , children = []

  for (var i = 0; i < el.childNodes.length; i++) {
    children.push(createVNode(el.childNodes[i]/*, i*/))
  }

  return new VNode(tagName, properties, children, null, namespace)
}


function getElementProperties(el) {
  var obj = {}

  for(var i=0; i<props.length; i++) {
    var propName = props[i]
    if(!el[propName]) continue

    // Special case: style
    // .style is a DOMStyleDeclaration, thus we need to iterate over all
    // rules to create a hash of applied css properties.
    //
    // You can directly set a specific .style[prop] = value so patching with vdom
    // is possible.
    if("style" == propName) {
      var css = {}
        , styleProp
      if ('undefined' !== typeof el.style.length) {
        for(var j=0; j<el.style.length; j++) {
          styleProp = el.style[j]
          css[styleProp] = el.style.getPropertyValue(styleProp) // XXX: add support for "!important" via getPropertyPriority()!
        }
      } else { // IE8
        for (var styleProp in el.style) {
          if (el.style[styleProp] && el.style.hasOwnProperty(styleProp)) {
            css[styleProp] = el.style[styleProp];
          }
        }
      }

      if(Object.keys(css).length) obj[propName] = css
      continue
    }

    // https://msdn.microsoft.com/en-us/library/cc848861%28v=vs.85%29.aspx
    // The img element does not support the HREF content attribute.
    // In addition, the href property is read-only for the img Document Object Model (DOM) object
    if (el.tagName.toLowerCase() === 'img' && propName === 'href') {
      continue;
    }

    // Special case: dataset
    // we can iterate over .dataset with a simple for..in loop.
    // The all-time foo with data-* attribs is the dash-snake to camelCase
    // conversion.
    //
    // *This is compatible with h(), but not with every browser, thus this section was removed in favor
    // of attributes (specified below)!*
    //
    // .dataset properties are directly accessible as transparent getters/setters, so
    // patching with vdom is possible.
    /*if("dataset" == propName) {
      var data = {}
      for(var p in el.dataset) {
        data[p] = el.dataset[p]
      }
      obj[propName] = data
      return
    }*/

    // Special case: attributes
    // these are a NamedNodeMap, but we can just convert them to a hash for vdom,
    // because of https://github.com/Matt-Esch/virtual-dom/blob/master/vdom/apply-properties.js#L57
    if("attributes" == propName){
      var atts = Array.prototype.slice.call(el[propName]);
      var hash = {}
      for(var k=0; k<atts.length; k++){
        var name = atts[k].name;
        if(obj[name] || obj[attrBlacklist[name]]) continue;
        hash[name] = el.getAttribute(name);
      }
      obj[propName] = hash;
      continue
    }
    if("tabIndex" == propName && el.tabIndex === -1) continue

    // Special case: contentEditable
    // browser use 'inherit' by default on all nodes, but does not allow setting it to ''
    // diffing virtualize dom will trigger error
    // ref: https://github.com/Matt-Esch/virtual-dom/issues/176
    if("contentEditable" == propName && el[propName] === 'inherit') continue

    if('object' === typeof el[propName]) continue

    // default: just copy the property
    obj[propName] = el[propName]
  }

  return obj
}

/**
 * DOMNode property white list
 * Taken from https://github.com/Raynos/react/blob/dom-property-config/src/browser/ui/dom/DefaultDOMPropertyConfig.js
 */
var props =

module.exports.properties = [
 "accept"
,"accessKey"
,"action"
,"alt"
,"async"
,"autoComplete"
,"autoPlay"
,"cellPadding"
,"cellSpacing"
,"checked"
,"className"
,"colSpan"
,"content"
,"contentEditable"
,"controls"
,"crossOrigin"
,"data"
//,"dataset" removed since attributes handles data-attributes
,"defer"
,"dir"
,"download"
,"draggable"
,"encType"
,"formNoValidate"
,"href"
,"hrefLang"
,"htmlFor"
,"httpEquiv"
,"icon"
,"id"
,"label"
,"lang"
,"list"
,"loop"
,"max"
,"mediaGroup"
,"method"
,"min"
,"multiple"
,"muted"
,"name"
,"noValidate"
,"pattern"
,"placeholder"
,"poster"
,"preload"
,"radioGroup"
,"readOnly"
,"rel"
,"required"
,"rowSpan"
,"sandbox"
,"scope"
,"scrollLeft"
,"scrolling"
,"scrollTop"
,"selected"
,"span"
,"spellCheck"
,"src"
,"srcDoc"
,"srcSet"
,"start"
,"step"
,"style"
,"tabIndex"
,"target"
,"title"
,"type"
,"value"

// Non-standard Properties
,"autoCapitalize"
,"autoCorrect"
,"property"

, "attributes"
]

var attrBlacklist =
module.exports.attrBlacklist = {
  'class': 'className'
}


/***/ },
/* 93 */
/***/ function(module, exports) {

module.exports = VirtualComment

function VirtualComment(text) {
  this.text = String(text)
}

VirtualComment.prototype.type = 'Widget'

VirtualComment.prototype.init = function() {
  return document.createComment(this.text)
}

VirtualComment.prototype.update = function(previous, domNode) {
  if(this.text === previous.text) return
  domNode.nodeValue = this.text
}


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

var createElement = __webpack_require__(43)

module.exports = createElement


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

var diff = __webpack_require__(107)

module.exports = diff


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

var h = __webpack_require__(104)

module.exports = h


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

var patch = __webpack_require__(100)

module.exports = patch


/***/ },
/* 98 */
/***/ function(module, exports) {

// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

var applyProperties = __webpack_require__(42)

var isWidget = __webpack_require__(3)
var VPatch = __webpack_require__(45)

var updateWidget = __webpack_require__(101)

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = renderOptions.render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = renderOptions.render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

var document = __webpack_require__(31)
var isArray = __webpack_require__(27)

var render = __webpack_require__(43)
var domIndex = __webpack_require__(98)
var patchOp = __webpack_require__(99)
module.exports = patch

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

var isWidget = __webpack_require__(3)

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var EvStore = __webpack_require__(65);

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};


/***/ },
/* 103 */
/***/ function(module, exports) {

"use strict";
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var isArray = __webpack_require__(27);

var VNode = __webpack_require__(25);
var VText = __webpack_require__(26);
var isVNode = __webpack_require__(9);
var isVText = __webpack_require__(16);
var isWidget = __webpack_require__(3);
var isHook = __webpack_require__(15);
var isVThunk = __webpack_require__(14);

var parseTag = __webpack_require__(105);
var softSetHook = __webpack_require__(103);
var evHook = __webpack_require__(102);

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (typeof c === 'number') {
        childNodes.push(new VText(String(c)));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode)
        '\n' +
        'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var split = __webpack_require__(48);

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(35)
var isHook = __webpack_require__(15)

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

var isArray = __webpack_require__(27)

var VPatch = __webpack_require__(45)
var isVNode = __webpack_require__(9)
var isVText = __webpack_require__(16)
var isWidget = __webpack_require__(3)
var isThunk = __webpack_require__(14)
var handleThunk = __webpack_require__(44)

var diffProps = __webpack_require__(106)

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}


/***/ },
/* 108 */
/***/ function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			configurable: false,
			get: function() { return module.l; }
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			configurable: false,
			get: function() { return module.i; }
		});
		module.webpackPolyfill = 1;
	}
	return module;
}


/***/ },
/* 109 */
/***/ function(module, exports) {

/* (ignored) */

/***/ },
/* 110 */
/***/ function(module, exports) {

/* (ignored) */

/***/ },
/* 111 */
/***/ function(module, exports) {

/* (ignored) */

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
"use strict";
var index_1 = __webpack_require__(46);
var model = [];
var view = function (state) {
    console.log(state);
    var counters = state.map(function (_, idx) {
        return "<div>\n      <h1>" + state[idx] + "</h1>\n      <button onclick='app.run(\"-1\"," + idx + ")'>-1</button>\n      <button onclick='app.run(\"+1\"," + idx + ")'>+1</button>\n      <button onclick='app.run(\"remove-counter\", " + idx + ")'>x</button>\n    </div>";
    }).join('');
    return "<div>\n  <div>\n    <button onclick='app.run(\"history-prev\")'> &lt;&lt; </button>\n    <button onclick='app.run(\"history-next\")'> &gt;&gt; </button>\n  </div><br>\n  <div>\n    <button onclick='app.run(\"add-counter\")'>add counter</button>\n    <button onclick='app.run(\"remove-counter\", " + (state.length - 1) + ")'>remove counter</button>\n  </div>\n  " + counters + "\n  </div>";
};
var update = {
    'add-counter': function (state) { return state.concat([0]); },
    'remove-counter': function (state, idx) { return state.slice(0, idx).concat(state.slice(idx + 1)); },
    '+1': function (state, idx) { return state.slice(0, idx).concat([
        state[idx] + 1
    ], state.slice(idx + 1)); },
    '-1': function (state, idx) { return state.slice(0, idx).concat([
        state[idx] - 1
    ], state.slice(idx + 1)); }
};
var element = document.getElementById('my-app');
var component = index_1.default.start(element, model, view, update, { history: true });
// {history: {prev: 'history-prev', next: 'history-next'}});


/***/ }
/******/ ]);