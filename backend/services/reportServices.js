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
            .populate("reportedBy", "username")
        return pendingreports;
    }
}

export default ReportService;