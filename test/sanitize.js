'use strict'
const test = require('brittle')
const validate = require('../express/validate')

test('xss', (t) => {
  t.test('sanitizes elements', (t) => {
    const q = '</script>a'
    const res = validate(q)

    t.is(res, 'a')
  })

  t.test('sanitizes arrays', (t) => {
    const q = [0, '</script>a']
    const res = validate(q)

    t.alike(res, [0, 'a'])
  })

  t.test('sanitizes objects', (t) => {
    const q = { 0: 'foo', bar: '</script>a' }
    const res = validate(q)

    t.alike(res, { 0: 'foo', bar: 'a' })
  })

  t.test('sanitizes object keys', (t) => {
    const q = { '</script>a': 'foo' }
    const res = validate(q)

    t.alike(res, { a: 'foo' })
  })

  t.test('handles objecsts nested in arrays', (t) => {
    const q = [{ '</script>a': 'foo' }]
    const res = validate(q)

    t.alike(res, [{ a: 'foo' }])
  })

  t.test('handles nested queries', (t) => {
    const q = { foo: { bar: { baz: ['</script>a'] } } }
    const res = validate(q)

    t.alike(res, { foo: { bar: { baz: ['a'] } } })
  })
})
