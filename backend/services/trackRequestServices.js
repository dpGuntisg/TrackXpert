import TrackRequest from "../models/trackRequest.js";
import Track from "../models/Track.js";

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

        // Check for existing pending request
        const existingRequest = await TrackRequest.findOne({
            sender: userId,
            track: trackId,
            status: "pending"
        });

        if (existingRequest) {
            throw new Error("A pending request already exists for this track");
        }

        // Create the request
        const request = await TrackRequest.create({
            sender: userId,
            receiver: track.created_by._id,
            track: trackId,
            content: content || '',
            status: "pending"
        });

        return request;
    }

    static async getTrackRequests(userId) {
        // Get all requests where the user is either sender or receiver
        const requests = await TrackRequest.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
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

        return requests;
    }

    static async getNotifications(userId) {
        // Get only pending requests where the user is the receiver (track owner)
        const notifications = await TrackRequest.find({
            receiver: userId,
            status: "pending"
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

        return notifications;
    }

    static async updateRequestStatus(requestId, status) {
        const request = await TrackRequest.findById(requestId);
        if (!request) {
            throw new Error("Request not found");
        }
        if (!["pending", "accepted", "rejected"].includes(status)) {
            throw new Error("Invalid status");
        }

        request.status = status;
        await request.save();

        return request;
    }

    static async getSentRequests(userId) {
        return await TrackRequest.find({ sender: userId })
            .populate('track', 'name')
            .sort({ createdAt: -1 });
    }

    static async getReceivedRequests(userId) {
        return await TrackRequest.find({ receiver: userId })
            .populate('track', 'name')
            .populate('sender', 'username profile_image')
            .sort({ createdAt: -1 });
    }
}

export default TrackRequestService;
