const transactionValidation = (req, res, next) => {

    const { type, category, amount, date } = req.body;

    if (!type || !category || !amount || !date) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    next();

}

module.exports = transactionValidation;