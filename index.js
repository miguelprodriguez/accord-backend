const express = require('express')
const { Server } = require('socket.io')
const app = express()
const http = require('http')
const server = http.createServer(app)
const helmet = require('helmet')
const cors = require('cors')
const userRoutes = require('./routes/user')
const { sessionMiddleware, wrap } = require('./middlewares/session')
const Redis = require('ioredis')

const corsConfig = {
    origin: 'http://localhost:3000',
    credentials: true,
}

// Middleware functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet())
app.use(cors(corsConfig))
app.use(sessionMiddleware)

// Routes
app.use('/api/users', userRoutes);
app.get('/', (req, res) => {
    res.json("hi")
})

// IO 
const io = new Server(server, { cors: corsConfig })

io.use(wrap(sessionMiddleware))

const redisClient = new Redis()
io.use((socket, next) => {
    if (!socket.request.session || !socket.request.session.user) {
        next(new Error("You shall not pass"))
        return
    }

    // Create user property and desctructure from socket request
    socket.user = { ...socket.request.session.user }
    next()
})
io.on('connection', socket => {
    console.log("Socket username: ", socket.user)
    // HSET key field/column value [field value ...]
    redisClient.hset(`userId:${socket.user.username}`, "userId", socket.user.userId)

    socket.on('add_friend', async (friendName, callback) => {
        if (friendName === socket.user.username) return callback({
            done: false,
            errorMessage: 'You cannot add yourself.'
        })

        const currentFriendsList = await redisClient.lrange(
            `friends:${socket.user.username}`,
            0, -1 // get the whole range
        )
        if (currentFriendsList && currentFriendsList.indexOf(friendName) !== -1) {
            return callback({ done: false, errorMessage: 'Friend already added.' })
        }

        const friendUserid = await redisClient.hget(
            `userId:${friendName}`,
            'userId'
        )
        if (!friendUserid) return callback({
            done: false,
            errorMessage: "User does not exist."
        })

        await redisClient.lpush(`friends:${socket.user.username}`, friendName)
        callback({ done: true })
    })
})

server.listen(4000, () => console.log('Server listening on port 4000'))