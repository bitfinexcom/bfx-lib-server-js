/* eslint-env mocha */

'use strict'
const assert = require('assert')
const validate = require('../express/validate')

describe('xss', () => {
  it('sanitizes elements', () => {
    const q = '</script>a'
    const res = validate(q)

    assert.strictEqual(res, 'a')
  })

  it('sanitizes arrays', () => {
    const q = [0, '</script>a']
    const res = validate(q)

    assert.deepStrictEqual(res, [0, 'a'])
  })

  it('sanitizes objects', () => {
    const q = { 0: 'foo', bar: '</script>a' }
    const res = validate(q)

    assert.deepStrictEqual(res, { 0: 'foo', bar: 'a' })
  })

  it('sanitizes object keys', () => {
    const q = { '</script>a': 'foo' }
    const res = validate(q)

    assert.deepStrictEqual(res, { a: 'foo' })
  })

  it('handles objecsts nested in arrays', () => {
    const q = [{ '</script>a': 'foo' }]
    const res = validate(q)

    assert.deepStrictEqual(res, [{ a: 'foo' }])
  })

  it('handles nested queries', () => {
    const q = { foo: { bar: { baz: ['</script>a'] } } }
    const res = validate(q)

    assert.deepStrictEqual(res, { foo: { bar: { baz: ['a'] } } })
  })
})
