const requestIp = require('request-ip')

function parseTokenIp (req) {
  const ip = requestIp.getClientIp(req)
  const { token } = req.headers
  return [token, { ip }]
}

function getIp (req) {
  return requestIp.getClientIp(req)
}

module.exports = { parseTokenIp, getIp }
