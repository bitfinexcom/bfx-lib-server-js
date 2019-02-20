const requestIp = require('request-ip')

function parseTokenIp (req) {
  const ip = requestIp.getClientIp(req)
  const token = (req && req.headers && req.headers.token) ||
    (req && req.query && req.query.token)
  return [token, { ip }]
}

function getIp (req) {
  return requestIp.getClientIp(req)
}

module.exports = { parseTokenIp, getIp }
