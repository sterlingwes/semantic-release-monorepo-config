const { createMockServer } = require('./base')
const { githubServerPort } = require('../constants')

// semantic-release infers the owner/repo from the remote origin
// url, which in the test case does not have an owner, so their parsing
// is off - but that doesn't affect our test results so let's go with it
const repoName = 'semantic-test-repo-bar/e'

let requestSequence = 0

const mockCreateRelease = {
  url: 'https://api.github.com/repos/octocat/Hello-World/releases/1',
  html_url: 'https://github.com/octocat/Hello-World/releases/v1.0.0',
  assets_url:
    'https://api.github.com/repos/octocat/Hello-World/releases/1/assets',
  upload_url:
    'https://uploads.github.com/repos/octocat/Hello-World/releases/1/assets{?name,label}',
  tarball_url:
    'https://api.github.com/repos/octocat/Hello-World/tarball/v1.0.0',
  zipball_url:
    'https://api.github.com/repos/octocat/Hello-World/zipball/v1.0.0',
  id: 1,
  node_id: 'MDc6UmVsZWFzZTE=',
  tag_name: 'v1.0.0',
  target_commitish: 'master',
  name: 'v1.0.0',
  body: 'Description of the release',
  draft: false,
  prerelease: false,
  created_at: '2013-02-27T19:35:32Z',
  published_at: '2013-02-27T19:35:32Z',
  author: {
    login: 'octocat',
    id: 1,
    node_id: 'MDQ6VXNlcjE=',
    avatar_url: 'https://github.com/images/error/octocat_happy.gif',
    gravatar_id: '',
    url: 'https://api.github.com/users/octocat',
    html_url: 'https://github.com/octocat',
    followers_url: 'https://api.github.com/users/octocat/followers',
    following_url:
      'https://api.github.com/users/octocat/following{/other_user}',
    gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
    organizations_url: 'https://api.github.com/users/octocat/orgs',
    repos_url: 'https://api.github.com/users/octocat/repos',
    events_url: 'https://api.github.com/users/octocat/events{/privacy}',
    received_events_url: 'https://api.github.com/users/octocat/received_events',
    type: 'User',
    site_admin: false,
  },
  assets: [],
}

createMockServer({
  name: 'github',
  port: githubServerPort,
  mockResponder: async ({ method, url, json }) => {
    requestSequence += 1

    if (method === 'GET' && url.includes(`repos/${repoName}`)) {
      return {
        statusCode: 200,
        jsonBody: {
          full_name: repoName,
        },
      }
    }

    // mock create release
    //
    // return request sequence number b/c releaseId must be an integer to
    // pass octokit validation & this id is used in the update call to
    // finalize the draft release
    if (method === 'POST' && url.includes(`${repoName}/releases`)) {
      return {
        statusCode: 201,
        jsonBody: {
          ...mockCreateRelease,
          ...json,
          id: requestSequence,
        },
      }
    }

    if (method === 'GET' && url.includes('releases/tags')) {
      const urlParts = url.split('/')
      const versionTag = urlParts.pop()
      return {
        statusCode: 200,
        jsonBody: {
          id: versionTag,
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
