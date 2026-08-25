const TaxEventModel =
    require("../models/taxEventModel");

const AppError =
    require("../utils/AppError");


const TaxEventService = {

    createTaxEvent: async (
        user_id,
        eventData
    ) => {

        if (!user_id) {
            throw new AppError(
                "User ID is required",
                401
            );
        }

        const {
            title,
            quarter,
            due_date
        } = eventData;

        if (!title || !quarter || !due_date) {
            throw new AppError(
                "Title, quarter and due date are required",
                400
            );
        }

        const year =
            Number(eventData.year) ||
            new Date(due_date).getFullYear();

        return await TaxEventModel.createTaxEvent({
            user_id,
            year,
            title,
            quarter,
            due_date,
            reminder_date:
                eventData.reminder_date || null,
            description:
                eventData.description || "",
            estimated_tax_amount:
                eventData.estimated_tax_amount || 0,
            currency_symbol:
                eventData.currency_symbol || "$",
            type:
                eventData.type || "payment",
            status:
                eventData.status || "upcoming"
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

        year =
            Number(year) ||
            new Date().getFullYear();

        const existingEvents =
            await TaxEventModel.getExistingQuarterlyEvents(
                user_id,
                year
            );

        if (existingEvents.length > 0) {
            return existingEvents;
        }


        const events = [

            // Q1

            {
                user_id,
                year,
                title:
                    "Reminder: Q1 Estimated Tax Payment",
                quarter: "Q1",
                due_date: `${year}-04-01`,
                reminder_date: `${year}-04-01`,
                description:
                    "Reminder for upcoming Q1 estimated tax payment due on April 15.",
                estimated_tax_amount: 0,
                currency_symbol: "$",
                type: "reminder",
                status: "upcoming"
            },

            {
                user_id,
                year,
                title:
                    "Q1 Estimated Tax Payment",
                quarter: "Q1",
                due_date: `${year}-04-15`,
                reminder_date: `${year}-04-01`,
                description:
                    "First quarter estimated tax payment due.",
                estimated_tax_amount: 0,
                currency_symbol: "$",
                type: "payment",
                status: "upcoming"
            },


            // Q2

            {
                user_id,
                year,
                title:
                    "Reminder: Q2 Estimated Tax Payment",
                quarter: "Q2",
                due_date: `${year}-06-01`,
                reminder_date: `${year}-06-01`,
                description:
                    "Reminder for upcoming Q2 estimated tax payment due on June 15.",
                estimated_tax_amount: 0,
                currency_symbol: "$",
                type: "reminder",
                status: "upcoming"
            },

            {
                user_id,
                year,
                title:
                    "Q2 Estimated Tax Payment",
                quarter: "Q2",
                due_date: `${year}-06-15`,
                reminder_date: `${year}-06-01`,
                description:
                    "Second quarter estimated tax payment due.",
                estimated_tax_amount: 0,
                currency_symbol: "$",
                type: "payment",
                status: "upcoming"
            },


            // Q3

            {
                user_id,
                year,
                title:
                    "Reminder: Q3 Estimated Tax Payment",
                quarter: "Q3",
                due_date: `${year}-09-01`,
                reminder_date: `${year}-09-01`,
                description:
                    "Reminder for upcoming Q3 estimated tax payment due on September 15.",
                estimated_tax_amount: 0,
                currency_symbol: "$",
                type: "reminder",
                status: "upcoming"
            },

            {
                user_id,
                year,
                title:
                    "Q3 Estimated Tax Payment",
                quarter: "Q3",
                due_date: `${year}-09-15`,
                reminder_date: `${year}-09-01`,
                description:
                    "Third quarter estimated tax payment due.",
                estimated_tax_amount: 0,
                currency_symbol: "$",
                type: "payment",
                status: "upcoming"
            },


            // Q4

            {
                user_id,
                year,
                title:
                    "Reminder: Q4 Estimated Tax Payment",
                quarter: "Q4",
                due_date: `${Number(year) + 1}-01-01`,
                reminder_date:
                    `${Number(year) + 1}-01-01`,
                description:
                    "Reminder for upcoming Q4 estimated tax payment due on January 15.",
                estimated_tax_amount: 0,
                currency_symbol: "$",
                type: "reminder",
                status: "upcoming"
            },

            {
                user_id,
                year,
                title:
                    "Q4 Estimated Tax Payment",
                quarter: "Q4",
                due_date: `${Number(year) + 1}-01-15`,
                reminder_date:
                    `${Number(year) + 1}-01-01`,
                description:
                    "Fourth quarter estimated tax payment due.",
                estimated_tax_amount: 0,
                currency_symbol: "$",
                type: "payment",
                status: "upcoming"
            }
        ];


        const createdEvents = [];

        for (const event of events) {

            const createdEvent =
                await TaxEventModel.createTaxEvent(
                    event
                );

            createdEvents.push(
                createdEvent
            );
        }

        return createdEvents;
    },


    getTaxEvents: async (
        user_id,
        year
    ) => {

        if (!user_id) {
            throw new AppError(
                "User ID is required",
                401
            );
        }

        return await TaxEventModel.getTaxEventsByUser(
            user_id,
            year
        );
    },


    getTaxEventsByMonth: async (
        user_id,
        month,
        year
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

        if (!year) {
            year = new Date().getFullYear();
        }

        return await TaxEventModel.getTaxEventsByMonth(
            user_id,
            month,
            year
        );
    },


    updateTaxEvent: async (
        id,
        user_id,
        eventData
    ) => {

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