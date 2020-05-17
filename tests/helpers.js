const { execSync } = require('child_process')
const { resolve } = require('path')

const randomId = (len = 8) =>
  [...Array(len)].map(() => Math.random().toString(36)[2]).join('')

const repoPath = resolve('../', `semantic-test-repo-${randomId()}`)

const exec = (...args) => execSync(...args).toString('utf-8')

const execInTestRepo = (command, options) =>
  exec(command, { ...options, cwd: repoPath })

module.exports = { exec, execInTestRepo, repoPath }
