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

router.get("/getevents", async (req, res) =>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const filters = {
          search: req.query.search,
          tags: req.query.tags ? JSON.parse(req.query.tags) : undefined,
          minLength: req.query.minLength,
          maxLength: req.query.maxLength,
          availability: req.query.availability ? JSON.parse(req.query.availability) : undefined
        };
        const { events, totalPages } = await EventService.getAllEvents({ page, limit, filters });
        res.status(200).json({ message: "Events fetched successfully", events, totalPages });
      } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
      }
});

router.post("/:id/like", verifyToken, async (req, res) => {
    try {
        const event = await EventService.likeEvent(req.params.id, req.userId);
        res.status(200).json({ message: "Event liked", event });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.post("/:id/unlike", verifyToken, async (req, res) => {
    try {
        const event = await EventService.unlikeEvent(req.params.id, req.userId);
        res.status(200).json({ message: "Event unliked", event });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

export default router;