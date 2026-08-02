const transactionValidation = (req, res, next) => {
    const { title, amount, type, category, transaction_date } = req.body;
    const errors = [];

    // Title: must be a non-empty string
    if (!title || typeof title !== "string" || title.trim().length === 0) {
        errors.push("Title is required and must be a non-empty string");
    }

    // Amount: must be a number greater than zero
    if (amount === undefined || amount === null) {
        errors.push("Amount is required");
    } else if (typeof amount !== "number" || isNaN(amount)) {
        errors.push("Amount must be a valid number");
    } else if (amount <= 0) {
        errors.push("Amount must be greater than zero");
    }

    // Type: must be "income" or "expense"
    if (!type) {
        errors.push("Type is required");
    } else if (!["income", "expense"].includes(type)) {
        errors.push("Type must be either 'income' or 'expense'");
    }

    // Category: must be a non-empty string
    if (!category || typeof category !== "string" || category.trim().length === 0) {
        errors.push("Category is required and must be a non-empty string");
    }

    // Transaction date: must be a valid date
    if (!transaction_date) {
        errors.push("Transaction date is required");
    } else if (isNaN(Date.parse(transaction_date))) {
        errors.push("Transaction date must be a valid date (e.g. '2026-08-01')");
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    next();
};

module.exports = transactionValidation;