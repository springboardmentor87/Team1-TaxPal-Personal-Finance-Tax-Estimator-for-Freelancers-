const AlertService = require("../services/alertService");
const asyncHandler = require("../utils/asyncHandler");

// Create quarterly tax alerts
const createQuarterlyTaxAlerts = asyncHandler(
    async (req, res) => {
        const user_id = req.user.id;

        const year =
            Number(req.body.year) ||
            new Date().getFullYear();

        const alerts =
            await AlertService.createQuarterlyTaxAlerts(
                user_id,
                year
            );

        return res.status(201).json({
            success: true,
            message:
                "Quarterly tax alerts created successfully",
            data: alerts
        });
    }
);


// Get all alerts of logged-in user
const getAlerts = asyncHandler(
    async (req, res) => {
        const user_id = req.user.id;

        const alerts =
            await AlertService.getUserAlerts(user_id);

        return res.status(200).json({
            success: true,
            message: "Alerts fetched successfully",
            data: alerts
        });
    }
);


// Mark alert as read
const markAlertAsRead = asyncHandler(
    async (req, res) => {
        const user_id = req.user.id;
        const { id } = req.params;

        await AlertService.markAlertAsRead(
            id,
            user_id
        );

        return res.status(200).json({
            success: true,
            message: "Alert marked as read"
        });
    }
);


// Mark alert as resolved
const markAlertAsResolved = asyncHandler(
    async (req, res) => {
        const user_id = req.user.id;
        const { id } = req.params;

        await AlertService.markAlertAsResolved(
            id,
            user_id
        );

        return res.status(200).json({
            success: true,
            message: "Alert marked as resolved"
        });
    }
);


// Delete alert
const deleteAlert = asyncHandler(
    async (req, res) => {
        const user_id = req.user.id;
        const { id } = req.params;

        await AlertService.deleteAlert(
            id,
            user_id
        );

        return res.status(200).json({
            success: true,
            message: "Alert deleted successfully"
        });
    }
);


module.exports = {
    createQuarterlyTaxAlerts,
    getAlerts,
    markAlertAsRead,
    markAlertAsResolved,
    deleteAlert
};