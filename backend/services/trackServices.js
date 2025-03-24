import Track from "../models/Track.js";
import Image from "../models/Images.js";
import { createImage } from "./helpers/imageHelper.js";

class TrackService {
    static async createTrack(userId,{ name, description, location, images, availability, latitude, longitude, distance, polyline }) {

        const created_by = userId;
        const trackData = { 
          name, 
          description,
          location,
          images:[],
          availability,
          created_by,
          distance 
        };

        if (images && Array.isArray(images)) {
          const imageIds = [];
          for (let image of images) {
            const imageData = await createImage(image.data, image.mimeType);
            imageIds.push(imageData._id);  // Collect image IDs
          }
          trackData.images = imageIds;  // Assign the array of image IDs to the track's images field
        }

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
        } else if (polyline && Array.isArray(polyline)) {
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
      
        // Track the IDs of images to be deleted
        const imagesToDelete = [];
      
        if (updates.images && Array.isArray(updates.images)) {
          const imageIds = [];
          for (let image of updates.images) {
            // If the image is new (doesn't have an _id), create it
            if (!image._id) {
              const imageData = await createImage(image.data, image.mimeType);
              imageIds.push(imageData._id);
            } else {
              // If the image already exists, keep its ID
              imageIds.push(image._id);
            }
          }
      
          // Find images that are no longer in the updated list
          const existingImageIds = track.images.map(img => img.toString());
          imagesToDelete.push(...existingImageIds.filter(id => !imageIds.includes(id)));
      
          updates.images = imageIds; // Assign the new image IDs to the images field
        }
      
        // Delete images that are no longer associated with the track
        if (imagesToDelete.length > 0) {
          await Image.deleteMany({ _id: { $in: imagesToDelete } });
        }
      
        // Update the track with the new data
        Object.assign(track, updates);
      
        // Handle geometry updates
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
    const tracks = await Track.find().skip(skip).limit(limit).populate("images", "data mimeType");
    const totalTracks = await Track.countDocuments();
    
    return {
      tracks,
      totalTracks,
      totalPages: Math.ceil(totalTracks / limit),
      currentPage: page,
    };
  }

  static async getTrackById(trackId) {
    const track = await Track.findById(trackId)
        .populate({
            path: 'created_by',
            select: 'name surname username email phonenumber profile_image',
            populate: {
                path: 'profile_image',
                select: 'data mimeType'
            }
        })
        .populate("images", "data mimeType");
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
    
    const tracks = await Track.find({ created_by: userId })
    .populate("created_by", "username email phonenumber")
    .populate("images", "data mimeType");
    if (!tracks.length) throw new Error("No tracks found for this user");
    
    return tracks;
  }
}

export default TrackService;