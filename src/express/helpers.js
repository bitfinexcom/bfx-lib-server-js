const requestIp = require('request-ip')

function parseTokenIp (req) {
  const ip = requestIp.getClientIp(req)
  const { token, auth } = req.headers
  if (token) {
    return [token, { ip }]
  }
  let authObject = {}
  try {
    if (auth) {
      authObject = JSON.parse(auth)
    }
  } catch (e) {
    console.error(e)
  }
  authObject.ip = ip
  return authObject
}

function getIp (req) {
  return requestIp.getClientIp(req)
}

module.exports = { parseTokenIp, getIp }
