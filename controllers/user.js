const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

module.exports.login = async (req, res) => {
    const user = await prisma.user.findFirst({ where: { email: req.body.email } })
    if (!user) return res.status(403).send('Incorrect email or password')

    const isPasswordMatching = bcrypt.compareSync(req.body.password, user.password)
    if (!isPasswordMatching) return res.status(403).send('Incorrect email or password')

    return res.status(200).send("Logged in successfully");
}

module.exports.signup = async (req, res) => {
    const isUsernameAlreadyExists = await checkIfUsernameExistsAlready(req.body)
    if (isUsernameAlreadyExists) return res.status(409).send("Username already exists.")

    const isEmailAlreadyExists = await checkIfEmailExistsAlready(req.body)
    if (isEmailAlreadyExists) return res.status(409).send("Email already exists, please login to your account.")

    const SALT_ROUNDS = 10
    const HASHED_DATA = {
        data: {
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, SALT_ROUNDS)
        }
    }
    await prisma.user.create(HASHED_DATA)
    return res.status(200).send("Signed up successfully");
}

const checkIfUsernameExistsAlready = async (requestBody) => {
    return await prisma.user.findFirst({ where: { username: requestBody.username } }) !== null
}

const checkIfEmailExistsAlready = async (requestBody) => {
    return await prisma.user.findFirst({ where: { username: requestBody.email } }) !== null
}