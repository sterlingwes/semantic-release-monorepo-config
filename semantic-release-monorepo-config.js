const semanticReleaseNpm = require('@semantic-release/npm')
const semanticReleaseGit = require('@semantic-release/git')
const semanticReleaseGithub = require('@semantic-release/github')
const semanticReleaseChangelog = require('@semantic-release/changelog')
const {
  analyzeCommits,
  generateNotes,
  tagFormat,
} = require('semantic-release-monorepo')

const shouldPublish = process.argv.includes('--npm-publish')

const publishConfig = (pluginConfig) => ({
  ...pluginConfig,
  npmPublish: shouldPublish,
})

const configure = (context) => ({
  ...context,
  options: {
    ...(context.options || {}),
    publish: [
      {
        path: '@semantic-release/npm',
        npmPublish: shouldPublish,
      },
    ],
  },
})

const githubConfig = (pluginConfig) => ({
  ...pluginConfig,
  successComment: false,
})

const commitMessageConfig = (pluginConfig) => ({
  ...pluginConfig,
  assets: ['CHANGELOG.md', 'package.json'],
  message: 'chore(release): ${nextRelease.gitTag}\n\n${nextRelease.notes}',
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
    await semanticReleaseChangelog.verifyConditions(pluginConfig, context)
    await semanticReleaseNpm.verifyConditions(
      publishConfig(pluginConfig),
      configure(context)
    )
    await semanticReleaseGithub.verifyConditions(pluginConfig, context)
  },

  prepare: async (pluginConfig, context) => {
    await semanticReleaseChangelog.prepare(pluginConfig, context)
    await semanticReleaseNpm.prepare(
      publishConfig(pluginConfig),
      configure(context)
    )
    await semanticReleaseGit.prepare(commitMessageConfig(pluginConfig), context)
  },

  publish: async (pluginConfig, context) => {
    await semanticReleaseNpm.publish(
      publishConfig(pluginConfig),
      configure(context)
    )
    await semanticReleaseGithub.publish(pluginConfig, context)
  },

  addChannel: async (pluginConfig, context) => {
    await semanticReleaseNpm.addChannel(
      publishConfig(pluginConfig),
      configure(context)
    )
    await semanticReleaseGithub.addChannel(pluginConfig, context)
  },

  success: async (pluginConfig, context) => {
    await semanticReleaseGithub.addChannel(githubConfig(pluginConfig), context)
  },
}
