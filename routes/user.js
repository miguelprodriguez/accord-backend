const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user')
const validateSchema = require('../middlewares/user')
const UserValidator = require('../validators/user')

router.post('/login', validateSchema(UserValidator.loginSchema), UserController.login)
router.post('/signup', validateSchema(UserValidator.signupSchema), UserController.signup)

module.exports = router 