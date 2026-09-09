const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    connectTimeout: 30000
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL Connection Created Successfully");
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