require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Initialize Express app
const app = express();

// Import database (initializes MySQL connection pool)
const pool = require("./config/db");

// Import routes
const transactionRoutes = require("./routes/transactionRoute");

// Configuration
const PORT = process.env.PORT || 8080;

// ===============================
// Security Middleware
// ===============================
app.disable("x-powered-by");
app.use(helmet());
app.use(cors());

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});

app.use(limiter);

// ===============================
// Middleware
// ===============================
app.use(express.json());

// ===============================
// Health Check Route
// ===============================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "TaxPal API is running successfully"
    });
});

// ===============================
// API Routes
// ===============================
app.use("/api/transactions", transactionRoutes);

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// ===============================
// Start Server
// ===============================
app.listen(PORT, () => {
    console.log(`🚀 TaxPal Server is running on http://localhost:${PORT}`);
});

// ===============================
// Graceful Shutdown
// ===============================
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down server...");
    process.exit(0);
});