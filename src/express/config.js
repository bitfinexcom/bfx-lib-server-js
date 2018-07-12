const fs = require('fs')

const configure = (path) => {
  let conf = null
  try {
    conf = JSON.parse(fs.readFileSync(path, 'utf8'))
  } catch (err) {
    console.error(err)
  }

  if (!conf) {
    console.error('Error reading configuration file')
    process.exit(-1)
  }
  return conf
}

const fileSystem = (conf) => conf.listen_socket && fs.chmodSync(conf.listen_socket, '0777')

const listen = (conf) => conf.listen_socket ? conf.listen_socket : conf.listen_port
const serveStatic = (conf) => conf.serve_static

const uploadActions = (conf, action) => {
  const actions = conf.upload_actions || []
  return actions.includes(action)
}

module.exports = {
  configure,
  serveStatic,
  fileSystem,
  listen,
  uploadActions
}
