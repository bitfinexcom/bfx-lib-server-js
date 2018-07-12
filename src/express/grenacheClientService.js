const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const sanitaze = require('./validate')
const Peer = Grenache.PeerRPCClient
const { uploadActions } = require('./config')

let peer = null
const grenacheInit = (conf) => {
  const link = new Link({
    grape: conf.grape
  })
  link.start()

  peer = new Peer(link, {})
  peer.init()
}

function grenacheRequest (service, query, res) {
  query = sanitaze(query)
  const timeout = _timeout(query.action)
  peer.request(service, query, timeout, (err, data) => {
    console.log('ok, we gots', err, data)
    return (err)
      ? res.json({ success: false, message: err.toString() })
      : res.json({ success: true, data })
  })
}

function _timeout (action) {
  const timeout = uploadActions(action) ? 120000 : 10000
  return {timeout}
}

module.exports = {grenacheRequest, grenacheInit}
