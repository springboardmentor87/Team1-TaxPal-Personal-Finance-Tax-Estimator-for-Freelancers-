const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    resetPassword
} = require("../controllers/authController");

// Test Route
router.get("/", (req, res) => {
    res.send("Auth Route Working");
});

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);

module.exports = router;