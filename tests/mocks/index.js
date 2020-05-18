const { spawn, execSync } = require('child_process')
const servers = ['github', 'npm', 'repo']
let children = []

const spawnMockServers = () => {
  children = servers.map((serverName) => {
    console.log(`spawning ${serverName} mock server`)
    return spawn('node', [`./tests/mocks/${serverName}`], { stdio: 'inherit' })
  })
}

const killMockServers = () => {
  children.forEach((child) => child.kill())
}

module.exports = {
  spawnMockServers,
  killMockServers,
}
