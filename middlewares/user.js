const validateSchema = schema => (req, res, next) => {
    if (!schema) return res.status(500)

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).send(error.details[0]);

    else next()
}

module.exports = validateSchema