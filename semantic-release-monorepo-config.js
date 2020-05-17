const semanticReleaseNpm = require('@semantic-release/npm')
const semanticReleaseGit = require('@semantic-release/git')
const semanticReleaseGithub = require('@semantic-release/github')
const semanticReleaseChanelog = require('@semantic-release/changelog')
const {
  analyzeCommits,
  generateNotes,
  tagFormat,
} = require('semantic-release-monorepo')

const noPublishNpmConfig = (pluginConfig) => ({
  ...pluginConfig,
  npmPublish: true,
})

const configure = (context) => ({
  ...context,
  options: {
    ...(context.options || {}),
    publish: [
      {
        path: '@semantic-release/npm',
        npmPublish: true,
      },
    ],
  },
})

const commitMessageConfig = (pluginConfig) => ({
  ...pluginConfig,
  assets: ['CHANGELOG.md', 'package.json'],
  message: 'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
})

/**
 * default semantic-release plugins:
 *
 * @semantic-release/commit-analyzer
 * @semantic-release/release-notes-generator
 * @semantic-release/npm
 * @semantic-release/github
 */

module.exports = {
  analyzeCommits,
  generateNotes,
  tagFormat,

  verifyConditions: async (pluginConfig, context) => {
    semanticReleaseGit.verifyConditions(
      commitMessageConfig(pluginConfig),
      context
    )
    await semanticReleaseChanelog.verifyConditions(pluginConfig, context)
    await semanticReleaseNpm.verifyConditions(
      noPublishNpmConfig(pluginConfig),
      configure(context)
    )
    await semanticReleaseGithub.verifyConditions(pluginConfig, context)
  },

  prepare: async (pluginConfig, context) => {
    await semanticReleaseChanelog.prepare(pluginConfig, context)
    await semanticReleaseNpm.prepare(
      noPublishNpmConfig(pluginConfig),
      configure(context)
    )
    await semanticReleaseGit.prepare(commitMessageConfig(pluginConfig), context)
  },

  publish: async (pluginConfig, context) => {
    await semanticReleaseNpm.publish(
      noPublishNpmConfig(pluginConfig),
      configure(context)
    )
    await semanticReleaseGithub.publish(pluginConfig, context)
  },

  addChannel: async (pluginConfig, context) => {
    await semanticReleaseNpm.addChannel(
      noPublishNpmConfig(pluginConfig),
      configure(context)
    )
  },
}
