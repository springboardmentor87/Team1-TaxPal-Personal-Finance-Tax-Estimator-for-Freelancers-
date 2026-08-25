const authService = require("../services/authService");

// Register Controller
const registerUser = async (req, res) => {
    console.log("Controller Layer - Register");
    try {
        const { name, username, email, password, country, income_bracket } = req.body;

        if (!name || !email || !password || !country || !income_bracket) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const result = await authService.register({
            name,
            username,
            email,
            password,
            country,
            income_bracket
        });
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
        });
    } catch (error) {
        console.error("Register Error:", error.message);
        if (error.message === "Email already registered") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

// Login Controller
const loginUser = async (req, res) => {
    console.log("Controller Layer - Login");
    try {
        const { email, username, password } = req.body;
        const identifier = username || email;

        // Basic validation in controller
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Username/Email and password are required"
            });
        }

        const result = await authService.login({ email, username, password });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message || "Login failed"
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};