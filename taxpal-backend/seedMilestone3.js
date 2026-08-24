const db = require('./config/db');

setTimeout(() => {
    console.log("Seeding Milestone 3 test data...");

    const sqlCalculations = `
        INSERT INTO tax_calculations (
            user_id, year, country, state, filing_status, quarter,
            gross_income, business_expenses, retirement_contributions,
            health_insurance_premiums, home_office_deduction, total_deductions,
            taxable_income, federal_tax, state_tax, self_employment_tax,
            total_estimated_tax, effective_tax_rate
        ) VALUES 
        (1, 2026, 'United States', 'California', 'single', 'Q1', 15000, 2000, 1000, 500, 300, 3800, 11200, 1150.00, 560.00, 1713.60, 3423.60, 22.82),
        (1, 2026, 'United States', 'California', 'single', 'Q2', 18000, 2500, 1500, 500, 300, 4800, 13200, 1420.00, 660.00, 2019.60, 4099.60, 22.78),
        (2, 2026, 'India', NULL, 'single', 'Q1', 500000, 50000, 30000, 20000, 0, 100000, 400000, 18750.00, 0, 20000.00, 38750.00, 7.75)
    `;

    const sqlSummaries = `
        INSERT INTO tax_summaries (user_id, year, total_income, total_expenses, taxable_income, estimated_tax) VALUES
        (1, 2026, 33000, 8600, 24400, 7523.20),
        (2, 2026, 500000, 100000, 400000, 38750.00)
    `;

    const sqlEvents = `
        INSERT INTO tax_events (user_id, title, quarter, due_date, reminder_date, description, estimated_tax_amount, currency_symbol, type, status) VALUES
        (1, 'Reminder: Q1 Estimated Tax Payment', 'Q1', '2026-04-15', '2026-04-01', 'First quarter estimated tax payment due for Jan-Mar earnings.', 3423.60, '$', 'reminder', 'completed'),
        (1, 'Q1 Estimated Tax Payment Due', 'Q1', '2026-04-15', '2026-04-15', 'Submit your Q1 tax payment to tax authorities.', 3423.60, '$', 'payment', 'completed'),
        (1, 'Reminder: Q2 Estimated Tax Payment', 'Q2', '2026-06-15', '2026-06-01', 'Reminder for upcoming Q2 estimated tax payment due on June 15.', 4099.60, '$', 'reminder', 'due_soon'),
        (1, 'Q2 Estimated Tax Payment Due', 'Q2', '2026-06-15', '2026-06-15', 'Second quarter estimated tax payment due.', 4099.60, '$', 'payment', 'upcoming'),
        (1, 'Reminder: Q3 Estimated Tax Payment', 'Q3', '2026-09-15', '2026-09-01', 'Reminder for upcoming Q3 estimated tax payment due on Sep 15.', NULL, '$', 'reminder', 'upcoming'),
        (1, 'Q3 Estimated Tax Payment Due', 'Q3', '2026-09-15', '2026-09-15', 'Third quarter estimated tax payment due.', NULL, '$', 'payment', 'upcoming')
    `;

    db.query(sqlCalculations, [], (err) => {
        if (err) console.error("Error inserting calculations:", err);
        else console.log("✓ Inserted sample tax calculations");
    });

    db.query(sqlSummaries, [], (err) => {
        if (err) console.error("Error inserting summaries:", err);
        else console.log("✓ Inserted sample tax summaries");
    });

    db.query(sqlEvents, [], (err) => {
        if (err) console.error("Error inserting events:", err);
        else console.log("✓ Inserted sample tax calendar events");
    });

    setTimeout(() => {
        process.exit(0);
    }, 1000);
}, 600);
