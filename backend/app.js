const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load env variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const db = require("./config/db");
const app = express();
const transactionRoutes = require("./routes/transactionRoute");
const authRoutes = require("../routes/authRoutes");

const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("working");
});

app.listen(port, () => {
    console.log(`port is running at ${port}`);
});