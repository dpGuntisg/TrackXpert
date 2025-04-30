import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";

class EventRegistrationService {
    static async registerForEvent(eventId, userId, registrationInfo = null) {
        try {
            // Check if event exists and is not completed
            const event = await Event.findById(eventId);
            if (!event) {
                throw new Error("Event not found");
            }

            // Check if event is completed
            if (event.status === 'completed') {
                throw new Error("Cannot register for completed events");
            }

            // Check if registration period is open
            const now = new Date();
            if (now < new Date(event.registrationDate.startDate) || now > new Date(event.registrationDate.endDate)) {
                throw new Error("Registration period is closed");
            }

            // Check if event has reached maximum participants
            if (!event.unlimitedParticipants && event.currentParticipants >= event.maxParticipants) {
                throw new Error("Event has reached maximum participants");
            }

            // Check if user is already registered
            const existingRegistration = await EventRegistration.findOne({
                event: eventId,
                user: userId
            });

            if (existingRegistration) {
                throw new Error("Already registered for this event");
            }

            // Create new registration
            const registration = await EventRegistration.create({
                event: eventId,
                user: userId,
                registrationInfo: registrationInfo,
                status: 'approved' // Since we're not using manual approval yet
            });

            // Update event's current participants count
            if (!event.unlimitedParticipants) {
                event.currentParticipants += 1;
                await event.save();
            }

            return registration;
        } catch (error) {
            console.error("Error registering for event:", error);
            throw error;
        }
    }

    static async getEventRegistrations(eventId) {
        try {
            return await EventRegistration.find({ event: eventId })
                .populate('user', 'username email')
                .sort({ registeredAt: -1 });
        } catch (error) {
            console.error("Error fetching event registrations:", error);
            throw error;
        }
    }

    static async getUserRegistrations(userId) {
        try {
            return await EventRegistration.find({ user: userId })
                .populate('event', 'name date status')
                .sort({ registeredAt: -1 });
        } catch (error) {
            console.error("Error fetching user registrations:", error);
            throw error;
        }
    }

    static async cancelRegistration(eventId, userId) {
        try {
            const registration = await EventRegistration.findOneAndDelete({
                event: eventId,
                user: userId
            });

            if (!registration) {
                throw new Error("Registration not found");
            }

            // Update event's current participants count
            const event = await Event.findById(eventId);
            if (event && !event.unlimitedParticipants) {
                event.currentParticipants = Math.max(0, event.currentParticipants - 1);
                await event.save();
            }

            return registration;
        } catch (error) {
            console.error("Error canceling registration:", error);
            throw error;
        }
    }
}

export default EventRegistrationService; 