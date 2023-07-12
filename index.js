const express = require('express')
const { Server } = require('socket.io')
const app = express()
const http = require('http')
const server = http.createServer(app)
const helmet = require('helmet')
const cors = require('cors')
const userRoutes = require('./routes/user')
const session = require('express-session')
const Redis = require('ioredis')
const RedisStore = require('connect-redis').default
require('dotenv').config()

const corsConfig = {
    origin: 'http://localhost:3000',
    credentials: true,
}

const io = new Server(server, { cors: corsConfig })

const redisClient = new Redis()
const redisStore = new RedisStore({ client: redisClient })

// Middleware functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet())
app.use(cors(corsConfig))

app.use(session({
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
}))

// Routes
app.use('/api/users', userRoutes);
app.get('/', (req, res) => {
    res.json("hi")
})

io.on('connection', socket => { })

server.listen(4000, () => console.log('Server listening on port 4000'))