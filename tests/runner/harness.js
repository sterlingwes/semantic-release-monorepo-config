const result = ({ err } = {}) => ({
  ok: !err,
  error: err,
})

const createTestExecutor = (execute) => () => {
  try {
    execute()
    return result()
  } catch (err) {
    console.log('test exec failure', err)
    if (err.output) {
      return result({ err: 'error w/ buffer (see console output above)' })
    }
    return result({ err })
  }
}

module.exports = { createTestExecutor }
