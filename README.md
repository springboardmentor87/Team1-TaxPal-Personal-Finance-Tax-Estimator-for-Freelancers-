# 💰 TaxPal – Personal Finance & Tax Estimator for Freelancers

TaxPal is a modern, full-stack personal finance and real-time tax estimation application crafted specifically for freelancers, gig workers, and self-employed professionals. It provides categorized transaction tracking, monthly budgeting limits with visual progress, regional tax estimation based on slabs, and calendar tracking for quarterly tax deadlines.

---

## 📌 Project Milestones Status

| Milestone | Scope & Deliverables | Status |
| :--- | :--- | :---: |
| **Milestone 1: Transaction Logging (Weeks 1–2)** | User Auth (JWT/Bcrypt), Manual Income & Expense Logging, Core Dashboard with KPI cards & Transaction Lists. | ✅ **Completed** |
| **Milestone 2: Categorization & Budgeting (Weeks 3–4)** | Auto & Manual Category Suggestions, Monthly Spending Limits, Visual Budget Progress & Health Tracking, Category Management. | ✅ **Completed** |
| **Milestone 3: Tax Estimation (Weeks 5–6)** | Regional Tax Calculation (US & India Tax Slabs, State Tax, Deductions), Quarterly Tax Due Date Calendar & Reminder Alerts. | ✅ **Completed** |
| **Milestone 4: Reporting & Export (Weeks 7–8)** | Financial Statement Summaries (Income Statement, Expense Report), Monthly/Quarterly Breakdowns, PDF & CSV Export. | ⏳ *In Progress* |

---

## 🏗️ System Architecture

```
┌────────────────────────────────┐         HTTP REST API        ┌────────────────────────────────┐       SQL Persistence      ┌────────────────────────────────┐
│      Angular 21 Frontend       │ ───────────────────────────> │    Node.js / Express Backend   │ ─────────────────────────> │     MySQL / SQLite Database    │
│ (taxpal-frontend - Port 4200)  │ <─────────────────────────── │  (taxpal-backend - Port 8080)  │ <───────────────────────── │            (taxpal)            │
└────────────────────────────────┘            JWT Auth          └────────────────────────────────┘      mysql2 / sqlite3      └────────────────────────────────┘
```

---

## 🚀 Key Features

### 🔐 1. Authentication & User Profile (Milestone 1)
* **JWT-Based Authentication**: Secure registration and login flows with encrypted passwords via `bcrypt`.
* **User Profile**: Regional country configuration, income bracket classification, and profile management.
* **Angular Auth Guards**: Protects all internal application routes.

### 💵 2. Transaction Management & Dashboard (Milestone 1)
* **Income & Expense Entry**: Record transactions with description, amount, category, date, and notes.
* **KPI Dashboard**: Real-time summaries of *Monthly Income*, *Monthly Expenses*, *Estimated Tax Due*, and *Savings Rate*.
* **Interactive Visualizations**: Timeframe-filtered Income vs. Expense bar charts and Category Spending doughnut charts using Chart.js.

### 📊 3. Smart Categorization & Budgeting (Milestone 2)
* **Auto-Categorization**: Intelligent category keyword suggestion engine on transaction entry.
* **Budget Limits**: Define monthly spending ceilings per category.
* **Visual Progress Tracking**: Real-time budget health meters (*Good / Warning / Danger*) with remaining budget calculations.
* **Category Management**: Create, edit, customize colors, and organize income and expense categories.

### 🏛️ 4. Regional Tax Estimation Engine & Calendar (Milestone 3)
* **Tax Calculation by Slabs**:
  * **India**: New tax regime slabs (0%, 5%, 10%, 15%, 20%, 30%) + cess and freelance business expenses.
  * **United States**: Federal brackets (10%, 12%, 22%, 24%) + State Tax (California, New York, Texas 0%, Florida 0%) + Self-Employment Tax (15.3%).
* **Deduction Engine**: Factor in Business Expenses, Retirement Contributions (SEP IRA, Solo 401(k), PPF), Health Insurance Premiums, and Home Office deductions.
* **Tax Calendar & Reminders**: Visual schedule of Q1–Q4 estimated tax deadlines with *Upcoming*, *Due Soon*, and *Mark Paid* status workflows.

---

## 🛠️ Tech Stack

* **Frontend**: Angular v21 (Standalone Components, RxJS, Reactive Forms, Chart.js, Vanilla CSS Design System)
* **Backend**: Node.js, Express.js, JWT, bcrypt
* **Database**: MySQL / SQLite (`schema.sql` supporting `users`, `transactions`, `budgets`, `categories`, `tax_calculations`, `tax_summaries`, `tax_events`, `alerts`)

---

## 💻 Getting Started

### Prerequisites
* **Node.js** (v18+) & **npm**
* **MySQL Server** (Optional – SQLite is built-in as local fallback)

---

### 1. Database Setup (Optional for MySQL)
Execute [`taxpal-backend/schema.sql`](file:///c:/Springbord/taxpal-backend/schema.sql) in MySQL:
```sql
mysql -u root -p < taxpal-backend/schema.sql
```

---

### 2. Backend Setup (`taxpal-backend`)
```bash
cd taxpal-backend
npm install
npm start
```
*Backend runs on `http://localhost:8080`.*

---

### 3. Frontend Setup (`taxpal-frontend`)
```bash
cd taxpal-frontend
npm install
npm start
```
*Open **`http://localhost:4200`** in your browser.*

---

## 📦 Build & Test

```bash
# Build Angular Frontend
cd taxpal-frontend
npm run build

# Run Tests
npm test
```
