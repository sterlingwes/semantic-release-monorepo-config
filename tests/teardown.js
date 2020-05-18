const { exec } = require('./helpers')
const { repoPath, bareRepoPath } = require('./constants')

const cleanupRepo = () => {
  console.log(`removing test repo at ${repoPath}`)
  exec(`rm -rf ${repoPath}`)
  console.log(`removing bare test repo at ${bareRepoPath}`)
  exec(`rm -rf ${bareRepoPath}`)
}

cleanupRepo()
