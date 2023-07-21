const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');

module.exports.currentUser = async (req, res) => {
    if (!req.session.user) return res.status(403).send({ message: 'Please login.' })

    const user = await prisma.user.findFirst({ where: { username: req.session.user.username } })
    res.status(200).send(user)
}

module.exports.login = async (req, res) => {
    try {
        const existingUser = await prisma.user.findFirst({ where: { email: req.body.email } })
        if (!existingUser) return res.status(403).send({ message: 'Incorrect email or password' })

        const isPasswordMatching = bcrypt.compareSync(req.body.password, existingUser.password)
        if (!isPasswordMatching) return res.status(403).send({ message: 'Incorrect email or password' })

        const userDetails = await getUserDetails(req.body)

        const sessionData = {
            username: userDetails.username,
            userId: userDetails.userId
        }
        req.session.user = sessionData

        return res.status(200).send({ message: "Logged in successfully" })
    } catch (error) {
        return res.status(500).send({ message: 'We are having a few problems. Please try again later.' })
    }
}

module.exports.signup = async (req, res) => {
    try {
        const isUsernameAlreadyExists = await checkIfUsernameExistsAlready(req.body)
        if (isUsernameAlreadyExists) return res.status(409).send({ message: "Username already exists." })

        const isEmailAlreadyExists = await checkIfEmailExistsAlready(req.body)
        if (isEmailAlreadyExists) return res.status(409).json({ message: "Email already exists." })

        const SALT_ROUNDS = 10
        await prisma.user.create({
            data: {
                username: req.body.username,
                userId: uuidv4(),
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, SALT_ROUNDS),
                image: process.env.DEFAULT_USER_IMAGE_URL
            }
        })

        const userDetails = await getUserDetails(req.body)
        const sessionData = {
            username: userDetails.username,
            userId: userDetails.userId
        }
        req.session.user = sessionData

        return res.status(200).send({ message: "User has been created successfully." });
    } catch (error) {
        return res.status(500).send({ message: 'We are having a few problems. Please try again later.' })
    }
}

module.exports.suggestedUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        const suggestedUsers = users.filter(user => {
            const currentUser = req.session.user.username
            const isCurrentUser = user.username === currentUser
            return user.username.includes(req.query.username) && !isCurrentUser
        })
        const userDetailsWithoutPassword = suggestedUsers.map(user => {
            delete user.password
            return user
        })
        return res.status(200).send(userDetailsWithoutPassword)
    } catch (error) {
        return res.status(500).send({ message: 'Something went wrong. Please try again later.' })
    }
}

const checkIfUsernameExistsAlready = async (requestBody) => {
    return await prisma.user.findFirst({ where: { username: requestBody.username } }) !== null
}

const checkIfEmailExistsAlready = async (requestBody) => {
    return await prisma.user.findFirst({ where: { email: requestBody.email } }) !== null
}

const getUserDetails = async (requestBody) => {
    const details = await prisma.user.findFirst({
        where: { email: requestBody.email },
    })

    return details
}