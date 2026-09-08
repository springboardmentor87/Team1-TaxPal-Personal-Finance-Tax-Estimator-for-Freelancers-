const ReportService = require("../services/reportService");
const ReportModel = require("../models/reportModel");

const { generateCSV } = require("../utils/csvGenerator");
const { generatePDF } = require("../utils/pdfGenerator");

// ========================================
// HELPER: GET USER ID
// ========================================

const getUserId = (req) => {
    if (!req.user) {
        throw new Error("User not authenticated");
    }

    // Support both possible JWT payload formats
    const userId = req.user.id || req.user.user_id;

    if (!userId) {
        throw new Error("User ID not found in token");
    }

    return userId;
};


// ========================================
// MONTHLY REPORT
// ========================================

const getMonthlyReport = async (req, res) => {
    try {

        const userId = getUserId(req);
        const { month } = req.query;

        if (!month) {
            return res.status(400).json({
                success: false,
                message: "Month is required. Use format YYYY-MM."
            });
        }

        const report = await ReportService.getMonthlyReport(
            userId,
            month
        );

        return res.status(200).json({
            success: true,
            report
        });

    } catch (error) {

        console.error(
            "Monthly report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to generate monthly report"
        });
    }
};


// ========================================
// QUARTERLY REPORT
// ========================================

const getQuarterlyReport = async (req, res) => {
    try {

        const userId = getUserId(req);

        const {
            year,
            quarter
        } = req.query;

        if (!year) {
            return res.status(400).json({
                success: false,
                message: "Year is required"
            });
        }

        if (!quarter) {
            return res.status(400).json({
                success: false,
                message: "Quarter is required"
            });
        }

        const report = await ReportService.getQuarterlyReport(
            userId,
            year,
            quarter
        );

        return res.status(200).json({
            success: true,
            report
        });

    } catch (error) {

        console.error(
            "Quarterly report error:",
            error
        );

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to generate quarterly report"
        });
    }
};


// ========================================
// SAVE REPORT
// ========================================

const saveReport = async (req, res) => {
    try {

        const userId = getUserId(req);

        const {
            period,
            reportType,
            filePath
        } = req.body;

        if (!period) {
            return res.status(400).json({
                success: false,
                message: "period is required"
            });
        }

        if (!reportType) {
            return res.status(400).json({
                success: false,
                message: "reportType is required"
            });
        }

        if (
            !["monthly", "quarterly"].includes(reportType)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "reportType must be monthly or quarterly"
            });
        }

        const reportId = await ReportModel.createReport(
            userId,
            period,
            reportType,
            filePath || null
        );

        return res.status(201).json({
            success: true,
            message: "Report saved successfully",
            reportId
        });

    } catch (error) {

        console.error(
            "Save report error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message || "Failed to save report"
        });
    }
};


// ========================================
// GET ALL SAVED REPORTS
// ========================================

const getAllReports = async (req, res) => {
    try {

        const userId = getUserId(req);

        const reports =
            await ReportModel.getReportsByUser(userId);

        return res.status(200).json({
            success: true,
            reports
        });

    } catch (error) {

        console.error(
            "Get reports error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message || "Failed to fetch reports"
        });
    }
};


// ========================================
// GET ONE SAVED REPORT
// ========================================

const getReportById = async (req, res) => {
    try {

        const userId = getUserId(req);

        const reportId = req.params.id;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: "Report ID is required"
            });
        }

        const report =
            await ReportModel.getReportById(
                reportId,
                userId
            );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        return res.status(200).json({
            success: true,
            report
        });

    } catch (error) {

        console.error(
            "Get report error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message || "Failed to fetch report"
        });
    }
};


// ========================================
// CSV EXPORT
// ========================================

const exportCSV = async (req, res) => {
    try {

        const userId = getUserId(req);

        const {
            month,
            year,
            quarter
        } = req.query;

        let report;

        // MONTHLY
        if (month) {

            report =
                await ReportService.getMonthlyReport(
                    userId,
                    month
                );

        }

        // QUARTERLY
        else if (year && quarter) {

            report =
                await ReportService.getQuarterlyReport(
                    userId,
                    year,
                    quarter
                );

        }

        // INVALID REQUEST
        else {

            return res.status(400).json({
                success: false,
                message:
                    "Provide month OR year and quarter"
            });
        }

        const csv = generateCSV(report);

        res.setHeader(
            "Content-Type",
            "text/csv"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${report.period}-report.csv"`
        );

        return res.status(200).send(csv);

    } catch (error) {

        console.error(
            "CSV export error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message || "Failed to export CSV"
        });
    }
};


// ========================================
// PDF EXPORT
// ========================================

const exportPDF = async (req, res) => {
    try {

        const userId = getUserId(req);

        const {
            month,
            year,
            quarter
        } = req.query;

        let report;

        // MONTHLY
        if (month) {

            report =
                await ReportService.getMonthlyReport(
                    userId,
                    month
                );

        }

        // QUARTERLY
        else if (year && quarter) {

            report =
                await ReportService.getQuarterlyReport(
                    userId,
                    year,
                    quarter
                );

        }

        // INVALID REQUEST
        else {

            return res.status(400).json({
                success: false,
                message:
                    "Provide month OR year and quarter"
            });
        }

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${report.period}-report.pdf"`
        );

        return generatePDF(
            report,
            res
        );

    } catch (error) {

        console.error(
            "PDF export error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message || "Failed to export PDF"
        });
    }
};


// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
    getMonthlyReport,
    getQuarterlyReport,
    saveReport,
    getAllReports,
    getReportById,
    exportCSV,
    exportPDF
};