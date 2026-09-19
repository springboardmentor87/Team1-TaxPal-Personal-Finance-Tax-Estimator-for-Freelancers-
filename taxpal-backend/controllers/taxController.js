const TaxService = require("../services/taxService");
const asyncHandler = require("../utils/asyncHandler");

const calculateTax = asyncHandler(async (req, res) => {
    const user_id = req.user.id;

    const {
        year,
        country,
        state,
        filingStatus,
        quarter,
        grossIncome,
        businessExpenses,
        retirementContributions,
        healthInsurancePremiums,
        homeOfficeDeduction
    } = req.body;

    const taxData = await TaxService.calculateTax({
        user_id,
        year: year || new Date().getFullYear(),
        country,
        state,
        filingStatus,
        quarter,
        grossIncome,
        businessExpenses,
        retirementContributions,
        healthInsurancePremiums,
        homeOfficeDeduction
    });

    return res.status(200).json({
        success: true,
        message: "Tax calculated successfully",
        data: taxData
    });
});

module.exports = {
    calculateTax
};