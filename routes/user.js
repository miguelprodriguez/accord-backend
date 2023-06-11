const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user')

router.post('/login', (req, res) => {
    // Do below if UserController is asynchronous
    // UserController.login(req.body).then(result => res.send(result))
    res.send(UserController.login(req.body))
})

module.exports = router 