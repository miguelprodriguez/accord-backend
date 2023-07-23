const Redis = require('ioredis')
const RedisStore = require('connect-redis').default

const redisClient = new Redis()
const redisStore = new RedisStore({ client: redisClient })

module.exports = { redisClient, redisStore }