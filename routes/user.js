const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const validateForm = require('../middlewares/validateForm')
const userValidator = require('../validators/user')
const { limitRate } = require('../middlewares/limitRate')

router.route('/login')
    .get(userController.checkIfLoggedIn)
    .post(
        limitRate,
        validateForm(userValidator.loginSchema),
        userController.login
    )

router.post('/signup', validateForm(userValidator.signupSchema), userController.signup)

module.exports = router