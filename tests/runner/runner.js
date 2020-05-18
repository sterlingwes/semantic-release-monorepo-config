const { createTestExecutor } = require('./harness')
const Tests = require('../specs')

const reservedHooks = ['beforeAll', 'afterAll']

/**
 * @typedef TestDefinition
 * @property {String} suiteName
 * @property {String} unitName
 * @property {Function} execute
 */

/**
 * @param {TestDefinition} param0
 */
const notLifecycleHook = ({ unitName }) =>
  reservedHooks.includes(unitName) === false

const unitTestSuites = Object.keys(Tests).map((suiteName) => {
  const suiteExports = Tests[suiteName]
  return Object.keys(suiteExports)
    .map((unitName) => ({
      suiteName,
      unitName,
      execute: createTestExecutor(suiteExports[unitName]),
    }))
    .filter(notLifecycleHook)
})

const runTests = () => {
  const summary = { passed: 0, failed: 0 }

  const unitResults = unitTestSuites.map((units) => {
    const suiteName = units[0] ? units[0].suiteName : ''
    const suite = Tests[suiteName]
    const beforeAll = suite.beforeAll
    const afterAll = suite.afterAll

    // this works b/c we run our commands with node sync methods
    if (typeof beforeAll === 'function') {
      beforeAll()
    }

    const suiteUnitResults = units.map((unit) => {
      const unitResult = {
        ...unit,
        result: unit.execute(),
      }

      if (unitResult.result.ok) {
        summary.passed += 1
      } else {
        summary.failed += 1
      }

      return unitResult
    })

    if (typeof afterAll === 'function') {
      afterAll()
    }

    return suiteUnitResults
  })

  console.log(
    '\n================\ntest results:',
    JSON.stringify(unitResults, null, 2),
    '\n'
  )

  console.log(summary)

  if (summary.failed > 0) {
    process.exit(1)
  }
}

runTests()
