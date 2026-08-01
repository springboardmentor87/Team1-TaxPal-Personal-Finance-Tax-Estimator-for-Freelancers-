const authService = require("../services/authService");

// Register Controller
const registerUser = async (req, res) => {
    console.log("Controller Layer - Register");
    try {
        const { name, email, password } = req.body;
        
        // Basic validation in controller
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const result = await authService.register({ name, email, password });
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
            message: "Internal server error",
            error: error.message
        });
    }
};

// Login Controller
const loginUser = async (req, res) => {
    console.log("Controller Layer - Login");
    try {
        const { email, password } = req.body;

        // Basic validation in controller
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result = await authService.login({ email, password });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        if (error.message === "Invalid email or password") {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};