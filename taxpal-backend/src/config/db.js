const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { env } = require('./env');
const { logger } = require('./logger');

let db = null;
let dbDialect = process.env.DB_DIALECT || 'sqlite';

const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || path.resolve(__dirname, '../../taxpal.sqlite');

/**
 * Initialize and connect to the Database (SQLite / MySQL)
 */
async function connectDB() {
  if (dbDialect === 'mysql') {
    try {
      const mysql = require('mysql2/promise');
      db = await mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'taxpal',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      logger.info('Connected to MySQL database pool');
      await initializeSchema();
      return db;
    } catch (err) {
      logger.error('Failed to connect to MySQL database, falling back to SQLite:', err.message);
      dbDialect = 'sqlite';
    }
  }

  // SQLite connection
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(SQLITE_DB_PATH, async (err) => {
      if (err) {
        logger.error('Failed to connect to SQLite database:', err);
        return reject(err);
      }
      logger.info(`Connected to SQLite database at ${SQLITE_DB_PATH}`);
      try {
        await initializeSchema();
        resolve(db);
      } catch (schemaErr) {
        reject(schemaErr);
      }
    });
  });
}

/**
 * Initialize Schema from schema.sql
 */
async function initializeSchema() {
  const schemaPath = path.resolve(__dirname, '../schema.sql');
  if (!fs.existsSync(schemaPath)) {
    logger.warn(`schema.sql not found at ${schemaPath}`);
    return;
  }

  const sql = fs.readFileSync(schemaPath, 'utf-8');

  if (dbDialect === 'mysql') {
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      try {
        await db.query(statement);
      } catch (e) {
        // Ignore table exists or syntax differences for mysql if compatible
      }
    }
  } else {
    // SQLite executes batch DDL with db.exec
    await new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          logger.error('Error executing schema.sql in SQLite:', err);
          return reject(err);
        }
        resolve();
      });
    });
  }

  // Seed default categories if empty
  await seedDefaultCategories();
}

/**
 * Seed default categories if not already present
 */
async function seedDefaultCategories() {
  try {
    const existing = await query('SELECT COUNT(*) as count FROM categories WHERE is_default = 1');
    const count = existing && existing[0] ? existing[0].count : 0;
    if (count > 0) return;

    const defaultCategories = [
      { id: 'cat-inc-freelance', name: 'Freelance & Contracting', type: 'income', color: '#10b981', icon: 'briefcase' },
      { id: 'cat-inc-consulting', name: 'Consulting', type: 'income', color: '#06b6d4', icon: 'chat-bubble-left-right' },
      { id: 'cat-inc-royalties', name: 'Royalties & Products', type: 'income', color: '#8b5cf6', icon: 'banknotes' },
      { id: 'cat-inc-investment', name: 'Investments & Dividends', type: 'income', color: '#f59e0b', icon: 'chart-pie' },
      { id: 'cat-inc-other', name: 'Other Income', type: 'income', color: '#6b7280', icon: 'tag' },
      { id: 'cat-exp-software', name: 'Software & Subscriptions', type: 'expense', color: '#ec4899', icon: 'code-bracket' },
      { id: 'cat-exp-hardware', name: 'Hardware & Equipment', type: 'expense', color: '#3b82f6', icon: 'computer-desktop' },
      { id: 'cat-exp-office', name: 'Home Office & Utilities', type: 'expense', color: '#eab308', icon: 'home' },
      { id: 'cat-exp-travel', name: 'Travel & Meals', type: 'expense', color: '#f97316', icon: 'truck' },
      { id: 'cat-exp-marketing', name: 'Marketing & Ads', type: 'expense', color: '#14b8a6', icon: 'megaphone' },
      { id: 'cat-exp-taxes', name: 'Taxes & Legal Fees', type: 'expense', color: '#ef4444', icon: 'scale' },
      { id: 'cat-exp-other', name: 'Other Expenses', type: 'expense', color: '#9ca3af', icon: 'tag' },
    ];

    for (const cat of defaultCategories) {
      await run(
        `INSERT INTO categories (id, user_id, name, type, color, icon, is_default)
         VALUES (?, NULL, ?, ?, ?, ?, 1)`,
        [cat.id, cat.name, cat.type, cat.color, cat.icon]
      );
    }
  } catch (err) {
    logger.warn('Could not seed default categories:', err.message);
  }
}

/**
 * Universal Query Execution
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Array>}
 */
function query(sql, params = []) {
  if (dbDialect === 'mysql') {
    return db.query(sql, params).then(([rows]) => rows);
  }

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Execute DML statement (INSERT, UPDATE, DELETE)
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<{ changes: number, lastID: any }>}
 */
function run(sql, params = []) {
  if (dbDialect === 'mysql') {
    return db.execute(sql, params).then(([result]) => ({
      changes: result.affectedRows,
      lastID: result.insertId,
    }));
  }

  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({
        changes: this.changes,
        lastID: this.lastID,
      });
    });
  });
}

/**
 * Fetch a single row
 * @param {string} sql
 * @param {Array} params
 * @returns {Promise<Object|null>}
 */
function get(sql, params = []) {
  if (dbDialect === 'mysql') {
    return db.query(sql, params).then(([rows]) => (rows && rows.length > 0 ? rows[0] : null));
  }

  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

module.exports = {
  connectDB,
  query,
  run,
  get,
  all: query,
  getDbDialect: () => dbDialect,
};
