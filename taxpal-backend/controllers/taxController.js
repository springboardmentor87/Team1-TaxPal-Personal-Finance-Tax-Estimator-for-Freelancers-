const TaxModel = require("../models/taxModel");
const TaxService = require("../services/taxService");



// ==========================================
// Calculate Tax
// ==========================================
const calculateTax = async (req, res) => {

    try {

        const user_id = req.user.id;

        const result =
            await TaxService.calculateTax(
                user_id,
                req.body
            );


        return res.status(200).json({

            success: true,

            message:
                "Tax calculated successfully",

            data: result

        });

    } catch (error) {

        console.error(
            "Tax Calculation Error:",
            error.message
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });
    }
};


// ==========================================
// Get Tax Reminders
// ==========================================
const getTaxReminders = async (req, res) => {

    try {

        const user_id = req.user.id;


        const reminders =
            await TaxService.getTaxReminders(
                user_id
            );


        return res.status(200).json({

            success: true,

            message:
                "Tax reminders fetched successfully",

            data: reminders

        });

    } catch (error) {

        console.error(
            "Tax Reminder Error:",
            error.message
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch tax reminders",

            error:
                error.message

        });
    }
};


// ==========================================
// Update Reminder Status
// ==========================================
const updateReminderStatus = async (req, res) => {

    try {

        const user_id = req.user.id;
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        // Frontend sends IDs such as:
        // Q1-reminder
        // Q2-reminder
        // Q3-payment
        // Q4-payment

        const parts = id.split("-");

        const quarter = parts[0];

        const currentYear =
        new Date().getFullYear();
        const alertDate =
        TaxService.getQuarterDueDate(quarter,currentYear);

        if (!alertDate) {
            return res.status(404).json({
                success: false,
                message: "Invalid reminder ID"
            });
        }

        const result =
            await TaxModel.markAlertAsReadByDate(
                user_id,
                alertDate
            );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Reminder not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Reminder status updated successfully",
            data: {
                id,
                status
            }
        });

    } catch (error) {

        console.error(
            "Update Reminder Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update reminder status"
        });
    }
};

const getAlerts = async (req, res) => {

    try {

        const user_id = req.user.id;

        const alerts =
            await TaxModel.getAlertsByUser(user_id);

        return res.status(200).json({
            success: true,
            data: alerts
        });

    } catch (error) {

        console.error(
            "Get Alerts Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch alerts"
        });
    }
};


module.exports = {
    calculateTax,
    getTaxReminders,
    updateReminderStatus,
    getAlerts
};