const UserValidator = require('../validators/user') 

module.exports.login = (req,res) => {
    const { error } = UserValidator.loginSchema.validate(req, {
        // Setting abortEarly to true won't check other fields in case of error
        // If email is incorrect, password won't be checked anymore
        // TLDR: Return multiple errors
        abortEarly: false,
    });

    if (error) return res.status(400).send(error.details[0]);
    return res.send("Logged in successfully");
}

module.exports.signup = (req,res) => {
    const { error } = UserValidator.signupSchema.validate(req, {
        abortEarly: false,
    });

    if (error) return res.status(400).send(error.details[0]);
    return res.send("Signed up successfully");
}