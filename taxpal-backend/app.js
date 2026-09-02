const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const AppError = require("./utils/AppError");
const errorHandler = require("./middleware/errorHandler");

const app = express();

dotenv.config();

require("./config/db");


const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoute");
const dashboardRoutes = require("./routes/dashboardRoute");
const budgetRoute = require("./routes/budgetRoute");
const categoryRoute = require("./routes/categoryRoute");
const taxRoute = require("./routes/taxRoute");
const alertRoute = require("./routes/alertRoute");
const taxEventRoute = require("./routes/taxEventRoute");
const reportRoutes = require("./routes/reportRoute");


app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budgets", budgetRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/tax", taxRoute);
app.use("/api/alerts", alertRoute);
app.use("/api/tax-events", taxEventRoute);
app.use("/api/reports", reportRoutes);


app.get("/", (req, res) => {
    res.send("TaxPal Backend is Running...");
});


app.use((req, res, next) => {
    next(
        new AppError(
            `Route ${req.originalUrl} not found`,
            404
        )
    );
});


app.use(errorHandler);


module.exports = app;