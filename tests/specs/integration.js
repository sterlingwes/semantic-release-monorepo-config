const assert = require('assert')
const {
  exec,
  execAsync,
  runSemanticRelease,
  listCommits,
  commitChange,
  assertRequestOccurred,
  assertRequestContains,
} = require('../helpers')

const { mockRequestsPath } = require('../constants')

module.exports = {
  beforeAll: () => {
    console.log('setting up integration test environment...')
    exec(`rm -rf ${mockRequestsPath}`)
    exec(`mkdir ${mockRequestsPath}`)
    execAsync(`./start-test-mock-servers.sh`)
    exec('node tests/setup')
    console.log('done beforeAll... running tests')
  },

  afterAll: () => {
    console.log('cleaning up test environment')
    exec('node tests/teardown')
    exec(`./stop-test-mock-servers.sh`)
  },

  'with a brand new repo, should be a no-op': () => {
    const before = listCommits()
    runSemanticRelease()
    const after = listCommits()
    assert.equal(before, after, 'expect no new commits')
  },

  'with a package-a fix, should only bump package-a': () => {
    const before = listCommits()
    commitChange('package-a', 'fix')
    const result = runSemanticRelease()
    const after = listCommits()

    const commitDiff = after.replace(before, '')
    const expectedCommits = `chore(release): 1.0.0
fix: add some changes
`

    assert.equal(
      commitDiff,
      expectedCommits,
      'expect new release commit to be added'
    )

    // assert that expected NPM publish event occurred
    const requestBody = assertRequestOccurred('npm', 'PUT', '/package-a')
    assertRequestContains({
      bodyContains: { 'dist-tags': { latest: '1.0.0' } },
      requestBody,
    })
    assertRequestContains({
      bodyContains: { name: 'package-a' },
      requestBody,
    })
  },
}
