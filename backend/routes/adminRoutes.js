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

      const { logs, totalPages, currentPage, sortDir } = 
      await AdminService.getLogs({page,limit,action,userId,startDate,endDate,sortOrder,});

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

)
export default router;
