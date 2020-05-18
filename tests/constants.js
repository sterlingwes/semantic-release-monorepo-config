const { resolve } = require('path')

const gitServerHost = '127.0.0.1'
const gitServerPort = 5000
const mockServerHost = '127.0.0.1'
const githubServerPort = 3001
const npmServerPort = 3002

const repoName = 'semantic-test-repo'
const bareRepoName = 'semantic-test-repo-bare'

const repoPath = resolve('../', repoName)
const bareRepoPath = resolve('../', bareRepoName)
const mockRequestsPath = resolve('./', 'mock-server-requests')

const yarnCacheFolder = 'semantic-release-npm-cache'

module.exports = {
  gitServerHost,
  gitServerPort,
  mockServerHost,
  githubServerPort,
  npmServerPort,
  repoName,
  repoPath,
  bareRepoName,
  bareRepoPath,
  yarnCacheFolder,
  mockRequestsPath,
}
