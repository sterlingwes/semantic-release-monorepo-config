const { createTestExecutor } = require('./harness')
const Units = require('./unit')

const unitTestSuites = Object.keys(Units).map((suiteName) => {
  const suiteExports = Units[suiteName]
  return Object.keys(suiteExports).map((unitName) => ({
    suiteName,
    unitName,
    execute: createTestExecutor(suiteExports[unitName]),
  }))
})

const runTests = () => {
  const unitResults = unitTestSuites.map((units) => {
    return units.map((unit) => ({
      ...unit,
      result: unit.execute(),
    }))
  })

  console.log('test results', JSON.stringify(unitResults, null, 2))
}

runTests()
