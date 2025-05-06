import express from "express";
import PdfTicketService from "../services/pdfTicketServices.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/event-ticket/:eventId", verifyToken,  async (req, res) => {
    try{
        const { eventId } = req.params;
        const EventTicket = await PdfTicketService.generateEventPdfTicket(req.userId, req.params.eventId, res);
    } catch (error){
        console.error("PDF generation error:", error);
        res.status(error.status || 500).json({ message: error.message });
    }
})

export default router;
