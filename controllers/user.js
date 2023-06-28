const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

module.exports.login = async (req, res) => {
    try {
        const existingUser = await prisma.user.findFirst({ where: { email: req.body.email } })
        if (!existingUser) return res.status(403).send({ message: 'Incorrect email or password' })

        const isPasswordMatching = bcrypt.compareSync(req.body.password, existingUser.password)
        if (!isPasswordMatching) return res.status(403).send({ message: 'Incorrect email or password' })

        const userId = await getUserId(req.body)
        const sessionData = {
            email: req.body.email,
            id: userId
        }
        req.session.user = sessionData

        return res.status(200).send({ message: "Logged in successfully" })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

module.exports.signup = async (req, res) => {
    try {
        const isUsernameAlreadyExists = await checkIfUsernameExistsAlready(req.body)
        if (isUsernameAlreadyExists) return res.status(409).send({ message: "Username already exists." })

        const isEmailAlreadyExists = await checkIfEmailExistsAlready(req.body)
        if (isEmailAlreadyExists) return res.status(409).json({ message: "Email already exists." })

        const SALT_ROUNDS = 10
        const HASHED_DATA = {
            data: {
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, SALT_ROUNDS)
            }
        }
        await prisma.user.create(HASHED_DATA)

        const userId = await getUserId(req.body)
        const sessionData = {
            email: req.body.email,
            userId
        }
        req.session.user = sessionData

        return res.status(200).send({ message: "User has been created successfully." });
    } catch (error) {
        return res.status(500).send({ message: error.message })
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
        select: { id: true }
    })

    return result.id
}