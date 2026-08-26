const ScheduledReport = require('../models/ScheduledReport');
const { ReportService } = require('./report.service');
const { MailerService } = require('./mailer.service');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');

class ScheduleService {
  static async createSchedule(userId, data) {
    const { email, frequency = 'Monthly', format = 'pdf' } = data;

    if (!email) {
      throw new ApiError(400, 'Email address is required');
    }

    return await ScheduledReport.create({
      userId,
      email,
      frequency,
      format,
      isActive: true,
    });
  }

  static async getSchedules(userId) {
    return await ScheduledReport.findByUserId(userId);
  }

  static async deleteSchedule(userId, scheduleId) {
    const deleted = await ScheduledReport.deleteById(scheduleId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Scheduled report not found');
    }
  }

  static async runScheduledTask() {
    console.log('[SCHEDULE WORKER] Starting scheduled reports heartbeat scan...');
    try {
      const activeSchedules = await ScheduledReport.findAllActive();
      console.log(`[SCHEDULE WORKER] Found ${activeSchedules.length} active scheduled reports`);

      for (const schedule of activeSchedules) {
        const shouldSend = !schedule.lastSentAt ||
          (Date.now() - new Date(schedule.lastSentAt).getTime()) >= 28 * 24 * 60 * 60 * 1000;

        if (shouldSend) {
          console.log(`[SCHEDULE WORKER] Sending report to ${schedule.email}`);
          try {
            const user = await User.findById(schedule.userId);
            if (!user) continue;

            const userName = user.fullName || 'Freelancer';

            const report = await ReportService.generateReport(schedule.userId, {
              reportType: 'Income & Expense Summary',
              period: 'Last Month',
              format: schedule.format || 'pdf',
            });

            let fileBuffer;
            let filename;
            let mimeType;

            if (String(schedule.format).toLowerCase() === 'csv') {
              fileBuffer = ReportService.generateCSV(report);
              filename = 'TaxPal_Financial_Report_Last_Month.csv';
              mimeType = 'text/csv';
            } else {
              fileBuffer = await ReportService.generatePDF(report, userName);
              filename = 'TaxPal_Financial_Report_Last_Month.pdf';
              mimeType = 'application/pdf';
            }

            await MailerService.sendReportMail(
              schedule.email,
              'Income & Expense Summary',
              'Last Month',
              fileBuffer,
              filename,
              mimeType
            );

            await ScheduledReport.updateById(schedule.id, {
              lastSentAt: new Date().toISOString(),
            });
          } catch (err) {
            console.error(`[SCHEDULE WORKER] Error dispatching to ${schedule.email}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error('[SCHEDULE WORKER] Scan loop error:', err.message);
    }
  }
}

module.exports = {
  ScheduleService,
};
