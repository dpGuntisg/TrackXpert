import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { logActivity } from "./helpers/logHelper.js";
import crypto from "crypto";

class EventRegistrationService {
    static async createRegistration(userId, eventId, registrationInfo) {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        // Check if registration is open
        const now = new Date();
        if (now < event.registrationDate.startDate || now > event.registrationDate.endDate) {
            throw new Error("Registration is not open for this event");
        }

        // Check if user is already registered
        const existingRegistration = await EventRegistration.findOne({ event: eventId, user: userId });
        if (existingRegistration) {
            throw new Error("You are already registered for this event");
        }

        // Check if user is already in approvedParticipants
        const isAlreadyApproved = event.approvedParticipants.some(p => p.user.toString() === userId);
        if (isAlreadyApproved) {
            throw new Error("You are already registered for this event");
        }

        // Check if event is full
        if (!event.unlimitedParticipants && event.currentParticipants >= event.maxParticipants) {
            throw new Error("Event is full");
        }

        // Create registration
        const registration = await EventRegistration.create({
            event: eventId,
            user: userId,
            registrationInfo,
            status: event.requireManualApproval ? 'pending' : 'approved'
        });

        // If manual approval is not required, automatically approve
        if (!event.requireManualApproval) {
            // Generate ticket ID
            const timestamp = Date.now();
            const uniqueString = `${userId}-${eventId}-${timestamp}`;
            const ticketId = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 12).toUpperCase();

            // Add to approved participants
            event.approvedParticipants.push({
                user: userId,
                ticketId,
                registeredAt: new Date()
            });
            event.currentParticipants += 1;
            await event.save();

            // Update registration with ticket ID
            registration.ticketId = ticketId;
            await registration.save();
        }

        await logActivity(userId, 'registered_for_event', {
            eventId: event._id,
            eventName: event.name,
            status: registration.status
        });

        return registration;
    }

    static async updateRegistrationStatus(registrationId, userId, status) {
        const registration = await EventRegistration.findById(registrationId);
        if (!registration) throw new Error("Registration not found");

        const event = await Event.findById(registration.event);
        if (!event) throw new Error("Event not found");

        // Check if user has permission to update status
        if (event.created_by.toString() !== userId) {
            throw new Error("Unauthorized");
        }

        // Update registration status
        registration.status = status;
        await registration.save();

        // If approved, add to event's approved participants
        if (status === 'approved') {
            // Check if already approved
            const isAlreadyApproved = event.approvedParticipants.some(p => p.user.toString() === registration.user.toString());
            if (!isAlreadyApproved) {
                // Generate ticket ID
                const timestamp = Date.now();
                const uniqueString = `${registration.user}-${event._id}-${timestamp}`;
                const ticketId = crypto.createHash('sha256').update(uniqueString).digest('hex').substring(0, 12).toUpperCase();

                // Add to approved participants
                event.approvedParticipants.push({
                    user: registration.user,
                    ticketId,
                    registeredAt: new Date()
                });
                event.currentParticipants += 1;
                await event.save();

                // Update registration with ticket ID
                registration.ticketId = ticketId;
                await registration.save();
            }
        }

        await logActivity(userId, 'updated_registration_status', {
            registrationId: registration._id,
            eventId: event._id,
            eventName: event.name,
            status
        });

        return registration;
    }

    static async deleteRegistrations(registrationIds, userId) {
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

            // Check if user has permission
            if (event.created_by.toString() !== userId) {
                throw new Error("Unauthorized");
            }

            // Remove from approved participants if they were approved
            const approvedUserIds = eventRegs
                .filter(reg => reg.status === 'approved')
                .map(reg => reg.user.toString());

            if (approvedUserIds.length > 0) {
                event.approvedParticipants = event.approvedParticipants.filter(
                    p => !approvedUserIds.includes(p.user.toString())
                );
                event.currentParticipants = Math.max(0, event.currentParticipants - approvedUserIds.length);
                await event.save();
            }
        }

        // Delete the registrations
        await EventRegistration.deleteMany({ _id: { $in: registrationIds } });

        await logActivity(userId, 'deleted_registrations', {
            registrationIds,
            count: registrationIds.length
        });

        return { message: "Registrations deleted successfully" };
    }

    static async getRegistrationsByEvent(eventId, userId) {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        // Check if user has permission
        if (event.created_by.toString() !== userId) {
            throw new Error("Unauthorized");
        }

        const registrations = await EventRegistration.find({ event: eventId })
            .populate('user', 'name surname email')
            .sort({ createdAt: -1 });

        return registrations;
    }

    static async getRegistrationsByUser(userId) {
        const registrations = await EventRegistration.find({ user: userId })
            .populate('event', 'name date location')
            .sort({ createdAt: -1 });

        return registrations;
    }
}

export default EventRegistrationService;