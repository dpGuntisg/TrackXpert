import express from "express";
import EventRegistrationService from "../services/eventRegistrationService.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Register for an event
router.post("/register/:eventId", verifyToken, async (req, res) => {
    try {
        const registration = await EventRegistrationService.registerForEvent(
            req.params.eventId,
            req.userId,
            req.body.registrationInfo
        );
        res.status(201).json({ message: "Successfully registered for event", registration });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all registrations for an event
router.get("/event/:eventId", verifyToken, async (req, res) => {
    try {
        const registrations = await EventRegistrationService.getEventRegistrations(req.params.eventId);
        res.status(200).json({ registrations });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all registrations for a user
router.get("/user", verifyToken, async (req, res) => {
    try {
        const registrations = await EventRegistrationService.getUserRegistrations(req.userId);
        res.status(200).json({ registrations });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cancel registration
router.delete("/:eventId", verifyToken, async (req, res) => {
    try {
        const registration = await EventRegistrationService.cancelRegistration(req.params.eventId, req.userId);
        res.status(200).json({ message: "Registration cancelled successfully", registration });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router; 