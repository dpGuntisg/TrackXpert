import ReportServices from "../services/reportServices.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import { Router } from "express";

const router = Router();

router.post("/create", verifyToken, async (req, res) => {
    try {
        const { targetType, targetId, reason } = req.body;
        const report = await ReportServices.createReport(req.userId, targetType, targetId, reason);
        res.status(201).json({ message: "Report created successfully", report });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.get("/pending", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const pendingReports = await ReportServices.getPendingReports();
        res.status(200).json(pendingReports);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        
        // Default to pending if no status specified
        const reportStatus = status || 'pending';
        
        // Validate status
        if (!['pending', 'resolved', 'dismissed'].includes(reportStatus)) {
            return res.status(400).json({ message: 'Invalid status parameter' });
        }
        
        const reports = await ReportServices.getReportsByStatus(reportStatus);
        res.status(200).json(reports);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.patch('/:reportId/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'resolved', 'dismissed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const report = await ReportServices.updateReportStatus(reportId, status, req.userId);
        res.json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
