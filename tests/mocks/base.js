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

const isJsonBody = (req) => {
  return (req.headers['content-type'] || '').includes('application/json')
}

const createMockServer = (configuration) => {
  const { name, port, mockResponder } = configuration

  const server = http.createServer((req, res) => {
    const { method, url, headers } = req

    const errorResponse = (message) => {
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end(message)
    }

    readBody(name, req)
      .then((body) => {
        let json
        if (isJsonBody(req)) {
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
          mockResponder(requestDetails)
            .then((mockResponse) => {
              if (!mockResponse) {
                console.log('No mock response resolved for', method, url)
                defaultResponse()
                return
              }

              res.statusCode = mockResponse.statusCode
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(mockResponse.jsonBody))
            })
            .catch((e) => {
              errorResponse(
                `[${name}] failed to mock response url=${url} error=${e.message} stack=${e.stack}`
              )
            })
          return
        }

        defaultResponse()
      })
      .catch((e) => {
        errorResponse(
          `[${name}] failed to parse request body url=${url} error=${e.message} stack=${e.stack}`
        )
      })
  })

  server.listen(port, hostname)
}

module.exports = { createMockServer }
