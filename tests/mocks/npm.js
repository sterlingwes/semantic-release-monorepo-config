const { createMockServer } = require('./base')
const { npmServerPort } = require('../constants')

createMockServer({
  name: 'npm',
  port: npmServerPort,
})
