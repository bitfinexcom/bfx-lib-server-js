'use strict'

const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const _ = require('lodash')
const request = require('request')

const sanitaze = require('./validate')
const { parseTokenIp, getIp } = require('./helpers')

const { grape, uploadActions, sanitize } = require('./config')

const Peer = Grenache.PeerRPCClient

const link = new Link({
  grape: grape
})
link.start()

const peer = new Peer(link, {})
peer.init()

function requestGrc (query, res, service, pipe = false) {
  const sQuery = sanitize ? sanitaze(query) : query
  const timeout = _timeout(sQuery.action)
  peer.request(service, sQuery, timeout, (err, data) => {
    if (err) return res.json({ success: false, message: err.message })

    if (pipe) {
      const url = data && data.url

      if (!url) return res.json({ success: false, message: 'Malformed data, no url' })

      return request(url).pipe(res)
    }

    return res.json({ success: true, data })
  })
}

function _timeout (action) {
  const timeout = uploadActions(action) ? 900000 : 30000
  return { timeout }
}

function setGrenacheRequest (action, extra, service, pipe) {
  return (req, res) => {
    const add = (extra)
      ? extra(req)
      : {}
    if (req.file) {
      const buffer = req.file.buffer.toString('hex')
      req.file.buffer = buffer
      add.file = req.file
    }
    const args = [_.assign({}, req.query, req.body, add)]
    const query = { action, args }
    requestGrc(query, res, service, pipe)
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

function pipeGrenacheReqWithAuth (action, service) {
  const setAuth = (req) => {
    const auth = parseTokenIp(req)
    return { auth }
  }

  return setGrenacheRequest(action, setAuth, service, true)
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
    requestGrc(query, res, service)
  }
}

module.exports = {
  setGrenacheRequest,
  getGrenacheReqWithAuth,
  getGrenacheReqWithIp,
  pipeGrenacheReqWithAuth,
  getGrenacheReq
}
