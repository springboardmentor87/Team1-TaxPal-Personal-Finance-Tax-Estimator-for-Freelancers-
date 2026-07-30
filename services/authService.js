// Register Service
const register = (userData) => {

    console.log("Service Layer - Register");

    return {
        success: true,
        message: "User Registered Successfully",
        data: userData
    };

};

// Login Service
const login = (loginData) => {

    console.log("Service Layer - Login");

    return {
        success: true,
        message: "Login Successful",
        data: loginData
    };

};

module.exports = {
    register,
    login
};