const ReportModel =
    require("../models/reportModel");


// ==========================================
// GET ALL REPORTS
// ==========================================

const getAllReports = async (req, res) => {

    try {

        const userId = req.user.id;

        const reports =
            await ReportModel.getReportsByUser(
                userId
            );

        res.status(200).json({

            success: true,

            reports

        });

    } catch (error) {

        console.error(
            "Get reports error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch reports"

        });
    }
};



// ==========================================
// GET SINGLE REPORT
// ==========================================

const getReportById = async (req, res) => {

    try {

        const userId =
            req.user.id;

        const reportId =
            req.params.id;


        const report =
            await ReportModel.getReportById(
                reportId,
                userId
            );


        if (!report) {

            return res.status(404).json({

                success: false,

                message:
                    "Report not found"

            });
        }


        res.status(200).json({

            success: true,

            report

        });

    } catch (error) {

        console.error(
            "Get report error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch report"

        });
    }
};



// ==========================================
// SAVE REPORT INFORMATION
// ==========================================
//
// Developer 1 generates/calculates the report.
// Developer 3 stores report metadata in Reports table.
//

const saveReport = async (req, res) => {

    try {

        const userId =
            req.user.id;


        const {
            period,
            reportType,
            filePath
        } = req.body;


        // Validation

        if (!period) {

            return res.status(400).json({

                success: false,

                message:
                    "period is required"

            });
        }


        if (!reportType) {

            return res.status(400).json({

                success: false,

                message:
                    "reportType is required"

            });
        }


        if (
            reportType !== "monthly" &&
            reportType !== "quarterly"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "reportType must be monthly or quarterly"

            });
        }


        const reportId =
            await ReportModel.createReport(

                userId,

                period,

                reportType,

                filePath || null

            );


        res.status(201).json({

            success: true,

            message:
                "Report saved successfully",

            reportId

        });

    } catch (error) {

        console.error(
            "Save report error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to save report"

        });
    }
};



// ==========================================
// UPDATE REPORT FILE
// ==========================================
//
// Developer 2 can use this after creating
// PDF/CSV.
//

const updateReportFile = async (req, res) => {

    try {

        const userId =
            req.user.id;

        const reportId =
            req.params.id;

        const {
            filePath
        } = req.body;


        if (!filePath) {

            return res.status(400).json({

                success: false,

                message:
                    "filePath is required"

            });
        }


        const report =
            await ReportModel.getReportById(
                reportId,
                userId
            );


        if (!report) {

            return res.status(404).json({

                success: false,

                message:
                    "Report not found"

            });
        }


        await ReportModel.updateFilePath(

            reportId,

            userId,

            filePath

        );


        res.status(200).json({

            success: true,

            message:
                "Report file updated successfully"

        });

    } catch (error) {

        console.error(
            "Update report file error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update report file"

        });
    }
};



module.exports = {

    getAllReports,

    getReportById,

    saveReport,

    updateReportFile

};