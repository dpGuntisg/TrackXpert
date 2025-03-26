import mongoose from "mongoose";

const TrackRequestSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    track: { type: mongoose.Schema.Types.ObjectId, ref: "Track", required: true },
    content: { type: String },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
  });

export default mongoose.model("TrackRequest", TrackRequestSchema);
