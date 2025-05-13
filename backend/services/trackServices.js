import Track from "../models/Track.js";
import Image from "../models/Images.js";
import { createImage } from "./helpers/imageHelper.js";
import { validateTrackTags, getValidTags } from './helpers/tagHelper.js';
import { buildTrackQuery } from './helpers/filterHelper.js';
import { logActivity } from "./helpers/logHelper.js";
import { hasModificationPermission } from "./helpers/permissionHelper.js";

class TrackService {
    static async createTrack(userId,{ name, description, location, images, availability, latitude, longitude, distance, polyline, tags, joining_enabled, joining_requirements }) {
        const created_by = userId;
        const trackData = { 
          name, 
          description,
          location,
          images:[],
          availability,
          created_by,
          distance,
          tags: tags || [],
          joining_enabled: joining_enabled ?? false,
          joining_requirements: joining_requirements ?? ""
        };

        if (joining_requirements && joining_requirements.length > 500) {
          throw new Error("Joining requirements must be less than 500 characters");
        }

        // Validate tags if provided
        if (tags && Array.isArray(tags)) {
          validateTrackTags(tags);
        }

        if (images && Array.isArray(images)) {
          const imageIds = [];
          for (let image of images) {
            const imageData = await createImage(image.data, image.mimeType);
            imageIds.push(imageData._id);
          }
          trackData.images = imageIds;
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
        const createdTrack = await Track.create(trackData);

        await logActivity(userId, 'created_track', {
          name: createdTrack.name,
          description: createdTrack.description,
          location: createdTrack.location
        });
        
        return createdTrack;

    }

    static async updateTrack(trackId, userId, updates) {
        const track = await Track.findById(trackId);
        if (!track) throw new Error("Track not found");
        
        const hasPermission = await hasModificationPermission(userId, track.created_by.toString());
        if (!hasPermission) throw new Error("Unauthorized");
      
        // Track the IDs of images to be deleted
        const imagesToDelete = [];
      
        // Handle tags update
        if (updates.joining_enabled !== undefined) {
          track.joining_enabled = updates.joining_enabled;
        }

        if (updates.joining_requirements !== undefined) {
          if (updates.joining_requirements.length > 500) {
            throw new Error("Joining requirements must be less than 500 characters");
          }
          track.joining_requirements = updates.joining_requirements;
        }

        if (updates.tags !== undefined) {
          validateTrackTags(updates.tags || []);
          track.tags = updates.tags;
        }
      
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
      
          const existingImageIds = track.images.map(img => img.toString());
          imagesToDelete.push(...existingImageIds.filter(id => !imageIds.includes(id)));
      
          updates.images = imageIds;
        }
      
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

    static async getAllTracks({ page = 1, limit = 6, filters = {} }) {
        const skip = (page - 1) * limit;
        
        // Build query using the filter helper
        const query = buildTrackQuery(filters);
        
        const tracks = await Track.find(query)
            .skip(skip)
            .limit(limit)
            .populate("images", "data mimeType")
            .populate("created_by", "_id");
        const totalTracks = await Track.countDocuments(query);
        
        return {
            tracks,
            totalTracks,
            totalPages: Math.ceil(totalTracks / limit),
            currentPage: page
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
        
        const hasPermission = await hasModificationPermission(userId, track.created_by.toString());
        if (!hasPermission) throw new Error("Unauthorized");
        
        await Image.deleteMany({ _id: { $in: track.images } });
        await Track.findByIdAndDelete(trackId);
        return { message: "Track deleted successfully" };
    }

    static async getTracksByUserId(userId) {
        if (!userId) throw new Error("User ID is required");
        
        const tracks = await Track.find({ created_by: userId })
        .populate("created_by", "username email phonenumber")
        .populate("images", "data mimeType");
        
        return tracks || [];
    }

    static async likeTrack(trackId, userId) {
        const track = await Track.findById(trackId);
        if (!track) throw new Error("Track not found");

        // Check if user already liked the track
        if (track.likes.includes(userId)) {
          throw new Error("Track already liked by user");
        }

        // Add user to likes array
        track.likes.push(userId);
        await track.save();

        return track;
    }

    static async unlikeTrack(trackId, userId) {
        const track = await Track.findById(trackId);
        if (!track) throw new Error("Track not found");

        // Check if user has liked the track
        if (!track.likes.includes(userId)) {
          throw new Error("Track not liked by user");
        }

        // Remove user from likes array
        track.likes = track.likes.filter(id => id.toString() !== userId);
        await track.save();

        return track;
    }

    static async getLikedTracks(userId) {
        if (!userId) throw new Error("User ID is required");
        
        const tracks = await Track.find({ likes: userId })
          .populate("created_by", "username email phonenumber")
          .populate("images", "data mimeType");
        
        return tracks;
    }
}

export default TrackService;