const db = require("../config/db");

const ReportModel = {

    // ========================================
    // GET INCOME AND EXPENSE FOR A PERIOD
    // ========================================
    getIncomeExpense: async (userId, startDate, endDate) => {

        const sql = `
            SELECT
                type,
                COALESCE(SUM(amount), 0) AS total
            FROM transactions
            WHERE user_id = ?
              AND transaction_date >= ?
              AND transaction_date < ?
            GROUP BY type
        `;

        const [results] = await db.promise().query(
            sql,
            [userId, startDate, endDate]
        );

        return results;
    },


    // ========================================
    // GET EXPENSE BY CATEGORY
    // ========================================
    getExpenseByCategory: async (
        userId,
        startDate,
        endDate
    ) => {

        const sql = `
            SELECT
                category,
                COALESCE(SUM(amount), 0) AS total
            FROM transactions
            WHERE user_id = ?
              AND LOWER(type) = 'expense'
              AND transaction_date >= ?
              AND transaction_date < ?
            GROUP BY category
            ORDER BY total DESC
        `;

        const [results] = await db.promise().query(
            sql,
            [userId, startDate, endDate]
        );

        return results;
    },


    // ========================================
    // CREATE / SAVE REPORT
    // ========================================
    createReport: async (
        userId,
        period,
        reportType,
        filePath = null
    ) => {

        const sql = `
            INSERT INTO reports
            (
                user_id,
                period,
                report_type,
                file_path
            )
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.promise().query(
            sql,
            [
                userId,
                period,
                reportType,
                filePath
            ]
        );

        return result.insertId;
    },


    // ========================================
    // GET ALL REPORTS OF USER
    // ========================================
    getReportsByUser: async (userId) => {

        const sql = `
            SELECT
                id,
                user_id,
                period,
                report_type,
                file_path,
                created_at
            FROM reports
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;

        const [results] = await db.query(
            sql,
            [userId]
        );

        return results;
    },



    getReportById: async (
        reportId,
        userId
    ) => {

        const sql = `
            SELECT
                id,
                user_id,
                period,
                report_type,
                file_path,
                created_at
            FROM reports
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
        `;

        const [results] = await db.promise().query(
            sql,
            [reportId, userId]
        );

        return results.length > 0
            ? results[0]
            : null;
    },


    // ========================================
    // UPDATE REPORT FILE PATH
    // ========================================
    updateFilePath: async (
        reportId,
        userId,
        filePath
    ) => {

        const sql = `
            UPDATE reports
            SET file_path = ?
            WHERE id = ?
              AND user_id = ?
        `;

        const [result] = await db.promise().query(
            sql,
            [
                filePath,
                reportId,
                userId
            ]
        );

        return result;
    }
};

module.exports = ReportModel;