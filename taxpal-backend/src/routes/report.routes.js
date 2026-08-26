const express = require('express');
const { ReportController } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  createReportSchema,
  reportIdParamSchema,
  scheduleReportSchema,
} = require('../validators/report.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createReportSchema), ReportController.createReport);
router.get('/', ReportController.getReports);
router.post('/schedule', validate(scheduleReportSchema), ReportController.createSchedule);
router.get('/schedule', ReportController.getSchedules);
router.delete('/schedule/:id', validate(reportIdParamSchema), ReportController.deleteSchedule);
router.get('/:id', validate(reportIdParamSchema), ReportController.getReportById);
router.get('/:id/download', validate(reportIdParamSchema), ReportController.downloadReport);
router.post('/:id/email', validate(reportIdParamSchema), ReportController.emailReport);
router.delete('/:id', validate(reportIdParamSchema), ReportController.deleteReport);

module.exports = router;
