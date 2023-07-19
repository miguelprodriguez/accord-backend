const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const validateForm = require('../middlewares/validateForm')
const userValidator = require('../validators/user')
const { checkRateLimit } = require('../middlewares/checkRateLimit')

router.route('/login')
    .get(userController.currentUser)
    .post(
        checkRateLimit,
        validateForm(userValidator.loginSchema),
        userController.login
    )

router.post('/signup', validateForm(userValidator.signupSchema), userController.signup)
router.get('/', userController.suggestedUsers)

module.exports = router