const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const taxRoute = require("./routes/taxRoute");

const app = express();

dotenv.config();

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoute");
const dashboardRoutes = require("./routes/dashboardRoute");
const budgetRoute = require("./routes/budgetRoute");
// const spendingRoutes = require("./routes/spendingRoute");
const categoryRoute = require("./routes/categoryRoute");



app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budgets", budgetRoute);
// app.use("/api/spending", spendingRoutes);
app.use("/api/categories", categoryRoute);
app.use("/api/tax", taxRoute);

app.get("/", (req, res) => {
    res.send("TaxPal Backend is Running...");
});

module.exports = app;