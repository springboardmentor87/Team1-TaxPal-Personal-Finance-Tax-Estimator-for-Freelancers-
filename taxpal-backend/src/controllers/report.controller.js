const { ReportService } = require('../services/report.service');
const { ScheduleService } = require('../services/schedule.service');
const { MailerService } = require('../services/mailer.service');
const User = require('../models/User');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

class ReportController {
  static async createReport(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const report = await ReportService.generateReport(userId, req.body);
      res.status(201).json(new ApiResponse(report, 'Report generated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getReports(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const reports = await ReportService.getReports(userId);
      res.status(200).json(new ApiResponse(reports, 'Reports retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getReportById(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const report = await ReportService.getReportById(userId, id);
      res.status(200).json(new ApiResponse(report, 'Report retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async downloadReport(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;
      const formatOverride = req.query ? req.query.format : '';

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const report = await ReportService.getReportById(userId, id);
      const exportFormat = (formatOverride || report.format || 'PDF').toUpperCase();
      const user = await User.findById(userId);
      const userName = user ? user.fullName : 'Freelancer';

      const filename = `TaxPal_Report_${id}.${exportFormat === 'CSV' ? 'csv' : 'pdf'}`;
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      if (exportFormat === 'CSV') {
        const csvBuffer = ReportService.generateCSV(report);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvBuffer);
      } else {
        const pdfBuffer = await ReportService.generatePDF(report, userName);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(pdfBuffer);
      }
    } catch (error) {
      next(error);
    }
  }

  static async emailReport(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;
      const { email, format = 'pdf' } = req.body;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const report = await ReportService.getReportById(userId, id);
      const user = await User.findById(userId);
      const userName = user ? user.fullName : 'Freelancer';

      let fileBuffer;
      let filename;
      let mimeType;

      if (String(format).toLowerCase() === 'csv') {
        fileBuffer = ReportService.generateCSV(report);
        filename = `TaxPal_Report_${id}.csv`;
        mimeType = 'text/csv';
      } else {
        fileBuffer = await ReportService.generatePDF(report, userName);
        filename = `TaxPal_Report_${id}.pdf`;
        mimeType = 'application/pdf';
      }

      const sent = await MailerService.sendReportMail(
        email,
        report.type || 'Financial Summary',
        report.period || 'Period',
        fileBuffer,
        filename,
        mimeType
      );

      if (!sent) {
        throw new ApiError(500, 'Failed to send report email');
      }

      res.status(200).json(new ApiResponse(null, `Report successfully emailed to ${email}`));
    } catch (error) {
      next(error);
    }
  }

  static async deleteReport(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      await ReportService.deleteReport(userId, id);
      res.status(200).json(new ApiResponse(null, 'Report deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async createSchedule(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const schedule = await ScheduleService.createSchedule(userId, req.body);
      res.status(201).json(new ApiResponse(schedule, 'Scheduled report created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getSchedules(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const schedules = await ScheduleService.getSchedules(userId);
      res.status(200).json(new ApiResponse(schedules, 'Scheduled reports retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteSchedule(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      await ScheduleService.deleteSchedule(userId, id);
      res.status(200).json(new ApiResponse(null, 'Scheduled report deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  ReportController,
};
