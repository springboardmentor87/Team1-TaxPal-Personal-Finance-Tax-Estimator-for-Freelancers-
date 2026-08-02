const mysql = require("mysql2");

// Use a connection pool instead of a single connection.
// Pools automatically handle reconnections and support concurrent queries.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

// Verify the pool can connect on startup.
// If it cannot, the server should not start.
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }

    console.log("MySQL Connected Successfully (Pool)");
    connection.release();
});

module.exports = pool;