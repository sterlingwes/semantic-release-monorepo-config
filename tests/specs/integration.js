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
    commitChange('package-a', 'fix')
    const result = runSemanticRelease()
    console.log('result:', result)
    console.log(listCommits())
  },
}
