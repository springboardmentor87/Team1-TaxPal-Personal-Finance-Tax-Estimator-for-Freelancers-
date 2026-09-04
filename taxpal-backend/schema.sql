CREATE DATABASE IF NOT EXISTS taxpal;
USE taxpal;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    income_bracket VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    transaction_date DATE NOT NULL,
    date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget_limit DECIMAL(10,2) NOT NULL,
    month DATE NOT NULL,
    description VARCHAR(500) NULL,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_user_category_month
        (user_id, category, month)
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    color VARCHAR(50) DEFAULT '#3b82f6',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_user_category_type
        (user_id, name, type)
);

CREATE TABLE IF NOT EXISTS tax_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    financial_year VARCHAR(50) NOT NULL,
    gross_income DECIMAL(15,2) NOT NULL,
    business_expenses DECIMAL(15,2) NOT NULL,
    other_deductions DECIMAL(15,2) NOT NULL,
    taxable_income DECIMAL(15,2) NOT NULL,
    old_regime_tax DECIMAL(15,2) NOT NULL,
    new_regime_tax DECIMAL(15,2) NOT NULL,
    selected_regime VARCHAR(20) NOT NULL,
    estimated_tax DECIMAL(15,2) NOT NULL,
    cess DECIMAL(15,2) NOT NULL,
    total_tax DECIMAL(15,2) NOT NULL,
    effective_tax_rate DECIMAL(5,2) NOT NULL,
    net_income DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tax_assessment_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);


