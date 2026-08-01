const UserModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "taxpal_secret_key_12345";
const JWT_EXPIRES_IN = "24h";

// Register Service
const register = async (userData) => {

    const {
        name,
        email,
        password,
        country,
        income_bracket
    } = userData;

    // Validate fields
    if (!name || !email || !password || !country || !income_bracket) {
        throw new Error("All fields are required");
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
        throw new Error("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = await UserModel.createUser({
        name,
        email,
        password: hashedPassword,
        country,
        income_bracket
    });

    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        country: newUser.country,
        income_bracket: newUser.income_bracket
    };
};

// Login Service
const login = async (loginData) => {

    const { email, password } = loginData;

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            country: user.country,
            income_bracket: user.income_bracket
        }
    };
};

module.exports = {
    register,
    login
};