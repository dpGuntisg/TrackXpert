import express from "express";
import EventService from "../services/eventServices.js";
import verifyToken from "../middleware/verifyToken.js";
import { eventCreationLimiter, updateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/createevent", verifyToken, eventCreationLimiter, async (req, res) =>{
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
          tags: req.query.tags ? req.query.tags.split(',') : undefined,
          startDate: req.query.startDate,
          endDate: req.query.endDate
        };
        const { events, totalPages } = await EventService.getAllEvents({ page, limit, filters });
        res.status(200).json({ message: "Events fetched successfully", events, totalPages });
      } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
      }
});

router.get("/:id", async (req, res) =>{
    try {
        const event = await EventService.getEventsById(req.params.id);
        res.status(200).json({ message: "Event fetched successfully", event });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.patch("/:id", verifyToken, updateLimiter, async (req, res) => {
    try {
        const event = await EventService.updateEvent(req.params.id, req.userId, req.body);
        res.status(200).json({ message: "Event updated successfully", event });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const event = await EventService.deleteEvent(req.params.id, req.userId);
        res.status(200).json({ message: "Event deleted successfully", event });
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