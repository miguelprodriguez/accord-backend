const UserValidator = require('../validators/user')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports.login = (req, res) => {
    const { error } = UserValidator.loginSchema.validate(req, {
        // Setting abortEarly to true won't check other fields in case of error
        // If email is incorrect, password won't be checked anymore
        // TLDR: Return multiple errors
        abortEarly: false,
    });

    if (error) return res.status(400).send(error.details[0]);
    return res.send("Logged in successfully");
}

module.exports.signup = async (req, res) => {
    const { error } = UserValidator.signupSchema.validate(req.body, {
        abortEarly: false,
    });
    if (error) return res.status(400).send(error.details[0]);

    const isUsernameAlreadyExists = await prisma.user.findFirst() !== null
    if (isUsernameAlreadyExists) return res.status(409).send("Username already exists.")

    await prisma.user.create({
        data: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
    })

    return res.status(200).send("Signed up successfully");
}