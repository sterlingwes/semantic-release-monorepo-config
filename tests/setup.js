const { exec, execInTestRepo, repoPath } = require('./helpers')

const setupTemplateRepo = () => {
  console.log(`setting up test repo at path ${repoPath}`)
  exec(`cp -r tests/template-repo ${repoPath}`)
  exec(`cd ${repoPath}`)
  execInTestRepo('git init')
  execInTestRepo('git add . && git commit -qm "initial commit"')
}

const listCommits = () => {
  const commits = execInTestRepo('git log --pretty=format:"%s"')
  console.log('commits:\n', commits, '\n')
}

const cleanupRepo = () => {
  console.log(`removing test repo at ${repoPath}`)
  exec(`rm -r ${repoPath}`)
}

setupTemplateRepo()
listCommits()
cleanupRepo()
