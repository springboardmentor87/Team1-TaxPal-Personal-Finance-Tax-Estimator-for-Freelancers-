const db = require("../config/db");

const UserModel = {

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
            email,
            password,
            country,
            income_bracket
        } = userData;

        return new Promise((resolve, reject) => {

            const sql = `
                INSERT INTO users
                (name, email, password, country, income_bracket)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    name,
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