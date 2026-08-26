const express = require('express');
const { AlertController } = require('../controllers/alert.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { createAlertSchema, alertIdParamSchema } = require('../validators/alert.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createAlertSchema), AlertController.createAlert);
router.get('/', AlertController.getAlerts);
router.put('/read-all', AlertController.markAllAsRead);
router.get('/:id', validate(alertIdParamSchema), AlertController.getAlertById);
router.put('/:id/read', validate(alertIdParamSchema), AlertController.markAsRead);
router.delete('/:id', validate(alertIdParamSchema), AlertController.deleteAlert);

module.exports = router;
