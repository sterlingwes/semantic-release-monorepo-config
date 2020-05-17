const result = ({ err } = {}) => ({
  ok: !err,
  error: err,
})

const createTestExecutor = (execute) => () => {
  try {
    execute()
    return result()
  } catch (err) {
    return result({ err })
  }
}

module.exports = { createTestExecutor }
