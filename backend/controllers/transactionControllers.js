const addTransaction = (req, res) => {

    // Database - bipul

    res.status(201).json({
        message: "Transaction added successfully",
        data: req.body
    });

}

const getTransactions = (req, res) => {

    // database - bipul

    res.status(200).json({
        message: "Transaction list",
        data: []
    });

}

module.exports = { addTransaction, getTransactions }