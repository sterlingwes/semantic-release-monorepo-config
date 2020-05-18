const assert = require('assert')
const { runSemanticRelease, listCommits, commitChange } = require('../helpers')

module.exports = {
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
    const expectedCommits = `
chore(release): 1.0.0
fix: add some changes`

    assert.equal(
      commitDiff,
      expectedCommits,
      'expect new release commit to be added'
    )
  },
}
