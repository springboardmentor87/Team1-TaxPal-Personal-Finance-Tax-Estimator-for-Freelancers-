const db = require("../config/db");

const TaxEventModel = {

    // ==========================================
    // Create Tax Event
    // ==========================================
    createTaxEvent: async (eventData) => {

        const {
            user_id,
            title,
            description,
            due_date,
            quarter,
            is_custom
        } = eventData;

        const query = `
            INSERT INTO tax_events (
                user_id,
                title,
                description,
                due_date,
                quarter,
                is_custom
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(
            query,
            [
                user_id,
                title,
                description,
                due_date,
                quarter,
                is_custom
            ]
        );

        return {
            id: result.insertId,
            ...eventData
        };
    },


    // ==========================================
    // Get All Tax Events By User
    // ==========================================
    getTaxEventsByUser: async (user_id) => {

        const query = `
            SELECT *
            FROM tax_events
            WHERE user_id = ?
            ORDER BY due_date ASC
        `;

        const [rows] = await db.execute(
            query,
            [user_id]
        );

        return rows;
    },


    // ==========================================
    // Get Tax Events By Month
    // ==========================================
    getTaxEventsByMonth: async (user_id, month) => {

        const query = `
            SELECT *
            FROM tax_events
            WHERE user_id = ?
            AND MONTH(due_date) = ?
            ORDER BY due_date ASC
        `;

        const [rows] = await db.execute(
            query,
            [user_id, month]
        );

        return rows;
    },


    // ==========================================
    // Update Tax Event
    // ==========================================
    updateTaxEvent: async (
        id,
        user_id,
        eventData
    ) => {

        const {
            title,
            description,
            due_date,
            quarter,
            is_custom
        } = eventData;

        const query = `
            UPDATE tax_events
            SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                due_date = COALESCE(?, due_date),
                quarter = COALESCE(?, quarter),
                is_custom = COALESCE(?, is_custom)

            WHERE id = ?
            AND user_id = ?
        `;

        const [result] = await db.execute(
            query,
            [
                title !== undefined ? title : null,
                description !== undefined ? description : null,
                due_date !== undefined ? due_date : null,
                quarter !== undefined ? quarter : null,
                is_custom !== undefined ? is_custom : null,
                id,
                user_id
            ]
        );

        return {
            affectedRows: result.affectedRows
        };
    },


    // ==========================================
    // Mark Tax Event As Completed
    // ==========================================
    markAsCompleted: async (
        id,
        user_id
    ) => {

        const query = `
            UPDATE tax_events
            SET completed = 1
            WHERE id = ?
            AND user_id = ?
        `;

        const [result] = await db.execute(
            query,
            [id, user_id]
        );

        return {
            affectedRows: result.affectedRows
        };
    },


    // ==========================================
    // Delete Tax Event
    // ==========================================
    deleteTaxEvent: async (
        id,
        user_id
    ) => {

        const query = `
            DELETE FROM tax_events
            WHERE id = ?
            AND user_id = ?
        `;

        const [result] = await db.execute(
            query,
            [id, user_id]
        );

        return {
            affectedRows: result.affectedRows
        };
    }
};

module.exports = TaxEventModel;