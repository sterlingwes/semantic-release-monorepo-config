const assert = require('assert')
const { assertRequestOccurred, assertRequestContains } = require('../helpers')

module.exports = {
  'assertRequestOccurred with no match': () => {
    try {
      assertRequestOccurred('npm', 'POST', '/my-repo/releases')
    } catch (e) {
      assert.equal(
        e.expected,
        'npm-POST--my-repo-releases',
        'should throw AssertionError with file path it tried to find'
      )
    }
  },

  'assertRequestContains with key but no match': () => {
    try {
      assertRequestContains({
        bodyContains: {
          'dist-tags': { latest: '1.0.0' },
        },
        requestBody: {
          'dist-tags': {},
        },
      })
    } catch (e) {
      assert.equal(e.code, 'ERR_ASSERTION')
    }
  },

  'assertRequestContains with no matching key': () => {
    try {
      assertRequestContains({
        bodyContains: {
          'dist-tags': { latest: '1.0.0' },
        },
        requestBody: {
          'you-must-be-lost': {},
        },
      })
    } catch (e) {
      assert.equal(e.code, 'ERR_ASSERTION')
    }
  },

  'assertRequestContains with matching key & value': () => {
    assertRequestContains({
      bodyContains: {
        'dist-tags': { latest: '1.0.0' },
      },
      requestBody: {
        'dist-tags': { latest: '1.0.0' },
      },
    })
  },
}
