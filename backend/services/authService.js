const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "taxpal_secret_key_12345";
const JWT_EXPIRES_IN = "24h";

// Register Service
const register = async (userData) => {
    const { name, email, password } = userData;

    // Validate fields
    if (!name || !email || !password) {
        throw new Error("Name, email and password are required");
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        throw new Error("Email already registered");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to DB
    const newUser = await UserModel.createUser({
        name,
        email,
        password: hashedPassword
    });

    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
    };
};

// Login Service
const login = async (loginData) => {
    const { email, password } = loginData;

    // Validate fields
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    // Return token and user info (excluding password)
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    };
};

module.exports = {
    register,
    login
};