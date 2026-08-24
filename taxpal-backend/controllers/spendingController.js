const SpendingService = require("../services/spendingService");

const getSpending = async (req, res) => {

    try {

        const user_id = req.user.id;

        const { month } = req.query;

        const result =
            await SpendingService.getSpending(
                user_id,
                month
            );

        return res.status(200).json({

            success: true,

            message:
                "Spending data fetched successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "Get Spending Error:",
            error.message
        );

        return res.status(400).json({

            success: false,

            message: error.message

        });
    }
};

module.exports = {
    getSpending
};