const assert = require('assert')
const {
  exec,
  runSemanticRelease,
  listCommits,
  listTags,
  commitChange,
  assertRequestOccurred,
  assertRequestContains,
} = require('../helpers')

const { spawnMockServers, killMockServers } = require('../mocks')
const { mockRequestsPath } = require('../constants')

module.exports = {
  beforeAll: () => {
    console.log('setting up integration test environment...')
    exec(`rm -rf ${mockRequestsPath}`)
    exec(`mkdir ${mockRequestsPath}`)
    spawnMockServers()
    exec('node tests/setup')
    console.log('done beforeAll... running tests')
  },

  afterAll: () => {
    console.log('cleaning up test environment')
    exec('node tests/teardown')
    killMockServers()
  },

  'with a brand new repo, should be a no-op': () => {
    const before = listCommits()
    runSemanticRelease()
    const after = listCommits()
    assert.equal(before, after, 'expect no new commits')
  },

  'with a package-a fix, should only bump package-a & publish to NPM': () => {
    const before = listCommits()
    commitChange('package-a', 'fix')
    runSemanticRelease()
    const after = listCommits()

    const commitDiff = after.replace(before, '')
    const expectedCommits = `chore(release): package-a-v1.0.0
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

  'should add package-based release tags': () => {
    const tags = listTags()
    const expectedTags = `package-a-v1.0.0\n`
    assert.equal(tags, expectedTags)
  },

  'with another package-a fix, should patch bump & publish to NPM': () => {
    const before = listCommits()
    commitChange('package-a', 'fix')
    runSemanticRelease()
    const after = listCommits()

    const commitDiff = after.replace(before, '')
    const expectedCommits = `chore(release): package-a-v1.0.1
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
      bodyContains: { 'dist-tags': { latest: '1.0.1' } },
      requestBody,
    })
    assertRequestContains({
      bodyContains: { name: 'package-a' },
      requestBody,
    })
  },

  'when bumping both packages at once, should commit, tag and publish separately': () => {
    const before = listCommits()
    commitChange('package-a', 'feat')
    commitChange('package-b', 'fix')
    runSemanticRelease()
    const after = listCommits()

    const commitDiff = after.replace(before, '')
    const expectedCommits = `chore(release): package-b-v1.0.0
chore(release): package-a-v1.1.0
fix: add some changes
feat: add some changes
`

    assert.equal(
      commitDiff,
      expectedCommits,
      'expect new release commit to be added'
    )

    const tags = listTags()
    const expectedTags = `package-a-v1.0.0
package-a-v1.0.1
`
    assert.equal(tags, expectedTags)

    // assert that expected NPM publish event occurred
    const packageA = assertRequestOccurred('npm', 'PUT', '/package-a')
    assertRequestContains({
      bodyContains: { 'dist-tags': { latest: '1.1.0' } },
      requestBody: packageA,
    })

    const packageB = assertRequestOccurred('npm', 'PUT', '/package-b')
    assertRequestContains({
      bodyContains: { 'dist-tags': { latest: '1.0.0' } },
      requestBody: packageB,
    })
  },
}
