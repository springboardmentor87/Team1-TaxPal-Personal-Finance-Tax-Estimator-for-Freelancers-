const TaxEstimatorService = require("../services/taxEstimatorService");

const calculateTax = async (req, res) => {
    try {
        const calculation = TaxEstimatorService.calculateTax(req.body);

        return res.status(200).json({
            success: true,
            message: "Tax calculation completed successfully.",
            data: calculation
        });
    } catch (error) {
        console.error("Calculate Tax Error:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const saveAssessment = async (req, res) => {
    try {
        const user_id = req.user.id;

        const assessment = await TaxEstimatorService.saveAssessment(user_id, req.body);

        return res.status(201).json({
            success: true,
            message: "Tax assessment saved successfully.",
            data: assessment
        });
    } catch (error) {
        console.error("Save Tax Assessment Error:", error.message);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAssessments = async (req, res) => {
    try {
        const user_id = req.user.id;

        const assessments = await TaxEstimatorService.getAssessments(user_id);

        return res.status(200).json({
            success: true,
            message: "Tax assessments fetched successfully.",
            data: assessments
        });
    } catch (error) {
        console.error("Get Tax Assessments Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tax assessments.",
            error: error.message
        });
    }
};

const getAssessmentById = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        const assessment = await TaxEstimatorService.getAssessmentById(id, user_id);

        return res.status(200).json({
            success: true,
            message: "Tax assessment fetched successfully.",
            data: assessment
        });
    } catch (error) {
        console.error("Get Single Tax Assessment Error:", error.message);
        const statusCode = error.message.includes("not found") ? 404 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const deleteAssessment = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        await TaxEstimatorService.deleteAssessment(id, user_id);

        return res.status(200).json({
            success: true,
            message: "Tax assessment deleted successfully."
        });
    } catch (error) {
        console.error("Delete Tax Assessment Error:", error.message);
        const statusCode = error.message.includes("not found") ? 404 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    calculateTax,
    saveAssessment,
    getAssessments,
    getAssessmentById,
    deleteAssessment
};
