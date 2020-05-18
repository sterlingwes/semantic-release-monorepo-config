const { execSync, exec: execAsync } = require('child_process')
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

const execInBareRepo = (command, options) =>
  exec(command, { ...options, cwd: bareRepoPath })

/**
 * shorthand for staging any working changes & commiting with provided message
 * @param {string} commitMessage
 */
const gitCommit = (commitMessage) =>
  execInTestRepo(`git add . && git commit -qm "${commitMessage}"`)

const runSemanticRelease = () => {
  const env = {
    GITHUB_ACTION: 'some-id',
    NPM_TOKEN: 'some-npm-token',
    GITHUB_REF: 'refs/heads/master',
    GITHUB_TOKEN: 'some-gh-token',
    GITHUB_URL: `http://${mockServerHost}:${githubServerPort}`,
    GITHUB_API_URL: `http://${mockServerHost}:${githubServerPort}`,
    NPM_CONFIG_REGISTRY: `http://${mockServerHost}:${npmServerPort}`,
  }
  const stubEnv = Object.entries(env).reduce(
    (envStr, [key, val]) => `${envStr} ${key}=${val}`,
    ''
  )

  let semanticReleaseCommand

  if (process.env.DEBUG_SEMANTIC_RELEASE) {
    semanticReleaseCommand = `${stubEnv} yarn workspaces run node inspect ../../node_modules/semantic-release/bin/semantic-release.js --no-ci -e semantic-release-monorepo-config`
  } else {
    semanticReleaseCommand = `${stubEnv} yarn workspaces run semantic-release --no-ci -e semantic-release-monorepo-config`
  }

  return execInTestRepo(semanticReleaseCommand)
}

const listCommits = () => {
  return execInTestRepo('git log --pretty=format:"%s"')
}

/**
 * appends text to a file & commits with the provided commit prefix
 * @param {string} packagePath (package-a, package-b)
 * @param {string} commitPrefix
 */
const commitChange = (packagePath, commitPrefix) => {
  execInTestRepo(`echo "hello world" >> packages/${packagePath}/DONTREADME.md`)
  gitCommit(`${commitPrefix}: add some changes`)
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
  execAsync,
  execInTestRepo,
  execInBareRepo,
  gitCommit,
  runSemanticRelease,
  listCommits,
  commitChange,
  assertRequestOccurred,
  assertRequestContains,
}
