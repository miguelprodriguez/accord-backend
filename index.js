const express = require('express')
const { Server } = require('socket.io')
const app = express()
const http = require('http')
const server = http.createServer(app)
const helmet = require('helmet')
const cors = require('cors')
const userRoutes = require('./routes/user')

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
})

// Parse req body; middleware functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet())
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}))

app.use('/api/users', userRoutes);

app.use(express.json())

app.get('/', (req, res) => {
    res.json("hi")
})

io.on('connection', socket => {})

server.listen(4000, () => {
    console.log('Server listening on port 4000')
})