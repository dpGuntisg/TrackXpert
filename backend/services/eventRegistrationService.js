import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";
import crypto from "crypto";

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

            // Check if user is already in approvedParticipants
            const isAlreadyApproved = event.approvedParticipants.some(p => p.user.toString() === userId);
            if (isAlreadyApproved) {
                throw new Error("You are already registered for this event");
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

            // If manual approval is not required, automatically approve
            if (!event.requireManualApproval) {
                // Generate ticket ID if PDF tickets are enabled
                let ticketId = null;
                if (event.generatePdfTickets) {
                    const timestamp = Date.now();
                    const uniqueString = `${userId}-${eventId}-${timestamp}`;
                    ticketId = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 12).toUpperCase();
                    registration.ticketId = ticketId;
                    await registration.save();
                }

                // Add to approved participants
                event.approvedParticipants.push({
                    user: new mongoose.Types.ObjectId(userId),
                    ticketId,
                    registeredAt: new Date()
                });
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

            // If approved, add to event's approved participants
            if (status === 'approved') {
                const event = await Event.findById(registration.event._id);
                if (event) {
                    // Check if already approved
                    const isAlreadyApproved = event.approvedParticipants.some(p => p.user.toString() === registration.user.toString());
                    if (!isAlreadyApproved) {
                        // Generate ticket ID if PDF tickets are enabled
                        let ticketId = null;
                        if (event.generatePdfTickets) {
                            const timestamp = Date.now();
                            const uniqueString = `${registration.user}-${event._id}-${timestamp}`;
                            ticketId = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 12).toUpperCase();
                            registration.ticketId = ticketId;
                            await registration.save();
                        }

                        // Add to approved participants
                        event.approvedParticipants.push({
                            user: registration.user,
                            ticketId,
                            registeredAt: new Date()
                        });
                        event.currentParticipants = (Number(event.currentParticipants) || 0) + 1;
                        await event.save();
                    }
                }
            }

            return registration;
        } catch (error) {
            console.error("Error updating registration status:", error);
            throw error;
        }
    }

    static async deleteRegistrations(registrationIds, userId) {
        try {
            const registrations = await EventRegistration.find({ _id: { $in: registrationIds } });
            
            // Group registrations by event
            const eventRegistrations = {};
            registrations.forEach(reg => {
                if (!eventRegistrations[reg.event]) {
                    eventRegistrations[reg.event] = [];
                }
                eventRegistrations[reg.event].push(reg);
            });

            // Process each event's registrations
            for (const [eventId, eventRegs] of Object.entries(eventRegistrations)) {
                const event = await Event.findById(eventId);
                if (!event) continue;

                // Only check permission if the user is not the one who sent the request
                const isSentByUser = eventRegs.some(reg => reg.user.toString() === userId);
                if (!isSentByUser && event.created_by.toString() !== userId) {
                    throw new Error("Unauthorized");
                }
            }

            // Delete the registrations
            await EventRegistration.deleteMany({ _id: { $in: registrationIds } });

            return { message: "Registrations deleted successfully" };
        } catch (error) {
            console.error("Error deleting registrations:", error);
            throw error;
        }
    }
}

export default EventRegistrationService; 