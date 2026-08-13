const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();

dotenv.config();

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoute");
const dashboardRoutes = require("./routes/dashboardRoute");
const budgetRoute = require("./routes/budgetRoute");
const spendingRoutes = require("./routes/spendingRoute");



app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budget", budgetRoute);
app.use("/api/spending", spendingRoutes);

app.get("/", (req, res) => {
    res.send("TaxPal Backend is Running...");
});

module.exports = app;