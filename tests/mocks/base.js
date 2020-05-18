const http = require('http')
const fs = require('fs')

const { mockRequestsPath } = require('../constants')

const hostname = '127.0.0.1'

const getRequestSlug = ({ method, url }) =>
  `${method}-${url}`.replace(/\//g, '-')

const readBody = (mockServerName, req) => {
  const writePath = `${mockRequestsPath}/${mockServerName}-${getRequestSlug(
    req
  )}`
  const copyStream = fs.createWriteStream(writePath, {
    encoding: 'utf8',
  })

  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => {
      copyStream.write(chunk)
      body += chunk
    })
    req.on('end', () => {
      copyStream.end()
      resolve(body)
    })
  })
}

const isJson = (req) => {
  return req.headers['content-type'] === 'application/json'
}

const createMockServer = (configuration) => {
  const { name, port, mockResponder } = configuration

  const server = http.createServer((req, res) => {
    const { method, url, headers } = req

    readBody(name, req).then((body) => {
      let json
      if (isJson(req)) {
        json = JSON.parse(body)
      }

      const requestDetails = {
        headers,
        method,
        url,
        body,
        json,
      }

      console.log('received request', requestDetails)

      const defaultResponse = () => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(body)
      }

      if (typeof mockResponder === 'function') {
        const { statusCode, jsonBody } = mockResponder(requestDetails).then(
          (mockResponse) => {
            if (!mockResponse) {
              console.log('No mock response resolved for', method, url)
              defaultResponse()
              return
            }

            res.statusCode = mockResponse.statusCode
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(mockResponse.jsonBody))
          }
        )
        return
      }

      defaultResponse()
    })
  })

  server.listen(port, hostname)
}

module.exports = { createMockServer }
