# semantic-release-monorepo-config

An opinionated shareable config for semantic release in monorepos, wraps [semantic-release-monorepo](https://github.com/pmowrer/semantic-release-monorepo).

## Testing

The test script spins up an integration test environment involving repos with their own NPM dependencies.

`yarn test` will create sibling folders of this directory. So if you have cloned this repo to `~/code`, you can expect to see the following folders:

```
> ls ~/code | grep semantic
semantic-release-monorepo-config
semantic-release-npm-cache
semantic-test-repo
semantic-test-repo-bare
```

The test environment setup requires installing npm modules in the test repo, so it is not fast.

When the test run completes, the folders created above are removed.
