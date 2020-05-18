const { exec, execInTestRepo, execInBareRepo, gitCommit } = require('./helpers')

const {
  gitServerHost,
  gitServerPort,
  repoPath,
  bareRepoName,
  bareRepoPath,
  yarnCacheFolder,
} = require('./constants')

const setupTemplateRepo = () => {
  console.log(`setting up test repo at path ${repoPath}`)
  exec(`cp -r tests/template-repo ${repoPath}`)
  exec(`cd ${repoPath}`)
  execInTestRepo('git init')
  gitCommit('initial commit')
}

const recreateRepoFromBareClone = () => {
  exec(`git clone --bare ${repoPath} ${bareRepoPath}`)
  execInBareRepo('git remote remove origin')
  exec(`rm -rf ${repoPath}`)
  exec(`git clone ${bareRepoPath} ${repoPath}`)
  execInTestRepo('git remote remove origin')
  execInTestRepo(
    `git remote add origin http://${gitServerHost}:${gitServerPort}/${bareRepoName}`
  )
}

const installDependencies = () => {
  const pkg = require('../package.json')
  const testRepoDependencies = {
    'semantic-release': pkg.devDependencies['semantic-release'],
    'semantic-release-monorepo-config': '../semantic-release-monorepo-config',
  }

  console.log('installing dependencies:', testRepoDependencies)

  const testRepoManifest = execInTestRepo('cat package.json')
  const manifest = JSON.parse(testRepoManifest)
  manifest.dependencies = {
    ...manifest.dependencies,
    ...testRepoDependencies,
  }
  const manifestStr = JSON.stringify(manifest, null, 2)
  require('fs').writeFileSync(`${repoPath}/package.json`, manifestStr)

  execInTestRepo(`yarn --cache-folder ../${yarnCacheFolder}`)

  console.log('==== debugging deps')

  execInTestRepo(
    "sed  -i '' -e 's/options =/console.log(options);options =/g' node_modules/@octokit/rest/lib/constructor.js"
  )

  execInTestRepo(
    "sed -i '' 's/debug[(]/throw new Error(JSON.stringify({ pluginConfig, githubToken, githubUrl, owner, repo }));debug(/g' node_modules/@semantic-release/github/lib/publish.js"
  )

  gitCommit('add semantic-release and monorepo config')
}

setupTemplateRepo()
recreateRepoFromBareClone()
installDependencies()
