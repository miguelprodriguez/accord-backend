const Joi = require('joi')

module.exports.loginSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .messages({ "email": "Must be an email" })
        .required(),
    password: Joi.string()
        .required()
        .messages({ "password.required": "Password cannot be blank" })
})

module.exports.signupSchema = Joi.object({
    username: Joi.string()
        .required(), 
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .messages({ "email": "Must be an email" })
        .required(),
    password: Joi.string()
        .required()
        .messages({ "password.required": "Password cannot be blank" })
})

