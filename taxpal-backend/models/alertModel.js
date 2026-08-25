const db = require("../config/db");

const executeQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                return reject(err);
            }

            resolve(results);
        });
    });
};

const AlertModel = {

    createAlert: async (alertData) => {

        const {
            user_id,
            title,
            message,
            severity,
            alert_type,
            due_date,
            estimated_tax_amount
        } = alertData;

        const query = `
            INSERT INTO tax_alerts (
                user_id,
                title,
                message,
                severity,
                alert_type,
                due_date,
                estimated_tax_amount
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await executeQuery(
            query,
            [
                user_id,
                title,
                message,
                severity,
                alert_type,
                due_date,
                estimated_tax_amount || null
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
            FROM tax_alerts
            WHERE user_id = ?
            ORDER BY due_date ASC
        `;

        const rows = await executeQuery(
            query,
            [user_id]
        );

        return rows;
    },


    markAsRead: async (id, user_id) => {

        const query = `
            UPDATE tax_alerts
            SET is_read = 1
            WHERE id = ?
            AND user_id = ?
        `;

        const result = await executeQuery(
            query,
            [id, user_id]
        );

        return result;
    },


    markAsResolved: async (id, user_id) => {

        const query = `
            UPDATE tax_alerts
            SET is_resolved = 1
            WHERE id = ?
            AND user_id = ?
        `;

        const result = await executeQuery(
            query,
            [id, user_id]
        );

        return result;
    },


    deleteAlert: async (id, user_id) => {

        const query = `
            DELETE FROM tax_alerts
            WHERE id = ?
            AND user_id = ?
        `;

        const result = await executeQuery(
            query,
            [id, user_id]
        );

        return result;
    }

};

module.exports = AlertModel;