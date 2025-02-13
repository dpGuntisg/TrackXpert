import Track from "../models/Track.js";

export const createTrack = async (req, res) => {
    const { name, description, location, image, latitude, longitude, availability, } = req.body;
    const created_by = req.userId;

    try {
        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Location coordinates are required" });
        }

        const track = await Track.create({
            name,
            description,
            location,
            image,
            availability,
            created_by,
            coordinates: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            }
        });

        res.status(201).json({ message: "Track created successfully", track });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllTracks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6; 
        const skip = (page - 1) * limit;

        const tracks = await Track.find().skip(skip).limit(limit);
        const totalTracks = await Track.countDocuments();

        res.json({
            tracks,
            totalTracks,
            totalPages: Math.ceil(totalTracks / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTrackById = async (req, res) => {
    try {
        const trackId = req.params.id;
        const track = await Track.findById(trackId).populate("created_by", "username _id");
        if (!track) {
            return res.status(404).json({ message: "Track not found" });
        }
        res.status(200).json({ track });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteTrack = async (req, res) => {
    try {
        const trackId = req.params.id;
        const track = await Track.findById(trackId);

        if (!track) {
            return res.status(404).json({ message: "Track not found" });
        }
        if (track.created_by.toString() !== req.userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Track.findByIdAndDelete(trackId);
        res.status(200).json({ message: "Track deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateTrack = async (req, res) => {
    const trackId = req.params.id;
    const { name, description, location, image, latitude, longitude, availability, } = req.body;
    const created_by = req.userId;
    let errors = {};

    if (name && name.length < 5) {
        errors.name = "Track name must be at least 5 characters long";
    }
    if (description && description.length < 10) {
        errors.description = "Track description must be at least 10 characters long";
    }
    if (location && location.length < 5) {
        errors.location = "Track location must be at least 5 characters long";
    }
    if ((latitude && !longitude) || (!latitude && longitude)) {
        errors.coordinates = "Both latitude and longitude must be provided together";
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const track = await Track.findById(trackId);

        if (!track) {
            return res.status(404).json({ message: "Track not found" });
        }
        if (track.created_by.toString() !== created_by) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Update track details
        if (name) track.name = name;
        if (description) track.description = description;
        if (location) track.location = location;
        if (image) track.image = image; 
        if (availability) track.availability = availability;
        if (latitude && longitude) {
            track.coordinates = {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        await track.save();

        res.status(200).json({ message: "Track updated successfully", track });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




export const getTracksByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const tracks = await Track.find({ created_by: userId }).populate("created_by", "username email");

        if (!tracks.length) {
            return res.status(404).json({ message: "No tracks found for this user" });
        }

        res.status(200).json({ tracks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export default { createTrack, getAllTracks, deleteTrack, getTrackById, updateTrack };
