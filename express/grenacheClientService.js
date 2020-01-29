'use strict'

const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const _ = require('lodash')
const request = require('request')
const LRU = require('lru')

const cache = new LRU({ maxAge: 3600000 })
const sanitaze = require('./validate')
const { parseTokenIp, getIp } = require('./helpers')

const { grape, uploadActions, sanitize } = require('./config')

const Peer = Grenache.PeerRPCClient

const link = new Link({ grape })
const peer = new Peer(link, {})

let started = false

function start (cb = () => {}) {
  if (!started) {
    started = true
    link.start()
    peer.init()
  }

  cb()
}

function stop (cb = () => {}) {
  if (started) {
    started = false
    link.stop()
    peer.stop()
  }

  cb()
}

function checkAuthToken (req, service = 'rest:core:user') {
  const auth = parseTokenIp(req)
  const strAuth = JSON.stringify(auth)
  const mem = cache.get(strAuth)
  if (mem) return JSON.parse(mem)

  return new Promise((resolve, reject) => {
    const query = { action: 'checkAuthToken', args: auth }
    peer.request(service, query, 30000, (err, data) => {
      if (err) return reject(err)
      cache.set(strAuth, JSON.stringify(data))
      return resolve(data)
    })
  })
}

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

function sendGrcRequestPlain (service, action, args, cb) {
  const query = { action, args }
  const sQuery = sanitize ? sanitaze(query) : query
  const timeout = _timeout(sQuery.action)

  peer.request(service, sQuery, timeout, (err, data) => {
    if (err) return cb(err)

    return cb(null, data)
  })
}

start()

module.exports = {
  checkAuthToken,
  setGrenacheRequest,
  getGrenacheReqWithAuth,
  getGrenacheReqWithIp,
  pipeGrenacheReqWithAuth,
  getGrenacheReq,
  start,
  stop,
  getIp,
  sendGrcRequestPlain
}
