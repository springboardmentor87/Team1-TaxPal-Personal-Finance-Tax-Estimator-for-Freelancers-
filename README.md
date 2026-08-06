# 💰 TaxPal – Personal Finance & Tax Estimator for Freelancers

TaxPal is a professional, full-stack personal finance and real-time tax estimation application crafted specifically for freelancers, consultants, and gig workers. It provides an intuitive dashboard for income and expense tracking, tax liability estimations, interactive visual analytics, and full database persistence powered by Node.js, Express, and MySQL.

---

## 🏗️ System Architecture

TaxPal is built as an end-to-end full-stack solution featuring a responsive Angular SPA frontend, a Node.js/Express REST API backend, and a relational MySQL database layer.

```
┌───────────────────────────────┐     HTTP REST API      ┌───────────────────────────────┐      SQL Queries      ┌───────────────────────────────┐
│     Angular 21 Frontend       │ ────────────────────>  │    Node.js / Express Backend  │ ────────────────────> │        MySQL Database         │
│  (taxpal-frontend - Port 4200)│ <────────────────────  │  (taxpal-backend - Port 8080) │ <──────────────────── │           (taxpal)            │
└───────────────────────────────┘       JWT Auth         └───────────────────────────────┘        mysql2         └───────────────────────────────┘
```

---

## 🚀 Key Features

### 🔐 Secure Authentication & User Management
* **JWT-Based Authentication**: Full authentication workflow using JSON Web Tokens.
* **Login & Registration**: User signup and login connected directly to the Express backend and MySQL database.
* **Password Encryption**: Secure password hashing implemented using `bcrypt`.
* **Route Guards**: Angular `AuthGuard` protects private routes and redirects unauthenticated users to login.

### 📊 Interactive Financial Dashboard
* **KPI Metric Cards**: Real-time calculations for *Monthly Income*, *Monthly Expenses*, *Estimated Tax Due* (15% rate), and *Savings Rate*.
* **Dynamic Timeframe Analytics**: Income vs. Expense bar charts filterable by **Month**, **Quarter**, and **Year** powered by Chart.js.
* **Categorized Expense Breakdown**: Interactive doughnut chart displaying monthly spending habits.
* **Recent Activity Stream**: Instant display of latest logged financial transactions.

### 💵 Real-Time Transaction Management & Currency Localization
* **Full CRUD Operations**: Modal dialogs to log incomes and expenses with categories, descriptions, amounts, and dates.
* **Rupee (₹) Currency Localization**: Native support for Indian Rupees (`₹`) formatted across all forms, tables, and chart axes.
* **Search, Sort & Filter**: Advanced transaction history workspace to filter and audit records.

### 🗄️ Relational MySQL Persistence
* **Relational Schema**: Structured MySQL tables (`users`, `transactions`) configured with foreign keys and cascading deletes.

---

## 🛠️ Tech Stack

### **Frontend (`taxpal-frontend`)**
* **Framework**: Angular v21 (Standalone Components)
* **Language**: TypeScript
* **State & HTTP**: RxJS, Angular HttpClient
* **Styling**: Vanilla CSS (Custom Design Tokens, Responsive Layouts, Dynamic Themes)
* **Visualizations**: Chart.js / Canvas

### **Backend (`taxpal-backend`)**
* **Runtime**: Node.js & Express.js
* **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcrypt`
* **Database Driver**: `mysql2`

### **Database Layer**
* **RDBMS**: MySQL
* **Database Name**: `taxpal`

---

## 💻 Getting Started

### Prerequisites
* **Node.js** (v18+ recommended) & **npm**
* **MySQL Server** running locally or remotely

---

### 1. Database Setup

Execute [`taxpal-backend/schema.sql`](file:///c:/Springbord/taxpal-backend/schema.sql) in your MySQL environment:

```sql
mysql -u root -p < taxpal-backend/schema.sql
```

---

### 2. Backend Setup (`taxpal-backend`)

1. Navigate to the backend directory:
   ```bash
   cd taxpal-backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `taxpal-backend/`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=taxpal
   JWT_SECRET=your_secret_key
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:5000`.*

---

### 3. Frontend Setup (`taxpal-frontend`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd taxpal-frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   ```
4. Open **`http://localhost:4200`** in your browser.

---

## 📦 Production Build & Testing

### Build Frontend
```bash
cd taxpal-frontend
npm run build
```

### Run Tests
```bash
cd taxpal-frontend
npm test
```
