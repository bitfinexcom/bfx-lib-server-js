const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const _ = require('lodash')
const sanitaze = require('./validate')
const { parseTokenIp, getIp } = require('./helpers')

const { grape, uploadActions } = require('./config')

const Peer = Grenache.PeerRPCClient

const link = new Link({
  grape: grape
})
link.start()

const peer = new Peer(link, {})
peer.init()

function request (query, res, service) {
  query = sanitaze(query)
  const timeout = _timeout(query.action)
  peer.request(service, query, timeout, (err, data) => ((err)
    ? res.json({ success: false, message: err.message })
    : res.json({ success: true, data })))
}

function _timeout (action) {
  const timeout = uploadActions(action) ? 120000 : 10000
  return { timeout }
}

function setGrenacheRequest (action, extra, service) {
  return (req, res) => {
    const add = (extra)
      ? extra(req)
      : {}
    if (req.file) {
      add.file = req.file
    }
    const args = [_.assign({}, req.query, req.body, add)]
    const query = { action, args }
    request(query, res, service)
  }
}

// Types of requests
function getGrenacheReqWithAuth (action, collection, service) {
  const setExtra = (req) => {
    const auth = parseTokenIp(req)
    return (collection)
      ? { auth, collection }
      : { auth }
  }
  return setGrenacheRequest(action, setExtra, service)
}

function getGrenacheReqWithIp (action, service) {
  const setIp = (req) => {
    const ip = getIp(req)
    return { ip }
  }
  return setGrenacheRequest(action, setIp, service)
}

function getGrenacheReq (action, args, service) {
  return (req, res) => {
    const query = { action, args }
    request(query, res, service)
  }
}

module.exports = {
  setGrenacheRequest,
  getGrenacheReqWithAuth,
  getGrenacheReqWithIp,
  getGrenacheReq
}
