const dashboardService = require("../services/dashboardService");

const getDashboard = async (req, res) => {
    try {
        const dashboardData = await dashboardService.getDashboardData();

        res.status(200).json({
            success: true,
            message: "Dashboard fetched successfully",
            data: dashboardData
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getDashboard
};