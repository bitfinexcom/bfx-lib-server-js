
const sanitizer = require('sanitizer')
const _ = require('lodash')

function sanitaze (query) {
  return _sanitazer(query)
}

function _sanitazer (val) {
  if (_.isArray(val)) return _sanitazeArr(val)
  if (_.isPlainObject(val)) return _sanitazeObj(val)
  return (typeof val === 'string') ? sanitizer.sanitize(val) : val
}

function _sanitazeArr (arr) {
  return _.map(arr, _sanitazer)
}

function _sanitazeObj (obj) {
  return _.reduce(obj, (result, value, key) => {
    result[_sanitazer(key)] = _sanitazer(value)
    return result
  }, {})
}

module.exports = sanitaze
