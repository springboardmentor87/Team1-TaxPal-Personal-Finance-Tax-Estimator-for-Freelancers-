const db = require("../config/db");

const CategoryModel = {

    createCategory: (categoryData) => {

        const {
            user_id,
            name,
            type,
            color,
            description
        } = categoryData;

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO categories
                (
                    user_id,
                    name,
                    type,
                    color,
                    description
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    user_id,
                    name,
                    type,
                    color || "#3b82f6",
                    description || ""
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: result.insertId,
                        user_id,
                        name,
                        type,
                        color: color || "#3b82f6",
                        description: description || ""
                    });
                }
            );
        });
    },

    getCategoriesByUser: (user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT
                    id,
                    name,
                    type,
                    color,
                    description,
                    created_at
                FROM categories
                WHERE user_id = ?
                ORDER BY type ASC, name ASC
            `;

            db.query(
                sql,
                [user_id],
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(results);
                }
            );
        });
    },

    getCategoryById: (id, user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT
                    id,
                    name,
                    type,
                    color,
                    description,
                    created_at
                FROM categories
                WHERE id = ?
                AND user_id = ?
            `;

            db.query(
                sql,
                [id, user_id],
                (err, results) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(results[0] || null);
                }
            );
        });
    },

    updateCategory: (id, user_id, categoryData) => {

        const {
            name,
            type,
            color,
            description
        } = categoryData;

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE categories
                SET
                    name = ?,
                    type = ?,
                    color = ?,
                    description = ?
                WHERE id = ?
                AND user_id = ?
            `;

            db.query(
                sql,
                [
                    name,
                    type,
                    color || "#3b82f6",
                    description || "",
                    id,
                    user_id
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(result);
                }
            );
        });
    },

    deleteCategory: (id, user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                DELETE FROM categories
                WHERE id = ?
                AND user_id = ?
            `;

            db.query(
                sql,
                [id, user_id],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve(result);
                }
            );
        });
    }

};

module.exports = CategoryModel;