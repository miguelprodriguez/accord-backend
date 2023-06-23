const UserValidator = require('../validators/user')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

module.exports.login = (req, res) => {
    const { error } = UserValidator.loginSchema.validate(req, { abortEarly: false });
    if (error) return res.status(400).send(error.details[0]);

    return res.send("Logged in successfully");
}

module.exports.signup = async (req, res) => {
    const { error } = UserValidator.signupSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).send(error.details[0]);

    const isUsernameAlreadyExists = checkIfUsernameExistsAlready(req.body)
    if (isUsernameAlreadyExists) return res.status(409).send("Username already exists.")

    const isEmailAlreadyExists = checkIfEmailExistsAlready(req.body)
    if (isEmailAlreadyExists) return res.status(409).send("Email already exists, please login to your account.")

    const SALT_ROUNDS = 10
    const HASHED_DATA = {
        data: {
            username: req.body.username,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, SALT_ROUNDS)
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