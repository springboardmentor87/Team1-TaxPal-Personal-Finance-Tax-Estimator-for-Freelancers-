# 💰 TaxPal – Personal Finance & Tax Estimator for Freelancers

TaxPal is a high-fidelity personal finance & tax estimation application built to help freelancers and gig workers manage their business finances. The application provides an intuitive dashboard, real-time transaction logging (income and expenses), categorization, savings rate calculation, and live tax estimates.

This codebase contains the complete **Milestone 1 Frontend** implementation, configured as a standalone, frontend-only Angular application with local data persistence.

---

## 🚀 Key Features

*   **🔐 Client-Side Authentication (Mocked)**
    *   **Login Screen**: Form with input validators and helper card credentials for testing (`demo` / `password`).
    *   **Registration Screen**: Form with comprehensive validations (Name, Email, Country, and optional Income Bracket dropdown).
    *   **Navigation Guard**: Active `AuthGuard` protects dashboard pages and redirects unauthenticated sessions back to the login screen.
*   **📊 Interactive Financial Dashboard**
    *   **KPI Metric Cards**: Displays real-time calculations for *Monthly Income*, *Monthly Expenses*, *Estimated Tax Due* (using a 15% net income rate), and *Savings Rate*.
    *   **Dynamic Bar Chart**: Visualizes Income vs. Expenses over different timeframes (**Month**, **Quarter**, **Year**) powered by Chart.js.
    *   **Expense Breakdown Chart**: Categorized doughnut chart of the current month's expenses.
    *   **Recent Activity**: Quick view list showing the latest 5 transactions with colored badges.
*   **💵 Manual Transaction Logging**
    *   **Record Income/Expense Modals**: Easy-to-use popups with validations for Description, Amount, Category, Date, and Notes.
    *   **Rupee Currency Formatting**: Localized from USD (`$`) to Indian Rupees (`₹`) across all inputs, summaries, tables, and chart axes.
*   **🗂️ Full Transaction History**
    *   Dedicated search, sort, and filter workspace to query, review, and delete transactions.
*   **💾 Local Storage Persistence**
    *   Keeps session data and added transactions persistent across page refreshes.

---

## 🛠️ Tech Stack

*   **Framework**: Angular v21 (Standalone Components)
*   **Language**: TypeScript
*   **Styling**: Pure CSS (custom theme variables, responsive grids, and transitions)
*   **Visualizations**: Chart.js / Canvas
*   **Testing**: Vitest (configured with JSDOM)

---

## 💻 Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

### Installation

Install the project dependencies:
```bash
npm install
```

### Running Development Server

To run the application locally:
```bash
npm start
```
Once started, navigate to **`http://localhost:4200/`** in your browser.

### Building for Production

To compile the application bundle:
```bash
npm run build
```

### Running Unit Tests

To execute the unit test suite using Vitest:
```bash
npm test
```
