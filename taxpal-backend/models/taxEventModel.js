const db = require("../config/db");

const TaxEventModel = {

    createTaxEvent: (eventData) => {
        return new Promise((resolve, reject) => {

            const {
                user_id,
                year,
                title,
                quarter,
                due_date,
                reminder_date,
                description,
                estimated_tax_amount,
                currency_symbol,
                type,
                status
            } = eventData;

            const query = `
                INSERT INTO tax_events (
                    user_id,
                    year,
                    title,
                    quarter,
                    due_date,
                    reminder_date,
                    description,
                    estimated_tax_amount,
                    currency_symbol,
                    type,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                query,
                [
                    user_id,
                    year,
                    title,
                    quarter,
                    due_date,
                    reminder_date || null,
                    description || null,
                    estimated_tax_amount || 0,
                    currency_symbol || "$",
                    type || "payment",
                    status || "upcoming"
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: result.insertId,
                        ...eventData
                    });
                }
            );
        });
    },


    getTaxEventsByUser: (user_id, year) => {
        return new Promise((resolve, reject) => {

            let query = `
                SELECT *
                FROM tax_events
                WHERE user_id = ?
            `;

            const params = [user_id];

            if (year) {
                query += ` AND year = ?`;
                params.push(year);
            }

            query += `
                ORDER BY due_date ASC
            `;

            db.query(query, params, (err, rows) => {

                if (err) {
                    return reject(err);
                }

                resolve(rows || []);
            });
        });
    },


    getTaxEventsByMonth: (user_id, month, year) => {
        return new Promise((resolve, reject) => {

            const query = `
                SELECT *
                FROM tax_events
                WHERE user_id = ?
                AND substr(due_date, 6, 2) = ?
                AND year = ?
                ORDER BY due_date ASC
            `;

            db.query(
                query,
                [
                    user_id,
                    String(month).padStart(2, "0"),
                    Number(year)
                ],
                (err, rows) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(rows || []);
                }
            );
        });
    },


    getExistingQuarterlyEvents: (user_id, year) => {
        return new Promise((resolve, reject) => {

            const query = `
                SELECT *
                FROM tax_events
                WHERE user_id = ?
                AND year = ?
                ORDER BY due_date ASC
            `;

            db.query(
                query,
                [user_id, year],
                (err, rows) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(rows || []);
                }
            );
        });
    },


    updateTaxEvent: (id, user_id, eventData) => {
        return new Promise((resolve, reject) => {

            const {
                title,
                description,
                due_date,
                reminder_date,
                estimated_tax_amount,
                status
            } = eventData;

            const query = `
                UPDATE tax_events
                SET
                    title = COALESCE(?, title),
                    description = COALESCE(?, description),
                    due_date = COALESCE(?, due_date),
                    reminder_date = COALESCE(?, reminder_date),
                    estimated_tax_amount =
                        COALESCE(?, estimated_tax_amount),
                    status = COALESCE(?, status)
                WHERE id = ?
                AND user_id = ?
            `;

            db.query(
                query,
                [
                    title || null,
                    description || null,
                    due_date || null,
                    reminder_date || null,
                    estimated_tax_amount ?? null,
                    status || null,
                    id,
                    user_id
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        affectedRows: result.affectedRows
                    });
                }
            );
        });
    },


    markAsCompleted: (id, user_id) => {
        return new Promise((resolve, reject) => {

            const query = `
                UPDATE tax_events
                SET status = 'completed'
                WHERE id = ?
                AND user_id = ?
            `;

            db.query(
                query,
                [id, user_id],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        affectedRows: result.affectedRows
                    });
                }
            );
        });
    },


    deleteTaxEvent: (id, user_id) => {
        return new Promise((resolve, reject) => {

            const query = `
                DELETE FROM tax_events
                WHERE id = ?
                AND user_id = ?
            `;

            db.query(
                query,
                [id, user_id],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        affectedRows: result.affectedRows
                    });
                }
            );
        });
    }
};

module.exports = TaxEventModel;