const db = require("../config/db");

const UserModel = {
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results[0] || null);
            });
        });
    },

    createUser: (userData) => {
        const { name, email, password } = userData;
        return new Promise((resolve, reject) => {
            db.query(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [name, email, password],
                (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve({ id: result.insertId, name, email });
                }
            );
        });
    }
};

module.exports = UserModel;
