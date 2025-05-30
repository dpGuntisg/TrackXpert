import mongoose from "mongoose";
import { validateTrackTags } from '../services/helpers/tagHelper.js';

const TrackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Track name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Track description is required']
  },
  location: {
    type: String,
    required: [true, 'Track location is required']
  },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image' }],
  thumbnailImage: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
  isArchived: { type: Boolean, default: false },
  // Track tags with validation
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        if (!tags) return true; // Allow empty tags
        return validateTrackTags(tags);
      },
      message: props => `${props.value} contains invalid tags!`
    }
  },
  availability: [{
    startDay: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: false
    },
    endDay: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: false
    },
    open_time: { type: String, required: false },
    close_time: { type: String, required: false }
  }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false
    }
  },
  
  distance: {
    type: Number,
    default: 0
  },
    
  polyline: {
    type: {
      type: String,
      enum: ["LineString"],
      required: false
    },
    coordinates: {
      type: [[Number]],
      required: false
    }
  },
  joining_enabled: { 
    type: Boolean,
    default: false,
  },
  joining_requirements: {
    type: String,
    required: false
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
},{timestamps:true});

TrackSchema.pre("save", function (next) {
  // Set thumbnailImage if not already set and images exist
  if (!this.thumbnailImage && this.images?.length > 0) {
    this.thumbnailImage = this.images[0];
  }
  next();
});

// Pre-save middleware for availability validation
TrackSchema.pre("save", function (next) {
  const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Only validate availability if it's provided
  if (this.availability && this.availability.length > 0) {
    this.availability.forEach((slot) => {
      const startIdx = daysOrder.indexOf(slot.startDay);
      const endIdx = daysOrder.indexOf(slot.endDay);
      
      // Check if startDay and endDay are valid
      if (startIdx === -1) {
        return next(new Error("Invalid start day."));
      }
      if (endIdx === -1) {
        return next(new Error("Invalid end day."));
      }
      
      // Check if endDay is after or the same as startDay
      if (startIdx > endIdx) {
        return next(new Error("End day must be on or after the start day."));
      }
      
      // Handle case where startDay and endDay are the same
      if (startIdx === endIdx) {
        slot.endDay = slot.startDay; // Ensure endDay equals startDay
      }
      
      // Time validation if both open and close times are provided
      if (slot.open_time && slot.close_time) {
        const openTimeParts = slot.open_time.split(":").map(Number);
        const closeTimeParts = slot.close_time.split(":").map(Number);
        
        if (openTimeParts.length !== 2 || closeTimeParts.length !== 2) {
          return next(new Error("Invalid time format. Expected HH:MM."));
        }
        
        const openMinutes = openTimeParts[0] * 60 + openTimeParts[1];
        const closeMinutes = closeTimeParts[0] * 60 + closeTimeParts[1];
        
        if (openMinutes >= closeMinutes) {
          return next(new Error("Close time must be after open time."));
        }
      } else if (slot.open_time || slot.close_time) {
        return next(new Error("Both open time and close time must be provided if one is specified."));
      }
    });
  }
  
  // Validate that at least one geometry type is provided
  const hasPoint = this.coordinates && this.coordinates.coordinates && this.coordinates.coordinates.length === 2;
  const hasPolygon = this.polygon && this.polygon.coordinates && this.polygon.coordinates.length > 0;
  const hasPolyline = this.polyline && this.polyline.coordinates && this.polyline.coordinates.length > 0;
  
  if (!hasPoint && !hasPolygon && !hasPolyline) {
    return next(new Error("At least one geometry type (point, polygon, or polyline) must be provided."));
  }
  
  next();
});

// Create geospatial indexes for all geometry types
TrackSchema.index({ coordinates: "2dsphere" });
TrackSchema.index({ polygon: "2dsphere" });
TrackSchema.index({ polyline: "2dsphere" });

export default mongoose.model("Track", TrackSchema);