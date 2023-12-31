const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chat')

router.route('/')
    .get(chatController.allChats)
    .post(chatController.findOrCreateChat)

module.exports = router