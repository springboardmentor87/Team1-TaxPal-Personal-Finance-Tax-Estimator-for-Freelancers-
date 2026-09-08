const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "taxpal",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error(
            "MySQL connection failed:",
            err.message
        );
        return;
    }

    console.log(
        "MySQL Connection Created Successfully"
    );

    connection.release();
});

db.query("SELECT 1 AS test", (err, results) => {
    if (err) {
        console.error("DB TEST FAILED:", err);
    } else {
        console.log("DB TEST SUCCESS:", results);
    }
});

module.exports = db;