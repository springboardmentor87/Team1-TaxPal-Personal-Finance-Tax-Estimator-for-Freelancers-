const transactionValidation = (req, res, next) => {

    const {
        title,
        description,
        amount,
        type,
        category,
        transaction_date,
        date
    } = req.body;

    const hasTitle = title || description;
    const hasDate = transaction_date || date;

    if (!hasTitle || !amount || !type || !category || !hasDate) {
        return res.status(400).json({
            message: "All fields (description/title, amount, type, category, date) are required"
        });
    }

    next();

};

module.exports = transactionValidation;