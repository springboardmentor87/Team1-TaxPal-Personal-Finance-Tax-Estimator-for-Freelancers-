const TaxModel = require("../models/taxModel");


// ==========================================
// Calculate due date for quarter
// ==========================================
const getQuarterDueDate = (quarter, year, country) => {

    /*
     * The current TaxPal UI uses quarterly estimated-tax
     * dates. These are kept in one place so the dates can
     * later be made country-specific.
     */

    const dates = {
        Q1: `${year}-04-15`,
        Q2: `${year}-06-15`,
        Q3: `${year}-09-15`,
        Q4: `${year + 1}-01-15`
    };

    return dates[quarter];
};


// ==========================================
// Calculate Tax
// ==========================================
const calculateTax = async (user_id, data) => {

    const {
        country,
        state,
        filingStatus,
        quarter,
        grossIncome,
        businessExpenses,
        retirementContributions,
        healthInsurancePremiums,
        homeOfficeDeduction
    } = data;


    // --------------------------------------
    // Validation
    // --------------------------------------

    if (!country) {
        throw new Error("Country / Region is required");
    }

    if (!quarter || !["Q1", "Q2", "Q3", "Q4"].includes(quarter)) {
        throw new Error("Invalid quarter");
    }

    const income = Number(grossIncome) || 0;
    const expenses = Number(businessExpenses) || 0;
    const retirement = Number(retirementContributions) || 0;
    const healthInsurance =
        Number(healthInsurancePremiums) || 0;
    const homeOffice =
        Number(homeOfficeDeduction) || 0;


    if (income < 0) {
        throw new Error("Income cannot be negative");
    }


    // --------------------------------------
    // Calculate deductions
    // --------------------------------------

    const totalDeductions =
        expenses +
        retirement +
        healthInsurance +
        homeOffice;


    const taxableIncome =
        Math.max(
            0,
            income - totalDeductions
        );


    // --------------------------------------
    // Tax calculation
    //
    // This follows the calculation currently
    // implemented in the Angular fallback.
    // --------------------------------------

    let federalTax = 0;
    let stateTax = 0;
    let selfEmploymentTax = 0;

    const breakdown = [];


    // India
    if (country === "India") {

        const annualIncome =
            taxableIncome * 4;

        let annualTax = 0;


        if (annualIncome > 1500000) {

            annualTax =
                150000 +
                (annualIncome - 1500000) * 0.30;

            breakdown.push({
                bracket: "> ₹15,00,000",
                rate: 30,
                amount:
                    (annualIncome - 1500000) * 0.30 / 4
            });

        } else if (annualIncome > 1200000) {

            annualTax =
                90000 +
                (annualIncome - 1200000) * 0.20;

            breakdown.push({
                bracket: "₹12L - ₹15L",
                rate: 20,
                amount:
                    (annualIncome - 1200000) * 0.20 / 4
            });

        } else if (annualIncome > 900000) {

            annualTax =
                45000 +
                (annualIncome - 900000) * 0.15;

            breakdown.push({
                bracket: "₹9L - ₹12L",
                rate: 15,
                amount:
                    (annualIncome - 900000) * 0.15 / 4
            });

        } else if (annualIncome > 600000) {

            annualTax =
                15000 +
                (annualIncome - 600000) * 0.10;

            breakdown.push({
                bracket: "₹6L - ₹9L",
                rate: 10,
                amount:
                    (annualIncome - 600000) * 0.10 / 4
            });

        } else if (annualIncome > 300000) {

            annualTax =
                (annualIncome - 300000) * 0.05;

            breakdown.push({
                bracket: "₹3L - ₹6L",
                rate: 5,
                amount:
                    (annualIncome - 300000) * 0.05 / 4
            });
        }


        federalTax =
            Math.round(annualTax / 4);

        selfEmploymentTax =
            Math.round(taxableIncome * 0.05);

    } else {

        /*
         * Existing frontend fallback calculation
         * for non-India regions.
         */

        const annualIncome =
            taxableIncome * 4;

        let annualTax = 0;


        if (annualIncome > 100000) {

            annualTax =
                16290 +
                (annualIncome - 100000) * 0.24;

            breakdown.push({
                bracket: "24% Bracket",
                rate: 24,
                amount:
                    (annualIncome - 100000) * 0.24 / 4
            });

        } else if (annualIncome > 47150) {

            annualTax =
                5426 +
                (annualIncome - 47150) * 0.22;

            breakdown.push({
                bracket: "22% Bracket",
                rate: 22,
                amount:
                    (annualIncome - 47150) * 0.22 / 4
            });

        } else if (annualIncome > 11600) {

            annualTax =
                1160 +
                (annualIncome - 11600) * 0.12;

            breakdown.push({
                bracket: "12% Bracket",
                rate: 12,
                amount:
                    (annualIncome - 11600) * 0.12 / 4
            });

        } else {

            annualTax =
                annualIncome * 0.10;

            breakdown.push({
                bracket: "10% Bracket",
                rate: 10,
                amount:
                    annualTax / 4
            });
        }


        federalTax =
            Math.round(annualTax / 4);

        stateTax =
            Math.round(taxableIncome * 0.05);

        selfEmploymentTax =
            Math.round(taxableIncome * 0.153);
    }


    const totalEstimatedTax =
        federalTax +
        stateTax +
        selfEmploymentTax;


    const effectiveTaxRate =
        income > 0
            ? Number(
                (
                    totalEstimatedTax /
                    income *
                    100
                ).toFixed(1)
            )
            : 0;


    // --------------------------------------
    // Determine year and due date
    // --------------------------------------

    const currentYear =
        new Date().getFullYear();

    const dueDate =
        getQuarterDueDate(
            quarter,
            currentYear,
            country
        );


    // --------------------------------------
    // Save estimate
    // --------------------------------------

    await TaxModel.createTaxEstimate({

        user_id,

        country,

        quarter,

        estimated_tax:
            totalEstimatedTax,

        due_date:
            dueDate,

        state,

        filing_status:
            filingStatus,

        gross_income_for_quarter:
            income,

        business_expenses:
            expenses,

        retirement_contribution:
            retirement,

        health_insurance_premiums:
            healthInsurance,

        home_office_deduction:
            homeOffice
    });
    
    const alertExists = await TaxModel.hasAlert(
    user_id,
    "TAX_REMINDER",
    dueDate
);

if (!alertExists) {

    await TaxModel.createAlert({
        user_id,

        type: "TAX_REMINDER",

        message:
            `${quarter} Estimated Tax Payment is due on ${dueDate}`,

        alert_date: dueDate,

        is_read: false
    });
}


    return {

        country,

        state,

        filingStatus,

        quarter,

        grossIncome: income,

        totalDeductions,

        taxableIncome,

        federalTax,

        stateTax,

        selfEmploymentTax,

        totalEstimatedTax,

        effectiveTaxRate,

        breakdown,

        dueDate
    };
};


// ==========================================
// Get Quarterly Reminders
// ==========================================

// ==========================================
// Get Quarterly Reminders
// ==========================================
const getTaxReminders = async (user_id) => {

    const currentYear =
        new Date().getFullYear();

    const estimates =
        await TaxModel.getTaxEstimatesByUser(
            user_id
        );

    const quarters = [
        "Q1",
        "Q2",
        "Q3",
        "Q4"
    ];

    const reminders = [];

    for (const quarter of quarters) {

        const dueDate =
            getQuarterDueDate(
                quarter,
                currentYear
            );


        const estimate =
            estimates.find(
                item =>
                    item.quarter === quarter &&
                    item.due_date === dueDate
            );


        // Get alert for this quarter
        const alert =
            await TaxModel.getAlertByDate(
                user_id,
                dueDate
            );


        // Reminder date = 14 days before due date
        const reminderDate =
            new Date(dueDate);

        reminderDate.setDate(
            reminderDate.getDate() - 14
        );


        const today =
            new Date();

        const due =
            new Date(dueDate);


        let status =
            "upcoming";


        // If user marked the reminder as completed
        if (alert && alert.is_read) {

            status = "completed";

        } else if (due < today) {

            status = "completed";

        } else {

            const difference =
                due.getTime() -
                today.getTime();

            const days =
                Math.ceil(
                    difference /
                    (1000 * 60 * 60 * 24)
                );

            if (days <= 14) {
                status = "due_soon";
            }
        }


        const formattedDueDate =
            new Date(
                dueDate + "T00:00:00"
            ).toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );


        const formattedReminderDate =
            reminderDate.toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );


        // Reminder event
        reminders.push({

            id:
                `${quarter}-reminder`,

            title:
                `Reminder: ${quarter} Estimated Tax Payment`,

            quarter,

            dueDate:
                formattedDueDate,

            reminderDate:
                formattedReminderDate,

            description:
                `Reminder for upcoming ${quarter} estimated tax payment due on ${formattedDueDate}.`,

            estimatedTaxAmount:
                estimate
                    ? Number(estimate.estimated_tax)
                    : null,

            type:
                "reminder",

            status

        });


        // Payment event
        reminders.push({

            id:
                `${quarter}-payment`,

            title:
                `${quarter} Estimated Tax Payment`,

            quarter,

            dueDate:
                formattedDueDate,

            reminderDate:
                formattedDueDate,

            description:
                `${quarter} estimated tax payment due.`,

            estimatedTaxAmount:
                estimate
                    ? Number(estimate.estimated_tax)
                    : null,

            type:
                "payment",

            status

        });

    }


    return reminders;
};

module.exports = {
    calculateTax,
    getTaxReminders,
    getQuarterDueDate
};