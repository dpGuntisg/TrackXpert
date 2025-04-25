import mongoose from "mongoose";
import { validateEventTags } from '../services/helpers/tagHelper.js';

const EventSchema = new mongoose.Schema({
    created_by: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: { 
        type: String,
        required: true,
        minLenght: [5, "Event name must be at least 5 characters long."],
        maxLenght: 100,
        trim: true
    },
    description: { 
        type: String, 
        required: true,
        minLenght: [10, "Event description must be at least 10 characters long."],
        maxLenght: 15000,
        trim: true
    },
    date: {
        startDate: { 
          type: Date, 
          required: [true, "Event start date is required"] 
        },
        endDate: { 
          type: Date, 
          required: [true, "Event end date is required"] 
        },
    },
    location: {
        type: String,
    },
    track: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Track', 
        required: [true, "Track selection is required"] 
    },
    maxParticipants: { 
        type: Number, 
        validate: {
            validator: function(v) {
                if (this.unlimitedParticipants) return true;
                return v !== undefined && v !== null && v > 0 && v <= 100;
            },
            message: props => `Maximum participants must be between 1 and 100`
        }
    },
    unlimitedParticipants: {
        type: Boolean,
        default: false
      },
    currentParticipants: { 
        type: Number, 
        default: 0,
        validate: {
            validator: function(v) {
            // Current participants must not exceed maximum (if limited)
            if (this.unlimitedParticipants) return true;
            return v <= this.maxParticipants;
            },
            message: props => `Current participants cannot exceed maximum participants`
        }
    },
    images: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Image',
        validate: {
          validator: function(v) {
            // At least one image is required
            return Array.isArray(v) && v.length > 0;
          },
          message: props => "At least one image is required"
        }
    }],
    status: { 
        type: String, 
        enum: ['soon', 'active', 'completed'],
        default: "soon"
    },
    registrationDeadline: { 
        type: Date, 
        required: [true, "Registration deadline is required"]
    },
    registrationStartDate: {
        type: Date,
        required: [true, "Registration start date is required"]
    },
    requireManualRegistration: {
        type: Boolean,
        default: false
    },
    generatePdfTickets: {
        type: Boolean,
        default: false
    },
    registrationInstructions: {
        type: String,
        validate: {
            validator: function(v) {
            // Required to have detailed instructions if manual approval is required
            if (this.requireManualApproval) {
              return v && v.trim().length >= 10;
            }
            return true;
            },
            message: props => "Detailed registration instructions are required for events with manual approval"
        }
    },
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
    // Validate event dates
    if (this.date.endDate < this.date.startDate) {
      return next(new Error('Event end date must be after start date'));
    }
    
    // Validate registration dates
    if (this.registrationDeadline > this.date.startDate) {
      return next(new Error('Registration must end before event starts'));
    }
    
    if (this.registrationStartDate > this.registrationDeadline) {
      return next(new Error('Registration start date must be before deadline'));
    }
    
    // Additional validation for manual approval
    if (this.requireManualApproval && (!this.registrationInstructions || this.registrationInstructions.trim().length < 10)) {
      return next(new Error('Detailed registration instructions are required for events with manual approval'));
    }
  
    next();
  });

export default mongoose.model("Event", EventSchema);