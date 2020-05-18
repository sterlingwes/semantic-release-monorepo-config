const http = require('http')
const path = require('path')
const zlib = require('zlib')
const { spawn } = require('child_process')
const backend = require('git-http-backend')

const { gitServerHost, gitServerPort, bareRepoName } = require('../constants')
const repoDir = path.resolve(__dirname, '../../..', bareRepoName)

const server = http.createServer(function (req, res) {
  const repo = req.url.split('/')[1]

  const reqStream =
    req.headers['content-encoding'] == 'gzip'
      ? req.pipe(zlib.createGunzip())
      : req

  reqStream
    .pipe(
      backend(req.url, function (err, service) {
        if (err) {
          console.log(err)
          return res.end(err + '\n')
        }

        if (req.headers.accept !== '*/*') {
          res.setHeader('content-type', req.headers.accept)
        } else {
          res.setHeader('content-type', service.type)
        }

        const ps = spawn(service.cmd, service.args.concat(repoDir))
        ps.stdout.pipe(service.createStream()).pipe(ps.stdin)
      })
    )
    .pipe(res)
})

server.listen(gitServerPort, gitServerHost)
