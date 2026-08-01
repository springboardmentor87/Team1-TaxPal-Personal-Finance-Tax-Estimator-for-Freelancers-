const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

// Test Route
router.get("/", (req, res) => {
    res.send("Auth Route Working");
});

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

module.exports = router;