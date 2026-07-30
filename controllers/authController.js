const authService = require("../services/authService");

// Register Controller
const registerUser = (req, res) => {

    console.log("Controller Layer - Register");

    const result = authService.register(req.body);

    res.status(201).json(result);

};

// Login Controller
const loginUser = (req, res) => {

    console.log("Controller Layer - Login");

    const result = authService.login(req.body);

    res.status(200).json(result);

};

module.exports = {
    registerUser,
    loginUser
};