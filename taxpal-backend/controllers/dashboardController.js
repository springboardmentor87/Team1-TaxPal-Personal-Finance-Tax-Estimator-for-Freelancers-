const dashboardService = require("../services/dashboardService");

const getDashboard = async (req, res) => {
    try {

        const userId = req.user.id;

        const dashboardData = await dashboardService.getDashboard(userId);

        return res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to load dashboard",
            error: error.message
        });
    }
};

module.exports = {
    getDashboard
};