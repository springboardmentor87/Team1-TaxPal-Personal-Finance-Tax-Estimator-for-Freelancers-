const mysql = require("mysql2/promise");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const sqlitePath = path.join(__dirname, "../taxpal.sqlite");

const sqliteDb = new sqlite3.Database(sqlitePath);

// ==========================================
// SQLITE HELPER FUNCTIONS
// ==========================================

const sqliteAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
};

const sqliteRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function (err) {
            if (err) return reject(err);

            resolve({
                insertId: this.lastID,
                affectedRows: this.changes,
                changes: this.changes
            });
        });
    });
};

// ==========================================
// INITIALIZE SQLITE TABLES
// ==========================================

sqliteDb.serialize(() => {

    // USERS
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            country TEXT NOT NULL,
            income_bracket TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // TRANSACTIONS
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            transaction_date TEXT NOT NULL,
            date TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );
    `);

    // BUDGETS
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            budget_limit REAL NOT NULL,
            month TEXT NOT NULL,
            description TEXT,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            UNIQUE(user_id, category, month)
        );
    `);

    // CATEGORIES
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            color TEXT DEFAULT '#3b82f6',
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            UNIQUE(user_id, name, type)
        );
    `);

    // TAX CALCULATIONS
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_calculations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            year INTEGER NOT NULL,
            country TEXT NOT NULL,
            state TEXT,
            filing_status TEXT NOT NULL,
            quarter TEXT NOT NULL,

            gross_income REAL NOT NULL,

            business_expenses REAL DEFAULT 0,
            retirement_contributions REAL DEFAULT 0,
            health_insurance_premiums REAL DEFAULT 0,
            home_office_deduction REAL DEFAULT 0,

            total_deductions REAL DEFAULT 0,
            taxable_income REAL DEFAULT 0,

            federal_tax REAL DEFAULT 0,
            state_tax REAL DEFAULT 0,
            self_employment_tax REAL DEFAULT 0,

            total_estimated_tax REAL DEFAULT 0,
            effective_tax_rate REAL DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );
    `);

    // TAX SUMMARIES
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_summaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            year INTEGER NOT NULL,

            total_income REAL DEFAULT 0,
            total_expenses REAL DEFAULT 0,
            taxable_income REAL DEFAULT 0,
            estimated_tax REAL DEFAULT 0,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            UNIQUE(user_id, year)
        );
    `);

    // TAX EVENTS
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,
            year INTEGER NOT NULL,

            title TEXT NOT NULL,
            quarter TEXT NOT NULL,

            due_date TEXT NOT NULL,
            reminder_date TEXT,

            description TEXT,

            estimated_tax_amount REAL DEFAULT 0,

            currency_symbol TEXT DEFAULT '$',

            type TEXT DEFAULT 'payment',

            status TEXT DEFAULT 'upcoming',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );
    `);

    // TAX PAYMENTS
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            tax_calculation_id INTEGER DEFAULT NULL,

            year INTEGER NOT NULL,

            quarter TEXT NOT NULL,

            amount REAL NOT NULL DEFAULT 0,

            payment_date TEXT DEFAULT NULL,

            due_date TEXT DEFAULT NULL,

            status TEXT NOT NULL DEFAULT 'pending',

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (tax_calculation_id)
                REFERENCES tax_calculations(id)
                ON DELETE SET NULL
        );
    `);

    // TAX ALERTS
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            title TEXT NOT NULL,

            message TEXT,

            alert_type TEXT DEFAULT 'tax_reminder',

            severity TEXT DEFAULT 'medium',

            due_date TEXT,

            estimated_tax_amount REAL DEFAULT 0,

            is_read INTEGER DEFAULT 0,

            is_resolved INTEGER DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );
    `);

});

console.log("SQLite Database initialized at:", sqlitePath);

// ==========================================
// MYSQL CONNECTION POOL
// ==========================================

const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "taxpal",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0
});

let useSQLite = false;

// ==========================================
// CHECK MYSQL CONNECTION
// ==========================================

(async () => {
    try {
        const connection = await mysqlPool.getConnection();

        console.log("MySQL Connection Pool Created Successfully");

        connection.release();

    } catch (error) {

        console.log(
            "MySQL connection failed. Using SQLite fallback database."
        );

        useSQLite = true;
    }
})();

// ==========================================
// DATABASE WRAPPER
// ==========================================

const db = {

    // -------------------------
    // EXECUTE
    // -------------------------

    execute: async (sql, params = []) => {

        try {

            if (!useSQLite) {

                return await mysqlPool.execute(sql, params);
            }

            const trimmedSql = sql.trim();

            const isSelect =
                /^SELECT/i.test(trimmedSql) ||
                /^SHOW/i.test(trimmedSql);

            if (isSelect) {

                const rows = await sqliteAll(sql, params);

                return [rows, []];
            }

            const result = await sqliteRun(sql, params);

            return [result, []];

        } catch (error) {

            if (
                !useSQLite &&
                (
                    error.code === "ECONNREFUSED" ||
                    error.code === "ENOTFOUND"
                )
            ) {

                console.log(
                    "Switching database execution to SQLite fallback..."
                );

                useSQLite = true;

                return db.execute(sql, params);
            }

            throw error;
        }
    },

    // -------------------------
    // QUERY
    // -------------------------

    query: async (sql, params = []) => {

        try {

            if (!useSQLite) {

                return await mysqlPool.query(sql, params);
            }

            const trimmedSql = sql.trim();

            const isSelect =
                /^SELECT/i.test(trimmedSql) ||
                /^SHOW/i.test(trimmedSql);

            if (isSelect) {

                const rows = await sqliteAll(sql, params);

                return [rows, []];
            }

            const result = await sqliteRun(sql, params);

            return [result, []];

        } catch (error) {

            if (
                !useSQLite &&
                (
                    error.code === "ECONNREFUSED" ||
                    error.code === "ENOTFOUND"
                )
            ) {

                useSQLite = true;

                return db.query(sql, params);
            }

            throw error;
        }
    },

    // -------------------------
    // ALL
    // -------------------------

    all: async (sql, params = []) => {

        if (useSQLite) {

            return await sqliteAll(sql, params);
        }

        const [rows] = await mysqlPool.execute(
            sql,
            params
        );

        return rows;
    },

    // -------------------------
    // RUN
    // -------------------------

    run: async (sql, params = []) => {

        if (useSQLite) {

            return await sqliteRun(sql, params);
        }

        const [result] = await mysqlPool.execute(
            sql,
            params
        );

        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows,
            changes: result.affectedRows
        };
    }

};

module.exports = db;