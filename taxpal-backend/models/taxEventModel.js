const db = require("../config/db");

const TaxEventModel = {

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


    getTaxEventsByMonth: async (
        user_id,
        month
    ) => {

        const query = `
            SELECT *
            FROM tax_events
            WHERE user_id = ?
            AND strftime('%m', due_date) = ?
            ORDER BY due_date ASC
        `;

        const rows = await db.all(
            query,
            [user_id, month]
        );

        return rows;
    },


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

        const result = await db.run(
            query,
            [
                title || null,
                description || null,
                due_date || null,
                quarter || null,
                is_custom !== undefined
                    ? is_custom
                    : null,
                id,
                user_id
            ]
        );

        return {
            affectedRows: result.changes
        };
    },


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

        const result = await db.run(
            query,
            [id, user_id]
        );

        return {
            affectedRows: result.changes
        };
    },


    deleteTaxEvent: async (
        id,
        user_id
    ) => {

        const query = `
            DELETE FROM tax_events
            WHERE id = ?
            AND user_id = ?
        `;

        const result = await db.run(
            query,
            [id, user_id]
        );

        return {
            affectedRows: result.changes
        };
    }

};

module.exports = TaxEventModel;