const Joi = require('joi')

const schema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .messages({ "email": "Must be an email" })
        .required(),
    password: Joi.string()
        .required()
        .messages({ "password.required": "Password cannot be blank" })
})

module.exports.login = (req,res) => {
    const { error } = schema.validate(req, {
        // Setting abortEarly to true won't check other fields in case of error
        // If email is incorrect, password won't be checked anymore
        abortEarly: false,
    });

    if (error) return res.status(400).send(error.details[0]);
    return res.send("Logged in successfully");
}