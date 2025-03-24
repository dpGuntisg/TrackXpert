import mongoose from "mongoose";
import { validateEventTags } from '../services/helpers/tagHelper.js';

const EventSchema = new mongoose.Schema({
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
    },
    location: { type: String, required: true },
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
    maxParticipants: { type: Number, required: true },
    currentParticipants: { type: Number, default: 0 },
    price: { type: Number, required: true },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
    status: { type: String, enum: ['soon', 'active', 'completed'],
            default: "soon"
    },
    registrationDeadline: { type: Date, },
    tags: {
        type: [String],
        validate: {
            validator: function(tags) {
                if (!tags) return true; // Allow empty tags
                return validateEventTags(tags);
            },
            message: props => `${props.value} contains invalid tags!`
        }
    }
}, {
    timestamps: true
});

// Pre-save middleware for date validation
EventSchema.pre('save', function(next) {
    if (this.date.endDate < this.date.startDate) {
        next(new Error('End date must be after start date'));
    }
    next();
});

export default mongoose.model("Event", EventSchema);