const { createMockServer } = require('./base')
const { githubServerPort } = require('../constants')

// semantic-release infers the owner/repo from the remote origin
// url, which in the test case does not have an owner, so their parsing
// is off - but that doesn't affect our test results so let's go with it
const repoName = 'semantic-test-repo-bar/e'

createMockServer({
  name: 'github',
  port: githubServerPort,
  mockResponder: async ({ method, url }) => {
    if (method === 'GET' && url.includes(`repos/${repoName}`)) {
      return {
        statusCode: 200,
        jsonBody: {
          full_name: repoName,
        },
      }
    }

    // can refine this to return a list of PRs and assert the PR comment that's added
    // when releases are published
    // ref: https://github.com/semantic-release/github/blob/a04f84fe44852925576983d59d3195a8e5847ed7/lib/success.js#L45
    if (method === 'GET' && url.includes('search/issues')) {
      return {
        statusCode: 200,
        jsonBody: {
          items: [],
        },
      }
    }
  },
})
