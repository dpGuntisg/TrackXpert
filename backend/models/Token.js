import mongoose from "mongoose";

const Token = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true,},
    token: {type: String, required: true,},
    createdAt: {type: Date, default: Date.now, expires: 3600, // Token expiration time in seconds (1 hour)
    },
});

export default mongoose.model("Token", Token);