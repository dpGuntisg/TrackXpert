import Event from "../models/Event.js";
import Track from "../models/Track.js";
import Image from "../models/Images.js";
import User from "../models/User.js";
import { createImage } from "./helpers/imageHelper.js";
import { validateEventTags } from './helpers/tagHelper.js';
import mongoose from 'mongoose';

class EventService {
    static async createEvent(userId, { name, description, location, date, tracks, participants, unlimitedParticipants, status, registrationDate, images, tags, registrationInstructions, requireManualApproval, generatePdfTickets }) {
        try {
            const created_by = userId;
            const eventData = {
                created_by,
                name,
                description,
                location,
                date: {
                    startDate: date?.startDate ? new Date(date.startDate) : null,
                    endDate: date?.endDate ? new Date(date.endDate) : null
                },
                tracks: tracks || [],
                maxParticipants: unlimitedParticipants ? null : participants,
                unlimitedParticipants,
                currentParticipants: 0,
                status: status || 'soon',
                registrationDate: {
                    startDate: registrationDate?.startDate ? new Date(registrationDate.startDate) : null,
                    endDate: registrationDate?.endDate ? new Date(registrationDate.endDate) : null
                },
                images: [],
                tags: tags || [],
                registrationInstructions,
                requireManualApproval,
                generatePdfTickets
            };

            // Handle images first
            if (images && Array.isArray(images)) {
                const imageIds = [];
                for (let image of images) {
                    const imageData = await createImage(image.data, image.mimeType);
                    imageIds.push(imageData._id);
                }
                eventData.images = imageIds;
            }

            // Validate tracks
            if (!eventData.tracks || !Array.isArray(eventData.tracks) || eventData.tracks.length === 0) {
                throw new Error("At least one track is required");
            }

            // Convert track IDs to ObjectId
            eventData.tracks = eventData.tracks.map(trackId => {
                if (typeof trackId === 'string') {
                    return new mongoose.Types.ObjectId(trackId);
                }
                return trackId;
            });

            // Validate that tracks exist
            const existingTracks = await Track.find({ _id: { $in: eventData.tracks } });
            if (existingTracks.length !== eventData.tracks.length) {
                throw new Error("One or more tracks not found");
            }

            // Validate dates
            if (!eventData.date.startDate || !eventData.date.endDate) {
                throw new Error("Event dates are required");
            }
            if (eventData.date.endDate < eventData.date.startDate) {
                throw new Error("Event end date must be after start date");
            }

            if (!eventData.registrationDate.startDate || !eventData.registrationDate.endDate) {
                throw new Error("Registration dates are required");
            }
            if (eventData.registrationDate.endDate > eventData.date.startDate) {
                throw new Error("Registration must end before event starts");
            }
            if (eventData.registrationDate.startDate > eventData.registrationDate.endDate) {
                throw new Error("Registration start date must be before deadline");
            }

            // Validate participants
            if (!unlimitedParticipants) {
                if (!participants || participants <= 0) {
                    throw new Error("Number of participants must be greater than 0");
                }
                if (participants > 100) {
                    throw new Error("Maximum number of participants is 100");
                }
            }

            return await Event.create(eventData);
        } catch (error) {
            console.error("Error creating event:", error);
            throw new Error(error.message || "Failed to create event");
        }
    }

    static async updateEvent(eventId, userId, updated) {
        try {
            const event = await Event.findById(eventId);
            if (!event) throw new Error("Event not found");
            if (event.created_by.toString() !== userId) throw new Error("Unauthorized");

            // Validate tags if provided
            if (updated.tags !== undefined) {
                validateEventTags(updated.tags || []);
            }

            const imagesToDelete = [];
      
            if (updated.images && Array.isArray(updated.images)) {
                const imageIds = [];
                for (let image of updated.images) {
                    if (!image._id) {
                        const imageData = await createImage(image.data, image.mimeType);
                        imageIds.push(imageData._id);
                    } else {
                        imageIds.push(image._id);
                    }
                }
                const existingImageIds = event.images.map(img => img.toString());
                imagesToDelete.push(...existingImageIds.filter(id => !imageIds.includes(id)));

                updated.images = imageIds;
            }

            // Handle participants update
            if (updated.unlimitedParticipants !== undefined) {
                updated.maxParticipants = updated.unlimitedParticipants ? null : updated.participants;
            } else if (updated.participants !== undefined) {
                updated.maxParticipants = event.unlimitedParticipants ? null : updated.participants;
            }

            if (imagesToDelete.length > 0) {
                await Image.deleteMany({ _id: { $in: imagesToDelete } });
            }

            Object.assign(event, updated);
            return await event.save();
        } catch (error) {
            console.log(error);
            throw new Error("Failed to update event");
        }
    }

    static async getAllEvents({ page = 1, limit = 6, filters = {} }) {
        try {
            const skip = (page - 1) * limit;
            let query = {};

            // Handle search filter
            if (filters.search) {
                query.$or = [
                    { name: { $regex: filters.search, $options: 'i' } },
                    { description: { $regex: filters.search, $options: 'i' } }
                ];
            }

            // Handle tags filter
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $all: filters.tags };
            }

            // Handle date range filter
            if (filters.startDate || filters.endDate) {
                query['date.startDate'] = {};
                if (filters.startDate) {
                    query['date.startDate'].$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    query['date.startDate'].$lte = new Date(filters.endDate);
                }
            }

            const events = await Event.find(query)
                .skip(skip)
                .limit(limit)
                .populate("images", "data mimeType")
                .populate("tracks", "name length availability");
            
            const totalEvents = await Event.countDocuments(query);

            return {
                events,
                totalEvents,
                totalPages: Math.ceil(totalEvents / limit),
                currentPage: page,
            };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch the Events");
        }
    }

    static async getEventsById(eventId) {
        try {
            const event = await Event.findById(eventId)
                .populate("created_by", "username _id") 
                .populate("images", "data mimeType");

            return event;
        } catch (error) {
            console.log(error);
            throw new Error("Event not found");
        }
    }

    static async getEventsByUserId(userId) {
        try {
            const events = await Event.find({ created_by: userId })
                .populate("created_by", "username email") 
                .populate("images", "data mimeType");

            if (!events.length) throw new Error("No events found for this user");
            return events;
        } catch (error) {
            console.log(error);
            throw new Error("Events not found!");
        }
    }

    static async deleteEvents(eventId, userId) {
        try {
            const event = await Event.findById(eventId);
            if (!event) throw new Error("Event not found");
            if (event.created_by.toString() !== userId) throw new Error("Unauthorized");

            await Event.findByIdAndDelete(eventId);
            return { message: "Event deleted successfully" };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to delete event");
        }
    }

    static async likeEvent(eventId, userId) {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");
        if (!event.likes) event.likes = [];
        if (!event.likes.includes(userId)) {
            event.likes.push(userId);
            await event.save();
        }
        return event;
    }

    static async unlikeEvent(eventId, userId) {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");
        if (!event.likes) event.likes = [];
        event.likes = event.likes.filter(id => id.toString() !== userId);
        await event.save();
        return event;
    }
}

export default EventService;
