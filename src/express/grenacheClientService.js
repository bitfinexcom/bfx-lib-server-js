const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const _ = require('lodash')
const sanitaze = require('./validate')
const { parseTokenIp, getIp } = require('./helpers')

const Peer = Grenache.PeerRPCClient

let peer = null
const grenacheInit = (conf) => {
  const link = new Link({
    grape: conf.grape
  })
  link.start()

  peer = new Peer(link, {})
  peer.init()
}

function request(service, query, res) {
  query = sanitaze(query)
  const timeout = _timeout(query.action)
  peer.request(service, query, timeout, (err, data) => ((err)
    ? res.json({ success: false, message: err.toString() })
    : res.json({ success: true, data })))
}

function _timeout(action) {
  const timeout = uploadActions(action) ? 120000 : 10000
  return { timeout }
}

function setGrenacheRequest(service, action, extra) {
  return (req, res) => {
    const add = (extra)
      ? extra(req)
      : {}
    const args = [_.assign({}, req.query, req.body, add)]
    const query = { action, args }
    request(service, query, res)
  }
}

// Types of requests
function getGrenacheReqWithAuth(service, action, collection) {
  const setExtra = (req) => {
    const auth = parseTokenIp(req)
    return (collection)
      ? { auth, collection }
      : { auth }
  }
  return setGrenacheRequest(service, action, setExtra)
}

function getGrenacheReqWithIp(service, action) {
  const setIp = (req) => {
    const ip = getIp(req)
    return { ip }
  }
  return setGrenacheRequest(service, action, setIp)
}

module.exports = {
  grenacheInit,
  setGrenacheRequest,
  getGrenacheReqWithAuth,
  getGrenacheReqWithIp,
}
