import Report from "../models/Report.js";

class ReportService {
    static async createReport(reportedBy, targetType, targetId, reason) {
        const existingReport = await Report.findOne({
            reportedBy,
            targetType,
            targetId,
        });
        if (existingReport) {
            throw new Error("You have already reported this item");
        }
        const report = new Report({ reportedBy, targetType, targetId, reason });
        await report.save();
        return report;
    }
    
    static async getPendingReports() {
        const pendingreports = await Report.find({ status: "pending" })
                    .populate("reportedBy", "username profile_image _id")
                    .sort({ createdAt: -1 });
        return pendingreports;
    }

    static async getReportsByStatus(status) {
    const reports = await Report.find({ status })
        .populate("reportedBy", "username profile_image _id")
        .sort({ createdAt: -1 }); // Sort by newest first
    return reports;
}

    static async updateReportStatus(reportId, status, reviewedBy) {
        try {
            const report = await Report.findById(reportId);
            if (!report) {
                throw new Error('Report not found');
            }

            report.status = status;
            report.reviewedBy = reviewedBy;
            await report.save();

            return report;
        } catch (error) {
            throw error;
        }
    }
}

export default ReportService;