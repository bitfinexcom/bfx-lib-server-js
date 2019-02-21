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

const fileSystem = () => conf.listen_socket && fs.chmodSync(conf.listen_socket, '0777')

const listen = conf.listen_socket ? conf.listen_socket : conf.listen_port
const serveStatic = conf.serve_static

const uploadActions = (action) => {
  const actions = conf.upload_actions || []
  return actions.includes(action)
}

module.exports = {
  serveStatic,
  grape,
  fileSystem,
  listen,
  uploadActions
}
