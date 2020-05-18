const { execSync, spawnSync: spawn } = require('child_process')
const { readFileSync } = require('fs')
const { AssertionError, deepEqual } = require('assert')

const {
  repoPath,
  bareRepoPath,
  mockServerHost,
  mockRequestsPath,
  githubServerPort,
  npmServerPort,
} = require('./constants')

const exec = (...args) => execSync(...args).toString('utf-8')

const execInTestRepo = (command, options) =>
  exec(command, { ...options, cwd: repoPath })

const spawnInTestRepo = (command, args, options) =>
  spawn(command, args, { ...options, cwd: repoPath })

const execInBareRepo = (command, options) =>
  exec(command, { ...options, cwd: bareRepoPath })

/**
 * shorthand for staging any working changes & commiting with provided message
 * @param {string} commitMessage
 */
const gitCommit = (commitMessage) =>
  execInTestRepo(`git add . && git commit -qm "${commitMessage}"`)

const runSemanticRelease = ({ publish } = { publish: true }) => {
  const env = {
    GITHUB_ACTION: 'some-id',
    NPM_TOKEN: 'some-npm-token',
    GITHUB_REF: 'refs/heads/master',
    GITHUB_TOKEN: 'some-gh-token',
    GITHUB_URL: `http://${mockServerHost}:${githubServerPort}`,
    GITHUB_API_URL: `http://${mockServerHost}:${githubServerPort}`,
    NPM_CONFIG_REGISTRY: `http://${mockServerHost}:${npmServerPort}`,
  }

  let semanticReleaseCommand
  let spawnOptions = {}

  if (process.env.DEBUG_SEMANTIC_RELEASE) {
    semanticReleaseCommand = `workspaces run node inspect ../../node_modules/semantic-release/bin/semantic-release.js --no-ci -e semantic-release-monorepo-config`
    spawnOptions = { ...spawnOptions, stdio: 'inherit' }
  } else {
    semanticReleaseCommand = `workspaces run semantic-release --no-ci -e semantic-release-monorepo-config`
  }

  const args = semanticReleaseCommand.split(' ')
  if (publish) {
    args.push('--npm-publish')
  }

  return spawnInTestRepo('yarn', args, {
    ...spawnOptions,
    env: { ...process.env, ...env },
  })
}

const listCommits = () => {
  return execInTestRepo('git log --pretty=format:"%s"')
}

const listTags = () => {
  return execInBareRepo('git tag --list')
}

/**
 * @typedef CommitOptions
 * @property {String} commitMessage
 * @property {String} content
 * @property {String} file
 */

/**
 * appends text to a file & commits with the provided commit prefix
 * @param {string} packagePath (package-a, package-b)
 * @param {string} commitPrefix
 * @param {CommitOptions} options
 */
const commitChange = (
  packagePath,
  commitPrefix,
  { commitMessage, file, content } = {
    commitMessage: 'add some changes',
    file: 'DONTREADME.md',
    content: 'hello world',
  }
) => {
  execInTestRepo(`echo "${content}" >> packages/${packagePath}/${file}`)
  gitCommit(`${commitPrefix}: ${commitMessage}`)
}

/**
 * @param {string} serviceName
 * @param {string} method
 * @param {string} url
 */
const assertRequestOccurred = (serviceName, method, url) => {
  const filename = `${serviceName}-${method}-${url.replace(/\//g, '-')}`
  try {
    const requestBody = readFileSync(`${mockRequestsPath}/${filename}`, {
      encoding: 'utf8',
    })
    return JSON.parse(requestBody)
  } catch (_) {
    throw new AssertionError({
      message: `No request found for service=${serviceName} method=${method} url=${url}`,
      expected: filename,
    })
  }
}

/**
 * @param {Object} actual
 * @param {Object} includes
 */
const assertContainsObject = (actual, includes) => {
  Object.keys(includes).forEach((key) => {
    deepEqual(
      actual[key],
      includes[key],
      `unexpected value for request body param '${key}'`
    )
  })
}

/**
 * @typedef {Object} AssertRequestOptions
 * @property {Object} bodyContains
 * @property {Object} requestBody
 */

/**
 * @param {AssertRequestOptions} options
 */
const assertRequestContains = ({ bodyContains, requestBody }) => {
  if (!bodyContains || !requestBody) {
    throw new AssertionError({
      message: 'Expected requestBody and bodyContains to be objects',
      actual: {
        bodyContains: typeof bodyContains,
        requestBody: typeof requestBody,
      },
    })
  }

  assertContainsObject(requestBody, bodyContains)
}

module.exports = {
  exec,
  execInTestRepo,
  execInBareRepo,
  gitCommit,
  runSemanticRelease,
  listCommits,
  listTags,
  commitChange,
  assertRequestOccurred,
  assertRequestContains,
}
