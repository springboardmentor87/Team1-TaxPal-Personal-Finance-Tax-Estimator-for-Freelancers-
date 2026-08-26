# 💰 TaxPal – Personal Finance & Tax Estimator for Freelancers

**TaxPal** is a full-stack personal finance and automated tax estimation platform engineered specifically for freelancers, gig economy workers, independent contractors, and self-employed professionals. It provides expense tracking, budget management, tax calculations with regional tax slabs and deductions, automated receipt scanning, and periodic report exports.

---

## 📌 Project Milestones Status

| Milestone | Scope & Deliverables | Status |
| :--- | :--- | :---: |
| **Milestone 1: Transaction Logging & Dashboard** | User Auth (JWT/Bcrypt), Manual Income & Expense Logging, Core Dashboard with KPI cards & Transaction Lists. | ✅ **Completed** |
| **Milestone 2: Categorization & Budgeting** | Smart Category Suggestions, Monthly Spending Limits, Visual Budget Progress & Health Meters, Category Management. | ✅ **Completed** |
| **Milestone 3: Tax Estimation & Planning** | Regional Tax Calculation (US, India, etc.), Deduction Analysis, Quarterly Tax Deadlines & Reminder Alerts. | ✅ **Completed** |
| **Milestone 4: Reporting & Export** | Financial Statement Summaries (Income Statement, Expense Report, Tax Summaries), Scheduled Reports & Email Delivery, Receipt Scanner, Financial Help Assistant. | ✅ **Completed** |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Angular 21 Frontend                    │
│   (Standalone Components, Reactive Forms, Chart.js, CSS) │
│                Runs on: http://localhost:4200            │
└────────────────────────────┬─────────────────────────────┘
                             │  HTTP / REST API (JWT Bearer Token)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                Node.js & Express Backend                 │
│    (MVC Pattern, Auth Middleware, Validators, Mailer)    │
│                Runs on: http://localhost:8080            │
└────────────────────────────┬─────────────────────────────┘
                             │  SQL Queries / SQLite3 Fallback
                             ▼
┌──────────────────────────────────────────────────────────┐
│              Database (MySQL / SQLite Storage)           │
│    Users, Transactions, Budgets, Categories, Reports,   │
│                 Tax Estimates & Alerts                   │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 🔐 1. Authentication & Profile Management
- **JWT & Password Hashing**: Secure user registration and login with encrypted passwords (`bcrypt`) and token-based session handling.
- **Customizable Profiles**: User country/state settings, currency preferences, tax bracket configuration, and category mapping overrides.
- **Auth Guard & HTTP Interceptors**: Automatic bearer token attachment and route guarding in Angular.

### 💵 2. Transaction Tracking & Analytics Dashboard
- **Income & Expense Recording**: Detailed transaction entry with date, category, payment mode, receipt attachments, and notes.
- **Interactive KPI Cards**: Real-time totals for *Income*, *Expenses*, *Estimated Tax Due*, *Remaining Budget*, and *Net Savings*.
- **Visual Analytics**: Interactive category breakdown charts, monthly cash flow distributions, and expense trend charts.

### 📊 3. Smart Budgets & Category Management
- **Spending Thresholds**: Set monthly limits per category to prevent overspending.
- **Visual Health Indicators**: Color-coded progress meters (*Safe*, *Warning*, *Exceeded*).
- **Custom Categories**: Add, edit, recolor, and organize custom transaction categories.

### 🏛️ 4. Multi-Region Tax Estimation Engine
- **Tax Calculation Engine**:
  - **India**: New & Old Tax Regime slabs (0%, 5%, 10%, 15%, 20%, 30%) + standard deductions and freelance business expense offsets.
  - **United States**: Federal income brackets + State tax rates + Self-Employment Tax (Social Security & Medicare / 15.3%).
- **Deduction Engine**: Automatic deduction calculations for Home Office, Equipment, Software Subscriptions, Health Insurance, and Retirement (PPF, NPS, SEP IRA, Solo 401k).
- **Quarterly Calendar**: Due date tracking for Q1–Q4 with status indicators (*Upcoming*, *Due Soon*, *Paid*).

### 🧾 5. Financial Chat Assistant & Receipt Scanner
- **Financial Assistant**: Interactive assistant to answer tax questions, deduction eligibility, and budget health tips.
- **Receipt Scanning**: Upload receipt images or PDFs with automatic metadata extraction.

### 📑 6. Reports & Automated Email Delivery
- **Financial Statements**: Generate monthly and quarterly Income Statements, Expense Summaries, and Tax Filing reports.
- **Scheduled Reports**: Schedule periodic financial digest emails directly to the user's inbox.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Angular 21, TypeScript, RxJS, Chart.js, Vanilla CSS Design System |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), `bcrypt`, `multer`, `nodemailer`, `winston` |
| **Database** | SQLite (`sqlite3`) / MySQL (`mysql2`), SQL Schema Migration |
| **Testing & Tools** | Karma / Jasmine, Postman Collection, ESLint, Prettier |

---

## 📁 Repository Structure

```text
Team1-TaxPal-Personal-Finance-Tax-Estimator-for-Freelancers-/
├── taxpal-backend/                     # Node.js & Express REST API
│   ├── src/
│   │   ├── config/                     # Database, logger & env configurations
│   │   ├── controllers/                # REST API controllers
│   │   ├── middleware/                 # Auth, error & upload middlewares
│   │   ├── models/                     # SQL database models & query abstraction
│   │   ├── routes/                     # Express API endpoint routes
│   │   ├── services/                   # Business logic (tax calculations, mailer, reports)
│   │   ├── utils/                      # Helper utilities & API response formatters
│   │   ├── validators/                 # Request validation schemas
│   │   ├── app.js                      # Express app setup
│   │   ├── schema.sql                  # Database schema definition
│   │   └── server.js                   # Application entry point
│   ├── .env.example                    # Example environment variables
│   ├── package.json                    # Backend dependencies & scripts
│   ├── TaxPal.postman_collection.json  # Postman API test collection
│   └── README.md                       # Backend specific documentation
│
├── taxpal-frontend/                    # Angular 21 Single Page Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/             # Reusable UI components (Chatbot, Dropdowns)
│   │   │   ├── pages/                  # Page views (Dashboard, Budgets, Tax, Reports, etc.)
│   │   │   └── services/               # API clients, auth interceptor & state
│   │   ├── index.html                  # HTML entry
│   │   ├── styles.css                  # Global design system & theme variables
│   │   └── main.ts                     # Angular bootstrapping
│   ├── angular.json                    # Angular CLI configuration
│   ├── package.json                    # Frontend dependencies & scripts
│   └── README.md                       # Frontend specific documentation
│
└── README.md                           # Main project documentation (this file)
```

---

## ⚙️ Getting Started & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd taxpal-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment configuration file:
   ```bash
   cp .env.example .env
   ```
4. Start the backend development server:
   ```bash
   npm start
   ```
   *The backend API will run at **`http://localhost:8080`**.*

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd taxpal-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:4200
   ```

---

## 🔑 API Endpoint Reference

| Module | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new user account |
| **Auth** | `POST` | `/api/auth/login` | Login user & return JWT token |
| **Auth** | `GET` | `/api/auth/profile` | Get current user profile |
| **Transactions** | `GET` | `/api/transactions` | Fetch user transactions (filtered) |
| **Transactions** | `POST` | `/api/transactions` | Add new income or expense transaction |
| **Transactions** | `DELETE`| `/api/transactions/:id`| Delete a transaction |
| **Budgets** | `GET` | `/api/budgets` | Fetch monthly budget limits & utilization |
| **Budgets** | `POST` | `/api/budgets` | Create or update category budget |
| **Tax Estimates** | `POST` | `/api/tax-estimates/calculate` | Calculate estimated taxes based on inputs |
| **Tax Estimates** | `GET` | `/api/tax-estimates` | Fetch historical tax calculation records |
| **Reports** | `GET` | `/api/reports/summary` | Generate financial report summaries |
| **Alerts** | `GET` | `/api/alerts` | Fetch unread reminders & deadline alerts |
| **Chat** | `POST` | `/api/chat` | Send message to financial assistant |
| **Receipts** | `POST` | `/api/receipts/scan` | Upload and scan receipt |

---

## 🧪 Testing

```bash
# Run Frontend Tests (Jasmine/Karma)
cd taxpal-frontend
npm test

# Build Frontend for Production
npm run build
```

---

## 👥 Contributors

* **Team 1 - TaxPal**
* **Frontend Lead / Developer**: Chethan Urs ([@ChethanUrs](https://github.com/ChethanUrs))
