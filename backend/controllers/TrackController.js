import Track from "../models/Track.js";

export const createTrack = async (req, res) => {
    const { 
        name, description, location, image, availability,
        latitude, longitude,
        polygon, polyline
    } = req.body;
    
    const created_by = req.userId;

    try {
        const trackData = {
            name,
            description,
            location,
            image,
            availability,
            created_by
        };

        // Handle Point coordinates 
        if (latitude && longitude) {
            trackData.coordinates = {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        // Handle Polygon
        if (polygon && Array.isArray(polygon) && polygon.length > 2) {
            // Close the polygon by adding the first point at the end
            const closedPolygon = [...polygon];
            if (JSON.stringify(closedPolygon[0]) !== JSON.stringify(closedPolygon[closedPolygon.length - 1])) {
                closedPolygon.push(closedPolygon[0]);
            }
            
            trackData.polygon = {
                type: "Polygon",
                coordinates: [closedPolygon.map(point => [parseFloat(point[1]), parseFloat(point[0])])]
            };
        }

        // Handle Polyline
        if (polyline && Array.isArray(polyline) && polyline.length > 1) {
            trackData.polyline = {
                type: "LineString",
                coordinates: polyline.map(point => [parseFloat(point[1]), parseFloat(point[0])])
            };
        }

        // Ensure at least one geometry type is provided
        const hasGeometry = 
            (trackData.coordinates && trackData.coordinates.coordinates) || 
            (trackData.polygon && trackData.polygon.coordinates) || 
            (trackData.polyline && trackData.polyline.coordinates);
            
        if (!hasGeometry) {
            return res.status(400).json({ message: "At least one geometry type (point, polygon, or polyline) is required" });
        }

        const track = await Track.create(trackData);
        res.status(201).json({ message: "Track created successfully", track });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const updateTrack = async (req, res) => {
    const trackId = req.params.id;
    const { 
        name, description, location, image, availability,
        latitude, longitude,
        polygon, polyline
    } = req.body;
    
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

        // Update Point coordinates
        if (latitude && longitude) {
            track.coordinates = {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        } else if (latitude === null || longitude === null) {
            track.coordinates = undefined;
        }

        // Update Polygon
        if (polygon) {
            if (Array.isArray(polygon) && polygon.length > 2) {
                // Close the polygon by adding the first point at the end
                const closedPolygon = [...polygon];
                if (JSON.stringify(closedPolygon[0]) !== JSON.stringify(closedPolygon[closedPolygon.length - 1])) {
                    closedPolygon.push(closedPolygon[0]);
                }
                
                track.polygon = {
                    type: "Polygon",
                    coordinates: [closedPolygon.map(point => [parseFloat(point[1]), parseFloat(point[0])])]
                };
            } else if (polygon === null) {
                track.polygon = undefined;
            }
        }

        // Update Polyline
        if (polyline) {
            if (Array.isArray(polyline) && polyline.length > 1) {
                track.polyline = {
                    type: "LineString",
                    coordinates: polyline.map(point => [parseFloat(point[1]), parseFloat(point[0])])
                };
            } else if (polyline === null) {
                track.polyline = undefined;
            }
        }

        // Ensure at least one geometry type is provided
        const hasGeometry = 
            (track.coordinates && track.coordinates.coordinates) || 
            (track.polygon && track.polygon.coordinates) || 
            (track.polyline && track.polyline.coordinates);
            
        if (!hasGeometry) {
            return res.status(400).json({ message: "At least one geometry type (point, polygon, or polyline) is required" });
        }

        await track.save();
        res.status(200).json({ message: "Track updated successfully", track });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "Internal server error" });
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

export default { createTrack, getAllTracks, deleteTrack, getTrackById, updateTrack, getTracksByUserId };