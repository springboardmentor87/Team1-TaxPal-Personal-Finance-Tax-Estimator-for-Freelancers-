const TaxModel = require("../models/taxModel");
const AppError = require("../utils/AppError");

const TaxService = {
    calculateTax: async (data) => {
        const {
            user_id,
            year,
            country,
            state,
            filingStatus,
            quarter,
            grossIncome = 0,
            businessExpenses = 0,
            retirementContributions = 0,
            healthInsurancePremiums = 0,
            homeOfficeDeduction = 0
        } = data;

        if (!year || isNaN(Number(year))) {
            throw new AppError(
                "Valid year is required",
                400
            );
        }

        if (!country) {
            throw new AppError(
                "Country is required",
                400
            );
        }

        if (!filingStatus) {
            throw new AppError(
                "Filing status is required",
                400
            );
        }

        if (!quarter) {
            throw new AppError(
                "Quarter is required",
                400
            );
        }

        const gross = Number(grossIncome) || 0;
        const business = Number(businessExpenses) || 0;
        const retirement = Number(retirementContributions) || 0;
        const health = Number(healthInsurancePremiums) || 0;
        const homeOffice = Number(homeOfficeDeduction) || 0;

        const totalDeductions =
            business +
            retirement +
            health +
            homeOffice;

        const taxableIncome = Math.max(
            0,
            gross - totalDeductions
        );

        let federalTax = 0;
        let stateTax = 0;
        let selfEmploymentTax = 0;

        const breakdown = [];

        /*
        ============================================
        INDIA TAX CALCULATION
        ============================================
        */

        if (country === "India") {
            const annualIncome = taxableIncome * 4;

            let annualTax = 0;

            if (annualIncome > 1500000) {
                annualTax =
                    150000 +
                    (annualIncome - 1500000) * 0.30;

                breakdown.push({
                    bracket: "> ₹15,00,000",
                    rate: 30,
                    amount:
                        ((annualIncome - 1500000) * 0.30) / 4
                });

            } else if (annualIncome > 1200000) {
                annualTax =
                    90000 +
                    (annualIncome - 1200000) * 0.20;

                breakdown.push({
                    bracket: "₹12L - ₹15L",
                    rate: 20,
                    amount:
                        ((annualIncome - 1200000) * 0.20) / 4
                });

            } else if (annualIncome > 900000) {
                annualTax =
                    45000 +
                    (annualIncome - 900000) * 0.15;

                breakdown.push({
                    bracket: "₹9L - ₹12L",
                    rate: 15,
                    amount:
                        ((annualIncome - 900000) * 0.15) / 4
                });

            } else if (annualIncome > 600000) {
                annualTax =
                    15000 +
                    (annualIncome - 600000) * 0.10;

                breakdown.push({
                    bracket: "₹6L - ₹9L",
                    rate: 10,
                    amount:
                        ((annualIncome - 600000) * 0.10) / 4
                });

            } else if (annualIncome > 300000) {
                annualTax =
                    (annualIncome - 300000) * 0.05;

                breakdown.push({
                    bracket: "₹3L - ₹6L",
                    rate: 5,
                    amount:
                        ((annualIncome - 300000) * 0.05) / 4
                });
            } else {
                breakdown.push({
                    bracket: "Up to ₹3L",
                    rate: 0,
                    amount: 0
                });
            }

            federalTax = Number(
                (annualTax / 4).toFixed(2)
            );

            selfEmploymentTax = Number(
                (taxableIncome * 0.05).toFixed(2)
            );
        }

        /*
        ============================================
        OTHER COUNTRIES / USA CALCULATION
        ============================================
        */

        else {
            const annualIncome = taxableIncome * 4;

            let annualFederalTax = 0;

            if (annualIncome > 100000) {
                annualFederalTax =
                    16290 +
                    (annualIncome - 100000) * 0.24;

                breakdown.push({
                    bracket: "24% Bracket",
                    rate: 24,
                    amount:
                        ((annualIncome - 100000) * 0.24) / 4
                });

            } else if (annualIncome > 47150) {
                annualFederalTax =
                    5426 +
                    (annualIncome - 47150) * 0.22;

                breakdown.push({
                    bracket: "22% Bracket",
                    rate: 22,
                    amount:
                        ((annualIncome - 47150) * 0.22) / 4
                });

            } else if (annualIncome > 11600) {
                annualFederalTax =
                    1160 +
                    (annualIncome - 11600) * 0.12;

                breakdown.push({
                    bracket: "12% Bracket",
                    rate: 12,
                    amount:
                        ((annualIncome - 11600) * 0.12) / 4
                });

            } else {
                annualFederalTax =
                    annualIncome * 0.10;

                breakdown.push({
                    bracket: "10% Bracket",
                    rate: 10,
                    amount:
                        annualFederalTax / 4
                });
            }

            federalTax = Number(
                (annualFederalTax / 4).toFixed(2)
            );

            if (
                state === "Texas" ||
                state === "Florida"
            ) {
                stateTax = 0;
            } else {
                stateTax = Number(
                    (taxableIncome * 0.05).toFixed(2)
                );
            }

            selfEmploymentTax = Number(
                (taxableIncome * 0.153).toFixed(2)
            );
        }

        const totalEstimatedTax =
            federalTax +
            stateTax +
            selfEmploymentTax;

        const effectiveTaxRate =
            gross > 0
                ? Number(
                    (
                        (totalEstimatedTax / gross) * 100
                    ).toFixed(2)
                )
                : 0;

        /*
        ============================================
        RESULT OBJECT
        ============================================
        */

        const result = {
            year: Number(year),
            country,
            state: state || null,
            filingStatus,
            quarter,
            grossIncome: gross,
            totalDeductions,
            taxableIncome,
            federalTax,
            stateTax,
            selfEmploymentTax,
            totalEstimatedTax: Number(
                totalEstimatedTax.toFixed(2)
            ),
            effectiveTaxRate,
            breakdown
        };

        /*
        ============================================
        SAVE CALCULATION IN DATABASE
        ============================================
        */
        await TaxModel.createTaxCalculation({
            year: Number(year),
            country,
            state: state || null,
            filing_status: filingStatus,
            quarter,
            gross_income: gross,
            business_expenses: business,
            retirement_contributions: retirement,
            health_insurance_premiums: health,
            home_office_deduction: homeOffice,
            total_expenses: totalDeductions,
            taxable_income: taxableIncome,
            estimated_tax: Number(totalEstimatedTax.toFixed(2)),
            federal_tax: federalTax,
            state_tax: stateTax,
            self_employment_tax: selfEmploymentTax,
            effective_tax_rate: effectiveTaxRate
        });

        /*
        ============================================
        UPDATE TAX SUMMARY
        ============================================
        */

        await TaxModel.updateTaxSummary({
            user_id: user_id || null,
            year: Number(year),
            total_income: gross,
            total_expenses: totalDeductions,
            taxable_income: taxableIncome,
            estimated_tax: Number(
                totalEstimatedTax.toFixed(2)
            )
        });

        return result;
    }
};

module.exports = TaxService;