import Track from "../models/Track.js";

class TrackService {
    static async createTrack(userId,{ name, description, location, image, availability, latitude, longitude, distance, polyline }) {
        console.log("Incoming data:", { userId, name, description, location, image, availability, latitude, longitude, distance, polyline });
      
        const created_by = userId;
        const trackData = { name, description, location, image, availability, created_by, distance };
      
        // Add point geometry if latitude and longitude are provided
        if (latitude && longitude) {
          trackData.coordinates = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          };
        }
      
        // Add polyline geometry if polyline is provided
        if (polyline === null || polyline === undefined) {
          trackData.polyline = undefined;
        } else if (polyline && Array.isArray(polyline)) { // Fix here, added missing parenthesis
          if (polyline.length > 1) {
            trackData.polyline = {
              type: "LineString",
              coordinates: polyline.map(point => [parseFloat(point[1]), parseFloat(point[0])])
            };
          } else {
            console.warn("Polyline data is invalid or has insufficient points.");
            trackData.polyline = undefined;
          }
        }
      
        // Validate that at least one geometry type is present
        const hasGeometry = (trackData.coordinates && trackData.coordinates.coordinates) || 
                            (trackData.polyline && trackData.polyline.coordinates);
      
        if (!hasGeometry) {
          throw new Error("At least one geometry type (point or polyline) is required");
        }
      
        return await Track.create(trackData);
      }
  static async updateTrack(trackId, userId, updates) {
    const track = await Track.findById(trackId);
    if (!track) throw new Error("Track not found");
    if (track.created_by.toString() !== userId) throw new Error("Unauthorized");
    
    Object.assign(track, updates);
    
    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      track.coordinates = updates.latitude === null || updates.longitude === null ? undefined : {
        type: "Point",
        coordinates: [parseFloat(updates.longitude), parseFloat(updates.latitude)]
      };
    }
    
    if (updates.polyline !== undefined) {
      if (updates.polyline === null) {
        track.polyline = undefined;
      } else if (updates.polyline.type && updates.polyline.coordinates) {
        track.polyline = updates.polyline;
      } else if (Array.isArray(updates.polyline) && updates.polyline.length > 1) {
        track.polyline = {
          type: "LineString",
          coordinates: updates.polyline.map(point => [parseFloat(point[1]), parseFloat(point[0])])
        };
      } else {
        throw new Error("Invalid polyline data");
      }
    }
    
    return await track.save();
  }

  static async getAllTracks({ page = 1, limit = 6 }) {
    const skip = (page - 1) * limit;
    const tracks = await Track.find().skip(skip).limit(limit);
    const totalTracks = await Track.countDocuments();
    
    return {
      tracks,
      totalTracks,
      totalPages: Math.ceil(totalTracks / limit),
      currentPage: page,
    };
  }

  static async getTrackById(trackId) {
    const track = await Track.findById(trackId).populate("created_by", "username _id");
    if (!track) throw new Error("Track not found");
    return track;
  }

  static async deleteTrack(trackId, userId) {
    const track = await Track.findById(trackId);
    if (!track) throw new Error("Track not found");
    if (track.created_by.toString() !== userId) throw new Error("Unauthorized");
    
    await Track.findByIdAndDelete(trackId);
    return { message: "Track deleted successfully" };
  }

  static async getTracksByUserId(userId) {
    if (!userId) throw new Error("User ID is required");
    
    const tracks = await Track.find({ created_by: userId }).populate("created_by", "username email");
    if (!tracks.length) throw new Error("No tracks found for this user");
    
    return tracks;
  }
}

export default TrackService;