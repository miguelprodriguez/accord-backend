const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');

module.exports.checkIfLoggedIn = async (req, res) => {
    if (!req.session.user) return res.status(403).send({ message: 'Please login.' })
    res.status(200).send({ message: req.session.user })
}

module.exports.login = async (req, res) => {
    try {
        const existingUser = await prisma.user.findFirst({ where: { email: req.body.email } })
        if (!existingUser) return res.status(403).send({ message: 'Incorrect email or password' })

        const isPasswordMatching = bcrypt.compareSync(req.body.password, existingUser.password)
        if (!isPasswordMatching) return res.status(403).send({ message: 'Incorrect email or password' })

        const userId = await getUserId(req.body)

        const sessionData = {
            email: req.body.email,
            userId: userId
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
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, SALT_ROUNDS),
                userId: uuidv4()
            }
        })

        const userId = await getUserId(req.body)
        const sessionData = {
            email: req.body.email,
            userId
        }
        req.session.user = sessionData

        return res.status(200).send({ message: "User has been created successfully." });
    } catch (error) {
        return res.status(500).send({ message: 'We are having a few problems. Please try again later.' })
    }
}

const checkIfUsernameExistsAlready = async (requestBody) => {
    return await prisma.user.findFirst({ where: { username: requestBody.username } }) !== null
}

const checkIfEmailExistsAlready = async (requestBody) => {
    return await prisma.user.findFirst({ where: { email: requestBody.email } }) !== null
}

const getUserId = async (requestBody) => {
    const result = await prisma.user.findFirst({
        where: { email: requestBody.email },
    })

    return result.userId
}