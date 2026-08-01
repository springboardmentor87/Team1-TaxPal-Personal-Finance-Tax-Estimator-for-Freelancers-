const transactionValidation = (req, res, next) => {

    const {
        title,
        amount,
        type,
        category,
        transaction_date
    } = req.body;

    if (!title || !amount || !type || !category || !transaction_date) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    next();

};

module.exports = transactionValidation;