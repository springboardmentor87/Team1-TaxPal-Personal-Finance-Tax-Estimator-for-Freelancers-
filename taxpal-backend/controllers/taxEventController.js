const TaxEventService = require("../services/taxEventService");
const asyncHandler = require("../utils/asyncHandler");


const createTaxEvent = asyncHandler(
    async (req, res) => {

        const user_id = req.user.id;

        const event =
            await TaxEventService.createTaxEvent(
                user_id,
                req.body
            );

        return res.status(201).json({
            success: true,
            message: "Tax event created successfully",
            data: event
        });

    }
);


const createQuarterlyTaxEvents = asyncHandler(
    async (req, res) => {

        const user_id = req.user.id;

        const year =
            Number(req.body.year) ||
            new Date().getFullYear();

        const events =
            await TaxEventService.createQuarterlyTaxEvents(
                user_id,
                year
            );

        return res.status(201).json({
            success: true,
            message:
                "Quarterly tax events created successfully",
            data: events
        });

    }
);


const getTaxEvents = asyncHandler(
    async (req, res) => {

        const user_id = req.user.id;

        const events =
            await TaxEventService.getTaxEvents(
                user_id
            );

        return res.status(200).json({
            success: true,
            message: "Tax events fetched successfully",
            data: events
        });

    }
);


const getTaxEventsByMonth = asyncHandler(
    async (req, res) => {

        const user_id = req.user.id;
        const { month } = req.query;

        const events =
            await TaxEventService.getTaxEventsByMonth(
                user_id,
                month
            );

        return res.status(200).json({
            success: true,
            message: "Tax events fetched successfully",
            data: events
        });

    }
);


const updateTaxEvent = asyncHandler(
    async (req, res) => {

        const user_id = req.user.id;
        const { id } = req.params;

        await TaxEventService.updateTaxEvent(
            id,
            user_id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Tax event updated successfully"
        });

    }
);


const markEventAsCompleted = asyncHandler(
    async (req, res) => {

        const user_id = req.user.id;
        const { id } = req.params;

        await TaxEventService.markEventAsCompleted(
            id,
            user_id
        );

        return res.status(200).json({
            success: true,
            message: "Tax event marked as completed"
        });

    }
);


const deleteTaxEvent = asyncHandler(
    async (req, res) => {

        const user_id = req.user.id;
        const { id } = req.params;

        await TaxEventService.deleteTaxEvent(
            id,
            user_id
        );

        return res.status(200).json({
            success: true,
            message: "Tax event deleted successfully"
        });

    }
);


module.exports = {
    createTaxEvent,
    createQuarterlyTaxEvents,
    getTaxEvents,
    getTaxEventsByMonth,
    updateTaxEvent,
    markEventAsCompleted,
    deleteTaxEvent
};