const express = require('express');
const { sendMessage, getChatSessions, getChatHistory, deleteChat } = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/message', sendMessage);
router.get('/sessions', getChatSessions);
router.get('/sessions/:id', getChatHistory);
router.delete('/sessions/:id', deleteChat);

module.exports = router;
