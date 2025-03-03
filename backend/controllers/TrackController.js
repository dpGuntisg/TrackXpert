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
        if (polygon === null) {
            track.polygon = undefined;
            } else if (polygon && Array.isArray(polygon) && polygon.length > 2) {
        
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
        if (polyline === null) {
            track.polyline = undefined;
        } else if (polyline && Array.isArray(polyline) && polyline.length > 1) {
            // Your existing polyline handling code
        
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
        if (latitude !== undefined && longitude !== undefined) {
            if (latitude === null || longitude === null) {
                track.coordinates = undefined;
            } else {
                track.coordinates = {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                };
            }
        }

// Helper function to check if two line segments intersect
// Returns true if the line segments AB and CD intersect
function doLineSegmentsIntersect(A, B, C, D) {
    // Calculate the direction vectors
    const AB = [B[0] - A[0], B[1] - A[1]];
    const CD = [D[0] - C[0], D[1] - C[1]];
    
    // Calculate the denominator of the intersection equations
    const denominator = AB[0] * CD[1] - AB[1] * CD[0];
    
    // If denominator is zero, lines are parallel or collinear
    if (Math.abs(denominator) < 1e-10) return false;
    
    // Calculate the intersection parameters
    const AC = [C[0] - A[0], C[1] - A[1]];
    const t = (AC[0] * CD[1] - AC[1] * CD[0]) / denominator;
    const u = (AC[0] * AB[1] - AC[1] * AB[0]) / denominator;
    
    // Check if the intersection point is within both line segments
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// Function to check if a polygon has self-intersections
function hasPolygonSelfIntersections(coordinates) {
    const n = coordinates.length;
    
    // A polygon needs at least 4 points (3 edges) to have self-intersections
    if (n < 4) return false;
    
    // Check each pair of non-adjacent edges for intersections
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 2; j < n - 1; j++) {
            // Skip adjacent edges
            if (i === 0 && j === n - 2) continue;
            
            // Check for intersection
            if (doLineSegmentsIntersect(
                coordinates[i], coordinates[i + 1],
                coordinates[j], coordinates[j + 1]
            )) {
                return true;
            }
        }
    }
    
    return false;
}

// Function to validate and fix polygon before saving
function validateAndFixPolygon(polygonCoordinates) {
    // Ensure polygon is closed
    const n = polygonCoordinates.length;
    if (n < 3) {
        throw new Error('A polygon must have at least 3 points');
    }
    
    // Clone the array to avoid modifying the original
    let fixedPolygon = [...polygonCoordinates];
    
    // Ensure the polygon is closed
    const firstPoint = fixedPolygon[0];
    const lastPoint = fixedPolygon[fixedPolygon.length - 1];
    
    if (JSON.stringify(firstPoint) !== JSON.stringify(lastPoint)) {
        fixedPolygon.push([...firstPoint]);
    }
    
    // Check for self-intersections
    if (hasPolygonSelfIntersections(fixedPolygon)) {
        throw new Error('Polygon has self-intersections. Please redraw the polygon without crossing lines.');
    }
    
    return fixedPolygon;
}


// Update Polygon
    if (polygon === null) {
        track.polygon = undefined;
    } else if (polygon) {
        if (polygon.type && polygon.coordinates) {
            try {
                // Validate and fix the first ring of coordinates
                const fixedCoordinates = validateAndFixPolygon(polygon.coordinates[0]);
                polygon.coordinates[0] = fixedCoordinates;
                track.polygon = polygon;
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }
        } else if (Array.isArray(polygon) && polygon.length > 2) {
            // If it's an array of points
            try {
                // Validate and fix the coordinates
                const fixedPolygon = validateAndFixPolygon(polygon);
                
                track.polygon = {
                    type: "Polygon",
                    coordinates: [fixedPolygon.map(point => [parseFloat(point[1]), parseFloat(point[0])])]
                };
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }
        } else {
            return res.status(400).json({ message: "Invalid polygon data" });
        }
    }

    // Update Polyline - Handle both array format and GeoJSON format
    if (polyline === null) {
        track.polyline = undefined;
    } else if (polyline) {
        if (polyline.type && polyline.coordinates) {
            // If it's already in GeoJSON format
            track.polyline = polyline;
        } else if (Array.isArray(polyline) && polyline.length > 1) {
            // If it's an array of points
            track.polyline = {
                type: "LineString",
                coordinates: polyline.map(point => [parseFloat(point[1]), parseFloat(point[0])])
            };
        } else {
            return res.status(400).json({ message: "Invalid polyline data" });
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