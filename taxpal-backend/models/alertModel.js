const db = require("../config/db");

const AlertModel = {

    createAlert: async (alertData) => {

        const {
            user_id,
            title,
            message,
            severity,
            alert_type,
            due_date
        } = alertData;

        const query = `
            INSERT INTO alerts (
                user_id,
                title,
                message,
                severity,
                alert_type,
                due_date
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(
            query,
            [
                user_id,
                title,
                message,
                severity,
                alert_type,
                due_date
            ]
        );

        return {
            id: result.insertId,
            ...alertData
        };
    },


    getAlertsByUser: async (user_id) => {

        const query = `
            SELECT *
            FROM alerts
            WHERE user_id = ?
            ORDER BY due_date ASC
        `;

        const [rows] = await db.execute(
            query,
            [user_id]
        );

        return rows;
    },


    markAsRead: async (id, user_id) => {

        const query = `
            UPDATE alerts
            SET is_read = 1
            WHERE id = ?
            AND user_id = ?
        `;

        const [result] = await db.execute(
            query,
            [id, user_id]
        );

        return result;
    },


    markAsResolved: async (id, user_id) => {

        const query = `
            UPDATE alerts
            SET is_resolved = 1
            WHERE id = ?
            AND user_id = ?
        `;

        const [result] = await db.execute(
            query,
            [id, user_id]
        );

        return result;
    },


    deleteAlert: async (id, user_id) => {

        const query = `
            DELETE FROM alerts
            WHERE id = ?
            AND user_id = ?
        `;

        const [result] = await db.execute(
            query,
            [id, user_id]
        );

        return result;
    }

};

module.exports = AlertModel;