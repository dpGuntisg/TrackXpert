import express from "express";
import EventService from "../services/eventServices.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/createevent", verifyToken, async (req, res) =>{
    try{
        const event = await EventService.createEvent(req.userId, req.body);
        res.status(201).json({ message: "Event created successfully", event});
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

export default router;