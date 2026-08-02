const db = require("../config/db");

const UserModel = {

    // Find user by email or username
    findByEmailOrUsername: (identifier) => {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM users WHERE email = ? OR username = ?",
                [identifier, identifier],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results[0] || null);
                }
            );
        });
    },

    // Find user by email
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM users WHERE email = ?",
                [email],
                (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results[0] || null);
                }
            );
        });
    },

    // Create new user
    createUser: (userData) => {

        const {
            name,
            username,
            email,
            password,
            country,
            income_bracket
        } = userData;

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO users
                (name, username, email, password, country, income_bracket)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    name,
                    username || name.toLowerCase().replace(/\s+/g, ''),
                    email,
                    password,
                    country,
                    income_bracket
                ],
                (err, result) => {

                    if (err) {
                        return reject(err);
                    }

                    resolve({
                        id: result.insertId,
                        name,
                        username: username || name.toLowerCase().replace(/\s+/g, ''),
                        email,
                        country,
                        income_bracket
                    });

                }
            );

        });

    }

};

module.exports = UserModel;