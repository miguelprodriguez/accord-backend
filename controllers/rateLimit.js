const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis')

module.exports.limitRate = (req, res, next) => {
    // Rate limiting only applies to the /tokens route.
    rateLimiterRedis
        .consume(req.connection.remoteAddress, 2) // consume 2 points
        .then(() => {
            // Allow request and consume 1 point.
            next()
        })
        .catch(() => {
            // Not enough points. Block the request.
            res.status(429).send('Too Many Requests')
        })
}

const redisClient = new Redis()
const opts = {
    // Basic options
    storeClient: redisClient,
    points: 6, // Number of points
    duration: 5, // Per second(s)
};

const rateLimiterRedis = new RateLimiterRedis(opts);