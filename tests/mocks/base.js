const http = require('http')

const hostname = '127.0.0.1'

const readBody = (req) => {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      resolve(body)
    })
  })
}

const isJson = (req) => {
  return req.headers['content-type'] === 'application/json'
}

const createMockServer = (configuration) => {
  const { name, port } = configuration

  const server = http.createServer((req, res) => {
    const { method, url, headers } = req
    readBody(req).then((body) => {
      let json
      if (isJson(req)) {
        json = JSON.parse(body)
      }
      console.log('received request', {
        headers,
        method,
        url,
        body,
        json,
      })
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      res.end('Hello World')
    })
  })

  server.listen(port, hostname)
}

module.exports = { createMockServer }
