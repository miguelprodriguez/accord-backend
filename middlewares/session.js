
const session = require('express-session')
const Redis = require('ioredis')
const RedisStore = require('connect-redis').default
require('dotenv').config()

const redisClient = new Redis()
const redisStore = new RedisStore({ client: redisClient })

const sessionMiddleware = session({
    name: 'sid', // session ID
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.ENVIRONMENT === 'production',
        sameSite: process.env.ENVIRONMENT === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
    store: redisStore
})

const wrap = expressMiddleware => (socket, next) => expressMiddleware(socket.request, {}, next)

module.exports = { sessionMiddleware, wrap }