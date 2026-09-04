const mysql = require("mysql2");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const sqlitePath = path.join(__dirname, "../taxpal.sqlite");
const sqliteDb = new sqlite3.Database(sqlitePath);

// Initialize SQLite Schema automatically
sqliteDb.serialize(() => {
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
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            budget_limit REAL NOT NULL,
            month TEXT NOT NULL,
            description TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, category, month)
        );
    `);

    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            color TEXT DEFAULT '#3b82f6',
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, name, type)
        );
    `);

    // Tax Estimator
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            financial_year TEXT NOT NULL,
            gross_income REAL NOT NULL,
            business_expenses REAL NOT NULL,
            other_deductions REAL NOT NULL,
            taxable_income REAL NOT NULL,
            old_regime_tax REAL NOT NULL,
            new_regime_tax REAL NOT NULL,
            selected_regime TEXT NOT NULL,
            estimated_tax REAL NOT NULL,
            cess REAL NOT NULL,
            total_tax REAL NOT NULL,
            effective_tax_rate REAL NOT NULL,
            net_income REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    // Tax Calculations
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_calculations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Tax Summaries
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_summaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            year INTEGER NOT NULL,
            total_income REAL DEFAULT 0,
            total_expenses REAL DEFAULT 0,
            taxable_income REAL DEFAULT 0,
            estimated_tax REAL DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Tax Events
    sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tax_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            quarter TEXT,
            due_date TEXT NOT NULL,
            reminder_date TEXT,
            description TEXT,
            estimated_tax_amount REAL,
            currency_symbol TEXT DEFAULT '$',
            type TEXT DEFAULT 'payment',
            status TEXT DEFAULT 'upcoming',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
});

console.log("SQLite Database initialized at:", sqlitePath);

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

// Check MySQL connection
mysqlPool.getConnection((err, connection) => {
    if (err) {
        console.log("MySQL connection failed. Using SQLite fallback database.");
        useSQLite = true;
    } else {
        console.log("MySQL Connection Pool Created Successfully");
        connection.release();
    }
});

const db = {
    query: (sql, params, callback) => {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }

        params = params || [];

        if (!useSQLite) {
            mysqlPool.query(sql, params, (err, results, fields) => {
                if (
                    err &&
                    (err.code === "ECONNREFUSED" ||
                        err.code === "ENOTFOUND")
                ) {
                    console.log(
                        "Switching query execution to SQLite fallback..."
                    );

                    useSQLite = true;
                    return db.query(sql, params, callback);
                }

                if (callback) {
                    callback(err, results, fields);
                }
            });

            return;
        }

        // SQLite Execution Logic
        const trimmedSql = sql.trim();

        const isSelect =
            /^SELECT/i.test(trimmedSql) ||
            /^SHOW/i.test(trimmedSql);

        const isInsert = /^INSERT/i.test(trimmedSql);

        if (isSelect) {
            sqliteDb.all(sql, params, (err, rows) => {
                if (callback) {
                    callback(err, rows || []);
                }
            });
        } else if (isInsert) {
            sqliteDb.run(sql, params, function (err) {
                if (callback) {
                    callback(err, {
                        insertId: this ? this.lastID : null,
                        affectedRows: this ? this.changes : 0
                    });
                }
            });
        } else {
            sqliteDb.run(sql, params, function (err) {
                if (callback) {
                    callback(err, {
                        affectedRows: this ? this.changes : 0
                    });
                }
            });
        }
    }
};

module.exports = db;