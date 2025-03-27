import TrackRequest from "../models/trackRequest.js";
import Track from "../models/Track.js";
import User from "../models/User.js";

class TrackRequestService {
    static async createJoinRequest(userId, trackId, content) {
        // Find the track and ensure it exists
        const track = await Track.findById(trackId).populate('created_by', '_id');
        if (!track) {
            throw new Error("Track not found");
        }

        if (!track.joining_enabled) {
            throw new Error("This track does not accept joining requests");
        }

        // Check if user is trying to join their own track
        if (track.created_by._id.toString() === userId) {
            throw new Error("Cannot send join request to your own track");
        }

        const existingRequest = await TrackRequest.findOne({
            sender: userId,
            track: trackId,
            status: "pending"
        });

        if (existingRequest) {
            throw new Error("A pending request already exists for this track");
        }

        // Create the request with the track creator's ID
        const request = await TrackRequest.create({
            sender: userId,
            receiver: track.created_by._id,
            track: trackId,
            content: content || '',
            status: "pending"
        });

        // Add request to sender's sentRequests array
        await User.findByIdAndUpdate(userId, {
            $push: { sentRequests: request._id }
        });

        // Add request to receiver's receivedRequests array
        await User.findByIdAndUpdate(track.created_by._id, {
            $push: { receivedRequests: request._id }
        });

        return request;
    }

    static async getTrackRequests(userId) {
        const request = await TrackRequest.find({
            receiver: userId
        })
        .populate({
            path: 'sender',
            select: 'username profile_image',
            populate: {
                path: 'profile_image',
                select: 'data mimeType'
            }
        })
        .populate('track', 'name') 
        .sort({ createdAt: -1 }); 

        return request;
    }

    static async updateRequestStatus(requestId, status) {
        const request = await TrackRequest.findByIdAndUpdate(requestId, { status }, { new: true });
        return request;
    }
}

export default TrackRequestService;
