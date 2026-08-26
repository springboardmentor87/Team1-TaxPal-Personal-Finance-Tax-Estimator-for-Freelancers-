const express = require('express');
const { scanReceipt } = require('../controllers/receipt.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { memoryUpload } = require('../middleware/memoryUpload.middleware');

const router = express.Router();

router.post('/scan', authenticate, memoryUpload.single('receipt'), scanReceipt);

module.exports = router;
