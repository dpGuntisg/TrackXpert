import mongoose from "mongoose";

const TrackRequestSchema = new mongoose.Schema({
    track: { type: mongoose.Schema.Types.ObjectId, ref: "Track", required: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    status: { type: String, enum: ["pending", "approved", "denied"], default: "pending" },
    requestedDate: { type: Date, default: Date.now },
});

export default mongoose.model("TrackRequest", TrackRequestSchema);
