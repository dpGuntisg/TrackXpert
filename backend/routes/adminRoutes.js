import express from "express";
import AdminService from "../services/adminServices.js";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";

const router = express.Router();

//admin actions
router.get("/logs",verifyToken, verifyAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const action = req.query.action  || undefined;
      const userId = req.query.userId  || undefined;
      const startDate = req.query.startDate || undefined;
      const endDate = req.query.endDate   || undefined;
      const sortOrder = req.query.sortOrder || "desc";
      const search = req.query.search || undefined;

      const { logs, totalPages, currentPage, sortDir } = 
      await AdminService.getLogs({page, limit, action, userId, startDate, endDate, sortOrder, search});

      res.status(200).json({message: "Logs fetched successfully", logs, totalPages, currentPage, sortDir,});
    } catch (error) {
      console.error("Error in /logs route:", error);
      res.status(error.status || 500).json({ message: error.message || "Failed to fetch logs" });
    }
  }
);

//statistics
router.get("/stats/tracks-per-country", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const tracksperCountry = await AdminService.getTracksPerCountry();
      res.json(tracksperCountry);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/stats/summary", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const summary = await AdminService.getSummaryCount();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
);

router.get("/stats/monthly-growth", verifyToken, verifyAdmin, async (req, res) => {
    try {
      const growth = await AdminService.getMonthlyUserGrowth();
      res.json(growth);
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
);

router.post("/ban/:userId", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { reason, duration, isPermanent } = req.body;
        const { userId } = req.params;

        if (!reason) {
            return res.status(400).json({ message: "Ban reason is required" });
        }

        if (!isPermanent && !duration) {
            return res.status(400).json({ message: "Duration is required for temporary bans" });
        }

        const bannedUser = await AdminService.banUser(userId, { reason, duration, isPermanent });
        res.status(200).json({ message: "User banned successfully", user: bannedUser });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.post("/unban/:userId", verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const unbannedUser = await AdminService.unbanUser(userId);
        res.status(200).json({ message: "User unbanned successfully", user: unbannedUser });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

export default router;
