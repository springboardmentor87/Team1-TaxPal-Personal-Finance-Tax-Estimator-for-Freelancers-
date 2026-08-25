const errorHandler = (err, req, res, next) => {

    console.error("========== ERROR ==========");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    console.error("===========================");

    err.statusCode = err.statusCode || 500;

    err.status = err.status || "error";

    return res
        .status(err.statusCode)
        .json({
            success: false,
            status: err.status,
            message: err.message || "Something went wrong"
        });

};

module.exports = errorHandler;