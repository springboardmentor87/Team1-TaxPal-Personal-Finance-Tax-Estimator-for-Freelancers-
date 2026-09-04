const TaxEstimatorModel = require("../models/taxEstimatorModel");

const TaxEstimatorService = {

    validateInputs: (data) => {
        const {
            financialYear,
            taxRegime,
            annualIncome,
            businessIncome,
            otherIncome,
            businessExpenses,
            eligibleDeductions,
            otherDeductions
        } = data;

        if (!financialYear || !taxRegime) {
            throw new Error("Financial year and tax regime are required.");
        }

        if (taxRegime !== "new" && taxRegime !== "old") {
            throw new Error("Invalid tax regime selection. Must be 'new' or 'old'.");
        }

        if (financialYear !== "2024-25" && financialYear !== "2025-26") {
            throw new Error("Invalid financial year. Supported years are '2024-25' and '2025-26'.");
        }

        const incomeFields = { annualIncome, businessIncome, otherIncome };
        const expenseFields = { businessExpenses, eligibleDeductions, otherDeductions };

        for (const [key, value] of Object.entries(incomeFields)) {
            if (value !== undefined && value !== null) {
                const numVal = Number(value);
                if (isNaN(numVal) || numVal < 0) {
                    throw new Error(`${key} must be a valid non-negative number.`);
                }
            }
        }

        for (const [key, value] of Object.entries(expenseFields)) {
            if (value !== undefined && value !== null) {
                const numVal = Number(value);
                if (isNaN(numVal) || numVal < 0) {
                    throw new Error(`${key} must be a valid non-negative number.`);
                }
            }
        }
    },

    calculateTax: (data) => {
        // Validate first
        TaxEstimatorService.validateInputs(data);

        const fy = data.financialYear;
        const regime = data.taxRegime;

        const annual = Number(data.annualIncome || 0);
        const business = Number(data.businessIncome || 0);
        const other = Number(data.otherIncome || 0);

        const bizExpense = Number(data.businessExpenses || 0);
        const deductions = Number(data.eligibleDeductions || 0);
        const otherDeduct = Number(data.otherDeductions || 0);

        // 1. Gross Income
        const grossIncome = annual + business + other;

        // 2. Total Deductions (Note: standard/80C deductions are only applicable under the OLD regime)
        const totalDeductions = bizExpense + (regime === "old" ? deductions : 0) + otherDeduct;

        // 3. Taxable Income
        const taxableIncome = Math.max(0, grossIncome - totalDeductions);

        // 4. Calculate Old Regime basic tax (for comparison and final choice)
        const oldTaxable = Math.max(0, grossIncome - (bizExpense + deductions + otherDeduct));
        const oldBasicTax = TaxEstimatorService.computeOldRegimeBasicTax(oldTaxable);
        const oldRebate = TaxEstimatorService.computeOldRegimeRebate(oldTaxable, oldBasicTax);
        const oldRegimeTax = (Math.max(0, oldBasicTax - oldRebate)) * 1.04;

        // 5. Calculate New Regime basic tax (for comparison and final choice)
        const newTaxable = Math.max(0, grossIncome - (bizExpense + otherDeduct));
        const newBasicTax = TaxEstimatorService.computeNewRegimeBasicTax(newTaxable, fy);
        const newRebate = TaxEstimatorService.computeNewRegimeRebate(newTaxable, newBasicTax, fy);
        const newRegimeTax = (Math.max(0, newBasicTax - newRebate)) * 1.04;

        // 6. Selected regime results
        let basicTax = 0;
        let rebateApplied = 0;

        if (regime === "new") {
            basicTax = newBasicTax;
            rebateApplied = newRebate;
        } else {
            basicTax = oldBasicTax;
            rebateApplied = oldRebate;
        }

        const estimatedTax = Math.max(0, basicTax - rebateApplied); // Basic tax after rebate
        const cess = estimatedTax * 0.04;
        const totalTax = estimatedTax + cess;

        const effectiveTaxRate = grossIncome > 0 ? Number(((totalTax / grossIncome) * 100).toFixed(2)) : 0;
        const netIncome = grossIncome - totalTax;

        return {
            financialYear: fy,
            selectedRegime: regime,
            annualIncome: annual,
            businessIncome: business,
            otherIncome: other,
            grossIncome,
            businessExpenses: bizExpense,
            eligibleDeductions: regime === "old" ? deductions : 0,
            otherDeductions: otherDeduct,
            totalDeductions,
            taxableIncome,
            oldRegimeTax: Number(oldRegimeTax.toFixed(2)),
            newRegimeTax: Number(newRegimeTax.toFixed(2)),
            estimatedTax: Number(estimatedTax.toFixed(2)), // tax after rebate, before cess
            cess: Number(cess.toFixed(2)),
            totalTax: Number(totalTax.toFixed(2)),
            effectiveTaxRate,
            netIncome: Number(netIncome.toFixed(2))
        };
    },

    computeNewRegimeBasicTax: (income, fy) => {
        let tax = 0;
        if (fy === "2025-26") {
            // Slabs FY 2025-26:
            // Up to 4L: Nil
            // 4L to 8L: 5%
            // 8L to 12L: 10%
            // 12L to 16L: 15%
            // 16L to 20L: 20%
            // 20L to 24L: 25%
            // Above 24L: 30%
            if (income <= 400000) return 0;
            if (income > 400000) tax += Math.min(400000, income - 400000) * 0.05;
            if (income > 800000) tax += Math.min(400000, income - 800000) * 0.10;
            if (income > 1200000) tax += Math.min(400000, income - 1200000) * 0.15;
            if (income > 1600000) tax += Math.min(400000, income - 1600000) * 0.20;
            if (income > 2000000) tax += Math.min(400000, income - 2000000) * 0.25;
            if (income > 2400000) tax += (income - 2400000) * 0.30;
        } else {
            // Slabs FY 2024-25:
            // Up to 3L: Nil
            // 3L to 7L: 5%
            // 7L to 10L: 10%
            // 10L to 12L: 15%
            // 12L to 15L: 20%
            // Above 15L: 30%
            if (income <= 300000) return 0;
            if (income > 300000) tax += Math.min(400000, income - 300000) * 0.05;
            if (income > 700000) tax += Math.min(300000, income - 700000) * 0.10;
            if (income > 1000000) tax += Math.min(200000, income - 1000000) * 0.15;
            if (income > 1200000) tax += Math.min(300000, income - 1200000) * 0.20;
            if (income > 1500000) tax += (income - 1500000) * 0.30;
        }
        return tax;
    },

    computeNewRegimeRebate: (income, tax, fy) => {
        if (fy === "2025-26") {
            if (income <= 1200000) return tax;
        } else {
            if (income <= 700000) return tax;
        }
        return 0;
    },

    computeOldRegimeBasicTax: (income) => {
        let tax = 0;
        if (income <= 250000) return 0;
        if (income > 250000) tax += Math.min(250000, income - 250000) * 0.05;
        if (income > 500000) tax += Math.min(500000, income - 500000) * 0.20;
        if (income > 1000000) tax += (income - 1000000) * 0.30;
        return tax;
    },

    computeOldRegimeRebate: (income, tax) => {
        if (income <= 500000) return tax;
        return 0;
    },

    // Database Actions wrapped in Service
    saveAssessment: async (user_id, assessmentData) => {
        const calculated = TaxEstimatorService.calculateTax(assessmentData);
        return await TaxEstimatorModel.saveAssessment({
            user_id,
            financial_year: calculated.financialYear,
            gross_income: calculated.grossIncome,
            business_expenses: calculated.businessExpenses,
            other_deductions: calculated.otherDeductions,
            taxable_income: calculated.taxableIncome,
            old_regime_tax: calculated.oldRegimeTax,
            new_regime_tax: calculated.newRegimeTax,
            selected_regime: calculated.selectedRegime,
            estimated_tax: calculated.estimatedTax,
            cess: calculated.cess,
            total_tax: calculated.totalTax,
            effective_tax_rate: calculated.effectiveTaxRate,
            net_income: calculated.netIncome
        });
    },

    getAssessments: async (user_id) => {
        return await TaxEstimatorModel.getAssessmentsByUser(user_id);
    },

    getAssessmentById: async (id, user_id) => {
        const assessment = await TaxEstimatorModel.getAssessmentById(id, user_id);
        if (!assessment) {
            throw new Error("Tax assessment not found.");
        }
        return assessment;
    },

    deleteAssessment: async (id, user_id) => {
        const assessment = await TaxEstimatorModel.getAssessmentById(id, user_id);
        if (!assessment) {
            throw new Error("Tax assessment not found.");
        }
        return await TaxEstimatorModel.deleteAssessment(id, user_id);
    }
};

module.exports = TaxEstimatorService;
