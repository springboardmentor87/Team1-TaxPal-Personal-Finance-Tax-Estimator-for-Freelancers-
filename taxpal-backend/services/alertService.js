const AlertModel = require("../models/alertModel");
const AppError = require("../utils/AppError");

const AlertService = {

    createQuarterlyTaxAlerts: async (user_id, year) => {

        if (!user_id) {
            throw new AppError(
                "User ID is required",
                401
            );
        }

        if (!year || isNaN(Number(year))) {
            throw new AppError(
                "Valid year is required",
                400
            );
        }

        const alerts = [
            {
                title: "Quarter 1 Tax Due",
                message: `Your Quarter 1 tax payment for ${year} is due soon.`,
                severity: "warning",
                alert_type: "quarterly_tax",
                due_date: `${year}-06-15`
            },
            {
                title: "Quarter 2 Tax Due",
                message: `Your Quarter 2 tax payment for ${year} is due soon.`,
                severity: "warning",
                alert_type: "quarterly_tax",
                due_date: `${year}-09-15`
            },
            {
                title: "Quarter 3 Tax Due",
                message: `Your Quarter 3 tax payment for ${year} is due soon.`,
                severity: "warning",
                alert_type: "quarterly_tax",
                due_date: `${year}-12-15`
            },
            {
                title: "Quarter 4 Tax Due",
                message: `Your Quarter 4 tax payment for ${year} is due soon.`,
                severity: "warning",
                alert_type: "quarterly_tax",
                due_date: `${Number(year) + 1}-03-15`
            }
        ];

        const createdAlerts = [];

        for (const alert of alerts) {

            const createdAlert =
                await AlertModel.createAlert({
                    user_id,
                    ...alert
                });

            createdAlerts.push(createdAlert);
        }

        return createdAlerts;
    },

    getUserAlerts: async (user_id) => {

        if (!user_id) {
            throw new AppError(
                "User ID is required",
                401
            );
        }

        return await AlertModel.getAlertsByUser(user_id);
    },

    markAlertAsRead: async (id, user_id) => {

        const result =
            await AlertModel.markAsRead(id, user_id);

        if (result.affectedRows === 0) {
            throw new AppError(
                "Alert not found",
                404
            );
        }

        return true;
    },

    markAlertAsResolved: async (id, user_id) => {

        const result =
            await AlertModel.markAsResolved(id, user_id);

        if (result.affectedRows === 0) {
            throw new AppError(
                "Alert not found",
                404
            );
        }

        return true;
    },

    deleteAlert: async (id, user_id) => {

        const result =
            await AlertModel.deleteAlert(id, user_id);

        if (result.affectedRows === 0) {
            throw new AppError(
                "Alert not found",
                404
            );
        }

        return true;
    }

};

module.exports = AlertService;