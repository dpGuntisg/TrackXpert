import mongoose from "mongoose";

const UserActionLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
},{timestamps:true});

export default mongoose.model("UserActionLog", UserActionLogSchema);