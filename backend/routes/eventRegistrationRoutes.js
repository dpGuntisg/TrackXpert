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

// Get pending registrations for events created by the user
router.get('/pending', verifyToken, async (req, res) => {
    try {
        const pendingRegistrations = await EventRegistrationService.getPendingRegistrations(req.userId);
        res.json(pendingRegistrations || []);
    } catch (error) {
        console.error("Error fetching pending registrations:", error);
        res.status(500).json({ message: error.message });
    }
});

// Update registration status
router.put('/:registrationId/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const updatedRegistration = await EventRegistrationService.updateRegistrationStatus(
            req.params.registrationId,
            status,
            req.userId
        );
        res.json(updatedRegistration);
    } catch (error) {
        console.error("Error updating registration status:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router; 