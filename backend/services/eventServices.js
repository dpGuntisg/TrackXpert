import Event from "../models/Event.js";
import Track from "../models/Track.js";
import Image from "../models/Images.js";
import User from "../models/User.js";
import { createImage } from "./helpers/imageHelper.js";
import { validateEventTags } from './helpers/tagHelper.js';

class EventService {
    static async createEvent(userId, { name, description, location, date, tracks, capacity, status, registrationDeadline, images, tags }) {
        try {
            const created_by = userId;
            const tracks = tracks.map(track => track._id);
            const eventData = {
                created_by,
                name,
                description,
                location,
                date,
                tracks,
                capacity,
                status,
                registrationDeadline,
                images,
                tags
            };

            const existingTracks = await Track.find({ _id: { $in: tracks } });
            if (existingTracks.length !== tracks.length) {
                throw new Error("One or more tracks not found");
            }

            if (images && Array.isArray(images)) {
                const imageIds = [];
                for (let image of images) {
                    const imageData = await createImage(image.data, image.mimeType);
                    imageIds.push(imageData._id);
                }
                eventData.images = imageIds;
            }
            return await Event.create(eventData);
        } catch (error) {
            console.error("Error creating an event:", error);
            throw new Error("Failed to create event");
        }
    }

    static async updateEvent(eventId, userId, updated) {
        try {
            // Validate tags if provided
            if (updated.tags !== undefined) {
                validateEventTags(updated.tags || []);
            }

            const event = await Event.findById(eventId);
            if (!event) throw new Error("Event not found");
            if (event.created_by.toString() !== userId) throw new Error("Unauthorized");

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

    static async getAllEvents({ page = 1, limit = 6 }) {
        try {
            const skip = (page - 1) * limit;
            const events = await Event.find().skip(skip).limit(limit).populate("images", "data mimeType"); // Added `await`
            const totalEvents = await Event.countDocuments();

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
}

export default EventService;
