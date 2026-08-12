const db = require("../config/db");

const CategoryModel = {

    // ==========================================
    // Create Category
    // ==========================================
    createCategory: (categoryData) => {

        const {
            user_id,
            name,
            type
        } = categoryData;

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO categories
                (
                    user_id,
                    name,
                    type
                )
                VALUES (?, ?, ?)
            `;

            db.query(
                sql,
                [
                    user_id,
                    name,
                    type
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: result.insertId,
                        user_id,
                        name,
                        type
                    });
                }
            );
        });
    },


    // ==========================================
    // Get All Categories Of User
    // ==========================================
    getCategoriesByUser: (user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT
                    id,
                    name,
                    type,
                    created_at,
                    updated_at
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


    // ==========================================
    // Get Single Category
    // ==========================================
    getCategoryById: (id, user_id) => {

        return new Promise((resolve, reject) => {

            const sql = `
                SELECT
                    id,
                    name,
                    type,
                    created_at,
                    updated_at
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


    // ==========================================
    // Update Category
    // ==========================================
    updateCategory: (id, user_id, categoryData) => {

        const {
            name,
            type
        } = categoryData;

        return new Promise((resolve, reject) => {

            const sql = `
                UPDATE categories
                SET
                    name = ?,
                    type = ?
                WHERE id = ?
                AND user_id = ?
            `;

            db.query(
                sql,
                [
                    name,
                    type,
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


    // ==========================================
    // Delete Category
    // ==========================================
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