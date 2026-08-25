const TaxEventModel = require("../models/taxEventModel");
const AppError = require("../utils/AppError");

const TaxEventService = {

    createTaxEvent: async (user_id, eventData) => {

        if (!user_id) {
            throw new AppError(
                "User ID is required",
                401
            );
        }

        const {
            title,
            description,
            due_date,
            quarter,
            is_custom
        } = eventData;

        if (!title || !due_date) {
            throw new AppError(
                "Title and due date are required",
                400
            );
        }

        return await TaxEventModel.createTaxEvent({

            user_id,
            title,
            description: description || "",
            due_date,
            quarter: quarter || null,

            is_custom:
                is_custom !== undefined
                    ? is_custom
                    : 1

        });
    },


    createQuarterlyTaxEvents: async (
        user_id,
        year
    ) => {

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

        const events = [

            {
                title: "Quarter 1 Tax Due",
                description:
                    `Quarter 1 tax payment due for ${year}`,
                due_date: `${year}-06-15`,
                quarter: "Q1",
                is_custom: 0
            },

            {
                title: "Quarter 2 Tax Due",
                description:
                    `Quarter 2 tax payment due for ${year}`,
                due_date: `${year}-09-15`,
                quarter: "Q2",
                is_custom: 0
            },

            {
                title: "Quarter 3 Tax Due",
                description:
                    `Quarter 3 tax payment due for ${year}`,
                due_date: `${year}-12-15`,
                quarter: "Q3",
                is_custom: 0
            },

            {
                title: "Quarter 4 Tax Due",
                description:
                    `Quarter 4 tax payment due for ${year}`,
                due_date:
                    `${Number(year) + 1}-03-15`,
                quarter: "Q4",
                is_custom: 0
            }

        ];

        const createdEvents = [];

        for (const event of events) {

            const createdEvent =
                await TaxEventModel.createTaxEvent({

                    user_id,
                    ...event

                });

            createdEvents.push(createdEvent);
        }

        return createdEvents;
    },


    getTaxEvents: async (user_id) => {

        if (!user_id) {
            throw new AppError(
                "User ID is required",
                401
            );
        }

        return await TaxEventModel.getTaxEventsByUser(
            user_id
        );
    },


    getTaxEventsByMonth: async (
        user_id,
        month
    ) => {

        if (!user_id) {
            throw new AppError(
                "User ID is required",
                401
            );
        }

        if (!month) {
            throw new AppError(
                "Month is required",
                400
            );
        }

        return await TaxEventModel.getTaxEventsByMonth(
            user_id,
            month
        );
    },


    updateTaxEvent: async (
        id,
        user_id,
        eventData
    ) => {

        if (!id) {
            throw new AppError(
                "Tax event ID is required",
                400
            );
        }

        const result =
            await TaxEventModel.updateTaxEvent(
                id,
                user_id,
                eventData
            );

        if (result.affectedRows === 0) {
            throw new AppError(
                "Tax event not found",
                404
            );
        }

        return true;
    },


    markEventAsCompleted: async (
        id,
        user_id
    ) => {

        if (!id) {
            throw new AppError(
                "Tax event ID is required",
                400
            );
        }

        const result =
            await TaxEventModel.markAsCompleted(
                id,
                user_id
            );

        if (result.affectedRows === 0) {
            throw new AppError(
                "Tax event not found",
                404
            );
        }

        return true;
    },


    deleteTaxEvent: async (
        id,
        user_id
    ) => {

        if (!id) {
            throw new AppError(
                "Tax event ID is required",
                400
            );
        }

        const result =
            await TaxEventModel.deleteTaxEvent(
                id,
                user_id
            );

        if (result.affectedRows === 0) {
            throw new AppError(
                "Tax event not found",
                404
            );
        }

        return true;
    }

};

module.exports = TaxEventService;