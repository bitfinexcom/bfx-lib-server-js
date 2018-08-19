const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const _ = require('lodash')
const sanitaze = require('./validate')

let peer = null
const grenacheInit = (conf) => {
  const link = new Link({
    grape: conf.grape
  })
  link.start()

  peer = new Peer(link, {})
  peer.init()
}

function request(query, res) {
  query = sanitaze(query)
  const timeout = _timeout(query.action)
  peer.request('rest:core:kyc', query, timeout, (err, data) => ((err)
    ? res.json({ success: false, message: err.toString() })
    : res.json({ success: true, data })))
}

function _timeout(action) {
  const timeout = uploadActions(action) ? 120000 : 10000
  return { timeout }
}

function setRequest(action, extra) {
  return (req, res) => {
    const add = (extra)
      ? extra(req)
      : {}
    const args = [_.assign({}, req.query, req.body, add)]
    const query = { action, args }
    request(query, res)
  }
}

module.exports = { setRequest }
