import TrackRequest from "../models/trackRequest.js";
import Track from "../models/Track.js";
import { logActivity } from "./helpers/logHelper.js";

class TrackRequestService {
    static async createJoinRequest(userId, trackId, content) {
        const track = await Track.findById(trackId).populate("created_by", "_id");
        if (!track) throw new Error("Track not found");

        if (!track.joining_enabled) {
            throw new Error("This track does not accept joining requests");
        }

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

        return await TrackRequest.create({
            sender: userId,
            receiver: track.created_by._id,
            track: trackId,
            content: content || "",
            status: "pending"
        });
    }

    static async getAllUserTrackRequests(userId) {
        return await TrackRequest.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .populate({
            path: "sender",
            select: "username profile_image",
            populate: {
                path: "profile_image",
                select: "data mimeType"
            }
        })
        .populate("track", "name")
        .sort({ createdAt: -1 });
    }

    static async getPendingNotifications(userId) {
        return await TrackRequest.find({
            receiver: userId,
            status: "pending"
        })
        .populate({
            path: "sender",
            select: "username profile_image",
            populate: {
                path: "profile_image",
                select: "data mimeType"
            }
        })
        .populate("track", "name")
        .sort({ createdAt: -1 });
    }

    static async updateRequestStatus(requestId, status) {
        if (!["pending", "accepted", "rejected"].includes(status)) {
            throw new Error("Invalid status");
        }

        const request = await TrackRequest.findById(requestId)
            .populate("track", "name")
            .populate("sender", "username")
            .populate("receiver", "username");
            
        if (!request) throw new Error("Request not found");

        request.status = status;
        await request.save();

        await logActivity(request.receiver._id, 'updated_track_request', {
            requestId: request._id,
            trackName: request.track.name,
            sender: request.sender.username,
            receiver: request.receiver.username,
            newStatus: status
        });

        return request;
    }

    static async getSentRequests(userId) {
        return await TrackRequest.find({ sender: userId })
            .populate("track", "name")
            .sort({ createdAt: -1 });
    }

    static async getReceivedRequests(userId) {
        return await TrackRequest.find({ receiver: userId })
            .populate("track", "name")
            .populate("sender", "username profile_image")
            .sort({ createdAt: -1 });
    }

    static async markRequestAsRead(requestId) {
        const request = await TrackRequest.findById(requestId);
        if (!request) throw new Error("Request not found");

        request.read = true;
        await request.save();

        return request;
    }

    static async deleteRequests(requestIds, userId) {
        const ids = Array.isArray(requestIds) ? requestIds : [requestIds];

        const requests = await TrackRequest.find({
            _id: { $in: ids },
            $or: [{ sender: userId }, { receiver: userId }]
        });

        if (requests.length === 0) throw new Error("No deletable requests found");

        const idsToDelete = requests.map(r => r._id);
        await TrackRequest.deleteMany({ _id: { $in: idsToDelete } });

        return { message: "Requests deleted successfully" };
    }

}

export default TrackRequestService;
