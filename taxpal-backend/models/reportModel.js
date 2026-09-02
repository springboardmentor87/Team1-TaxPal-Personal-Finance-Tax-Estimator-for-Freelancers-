const db = require("../config/db");

const ReportModel = {

    // Get all reports belonging to logged-in user
    getReportsByUser: async (userId) => {

        const [rows] = await db.query(
            `SELECT
                id,
                user_id,
                period,
                report_type,
                file_path,
                created_at
             FROM reports
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );

        return rows;
    },


    // Get one report
    // IMPORTANT:
    // user_id is checked so one user cannot access
    // another user's report.
    getReportById: async (reportId, userId) => {

        const [rows] = await db.query(
            `SELECT
                id,
                user_id,
                period,
                report_type,
                file_path,
                created_at
             FROM reports
             WHERE id = ?
             AND user_id = ?
             LIMIT 1`,
            [reportId, userId]
        );

        return rows[0];
    },


    // Save report information
    createReport: async (
        userId,
        period,
        reportType,
        filePath = null
    ) => {

        const [result] = await db.query(
            `INSERT INTO reports
                (user_id, period, report_type, file_path)
             VALUES (?, ?, ?, ?)`,
            [
                userId,
                period,
                reportType,
                filePath
            ]
        );

        return result.insertId;
    },


    // Update file path after Developer 2
    // generates PDF/CSV
    updateFilePath: async (
        reportId,
        userId,
        filePath
    ) => {

        await db.query(
            `UPDATE reports
             SET file_path = ?
             WHERE id = ?
             AND user_id = ?`,
            [
                filePath,
                reportId,
                userId
            ]
        );
    }

};

module.exports = ReportModel;