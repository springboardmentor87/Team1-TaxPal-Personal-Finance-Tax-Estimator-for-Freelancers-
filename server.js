const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./backend/routes/transactionRoute");

const app = express();
const PORT = process.env.PORT || 5678;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to TaxPal Backend");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});