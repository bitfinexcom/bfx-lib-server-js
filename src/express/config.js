'use strict'

const fs = require('fs')
const path = require('path')

const configPath = process.env.EXPRESS_CONFIG_PATH ||
  path.join(process.cwd(), 'express', 'config.json')

let conf = null
try {
  conf = JSON.parse(fs.readFileSync(configPath, 'utf8'))
} catch (err) {
  console.error(err)
}

if (!conf) {
  console.error('Error reading configuration file')
  process.exit(-1)
}

const grape = conf.grape
const sanitize = conf.sanitize === false ? conf.sanitize : true

const listenSocket = process.env.EXPRESS_LISTEN_SOCKET || conf.listen_socket
const fileSystem = () => listenSocket && fs.chmodSync(listenSocket, '0777')

const listen = listenSocket || conf.listen_port
const serveStatic = conf.serve_static

const uploadActions = (action) => {
  const actions = conf.upload_actions || []
  return actions.includes(action)
}

module.exports = {
  serveStatic,
  grape,
  sanitize,
  fileSystem,
  listen,
  uploadActions
}
