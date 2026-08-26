-- Standard SQL Schema for TaxPal (SQLite & MySQL compatible)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  phone TEXT DEFAULT '',
  country TEXT DEFAULT 'US',
  state TEXT DEFAULT '',
  city TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  role TEXT DEFAULT 'freelancer',
  is_email_verified INTEGER DEFAULT 0,
  email_verification_token TEXT DEFAULT NULL,
  email_verification_expires TEXT DEFAULT NULL,
  password_reset_otp TEXT DEFAULT NULL,
  password_reset_expires TEXT DEFAULT NULL,
  refresh_token TEXT DEFAULT NULL,
  category_mappings TEXT DEFAULT '{}',
  auto_categorize_enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  custom_category TEXT DEFAULT NULL,
  description TEXT NOT NULL,
  transaction_date TEXT NOT NULL,
  notes TEXT DEFAULT '',
  receipt_url TEXT DEFAULT '',
  receipt_file_id TEXT DEFAULT '',
  is_deductible INTEGER DEFAULT 1,
  tags TEXT DEFAULT '[]',
  is_recurring INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  month TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE(user_id, category, month)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'tag',
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tax_estimates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT DEFAULT '',
  quarter TEXT NOT NULL,
  year INTEGER NOT NULL,
  gross_income REAL DEFAULT 0,
  business_expenses REAL DEFAULT 0,
  retirement_contribution REAL DEFAULT 0,
  health_insurance REAL DEFAULT 0,
  home_office_deduction REAL DEFAULT 0,
  deductions_total REAL DEFAULT 0,
  taxable_income REAL DEFAULT 0,
  effective_tax_rate REAL DEFAULT 0,
  estimated_tax REAL DEFAULT 0,
  calculation_details TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  read_at TEXT DEFAULT NULL,
  severity TEXT DEFAULT 'info',
  action_url TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  period TEXT DEFAULT '',
  generated_at TEXT DEFAULT (datetime('now')),
  format TEXT DEFAULT 'pdf',
  data TEXT DEFAULT '{}',
  summary TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  frequency TEXT NOT NULL,
  email TEXT NOT NULL,
  format TEXT DEFAULT 'pdf',
  last_sent_at TEXT DEFAULT NULL,
  next_run_at TEXT DEFAULT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT DEFAULT 'Financial Assistant Chat',
  messages TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  ip TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
