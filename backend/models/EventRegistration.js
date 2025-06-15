import mongoose from "mongoose";

const EventRegistrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    registrationInfo: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    ticketId: {
        type: String,
        unique: true,
        sparse: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a compound index to ensure a user can only register once per event
EventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
EventRegistrationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model("EventRegistration", EventRegistrationSchema); 