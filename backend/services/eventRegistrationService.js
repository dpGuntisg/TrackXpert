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
            const startDate = new Date(event.registrationDate.startDate);
            const endDate = new Date(event.registrationDate.endDate);
            // Set end date to end of day (23:59:59) to include the full end date
            endDate.setHours(23, 59, 59, 999);

            if (now < startDate || now > endDate) {
                throw new Error('Registration is not open for this event');
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

            // Create new registration with appropriate status
            const registration = await EventRegistration.create({
                event: eventId,
                user: userId,
                registrationInfo: registrationInfo,
                status: event.requireManualApproval ? 'pending' : 'approved'
            });

            // Only update participants count if auto-approved
            if (!event.requireManualApproval && !event.unlimitedParticipants) {
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
                .populate({
                    path: 'user',
                    select: 'username email profile_image',
                    populate: {
                        path: 'profile_image',
                        select: 'data mimeType'
                    }
                })
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

    static async getPendingRegistrations(userId) {
        try {
            // Find events created by the user that require manual approval
            const events = await Event.find({
                created_by: new mongoose.Types.ObjectId(userId),
                requireManualApproval: true
            }).select('_id');

            if (!events || events.length === 0) {
                return [];
            }

            const eventIds = events.map(event => event._id);

            // Get all pending registrations for these events
            return await EventRegistration.find({
                event: { $in: eventIds },
                status: 'pending'
            })
            .populate({
                path: 'user',
                select: 'username email profile_image',
                populate: {
                    path: 'profile_image',
                    select: 'data mimeType'
                }
            })
            .populate('event', 'name')
            .sort({ registeredAt: -1 });
        } catch (error) {
            console.error("Error fetching pending registrations:", error);
            throw error;
        }
    }

    static async updateRegistrationStatus(registrationId, status, userId) {
        try {
            const registration = await EventRegistration.findById(registrationId)
                .populate("event", "name created_by")
                .populate("user", "username");

            if (!registration) {
                throw new Error("Registration not found");
            }

            // Check if the user is the event creator
            if (registration.event.created_by.toString() !== userId) {
                throw new Error("Unauthorized to update registration status");
            }

            if (!['pending', 'approved', 'rejected'].includes(status)) {
                throw new Error(`Invalid status: ${status}. Valid statuses are: pending, approved, rejected`);
            }

            registration.status = status;
            await registration.save();

            // Update event's current participants count if approved
            if (status === 'approved' && !registration.event.unlimitedParticipants) {
                registration.event.currentParticipants += 1;
                await registration.event.save();
            }

            return registration;
        } catch (error) {
            console.error("Error updating registration status:", error);
            throw error;
        }
    }
}

export default EventRegistrationService; 