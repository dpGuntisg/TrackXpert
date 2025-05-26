import Event from "../models/Event.js";
import Track from "../models/Track.js";
import Image from "../models/Images.js";
import User from "../models/User.js";
import { createImage } from "./helpers/imageHelper.js";
import { validateEventTags } from './helpers/tagHelper.js';
import mongoose from "mongoose";
import { hasModificationPermission } from "./helpers/permissionHelper.js";
import { logActivity } from "./helpers/logHelper.js";
import { activeOnly } from "./helpers/archiveHelper.js";

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
            await logActivity(userId, 'created_event', {
                id: eventData._id,
                name: eventData.name,
                description: eventData.description,
                location: eventData.location,
                date: eventData.date,
                tracks: eventData.tracks
              });      
            return await Event.create(eventData);
        } catch (error) {
            console.error("Error creating event:", error);
            throw new Error(error.message || "Failed to create event");
        }
    }

    static async updateEvent(eventId, userId, updates) {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        const hasPermission = await hasModificationPermission(userId, event.created_by.toString());
        if (!hasPermission) throw new Error("Unauthorized");

        // Handle images update
        if (updates.images && Array.isArray(updates.images)) {
            const imageIds = [];
            for (let image of updates.images) {
                if (!image._id) {
                    const imageData = await createImage(image.data, image.mimeType);
                    imageIds.push(imageData._id);
                } else {
                    imageIds.push(image._id);
                }
            }
            updates.images = imageIds;
        }

        if((!event.thumbnailImage || !updates.thumbnailImage) && updates.images && updates.images.length > 0) {
            event.thumbnailImage = updates.images[0];
        }

        // Handle dates
        if (updates.date) {
            updates.date = {
                startDate: updates.date.startDate ? new Date(updates.date.startDate) : event.date.startDate,
                endDate: updates.date.endDate ? new Date(updates.date.endDate) : event.date.endDate
            };
        }

        if (updates.registrationDate) {
            updates.registrationDate = {
                startDate: updates.registrationDate.startDate ? new Date(updates.registrationDate.startDate) : event.registrationDate.startDate,
                endDate: updates.registrationDate.endDate ? new Date(updates.registrationDate.endDate) : event.registrationDate.endDate
            };
        }

        // Update event
        Object.assign(event, updates);
        const updatedEvent = await event.save();

        await logActivity(userId, 'updated_event', {
            id: updatedEvent._id,
            name: updatedEvent.name,
            description: updatedEvent.description,
            location: updatedEvent.location,
            date: updatedEvent.date,
        });

        return updatedEvent;
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
                const startDate = filters.startDate ? new Date(filters.startDate) : new Date(0);
                const endDate = filters.endDate ? new Date(filters.endDate) : new Date('9999-12-31');

                // Find events that overlap with the selected date range
                query.$and = [
                    {
                        'date.startDate': { $lte: endDate }
                    },
                    {
                        'date.endDate': { $gte: startDate }
                    }
                ];
            }

            const events = await Event.find(activeOnly(query))
                .skip(skip)
                .limit(limit)
                .populate("created_by", "username _id email")
                .populate("thumbnailImage", "data mimeType")
                .populate("tracks", "name length availability")
                .lean();
            
            const totalEvents = await Event.countDocuments(activeOnly(query));

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
            const event = await Event.findOne({ _id: eventId, ...activeOnly() })
                .populate("created_by", "username _id email") 
                .populate("images", "data mimeType")
                .populate({
                    path: "tracks",
                    select: "name length availability description images location",
                    populate: {
                        path: "thumbnailImage",
                        select: "data mimeType"
                    }
                });

            if (!event) {
                const error = new Error("Event not found");
                error.status = 404;
                throw error;
            }

            return event;
        } catch (error) {
            if (error.name === 'CastError') {
                error.status = 404;
                error.message = "Event not found";
            }
            throw error;
        }
    }

    static async getEventsByUserId(userId) {
        try {
            const events = await Event.find({ created_by: userId })
                .populate("created_by", "username email") 
                .populate("thumbnailImage", "data mimeType");

            if (!events.length) throw new Error("No events found for this user");
            return events;
        } catch (error) {
            console.log(error);
            throw new Error("Events not found!");
        }
    }

    static async deleteEvent(eventId, userId) {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        const hasPermission = await hasModificationPermission(userId, event.created_by.toString());
        if (!hasPermission) throw new Error("Unauthorized");

        await Image.deleteMany({ _id: { $in: event.images } });
        await Event.findByIdAndDelete(eventId);

        await logActivity(userId, 'deleted_event', {
            id: event._id,
            name: event.name,
        });

        return { message: "Event deleted successfully" };
    }

    static async likeEvent(eventId, userId) {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");
        
        // Check if user is the creator of the event
        if (event.created_by.toString() === userId) {
            throw new Error("You cannot like your own event");
        }
        
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
        
        // Check if user is the creator of the event
        if (event.created_by.toString() === userId) {
            throw new Error("You cannot unlike your own event");
        }
        
        if (!event.likes) event.likes = [];
        event.likes = event.likes.filter(id => id.toString() !== userId);
        await event.save();
        return event;
    }

    static async getLikedEvents(userId) {
        try {
            if (!userId) throw new Error("User ID is required");
            
            const events = await Event.find(activeOnly({ likes: userId }))
                .populate("created_by", "username email")
                .populate("thumbnailImage", "data mimeType");
            
            return events;
        } catch (error) {
            console.error("Error in getLikedEvents:", error);
            throw error;
        }
    }
}

export default EventService;
