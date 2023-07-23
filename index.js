const express = require('express')
const { Server } = require('socket.io')
const app = express()
const http = require('http')
const server = http.createServer(app)
const helmet = require('helmet')
const cors = require('cors')
const userRoutes = require('./routes/user')
const chatRoutes = require('./routes/chat')
const { sessionMiddleware, wrap } = require('./middlewares/session')
const { handleOnlineStatus, authenticateSocket } = require('./middlewares/socket')

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
app.use('/api/chats', chatRoutes);

// IO 
const io = new Server(server, { cors: corsConfig })
io.use(wrap(sessionMiddleware))

// const redisClient = new Redis()
io.use(authenticateSocket)

const onlineUsers = [];
io.on('connection', socket => handleOnlineStatus(socket, onlineUsers, io))

server.listen(4000, () => console.log('Server listening on port 4000'))