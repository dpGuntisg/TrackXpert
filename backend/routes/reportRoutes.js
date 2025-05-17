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


export default router;
